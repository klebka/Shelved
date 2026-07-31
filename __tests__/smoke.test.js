import { describe, it, expect, beforeEach } from 'vitest'
import { GET as libraryApiHandler, clearRateLimitMap } from '../app/api/library/route.js'
import { GET as visitorsApiHandler, parseVercelAnalyticsCount } from '../app/api/visitors/route.js'
import manifest from '../app/manifest.js'
import { isValidSteamId } from '../lib/steam.js'
import { filterGames, pickRandomGame } from '../lib/filters.js'

describe('Smoke Tests - Core Application Integrity', () => {
  beforeEach(() => {
    clearRateLimitMap()
  })

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

  describe('Visitor Counter API Route Handler', () => {
    it('returns incrementing visitor count and respects readOnly parameter', async () => {
      const req1 = new Request('http://localhost:3000/api/visitors')
      const res1 = await visitorsApiHandler(req1)
      expect(res1.status).toBe(200)
      const data1 = await res1.json()

      const req2 = new Request('http://localhost:3000/api/visitors')
      const res2 = await visitorsApiHandler(req2)
      const data2 = await res2.json()
      expect(data2.count).toBe(data1.count + 1)

      const reqReadOnly = new Request('http://localhost:3000/api/visitors?readOnly=true')
      const resReadOnly = await visitorsApiHandler(reqReadOnly)
      const dataReadOnly = await resReadOnly.json()
      expect(dataReadOnly.count).toBe(data2.count)
    })

    it('correctly parses Vercel Analytics REST API response formats, prioritizing visitors', () => {
      expect(parseVercelAnalyticsCount({ visitors: { value: 950 }, pageviews: { value: 1420 } })).toBe(950)
      expect(parseVercelAnalyticsCount({ visitors: [{ value: 500 }, { value: 450 }] })).toBe(950)
      expect(parseVercelAnalyticsCount({ pageviews: { value: 1420 } })).toBe(1420)
      expect(parseVercelAnalyticsCount({ total: 2000 })).toBe(2000)
      expect(parseVercelAnalyticsCount(null)).toBeNull()
    })
  })

  describe('Steam Library API Route Handler & Rate Limiting', () => {
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

    it('enforces HTTP 422 for invalid IDs and HTTP 429 rate limit error when requests exceed limit', async () => {
      const testIp = '192.168.1.100'
      const headers = { 'x-forwarded-for': testIp }

      // Make 15 requests (allowed limit)
      for (let i = 0; i < 15; i++) {
        const req = new Request('http://localhost:3000/api/library?steamid=invalid_id_123', { headers })
        const res = await libraryApiHandler(req)
        expect(res.status).toBe(422)
      }

      // 16th request should hit 429 Too Many Requests
      const rateLimitedReq = new Request('http://localhost:3000/api/library?steamid=76561198274160349', { headers })
      const rateLimitedRes = await libraryApiHandler(rateLimitedReq)
      expect(rateLimitedRes.status).toBe(429)
      const data = await rateLimitedRes.json()
      expect(data).toHaveProperty('error', 'Too many requests. Please wait a minute before searching again.')
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
