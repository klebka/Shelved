'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import FilterSection from '@/components/FilterSection'
import SearchBox from '@/components/SearchBox'
import GameCard from '@/components/GameCard'
import SkeletonCard from '@/components/SkeletonCard'
import PrivateProfileNotice from '@/components/PrivateProfileNotice'
import LibraryGrid from '@/components/LibraryGrid'
import BacklogStats from '@/components/BacklogStats'
import Footer from '@/components/Footer'
import { filterGames, pickRandomGame, filterMutuallyOwnedGames } from '@/lib/filters'
import { isValidSteamId, saveSteamId } from '@/lib/steam'

export default function Home() {
  const [viewMode, setViewMode] = useState('picker')
  const [soundMuted, setSoundMuted] = useState(false)
  const [steamid, setSteamid] = useState('')
  const [friendSteamIds, setFriendSteamIds] = useState([])
  const [games, setGames] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState(null)
  const [resetNotice, setResetNotice] = useState(null)
  const [isPrivateProfile, setIsPrivateProfile] = useState(false)
  const [minHours, setMinHours] = useState(0)
  const [maxHours, setMaxHours] = useState(12)
  const [mood, setMood] = useState(null)
  const [exclusions, setExclusions] = useState([])
  const [unplayedWeight, setUnplayedWeight] = useState(30)
  const [skippedAppIds, setSkippedAppIds] = useState([])

  // SSO Callback Listener
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const ssoSteamId = params.get('steamid')
    const ssoError = params.get('error')

    if (ssoError === 'steam_auth_failed') {
      setError('Steam authentication failed or was cancelled. Please try again.')
    } else if (ssoSteamId && isValidSteamId(ssoSteamId)) {
      setSteamid(ssoSteamId)
      saveSteamId(ssoSteamId)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Keyboard Shortcuts (Space/R: pick again, S: skip, Esc: reset filters)
  useEffect(() => {
    function handleKeyDown(e) {
      if (['input', 'textarea', 'select'].includes(e.target.tagName.toLowerCase())) return
      if (!games || loading || picking) return

      if (e.code === 'Space' || e.key.toLowerCase() === 'r') {
        e.preventDefault()
        pickNextGame()
      } else if (e.key.toLowerCase() === 's' && suggestion) {
        e.preventDefault()
        handleSkip(suggestion.appid)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleResetFilters()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [games, loading, picking, suggestion, minHours, maxHours, mood, exclusions, unplayedWeight, skippedAppIds])

  async function fetchLibrary() {
    if (loading || !steamid.trim()) return
    if (!isValidSteamId(steamid)) {
      setError('Please enter a valid 17-digit Steam ID.')
      setIsPrivateProfile(false)
      return
    }

    setLoading(true)
    setError(null)
    setResetNotice(null)
    setIsPrivateProfile(false)
    setSuggestion(null)
    setGames(null)
    setSkippedAppIds([])

    try {
      const res1 = await fetch(`/api/library?steamid=${steamid.trim()}`)
      const data1 = await res1.json()
      if (!res1.ok) {
        if (res1.status === 404 || (data1.error && data1.error.toLowerCase().includes('private'))) {
          setIsPrivateProfile(true)
        }
        throw new Error(data1.error || 'Failed to fetch games')
      }

      let combinedGames = data1

      // Fetch multiple friend libraries in parallel safely with fallback
      const validFriendIds = friendSteamIds
        .map(id => id.trim())
        .filter(id => isValidSteamId(id))

      if (validFriendIds.length > 0) {
        const friendFetches = validFriendIds.map(id =>
          fetch(`/api/library?steamid=${id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
        const friendResults = await Promise.all(friendFetches)
        const validFriendLibs = friendResults.filter(res => Array.isArray(res))

        if (validFriendLibs.length > 0) {
          combinedGames = filterMutuallyOwnedGames([data1, ...validFriendLibs])
          if (combinedGames.length === 0) {
            setError(`No mutually owned games found across these ${validFriendIds.length + 1} players. Make sure everyone has public game details set on Steam.`)
            setGames([])
            return
          }
        }
      }

      setGames(combinedGames)
      pickNextGame(combinedGames, minHours, maxHours, mood, [], exclusions, unplayedWeight, null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function pickNextGame(
    library = games,
    minH = minHours,
    maxH = maxHours,
    moodFilter = mood,
    skipped = skippedAppIds,
    activeExclusions = exclusions,
    weight = unplayedWeight,
    currentId = suggestion?.appid
  ) {
    if (!library || library.length === 0) return

    let candidatePool = filterGames(library, minH, maxH, moodFilter, activeExclusions)

    if (candidatePool.length === 0) {
      setError('No games match your active filters. Try adjusting them.')
      setPicking(false)
      setSuggestion(null)
      return
    }

    setError(null)
    setPicking(true)
    setTimeout(() => {
      const { game: next, poolReset } = pickRandomGame(candidatePool, skipped, weight, currentId)
      setSuggestion(next)
      setPicking(false)

      if (poolReset) {
        setSkippedAppIds([])
        setResetNotice("You've explored all matching games in your library! Skipped list has been reset.")
        setTimeout(() => setResetNotice(null), 4500)
      }
    }, 600)
  }

  function handleSkip(appid) {
    const updatedSkipped = [...skippedAppIds, appid]
    setSkippedAppIds(updatedSkipped)
    pickNextGame(games, minHours, maxHours, mood, updatedSkipped, exclusions, unplayedWeight, appid)
  }

  function handleMinHoursChange(val) {
    setMinHours(val)
    if (games) pickNextGame(games, val, maxHours, mood, skippedAppIds, exclusions, unplayedWeight, suggestion?.appid)
  }

  function handleMaxHoursChange(val) {
    setMaxHours(val)
    if (games) pickNextGame(games, minHours, val, mood, skippedAppIds, exclusions, unplayedWeight, suggestion?.appid)
  }

  function handleMoodToggle(f) {
    const next = mood?.id === f.id ? null : f
    setMood(next)
    if (games) pickNextGame(games, minHours, maxHours, next, skippedAppIds, exclusions, unplayedWeight, suggestion?.appid)
  }

  function handleExclusionToggle(exId) {
    const updated = exclusions.includes(exId)
      ? exclusions.filter(id => id !== exId)
      : [...exclusions, exId]
    setExclusions(updated)
    if (games) pickNextGame(games, minHours, maxHours, mood, skippedAppIds, updated, unplayedWeight, suggestion?.appid)
  }

  function handleWeightChange(newWeight) {
    setUnplayedWeight(newWeight)
    if (games) pickNextGame(games, minHours, maxHours, mood, skippedAppIds, exclusions, newWeight, suggestion?.appid)
  }

  function handleResetFilters() {
    setMinHours(0)
    setMaxHours(12)
    setMood(null)
    setExclusions([])
    setUnplayedWeight(30)
    setSkippedAppIds([])
    setResetNotice(null)
    if (games) pickNextGame(games, 0, 12, null, [], [], 30, null)
  }

  let activeFilteredGames = games ? filterGames(games, minHours, maxHours, mood, exclusions) : []

  const activeFriendCount = friendSteamIds.filter(id => isValidSteamId(id)).length

  return (
    <main className="main-container">
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
      />

      <div className="app-body-layout">
        <aside className="sidebar-column">
          {games && games.length > 0 && !loading && <BacklogStats games={games} />}

          <FilterSection
            games={games}
            minHours={minHours}
            maxHours={maxHours}
            mood={mood}
            exclusions={exclusions}
            unplayedWeight={unplayedWeight}
            onMinHoursChange={handleMinHoursChange}
            onMaxHoursChange={handleMaxHoursChange}
            onMoodToggle={handleMoodToggle}
            onExclusionToggle={handleExclusionToggle}
            onWeightChange={handleWeightChange}
            onResetFilters={handleResetFilters}
          />
        </aside>

        <section className="main-hero-column">
          <SearchBox
            steamid={steamid}
            setSteamid={setSteamid}
            friendSteamIds={friendSteamIds}
            setFriendSteamIds={setFriendSteamIds}
            onSearch={fetchLibrary}
            loading={loading}
          />

          {!games && !loading && !isPrivateProfile && (
            <p className="helper-text">
              Sign in via Steam above or enter a 17-digit Steam ID. Compare with multiple friends by adding their Steam IDs above.
            </p>
          )}

          {isPrivateProfile ? (
            <PrivateProfileNotice onRetry={fetchLibrary} />
          ) : (
            error && <div className="error-banner">{error}</div>
          )}

          {resetNotice && (
            <div className="reset-notice-banner card-enter">
              <svg className="reset-info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>{resetNotice}</span>
            </div>
          )}

          {loading && <SkeletonCard />}

          {games && !loading && games.length > 0 && (
            <>
              {activeFriendCount > 0 && (
                <div className="friend-compare-badge">
                  Comparing mutual games across {activeFriendCount + 1} players ({games.length} shared games)
                </div>
              )}

              {viewMode === 'picker' ? (
                <GameCard
                  suggestion={suggestion}
                  picking={picking}
                  onPickAgain={() => pickNextGame()}
                  onSkip={handleSkip}
                  skippedCount={skippedAppIds.length}
                  candidateGames={activeFilteredGames}
                  soundMuted={soundMuted}
                />
              ) : (
                <LibraryGrid
                  games={activeFilteredGames}
                />
              )}

              <p className="library-count">
                {games.length} games in library ({activeFilteredGames.length} matching filters)
              </p>
            </>
          )}
        </section>
      </div>

      <Footer />
    </main>
  )
}