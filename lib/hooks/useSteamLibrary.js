import { useState } from 'react'
import { isValidSteamId } from '@/lib/steam'
import { filterMutuallyOwnedGames } from '@/lib/filters'

export function useSteamLibrary() {
  const [steamid, setSteamid] = useState('')
  const [friendSteamIds, setFriendSteamIds] = useState([])
  const [games, setGames] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPrivateProfile, setIsPrivateProfile] = useState(false)

  async function fetchLibrary(onSuccess) {
    if (loading || !steamid.trim()) return
    const primaryId = steamid.trim()

    if (!isValidSteamId(primaryId)) {
      setError('Please enter a valid 17-digit Steam ID.')
      setIsPrivateProfile(false)
      return
    }

    setLoading(true)
    setError(null)
    setIsPrivateProfile(false)
    setGames(null)

    try {
      const res1 = await fetch(`/api/library?steamid=${primaryId}`)
      const data1 = await res1.json()
      if (!res1.ok) {
        if (res1.status === 404 || (data1.error && data1.error.toLowerCase().includes('private'))) {
          setIsPrivateProfile(true)
        }
        throw new Error(data1.error || 'Failed to fetch games')
      }

      let combinedGames = data1

      // Deduplicate friend Steam IDs and ignore self-matches
      const uniqueFriendIds = Array.from(
        new Set(
          friendSteamIds
            .map(id => id.trim())
            .filter(id => isValidSteamId(id) && id !== primaryId)
        )
      )

      if (uniqueFriendIds.length > 0) {
        const friendFetches = uniqueFriendIds.map(id =>
          fetch(`/api/library?steamid=${id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
        const friendResults = await Promise.all(friendFetches)
        const validFriendLibs = friendResults.filter(res => Array.isArray(res))

        if (validFriendLibs.length > 0) {
          combinedGames = filterMutuallyOwnedGames([data1, ...validFriendLibs])
          if (combinedGames.length === 0) {
            setError(`No mutually owned games found across these ${uniqueFriendIds.length + 1} players. Make sure everyone has public game details set on Steam.`)
            setGames([])
            return
          }
        }
      }

      setGames(combinedGames)
      if (onSuccess) onSuccess(combinedGames)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    steamid,
    setSteamid,
    friendSteamIds,
    setFriendSteamIds,
    games,
    setGames,
    loading,
    error,
    setError,
    isPrivateProfile,
    fetchLibrary
  }
}
