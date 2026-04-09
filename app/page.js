'use client'
import { useState } from 'react'

const SESSION_FILTERS = [
  { label: '30 min', max: 120 },
  { label: '2 hours', max: 480 },
  { label: 'All evening', max: Infinity },
]

const MOOD_FILTERS = [
  { label: 'Chill', tags: ['casual', 'relaxing', 'puzzle', 'exploration', 'walking simulator'] },
  { label: 'Intense', tags: ['action', 'shooter', 'fps', 'fast-paced', 'difficult', 'souls-like'] },
  { label: 'Story', tags: ['story rich', 'rpg', 'adventure', 'narrative', 'visual novel', 'choices matter'] },
  { label: 'Quick', tags: ['arcade', 'roguelite', 'indie', 'short', 'casual'] },
]

export default function Home() {
  const [steamid, setSteamid] = useState('')
  const [games, setGames] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)
  const [mood, setMood] = useState(null)
  const [shameMode, setShameMode] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  async function fetchLibrary() {
    setLoading(true)
    setError(null)
    setSuggestion(null)
    setGames(null)
    setImageLoaded(false)
    try {
      const res = await fetch(`/api/library?steamid=${steamid.trim()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setGames(data)
      pickGame(data, session, mood, shameMode)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function filterGames(library, sessionFilter, moodFilter, shame) {
    let filtered = [...library]
    if (shame) {
      return filtered
        .filter(g => g.playtime_forever === 0)
        .sort((a, b) => a.appid - b.appid)
    }
    if (sessionFilter) {
      filtered = filtered.filter(g => {
        if (g.playtime_forever === 0) return true
        const sessions = g.rtime_last_played ? 3 : 1
        return (g.playtime_forever / sessions) <= sessionFilter.max
      })
    }
    if (moodFilter) {
      const moodTagged = filtered.filter(g =>
        moodFilter.tags.some(tag => (g.name || '').toLowerCase().includes(tag))
      )
      if (moodTagged.length >= 3) filtered = moodTagged
    }
    return filtered
  }

  function pickGame(library = games, sessionFilter = session, moodFilter = mood, shame = shameMode) {
    if (!library || library.length === 0) return
    const filtered = filterGames(library, sessionFilter, moodFilter, shame)
    if (filtered.length === 0) {
      setError('No games match your filters. Try adjusting them.')
      return
    }
    setError(null)
    setPicking(true)
    setImageLoaded(false)
    setTimeout(() => {
      const next = shame
        ? filtered[0]
        : filtered[Math.floor(Math.random() * filtered.length)]
      setSuggestion(next)
      setPicking(false)
    }, 300)
  }

  function handleSessionToggle(f) {
    const next = session?.label === f.label ? null : f
    setSession(next)
    if (games) pickGame(games, next, mood, shameMode)
  }

  function handleMoodToggle(f) {
    const next = mood?.label === f.label ? null : f
    setMood(next)
    if (games) pickGame(games, session, next, shameMode)
  }

  function handleShameToggle() {
    const next = !shameMode
    setShameMode(next)
    if (games) pickGame(games, session, mood, next)
  }

  function getPlaytime(minutes) {
    if (minutes === 0) return 'Never played'
    if (minutes < 60) return `${minutes}m played`
    return `${(minutes / 60).toFixed(1)}h played`
  }

  const pill = (active, shame = false) => ({
    padding: '7px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: active ? '500' : '400',
    border: shame
      ? `1px solid ${active ? '#ff4444' : '#663333'}`
      : `1px solid ${active ? '#ffffff' : '#2e2e3a'}`,
    cursor: 'pointer',
    background: shame
      ? (active ? '#ff444422' : 'transparent')
      : (active ? '#ffffff18' : 'transparent'),
    color: shame
      ? (active ? '#ff8888' : '#885555')
      : (active ? '#ffffff' : '#666680'),
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  })

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0b0812; }
        input::placeholder { color: #444455; }
        input:focus { outline: none; border-color: #444466 !important; }
        button:active { transform: scale(0.97); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.7; }
          100% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .card-enter { animation: fadeUp 0.35s ease forwards; }
        .shimmer    { animation: shimmer 1.4s ease-in-out infinite; }
        .spinner    { animation: spin 0.8s linear infinite; }
        @media (max-width: 480px) {
          .filters-row { gap: 6px !important; }
          .main-pad    { padding: 40px 1rem 80px !important; }
        }
      `}</style>

      <main className="main-pad" style={{
        maxWidth: '460px',
        margin: '0 auto',
        padding: '60px 1.5rem 100px',
        minHeight: '100vh',
        background: '#0b0812',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>

        {/* Header */}
        <div style={{ 
          marginBottom: '36px' 
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            letterSpacing: '-2px', 
            lineHeight: 1, 
            marginBottom: '8px' 
          }}>
            Shelved
          </h1>
          <p style={{ 
            color: '#555566', 
            fontSize: '15px', 
            lineHeight: 1.5 
          }}>
            Too many games, not enough time.
          </p>
        </div>

        {/* Filter section */}
        <div style={{ 
          marginBottom: '28px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px' 
        }}>

          <div>
            <p style={{ 
              fontSize: '10px', 
              color: '#444455', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              marginBottom: '10px' 
            }}>
              Time available
            </p>
            <div className="filters-row" style={{ 
              display: 'flex', 
              gap: '8px', 
              flexWrap: 'wrap' 
            }}>
              {SESSION_FILTERS.map(f => (
                <button key={f.label} onClick={() => handleSessionToggle(f)} style={pill(session?.label === f.label)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ 
              fontSize: '10px', 
              color: '#444455', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              marginBottom: '10px' 
            }}>
              Mood
            </p>
            <div className="filters-row" style={{ 
              display: 'flex', 
              gap: '8px', 
              flexWrap: 'wrap' 
            }}>
              {MOOD_FILTERS.map(f => (
                <button key={f.label} onClick={() => handleMoodToggle(f)} style={pill(mood?.label === f.label)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ 
              fontSize: '10px', 
              color: '#444455', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              marginBottom: '10px' 
            }}>
              Backlog guilt
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <button onClick={handleShameToggle} style={pill(shameMode, true)}>
                {shameMode ? 'Shame mode ON' : 'Shame mode'}
              </button>
              {shameMode && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#885555' 
                }}>
                  Surfacing your most neglected games
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ 
          height: '1px', 
          background: '#1a1825', 
          marginBottom: '24px' 
        }}/>

        {/* Search input */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <input
            type="text"
            placeholder="Enter your Steam ID..."
            value={steamid}
            onChange={e => setSteamid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && steamid && !loading && fetchLibrary()}
            style={{
              flex: 1,
              padding: '11px 16px',
              fontSize: '14px',
              border: '1px solid #1e1e2a',
              borderRadius: '10px',
              background: '#12101a',
              color: '#fff',
              transition: 'border-color 0.15s',
            }}/>
          <button
            onClick={fetchLibrary}
            disabled={!steamid || loading}
            style={{
              padding: '11px 20px',
              fontSize: '14px',
              fontWeight: '500',
              background: steamid && !loading ? '#fff' : '#1a1825',
              color: steamid && !loading ? '#0b0812' : '#333344',
              border: 'none',
              borderRadius: '10px',
              cursor: steamid && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}>
            {loading ? (
              <>
                <div className="spinner" style={{
                  width: '14px', height: '14px',
                  border: '2px solid #333344',
                  borderTopColor: '#666677',
                  borderRadius: '50%',
                }}/>
                Loading
              </>
            ) : 'Search'}
          </button>
        </div>

        {/* Helper text */}
        {!games && !loading && (
          <p style={{ fontSize: '12px', color: '#333344', marginBottom: '24px' }}>
            Find your Steam ID at steamidfinder.com
          </p>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#1a0f0f',
            border: '1px solid #331111',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#ff6666',
          }}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ marginTop: '28px', borderRadius: '14px', overflow: 'hidden', background: '#12101a', border: '1px solid #1a1825' }}>
            <div className="shimmer" style={{ width: '100%', aspectRatio: '460/215', background: '#1a1825' }} />
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="shimmer" style={{ height: '20px', width: '60%', background: '#1a1825', borderRadius: '6px' }} />
              <div className="shimmer" style={{ height: '14px', width: '30%', background: '#1a1825', borderRadius: '6px' }} />
              <div className="shimmer" style={{ height: '40px', width: '100%', background: '#1a1825', borderRadius: '8px', marginTop: '6px' }} />
            </div>
          </div>
        )}

        {/* Game card */}
        {suggestion && !loading && (
          <div
            key={suggestion.appid}
            className="card-enter"
            style={{
              marginTop: '28px',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#fffffff6',
              border: '1px solid #ffffff',
              opacity: picking ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}>
            {/* Cover image */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '46.7%', background: '#1a1825' }}>
              {!imageLoaded && (
                <div className="shimmer" style={{
                  position: 'absolute', inset: 0,
                  background: '#1a1825',
                }}/>
              )}
              <img
                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${suggestion.appid}/header.jpg`}
                alt={suggestion.name}
                onLoad={() => setImageLoaded(true)}
                onError={e => { e.target.style.display = 'none'; setImageLoaded(true) }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}/>
            </div>

            {/* Card body */}
            <div style={{ padding: '10px' }}>
              <h2 style={{ 
                fontSize: '20px', 
                color: '#000000',
                fontWeight: '600', 
                marginBottom: '6px', 
                lineHeight: 1.2 
                }}>
                {suggestion.name}
              </h2>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '20px' 
              }}>
                <span style={{
                  fontSize: '12px',
                  color: suggestion.playtime_forever === 0 ? '#ff8888' : '#666680',
                  background: suggestion.playtime_forever === 0 ? '#ff222211' : '#00000008',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: `1px solid ${suggestion.playtime_forever === 0 ? '#ff222233' : '#00000011'}`,
                }}>
                  {getPlaytime(suggestion.playtime_forever)}
                </span>
                {suggestion.playtime_forever === 0 && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#664444' 
                  }}>
                    time to fix that
                  </span>
                )}
              </div>

              <button
                onClick={() => pickGame()}
                style={{
                  width: '100%',
                  padding: '1px',
                  fontSize: '14px',
                  fontWeight: '400',
                  background: 'transparent',
                  color: '#666680',
                  border: '1px solid #1e1a2e',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#2e2a4e'; e.target.style.color = '#9999bb' }}
                onMouseLeave={e => { e.target.style.borderColor = '#1e1a2e'; e.target.style.color = '#666680' }}
              >
                Pick again
              </button>
            </div>
          </div>
        )}

        {/* Library count */}
        {games && !loading && (
          <p style={{ 
            marginTop: '14px', 
            fontSize: '12px', 
            color: '#2a2838', 
            textAlign: 'center' 
          }}>
            {games.length} games in library
          </p>
        )}

        {/* Footer */}
        <p style={{ 
          marginTop: '60px', 
          fontSize: '12px', 
          color: '#1e1c2a', 
          textAlign: 'center' 
        }}>
          — klebka —
        </p>
      </main>
    </>
  )
}