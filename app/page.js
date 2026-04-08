'use client'
import {useState} from 'react'

export default function Home(){
  const [steamid, setSteamid] = useState('')
  const [games, setGames] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchLibrary(){
    setLoading(true)
    setError(null)
    setSuggestion(null)
    setGames(null)

    try{
      const res = await fetch(`/api/library?steamid=${steamid}`)
      const data = await res.json()
      if(!res.ok) throw new Error(data.error)
      setGames(data)
      pickGame(data)
    }
    catch(error){
      setError(error.message)
    }
    finally{
      setLoading(false)
    }
  }

  function pickGame(library = games){
    if(!library || library.length === 0) return
    const random = library[Math.floor(Math.random() * library.length)]
    setSuggestion(random)
  }

  function getPlaytime(minutes){
    if(minutes === 0) return 'Never played'
    if(minutes < 60) return `${minutes}m played`
    const hours = (minutes / 60).toFixed(1)
    return `${hours}h played`
  }

  return(
    <main style={{ maxWidth: '480px', margin: '80px auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '500', marginBottom: '8px' }}>
        Shelved
      </h1>
      <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>
        Too many games, not enough decisions.
      </p>

      <input
        type="text"
        placeholder="Enter your Steam ID"
        value={steamid}
        onChange={(e) => setSteamid(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && fetchLibrary()}
        style={{ width: '100%', padding: '10px 14px', fontSize: '14px',
          border: '1px solid #d1d1d1', borderRadius: '8px', marginBottom: '10px' }}
      />

      <button
        onClick={fetchLibrary}
        disabled={!steamid || loading}
        style={{ width: '100%', padding: '10px', fontSize: '14px',
          background: '#1a1a18', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: steamid && !loading ? 'pointer' : 'not-allowed',
          opacity: !steamid || loading ? 0.5 : 1 }}
      >
        {loading ? 'Loading your library...' : 'What should I play?'}
      </button>

      {error && (
        <p style={{ color: '#cc3333', marginTop: '16px', fontSize: '13px' }}>
          {error}
        </p>
      )}

      {suggestion && (
        <div style={{ marginTop: '32px', border: '2px solid #494949',
          borderRadius: '12px', overflow: 'hidden', background: '#cdcdcd' }}>

          <img
            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${suggestion.appid}/header.jpg`}
            alt={suggestion.name}
            style={{ width: '100%', display: 'block' }}
          />

          <div style={{ padding: '16px' }}>
            <h2 style={{ fontSize: '18px', color: '#000000', fontWeight: '500', marginBottom: '6px' }}>
              {suggestion.name}
            </h2>

            <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
              {getPlaytime(suggestion.playtime_forever)}
              {suggestion.playtime_forever === 0 && ' — time to fix that'}
            </p>

            <button
              onClick={() => pickGame()}
              style={{ width: '100%', padding: '10px', fontSize: '14px',
                background: '#fff', color: '#1a1a18',
                border: '1px solid #d1d1d1', borderRadius: '8px', cursor: 'pointer' }}
            >
              Pick again
            </button>
          </div>
        </div>
      )}

      {games && (
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#aaa', textAlign: 'center' }}>
          Picking from {games.length} games in your library
        </p>
      )}
    </main>
  )
}