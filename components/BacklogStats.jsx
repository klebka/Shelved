export default function BacklogStats({ games }) {
  if (!games || games.length === 0) return null;

  const totalGames = games.length;
  const unplayedCount = games.filter(g => g.playtime_forever === 0).length;
  const unplayedPct = totalGames > 0 ? Math.round((unplayedCount / totalGames) * 100) : 0;
  
  const totalMinutes = games.reduce((acc, g) => acc + (g.playtime_forever || 0), 0);
  const totalPlayedHours = Math.round(totalMinutes / 60);
  const estBacklogHours = Math.round(unplayedCount * 12);

  return (
    <div className="backlog-stats-card card-enter">
      <div className="stats-header flex-between">
        <span className="stats-title">Backlog Insights</span>
        <span className="stats-badge">{unplayedPct}% Unplayed</span>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{totalGames}</span>
          <span className="stat-label">Total Games</span>
        </div>

        <div className="stat-item">
          <span className="stat-value text-rose">{unplayedCount}</span>
          <span className="stat-label">Unplayed</span>
        </div>

        <div className="stat-item">
          <span className="stat-value text-indigo">{totalPlayedHours}h</span>
          <span className="stat-label">Time Played</span>
        </div>

        <div className="stat-item">
          <span className="stat-value text-amber">~{estBacklogHours}h</span>
          <span className="stat-label">Est. Backlog</span>
        </div>
      </div>
    </div>
  )
}
