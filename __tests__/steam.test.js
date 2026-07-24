import { describe, it, expect } from 'vitest'
import {
  isValidSteamId,
  formatPlaytime,
  getSteamCoverUrl,
  getSteamStoreUrl,
  getPlatforms
} from '../lib/steam'

describe('Steam Utils', () => {
  it('validates 17-digit numeric Steam IDs', () => {
    expect(isValidSteamId('76561198274160349')).toBe(true)
    expect(isValidSteamId('12345')).toBe(false)
    expect(isValidSteamId('abc76561198274160')).toBe(false)
    expect(isValidSteamId('')).toBe(false)
    expect(isValidSteamId(null)).toBe(false)
  })

  it('formats playtime correctly', () => {
    expect(formatPlaytime(0)).toBe('Never played')
    expect(formatPlaytime(45)).toBe('45m played')
    expect(formatPlaytime(120)).toBe('2.0h played')
    expect(formatPlaytime(null)).toBe('Never played')
  })

  it('generates Steam cover and store URLs', () => {
    expect(getSteamCoverUrl(10)).toBe('https://cdn.cloudflare.steamstatic.com/steam/apps/10/header.jpg')
    expect(getSteamStoreUrl(10)).toBe('https://store.steampowered.com/app/10')
  })

  it('detects Windows, macOS, Linux, and Steam Deck platforms', () => {
    const portalPlatforms = getPlatforms({ name: 'Portal' })
    expect(portalPlatforms).toContain('Win')
    expect(portalPlatforms).toContain('Mac')
    expect(portalPlatforms).toContain('Linux')
    expect(portalPlatforms).toContain('Deck')

    const winOnlyPlatforms = getPlatforms({ name: 'Unknown Windows Only Game App' })
    expect(winOnlyPlatforms).toContain('Win')
    expect(winOnlyPlatforms).toContain('Deck')
  })
})
