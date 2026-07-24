import { useState, useEffect } from 'react'
import { formatPlaytime, getSteamCoverUrl, getSteamStoreUrl, getPlatforms } from '@/lib/steam'
import { estimateCompletionTime } from '@/lib/filters'
import { playSpinTick, playWinChime } from '@/lib/sound'
import { PlatformIcon, ClockIcon, HourglassIcon } from '@/components/PlatformIcons'

export default function GameCard({
  suggestion,
  picking,
  onPickAgain,
  onSkip,
  skippedCount = 0,
  candidateGames = [],
  soundMuted = false
}) {
  const [spinTitle, setSpinTitle] = useState('')

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

  if (!suggestion) return null

  const storeUrl = getSteamStoreUrl(suggestion.appid)
  const coverUrl = getSteamCoverUrl(suggestion.appid)
  const durationEst = estimateCompletionTime(suggestion)
  const platforms = getPlatforms(suggestion)

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
            </div>

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
            </div>

            {skippedCount > 0 && (
              <p className="skipped-note text-center">
                Skipped {skippedCount} game{skippedCount > 1 ? 's' : ''} this session
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
