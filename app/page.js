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
import Watchlist from '@/components/Watchlist'
import Footer from '@/components/Footer'
import { filterGames, pickRandomGame } from '@/lib/filters'
import { isValidSteamId, saveSteamId, getPinnedGames, pinGame, unpinGame, isGamePinned } from '@/lib/steam'
import { useSteamLibrary } from '@/lib/hooks/useSteamLibrary'
import { useFilterPreferences } from '@/lib/hooks/useFilterPreferences'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'

export default function Home() {
  const [viewMode, setViewMode] = useState('picker')
  const [soundMuted, setSoundMuted] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [picking, setPicking] = useState(false)
  const [resetNotice, setResetNotice] = useState(null)
  const [pinnedGames, setPinnedGames] = useState([])

  // Load pinned games from localStorage on mount
  useEffect(() => {
    setPinnedGames(getPinnedGames())
  }, [])


  const {
    steamid,
    setSteamid,
    friendSteamIds,
    setFriendSteamIds,
    games,
    loading,
    error,
    setError,
    isPrivateProfile,
    fetchLibrary
  } = useSteamLibrary()

  const {
    minHours,
    setMinHours,
    maxHours,
    setMaxHours,
    mood,
    exclusions,
    skippedAppIds,
    setSkippedAppIds,
    resetFilters,
    toggleMood,
    toggleExclusion,
    addSkipped
  } = useFilterPreferences()

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
  }, [setSteamid, setError])

  function pickNextGame(
    library = games,
    minH = minHours,
    maxH = maxHours,
    moodFilter = mood,
    skipped = skippedAppIds,
    activeExclusions = exclusions,
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
      const { game: next, poolReset } = pickRandomGame(candidatePool, skipped, 30, currentId)
      setSuggestion(next)
      setPicking(false)

      if (poolReset) {
        setSkippedAppIds([])
        setResetNotice("You've explored all matching games in your library! Skipped list has been reset.")
        setTimeout(() => setResetNotice(null), 4500)
      }
    }, 600)
  }

  function handleSearch() {
    setResetNotice(null)
    setSuggestion(null)
    fetchLibrary(fetchedGames => {
      pickNextGame(fetchedGames, minHours, maxHours, mood, [], exclusions, null)
    })
  }

  function handleSkip(appid) {
    const updatedSkipped = addSkipped(appid)
    pickNextGame(games, minHours, maxHours, mood, updatedSkipped, exclusions, appid)
  }

  function handleMinHoursChange(val) {
    setMinHours(val)
    if (games) pickNextGame(games, val, maxHours, mood, skippedAppIds, exclusions, suggestion?.appid)
  }

  function handleMaxHoursChange(val) {
    setMaxHours(val)
    if (games) pickNextGame(games, minHours, val, mood, skippedAppIds, exclusions, suggestion?.appid)
  }

  function handleMoodToggle(f) {
    const next = toggleMood(f)
    if (games) pickNextGame(games, minHours, maxHours, next, skippedAppIds, exclusions, suggestion?.appid)
  }

  function handleExclusionToggle(exId) {
    const updated = toggleExclusion(exId)
    if (games) pickNextGame(games, minHours, maxHours, mood, skippedAppIds, updated, suggestion?.appid)
  }

  function handleResetFilters() {
    resetFilters()
    setResetNotice(null)
    if (games) pickNextGame(games, 0, 12, null, [], [], null)
  }

  useKeyboardShortcuts({
    enabled: Boolean(games && !loading && !picking),
    onPickAgain: () => pickNextGame(),
    onSkip: handleSkip,
    onResetFilters: handleResetFilters,
    suggestion
  })

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
            onMinHoursChange={handleMinHoursChange}
            onMaxHoursChange={handleMaxHoursChange}
            onMoodToggle={handleMoodToggle}
            onExclusionToggle={handleExclusionToggle}
            onResetFilters={handleResetFilters}
          />
        </aside>

        <section className="main-hero-column">
          <SearchBox
            steamid={steamid}
            setSteamid={setSteamid}
            friendSteamIds={friendSteamIds}
            setFriendSteamIds={setFriendSteamIds}
            onSearch={handleSearch}
            loading={loading}
          />

          {!games && !loading && !isPrivateProfile && (
            <p className="helper-text">
              Sign in via Steam above or enter a 17-digit Steam ID. Compare with multiple friends by adding their Steam IDs above.
            </p>
          )}

          {isPrivateProfile ? (
            <PrivateProfileNotice onRetry={handleSearch} />
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
                <>
                  <Watchlist
                    pinnedGames={pinnedGames}
                    onUnpin={(appid) => {
                      unpinGame(appid)
                      setPinnedGames(getPinnedGames())
                    }}
                  />
                  <GameCard
                    suggestion={suggestion}
                    picking={picking}
                    onPickAgain={() => pickNextGame()}
                    onSkip={handleSkip}
                    onPin={(game) => {
                      if (isGamePinned(game.appid)) {
                        unpinGame(game.appid)
                      } else {
                        pinGame(game)
                      }
                      setPinnedGames(getPinnedGames())
                    }}
                    isPinned={suggestion ? isGamePinned(suggestion.appid) : false}
                    skippedCount={skippedAppIds.length}
                    candidateGames={activeFilteredGames}
                    soundMuted={soundMuted}
                    steamid={steamid}
                  />
                </>
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