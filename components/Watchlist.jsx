import { getSteamCoverUrl, getSteamStoreUrl } from '@/lib/steam'

export default function Watchlist({ pinnedGames = [], onUnpin }) {
  if (pinnedGames.length === 0) return null

  return (
    <div className="watchlist-card">
      <div className="watchlist-header">
        <svg className="watchlist-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
        <span className="watchlist-title">Watchlist</span>
        <span className="watchlist-count">{pinnedGames.length}</span>
      </div>
      <div className="watchlist-items">
        {pinnedGames.map(game => (
          <div key={game.appid} className="watchlist-item">
            <a
              href={getSteamStoreUrl(game.appid)}
              target="_blank"
              rel="noopener noreferrer"
              className="watchlist-item-link"
            >
              <img
                src={getSteamCoverUrl(game.appid)}
                alt={game.name}
                className="watchlist-thumb"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
              <span className="watchlist-item-name">{game.name}</span>
            </a>
            <button
              type="button"
              className="watchlist-unpin"
              onClick={() => onUnpin(game.appid)}
              title="Remove from watchlist"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
