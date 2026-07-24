import { describe, it, expect } from 'vitest'
import { GET as libraryApiHandler } from '../app/api/library/route.js'
import manifest from '../app/manifest.js'
import { isValidSteamId } from '../lib/steam.js'
import { filterGames, pickRandomGame } from '../lib/filters.js'

describe('Smoke Tests - Core Application Integrity', () => {
  describe('PWA Manifest Endpoint', () => {
    it('returns a valid PWA web manifest with required properties', () => {
      const pwaManifest = manifest()
      expect(pwaManifest).toHaveProperty('name')
      expect(pwaManifest).toHaveProperty('short_name', 'Shelved')
      expect(pwaManifest).toHaveProperty('display', 'standalone')
      expect(pwaManifest).toHaveProperty('start_url', '/')
      expect(Array.isArray(pwaManifest.icons)).toBe(true)
      expect(pwaManifest.icons.length).toBeGreaterThan(0)
    })
  })

  describe('Steam Library API Route Handler', () => {
    it('returns 400 Bad Request error response when steamid parameter is missing', async () => {
      const request = new Request('http://localhost:3000/api/library')
      const response = await libraryApiHandler(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Missing steamid parameter')
    })

    it('returns 422 Unprocessable Entity when steamid parameter is invalid', async () => {
      const request = new Request('http://localhost:3000/api/library?steamid=invalid_id_123')
      const response = await libraryApiHandler(request)
      expect(response.status).toBe(422)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Invalid Steam ID. Must be a 17-digit number.')
    })
  })

  describe('Public Demo Accounts & Steam ID Validation', () => {
    it('validates 17-digit public demo Steam IDs', () => {
      expect(isValidSteamId('76561198274160349')).toBe(true)
      expect(isValidSteamId('76561199057913061')).toBe(true)
      expect(isValidSteamId('76561199808671807')).toBe(true)
    })
  })

  describe('Filter & RNG Selection Pipeline', () => {
    it('executes filter pipeline without crashing on empty or filled libraries', () => {
      const emptyResult = filterGames([], 0, 12, null, [])
      expect(emptyResult).toEqual([])

      const { game: nullPick } = pickRandomGame([])
      expect(nullPick).toBeNull()

      const sampleGames = [
        { appid: 10, name: 'Counter-Strike 2', playtime_forever: 100 },
        { appid: 20, name: 'Portal', playtime_forever: 0 }
      ]
      const filtered = filterGames(sampleGames, 0, 12, null, [])
      expect(filtered.length).toBe(2)

      const { game: picked } = pickRandomGame(filtered, [], 50)
      expect(picked).not.toBeNull()
      expect(sampleGames.some(g => g.appid === picked.appid)).toBe(true)
    })
  })
})
