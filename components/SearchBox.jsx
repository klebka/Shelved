import { useEffect } from 'react'
import { getSavedSteamId, saveSteamId } from '@/lib/steam'

export default function SearchBox({
  steamid,
  setSteamid,
  friendSteamIds = [],
  setFriendSteamIds,
  onSearch,
  loading
}) {
  const SAMPLES = [
    { label: 'Public Demo 1', id: '76561198274160349' },
    { label: 'Public Demo 2', id: '76561199057913061' },
    { label: 'Public Demo 3', id: '76561199808671807' },
  ]

  useEffect(() => {
    const saved = getSavedSteamId()
    if (saved && !steamid) {
      setSteamid(saved)
    }
  }, [])

  const handleSearchSubmit = () => {
    if (steamid) {
      saveSteamId(steamid)
    }
    onSearch()
  }

  const handleAddFriend = () => {
    setFriendSteamIds([...friendSteamIds, ''])
  }

  const handleUpdateFriend = (index, value) => {
    const updated = [...friendSteamIds]
    updated[index] = value
    setFriendSteamIds(updated)
  }

  const handleRemoveFriend = (index) => {
    setFriendSteamIds(friendSteamIds.filter((_, i) => i !== index))
  }

  const steamIdHelpTooltip = "Your Steam ID is the 17-digit number found in your Steam profile URL (e.g., steamcommunity.com/profiles/76561198...). You can also find it in Steam Settings > Account Details."
  const friendIdHelpTooltip = "Ask your friend to copy the 17-digit number from their Steam Profile URL address bar."

  return (
    <div className="search-container">
      <div className="sso-banner">
        <a href="/api/auth/steam/login" className="btn-steam-sso">
          <svg className="steam-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c.002.048.007.094.007.143 0 1.84-1.493 3.333-3.334 3.333-1.498 0-2.766-.989-3.186-2.348L.248 15.484C1.528 20.447 6.326 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z"/>
          </svg>
          Sign in through STEAM
        </a>
        <span className="or-divider">or enter Steam ID manually</span>
      </div>

      {/* Main Steam ID Input Header with ? Tooltip */}
      <div className="search-box-group">
        <div className="search-box-header flex-between">
          <div className="filter-label-with-tooltip">
            <span className="search-label-text">Steam ID (17 Digits)</span>
            <span className="tooltip-target info-circle-icon">
              ?
              <span className="tooltip-bubble">{steamIdHelpTooltip}</span>
            </span>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="e.g. 76561198274160349..."
            value={steamid}
            onChange={e => setSteamid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={!steamid.trim() || loading}
            className="search-btn"
          >
            {loading ? (
              <>
                <div className="spinner" />
                Searching
              </>
            ) : (
              'Find Games'
            )}
          </button>
        </div>
      </div>

      {/* Multi-Friend Steam ID Inputs */}
      {friendSteamIds.map((friendId, index) => (
        <div key={index} className="search-box-group">
          <div className="search-box-header flex-between">
            <div className="filter-label-with-tooltip">
              <span className="search-label-text">Friend #{index + 1} Steam ID</span>
              <span className="tooltip-target info-circle-icon">
                ?
                <span className="tooltip-bubble">{friendIdHelpTooltip}</span>
              </span>
            </div>
          </div>

          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder={`Friend #${index + 1} 17-digit Steam ID...`}
              value={friendId}
              onChange={e => handleUpdateFriend(index, e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
            />
            <button
              type="button"
              className="btn-remove-friend"
              onClick={() => handleRemoveFriend(index)}
            >
              <svg className="remove-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn-add-friend"
        onClick={handleAddFriend}
      >
        <svg className="add-friend-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="17" y1="11" x2="23" y2="11" />
        </svg>
        Add Friend (Compare Group Libraries)
      </button>

      <div className="quick-samples">
        <span className="quick-title">Quick try:</span>
        {SAMPLES.map(sample => (
          <button
            key={sample.id}
            type="button"
            className="sample-btn"
            onClick={() => {
              setSteamid(sample.id)
              saveSteamId(sample.id)
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  )
}
