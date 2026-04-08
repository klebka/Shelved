'use client'
import {useState} from 'react'

export default function Home(){
  const [steamid, setSteamid] = useState('')
  const [games, setGames] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchLibrary(){
    setLoading(true)
    setError(null)

    try{
      const res = await fetch(`/api/library?steamid=${steamid}`)
      const data = await res.json()
      if(!res.ok) throw new Error(data.error)
      setGames(data)
    }
    catch(error){
      setError(error.message)
    }
    finally{
      setLoading(false)
    }
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
        style={{ width: '100%', padding: '10px 14px', fontSize: '14px',
          border: '1px solid #d1d1d1', borderRadius: '8px', marginBottom: '10px' }}
      />

      <button
        onClick={fetchLibrary}
        disabled={!steamid || loading}
        style={{ width: '100%', padding: '10px', fontSize: '14px',
          background: '#1a1a18', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: 'pointer' }}
      >
        {loading ? 'Loading...' : 'What should I play?'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '16px', fontSize: '13px' }}>{error}</p>
      )}

      {games && (
        <p style={{ marginTop: '24px', fontSize: '13px', color: '#888' }}>
          {games.length} games found in library.
        </p>
      )}
    </main>
  )
}