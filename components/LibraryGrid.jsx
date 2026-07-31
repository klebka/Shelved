import { useState } from 'react'
import { formatPlaytime, getSteamCoverUrl, getSteamStoreUrl, getPlatforms, getAchievementProgress } from '@/lib/steam'
import { estimateCompletionTime } from '@/lib/filters'
import { PlatformIcon, ClockIcon, HourglassIcon, TrophyIcon } from '@/components/PlatformIcons'

export default function LibraryGrid({ games }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('playtime-desc')

  if (!games || games.length === 0) {
    return <p className="empty-grid-note">No games to display in library.</p>
  }

  const filteredGames = games.filter(g =>
    (g.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'playtime-desc') return b.playtime_forever - a.playtime_forever
    if (sortBy === 'playtime-asc') return a.playtime_forever - b.playtime_forever
    if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '')
    if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '')
    if (sortBy === 'recent') return (b.rtime_last_played || 0) - (a.rtime_last_played || 0)
    return 0
  })

  const durationTooltipText = "Estimated playthrough duration benchmarked from HowLongToBeat (HLTB) crowdsourced averages and your logged Steam playtime."

  return (
    <div className="library-grid-container card-enter">
      <div className="grid-toolbar flex-between">
        <input
          type="text"
          className="grid-search-input"
          placeholder="Search games in library..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="grid-sort-select"
        >
          <option value="playtime-desc">Most Played</option>
          <option value="playtime-asc">Least Played / Unplayed</option>
          <option value="name-asc">Name (A - Z)</option>
          <option value="name-desc">Name (Z - A)</option>
          <option value="recent">Recently Played</option>
        </select>
      </div>

      <div className="library-grid">
        {sortedGames.map(game => {
          const platforms = getPlatforms(game)
          const durationEst = estimateCompletionTime(game)
          const achievementPct = getAchievementProgress(game)

          return (
            <div key={game.appid} className="grid-card">
              <div className="grid-cover-wrapper">
                <img
                  src={getSteamCoverUrl(game.appid)}
                  alt={game.name}
                  className="grid-cover-img"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>

              <div className="grid-card-body">
                <h4 className="grid-card-title">{game.name}</h4>

                <div className="platform-badges grid-platform-badges">
                  {platforms.map(p => (
                    <span key={p} className={`platform-icon-pill tag-${p.toLowerCase()}`}>
                      <PlatformIcon type={p} />
                    </span>
                  ))}
                  {achievementPct !== null && (
                    <span className="platform-icon-pill achievement-pill" title={`Achievement Completion: ${achievementPct}%`}>
                      <TrophyIcon />
                      <span className="achievement-pill-text">{achievementPct}%</span>
                    </span>
                  )}
                </div>

                <div className="grid-badge-col">
                  <span className={`playtime-badge ${game.playtime_forever === 0 ? 'never' : ''}`}>
                    <ClockIcon />
                    {formatPlaytime(game.playtime_forever)}
                  </span>

                  <span className="duration-badge tooltip-target">
                    <HourglassIcon />
                    {durationEst}
                    <span className="tooltip-bubble">{durationTooltipText}</span>
                  </span>
                </div>

                <a
                  href={getSteamStoreUrl(game.appid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid-btn-store"
                >
                  Steam ↗
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {sortedGames.length === 0 && (
        <p className="empty-grid-note">No games match your search query "{searchTerm}".</p>
      )}
    </div>
  )
}
