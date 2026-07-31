import { useState, useEffect } from 'react'
import { formatPlaytime, getSteamCoverUrl, getSteamStoreUrl, getPlatforms, getAchievementProgress } from '@/lib/steam'
import { estimateCompletionTime } from '@/lib/filters'
import { playSpinTick, playWinChime } from '@/lib/sound'
import { PlatformIcon, ClockIcon, HourglassIcon, TrophyIcon, UpdateIcon, ThumbsUpIcon, UsersIcon } from '@/components/PlatformIcons'

export default function GameCard({
  suggestion,
  picking,
  onPickAgain,
  onSkip,
  onPin,
  isPinned = false,
  skippedCount = 0,
  candidateGames = [],
  soundMuted = false,
  steamid = ''
}) {
  const [spinTitle, setSpinTitle] = useState('')
  const [liveAchievementPct, setLiveAchievementPct] = useState(null)
  const [lastUpdateDate, setLastUpdateDate] = useState(null)
  const [reviewData, setReviewData] = useState(null)
  const [playerCount, setPlayerCount] = useState(null)

  useEffect(() => {
    if (!picking || candidateGames.length === 0) return
    const interval = setInterval(() => {
      const randomCandidate = candidateGames[Math.floor(Math.random() * candidateGames.length)]
      if (randomCandidate) {
        setSpinTitle(randomCandidate.name)
        playSpinTick(soundMuted)
      }
    }, 60)
    return () => clearInterval(interval)
  }, [picking, candidateGames, soundMuted])

  useEffect(() => {
    if (!picking && suggestion) {
      playWinChime(soundMuted)
    }
  }, [picking, suggestion, soundMuted])

  // Live Steam Achievement Fetching
  useEffect(() => {
    if (!suggestion || !steamid || suggestion.playtime_forever === 0) {
      setLiveAchievementPct(null)
      return
    }
    let cancelled = false
    fetch(`/api/achievements?steamid=${steamid}&appid=${suggestion.appid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled) {
          if (data && typeof data.percentage === 'number') {
            setLiveAchievementPct(data.percentage)
          } else {
            setLiveAchievementPct(getAchievementProgress(suggestion))
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLiveAchievementPct(getAchievementProgress(suggestion))
        }
      })
    return () => { cancelled = true }
  }, [suggestion?.appid, steamid])

  // Live Game Patch Update News Fetching
  useEffect(() => {
    if (!suggestion) {
      setLastUpdateDate(null)
      return
    }
    let cancelled = false
    fetch(`/api/news?appid=${suggestion.appid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data && data.lastUpdate) {
          setLastUpdateDate(data.lastUpdate)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [suggestion?.appid])

  // Live Steam Review Score Fetching
  useEffect(() => {
    if (!suggestion) {
      setReviewData(null)
      return
    }
    let cancelled = false
    fetch(`/api/reviews?appid=${suggestion.appid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data && data.score !== null) {
          setReviewData(data)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [suggestion?.appid])

  // Live Current Player Count Fetching
  useEffect(() => {
    if (!suggestion) {
      setPlayerCount(null)
      return
    }
    let cancelled = false
    fetch(`/api/players?appid=${suggestion.appid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data && data.count !== null) {
          setPlayerCount(data.count)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [suggestion?.appid])

  if (!suggestion) return null

  const storeUrl = getSteamStoreUrl(suggestion.appid)
  const coverUrl = getSteamCoverUrl(suggestion.appid)
  const durationEst = estimateCompletionTime(suggestion)
  const platforms = getPlatforms(suggestion)
  const achievementPct = liveAchievementPct !== null ? liveAchievementPct : getAchievementProgress(suggestion)

  const formatLastUpdate = (timestamp) => {
    if (!timestamp || timestamp === 0) return null
    const daysAgo = Math.floor((Date.now() / 1000 - timestamp) / 86400)
    if (daysAgo <= 0) return 'Updated today'
    if (daysAgo === 1) return 'Updated yesterday'
    if (daysAgo < 30) return `Updated ${daysAgo}d ago`
    if (daysAgo < 365) return `Updated ${Math.floor(daysAgo / 30)}mo ago`
    return `Updated ${Math.floor(daysAgo / 365)}y ago`
  }

  const formatPlayerCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toLocaleString()
  }

  const getReviewColor = (score) => {
    if (score >= 80) return 'review-positive'
    if (score >= 40) return 'review-mixed'
    return 'review-negative'
  }

  const durationTooltipText = "Estimated playthrough duration benchmarked from HowLongToBeat (HLTB) crowdsourced averages and your logged Steam playtime."
  const skipTooltipText = "Temporarily skips this game for the rest of your current pick session. (Keyboard shortcut: S)"

  return (
    <div className={`game-card card-enter ${picking ? 'slot-spinning' : ''}`}>
      {picking ? (
        <div className="slot-machine-overlay">
          <div className="slot-spinner-icon" />
          <p className="slot-spinning-label">Shuffling Library...</p>
          <h3 className="slot-spinning-title">{spinTitle || suggestion.name}</h3>
        </div>
      ) : (
        <>
          <div className="cover-wrapper">
            <img
              src={coverUrl}
              alt={suggestion.name}
              className="cover-img"
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <div className="card-body">
            <div className="card-header-row flex-between">
              <h2 className="card-title">
                {suggestion.name}
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="title-steam-link"
                  title="View on Steam"
                >
                  <svg className="external-link-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </h2>
              <div className="platform-badges">
                {platforms.map(p => (
                  <span key={p} className={`platform-icon-pill tag-${p.toLowerCase()}`}>
                    <PlatformIcon type={p} />
                  </span>
                ))}
              </div>
            </div>

            <div className="card-badge-row">
              <span className={`playtime-badge ${suggestion.playtime_forever === 0 ? 'never' : ''}`}>
                <ClockIcon />
                {formatPlaytime(suggestion.playtime_forever)}
              </span>

              <span className="duration-badge tooltip-target">
                <HourglassIcon />
                {durationEst}
                <span className="tooltip-bubble">{durationTooltipText}</span>
              </span>

              {achievementPct !== null && (
                <span className="achievement-badge" title={`Achievement completion: ${achievementPct}%`}>
                  <TrophyIcon />
                  {achievementPct}%
                </span>
              )}

              {lastUpdateDate && (
                <span className="last-played-badge" title="Latest game patch announcement from Steam News">
                  <UpdateIcon />
                  {formatLastUpdate(lastUpdateDate)}
                </span>
              )}
            </div>

            {(reviewData || playerCount !== null) && (
              <div className="card-badge-row card-badge-row-secondary">
                {reviewData && (
                  <span className={`review-badge ${getReviewColor(reviewData.score)}`} title={`${reviewData.description} — ${reviewData.score}% of ${reviewData.total.toLocaleString()} reviews are positive`}>
                    <ThumbsUpIcon />
                    {reviewData.description} ({reviewData.score}%)
                  </span>
                )}

                {playerCount !== null && playerCount > 0 && (
                  <span className="players-badge" title={`${playerCount.toLocaleString()} players in-game right now`}>
                    <UsersIcon />
                    {formatPlayerCount(playerCount)} playing
                  </span>
                )}
              </div>
            )}

            <div className="card-actions">
              <button type="button" onClick={onPickAgain} className="btn-again">
                Pick again (R)
              </button>
              <button
                type="button"
                onClick={() => onSkip(suggestion.appid)}
                className="btn-skip tooltip-target"
              >
                Skip (S)
                <span className="tooltip-bubble">{skipTooltipText}</span>
              </button>
              <button
                type="button"
                onClick={() => onPin(suggestion)}
                className={`btn-pin ${isPinned ? 'pinned' : ''}`}
                title={isPinned ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <svg viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                {isPinned ? 'Saved' : 'Save'}
              </button>
            </div>

            {skippedCount > 0 && (
              <p className="skipped-note">
                {skippedCount} game{skippedCount > 1 ? 's' : ''} skipped this session
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
