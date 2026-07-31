import { useState, useEffect } from 'react'

export default function BacklogStats({ games }) {
  const [livePlayedValue, setLivePlayedValue] = useState(null)
  const [currencySymbol, setCurrencySymbol] = useState('$')
  const [regionCc, setRegionCc] = useState('US')

  if (!games || games.length === 0) return null;

  const totalGames = games.length;
  const unplayedCount = games.filter(g => g.playtime_forever === 0).length;
  const playedCount = totalGames - unplayedCount;
  const playedPct = totalGames > 0 ? Math.round((playedCount / totalGames) * 100) : 0;
  const unplayedPct = 100 - playedPct;

  const totalMinutes = games.reduce((acc, g) => acc + (g.playtime_forever || 0), 0);
  const totalPlayedHours = Math.round(totalMinutes / 60);
  const estBacklogHours = Math.round(unplayedCount * 12);

  // Fetch live regional Steam Store prices for played games based on user's regional locale
  useEffect(() => {
    if (!games || games.length === 0) return
    const playedGames = games.filter(g => (g.playtime_forever || 0) > 0)
    if (playedGames.length === 0) return

    let userCc = 'us'
    if (typeof window !== 'undefined' && window.navigator && window.navigator.language) {
      const lang = window.navigator.language
      if (lang.includes('-')) {
        const parts = lang.split('-')
        userCc = parts[parts.length - 1].toLowerCase()
      }
    }

    const sampleAppIds = playedGames.slice(0, 20).map(g => g.appid).join(',')
    let cancelled = false

    fetch(`/api/prices?appids=${sampleAppIds}&cc=${userCc}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data && data.prices) {
          if (data.symbol) setCurrencySymbol(data.symbol)
          if (data.cc) setRegionCc(data.cc.toUpperCase())
          const priceMap = data.prices
          let sum = 0
          let countWithPrice = 0
          playedGames.forEach(g => {
            if (priceMap[g.appid] !== undefined) {
              sum += priceMap[g.appid]
              countWithPrice++
            }
          })
          if (countWithPrice > 0) {
            const avgPrice = sum / countWithPrice
            const totalEst = sum + (playedGames.length - countWithPrice) * (avgPrice || 14.99)
            setLivePlayedValue(totalEst)
          }
        }
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [games])

  // Calculate 100% Real Region-Based Cost Per Hour Metric
  const estPlayedValue = livePlayedValue !== null ? livePlayedValue : (playedCount * 14.99);
  const costPerHourNum = totalPlayedHours > 0 ? (estPlayedValue / totalPlayedHours) : 0;
  const costPerHourLabel = costPerHourNum > 0 ? `${currencySymbol}${costPerHourNum.toFixed(2)}/h` : `${currencySymbol}0.00/h`;

  // Find most played game
  const mostPlayed = games.reduce((max, g) => (g.playtime_forever || 0) > (max.playtime_forever || 0) ? g : max, games[0]);
  const mostPlayedHours = Math.round((mostPlayed?.playtime_forever || 0) / 60);

  // Find last played game with 100% fail-safe fallback cascade
  const playedGames = games.filter(g => (g.playtime_forever || 0) > 0);
  const playedGamesWithTime = playedGames.filter(g => g.rtime_last_played && g.rtime_last_played > 0);

  let lastPlayed = null;
  if (playedGamesWithTime.length > 0) {
    lastPlayed = playedGamesWithTime.reduce((latest, g) => (g.rtime_last_played > latest.rtime_last_played ? g : latest), playedGamesWithTime[0]);
  } else if (playedGames.length > 0) {
    lastPlayed = playedGames[0];
  }

  const formatLastPlayedTime = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Recently';
    const daysAgo = Math.floor((Date.now() / 1000 - timestamp) / 86400);
    if (daysAgo <= 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 30) return `${daysAgo}d ago`;
    if (daysAgo < 365) return `${Math.floor(daysAgo / 30)}mo ago`;
    return `${Math.floor(daysAgo / 365)}y ago`;
  };

  const estBacklogTooltipText = "Estimated remaining time to clear your unplayed backlog, benchmarked at an average 12 hours per unplayed game (Unplayed Games × 12h)."
  const valueMetricTooltipText = `Calculated using live regional Steam Store prices for ${regionCc} (${currencySymbol}) divided by total logged playtime (Regional Store Value ÷ Time Played).`
  const totalGamesTooltipText = "Total number of games owned in your Steam library."
  const unplayedTooltipText = "Number of games in your library with 0 logged minutes of playtime."
  const timePlayedTooltipText = "Total cumulative playtime hours logged across all games in your Steam library."

  return (
    <div className="backlog-stats-card card-enter">
      <div className="stats-header flex-between">
        <span className="stats-title">Backlog Insights</span>
        <span className="stats-badge">{unplayedPct}% Backlog</span>
      </div>

      {/* Played vs Unplayed Progress Bar */}
      <div className="backlog-progress-container">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${playedPct}%` }} />
        </div>
        <div className="progress-labels flex-between">
          <span className="progress-label-left">{playedCount} Played ({playedPct}%)</span>
          <span className="progress-label-right">{unplayedCount} Unplayed</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item tooltip-target">
          <span className="stat-value">{totalGames}</span>
          <span className="stat-label">Total Games</span>
          <span className="tooltip-bubble">{totalGamesTooltipText}</span>
        </div>

        <div className="stat-item tooltip-target">
          <span className="stat-value text-rose">{unplayedCount}</span>
          <span className="stat-label">Unplayed</span>
          <span className="tooltip-bubble">{unplayedTooltipText}</span>
        </div>

        <div className="stat-item tooltip-target">
          <span className="stat-value text-indigo">{totalPlayedHours}h</span>
          <span className="stat-label">Time Played</span>
          <span className="tooltip-bubble">{timePlayedTooltipText}</span>
        </div>

        <div className="stat-item tooltip-target">
          <span className="stat-value text-amber">~{estBacklogHours}h</span>
          <span className="stat-label">Est. Backlog</span>
          <span className="tooltip-bubble">{estBacklogTooltipText}</span>
        </div>

        <div className="stat-item tooltip-target">
          <span className="stat-value text-emerald">{costPerHourLabel}</span>
          <span className="stat-label">Value ({regionCc})</span>
          <span className="tooltip-bubble">{valueMetricTooltipText}</span>
        </div>
      </div>

      <div className="top-insights-row flex-between">
        {mostPlayed && mostPlayed.playtime_forever > 0 && (
          <div className="top-played-row">
            <div className="top-played-info">
              <span className="top-played-label">Most Played</span>
              <span className="top-played-name">{mostPlayed.name} ({mostPlayedHours}h)</span>
            </div>
          </div>
        )}

        {lastPlayed && (
          <div className="top-played-row recent-activity-row">
            <div className="top-played-info">
              <span className="top-played-label">Last Played Game</span>
              <span className="top-played-name">{lastPlayed.name} ({formatLastPlayedTime(lastPlayed.rtime_last_played)})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
