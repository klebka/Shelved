import { getGameMoodTags } from './steamGenres'

export const MOOD_FILTERS = [
  { id: 'chill', label: 'Chill & Relaxing' },
  { id: 'intense', label: 'Action & Intense' },
  { id: 'story', label: 'Story & Narrative' },
  { id: 'quick', label: 'Pick-up & Play' },
  { id: 'coop', label: 'Co-Op & Multiplayer' },
]

export const EXCLUSION_FILTERS = [
  { id: 'no-horror', label: 'No Horror', keywords: ['horror', 'zombie', 'phasmophobia', 'resident evil', 'dead by daylight'] },
  { id: 'no-vr', label: 'No VR-Only', keywords: ['vr', 'virtual reality'] },
]

export function matchesMood(game, moodId) {
  if (!game) return false
  const moodTags = getGameMoodTags(game)
  return moodTags.includes(moodId)
}

export function matchesExclusion(game, exclusionId) {
  if (!game || !game.name) return false
  const ex = EXCLUSION_FILTERS.find(f => f.id === exclusionId)
  if (!ex) return false
  const nameLower = game.name.toLowerCase()
  return ex.keywords.some(kw => nameLower.includes(kw))
}

export function filterGames(games, minHours = 0, maxHours = 12, moodFilter = null, activeExclusions = []) {
  if (!games || !Array.isArray(games)) return []

  return games.filter(game => {
    // Exclusion check
    if (activeExclusions.length > 0) {
      const isExcluded = activeExclusions.some(exId => matchesExclusion(game, exId))
      if (isExcluded) return false
    }

    // Two-point time range check
    const playedHours = game.playtime_forever / 60
    if (game.playtime_forever > 0) {
      if (playedHours < minHours) return false
      if (maxHours < 12 && playedHours > maxHours) return false
    }

    // Mood check via official Steam tags / genre list
    if (moodFilter) {
      if (!matchesMood(game, moodFilter.id)) return false
    }

    return true
  })
}

export function filterMutuallyOwnedGames(libraries) {
  if (!libraries || libraries.length === 0) return []
  if (libraries.length === 1) return libraries[0]

  const firstLib = libraries[0] || []
  return firstLib.filter(game => {
    return libraries.every(lib => lib.some(g => g.appid === game.appid))
  })
}

export function estimateCompletionTime(game) {
  if (!game) return 'Est: 15-25h'
  const name = (game.name || '').toLowerCase()

  let baseHours = 22

  if (/portal|limbo|inside|stanley|journey|undertale|abzu|short|donut|goose|little nightmares/i.test(name)) {
    baseHours = 5
  } else if (/deus ex|dishonored|prey|bioshock|tomb raider|batman|god of war|metro|wolfenstein|dead space/i.test(name)) {
    baseHours = 22
  } else if (/witcher|elder scrolls|skyrim|fallout|persona|final fantasy|baldurs|elden ring|cyberpunk|monster hunter|red dead|gta/i.test(name)) {
    baseHours = 75
  } else if (/hades|dead cells|celeste|slay the spire|hollow knight|subnautica|stardew|binding of isaac/i.test(name)) {
    baseHours = 30
  } else if (/counter-strike|cs|dota|league|apex|overwatch|rocket league|rainbow six|pubg|valorant/i.test(name)) {
    return 'Est: Replayable (Endless)'
  }

  if (game.playtime_forever === 0) {
    if (baseHours <= 5) return 'Est: 3-6h (Short)'
    if (baseHours >= 70) return 'Est: 50-100h+ (Epic RPG)'
    return 'Est: 15-30h (Medium Story)'
  }

  const playedHours = Math.round(game.playtime_forever / 60)
  const remainingHours = Math.max(1, baseHours - playedHours)

  return `Est: ~${remainingHours}h Remaining`
}

function getRandomInt(max) {
  if (max <= 1) return 0
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0] % max
  }
  return Math.floor(Math.random() * max)
}

export function pickRandomGame(candidateGames, skippedAppIds = [], unplayedWeight = 30, currentAppId = null) {
  if (!candidateGames || candidateGames.length === 0) return { game: null, poolReset: false }

  // 1. Filter out skipped games
  let pool = candidateGames.filter(g => !skippedAppIds.includes(g.appid))
  let poolReset = false

  // 2. If all candidate games have been skipped, fallback to full candidate list & set poolReset flag
  if (pool.length === 0) {
    pool = [...candidateGames]
    poolReset = true
  }

  // 3. Exclude currently displayed suggestion to avoid immediate repeat if pool > 1
  if (currentAppId && pool.length > 1) {
    const withoutCurrent = pool.filter(g => g.appid !== currentAppId)
    if (withoutCurrent.length > 0) pool = withoutCurrent
  }

  // 4. Apply Backlog Weighting (0% = equal RNG, 100% = unplayed focus)
  const unplayedPool = pool.filter(g => g.playtime_forever === 0)
  const playedPool = pool.filter(g => g.playtime_forever > 0)

  let selectedGame = null
  if (unplayedWeight > 0 && unplayedPool.length > 0 && playedPool.length > 0) {
    const rand = Math.random() * 100
    if (rand < unplayedWeight) {
      selectedGame = unplayedPool[getRandomInt(unplayedPool.length)]
    } else {
      selectedGame = playedPool[getRandomInt(playedPool.length)]
    }
  } else {
    selectedGame = pool[getRandomInt(pool.length)]
  }

  return { game: selectedGame, poolReset }
}
