import { describe, it, expect } from 'vitest'
import {
  filterGames,
  pickRandomGame,
  matchesMood,
  estimateCompletionTime,
  filterMutuallyOwnedGames
} from '../lib/filters'
import { getGameMoodTags } from '../lib/steamGenres'

const mockGames = [
  { appid: 730, name: 'Counter-Strike 2', playtime_forever: 1200, rtime_last_played: 1600000000 },
  { appid: 400, name: 'Portal', playtime_forever: 0, rtime_last_played: 0 },
  { appid: 367520, name: 'Hollow Knight', playtime_forever: 60, rtime_last_played: 1600000000 },
  { appid: 739630, name: 'Phasmophobia VR Horror', playtime_forever: 300, rtime_last_played: 1600000000 },
  { appid: 99999, name: 'Random Unknown Title', playtime_forever: 0, rtime_last_played: 0 }
]

const friend1Games = [
  { appid: 400, name: 'Portal', playtime_forever: 10 },
  { appid: 367520, name: 'Hollow Knight', playtime_forever: 50 },
  { appid: 105600, name: 'Terraria', playtime_forever: 200 }
]

const friend2Games = [
  { appid: 367520, name: 'Hollow Knight', playtime_forever: 15 },
  { appid: 105600, name: 'Terraria', playtime_forever: 100 }
]

describe('Filter Utils', () => {
  it('guarantees 100% coverage so every game in a library belongs to at least one mood category', () => {
    mockGames.forEach(game => {
      const tags = getGameMoodTags(game)
      expect(tags.length).toBeGreaterThan(0)
    })
  })

  it('filters by two-point session duration limits correctly', () => {
    const filtered = filterGames(mockGames, 0.5, 2, null, [])
    expect(filtered.some(g => g.appid === 730)).toBe(false)
    expect(filtered.some(g => g.appid === 367520)).toBe(true)
  })

  it('filters out excluded keywords like horror and VR', () => {
    const filtered = filterGames(mockGames, 0, 12, null, ['no-horror', 'no-vr'])
    expect(filtered.some(g => g.appid === 739630)).toBe(false)
  })

  describe('Multi-Player Mutual Games Comparison', () => {
    it('returns only games mutually owned by both Player A and Player B', () => {
      const mutual = filterMutuallyOwnedGames([mockGames, friend1Games])
      expect(mutual.length).toBe(2)
      expect(mutual.map(g => g.appid)).toEqual([400, 367520])
    })

    it('returns only games mutually owned across 3+ players', () => {
      const mutual3 = filterMutuallyOwnedGames([mockGames, friend1Games, friend2Games])
      expect(mutual3.length).toBe(1)
      expect(mutual3[0].appid).toBe(367520)
    })
  })

  it('accurately matches mood & genre tags via official Steam AppID genre map', () => {
    expect(matchesMood({ appid: 413150, name: 'Stardew Valley' }, 'chill')).toBe(true)
    expect(matchesMood({ appid: 730, name: 'Counter-Strike 2' }, 'intense')).toBe(true)
    expect(matchesMood({ appid: 1086940, name: 'Baldurs Gate 3' }, 'story')).toBe(true)
    expect(matchesMood({ appid: 1091500, name: 'Cyberpunk 2077' }, 'story')).toBe(true)
    expect(matchesMood({ appid: 2379780, name: 'Balatro' }, 'quick')).toBe(true)
    expect(matchesMood({ appid: 1145360, name: 'Hades' }, 'quick')).toBe(true)
    expect(matchesMood({ appid: 1942690, name: 'Lethal Company' }, 'coop')).toBe(true)
    expect(matchesMood({ appid: 550, name: 'Left 4 Dead 2' }, 'coop')).toBe(true)
  })

  it('excludes skipped appids and avoids repeating the currently displayed game', () => {
    const skipped = [400]
    const currentAppId = 730
    const { game: picked, poolReset } = pickRandomGame(mockGames, skipped, 30, currentAppId)
    expect(picked.appid).not.toBe(400)
    expect(picked.appid).not.toBe(730)
    expect(poolReset).toBe(false)
  })

  it('falls back to candidate pool and flags poolReset if all games have been skipped', () => {
    const allSkipped = [730, 400, 367520, 739630, 99999]
    const { game: picked, poolReset } = pickRandomGame(mockGames, allSkipped)
    expect(picked).not.toBeNull()
    expect(mockGames.some(g => g.appid === picked.appid)).toBe(true)
    expect(poolReset).toBe(true)
  })
})
