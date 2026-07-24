// Official Steam AppID Tag & Genre Mapping Table
export const STEAM_APP_GENRES = {
  // AppID -> Array of Mood Tags: ['chill', 'intense', 'story', 'quick', 'coop']
  413150: ['chill', 'coop'],       // Stardew Valley
  105600: ['chill', 'coop'],       // Terraria
  730:    ['intense', 'coop'],     // Counter-Strike 2
  1091500:['story', 'intense'],    // Cyberpunk 2077
  1086940:['story', 'coop'],       // Baldur's Gate 3
  1145360:['quick', 'intense'],    // Hades
  2379780:['quick', 'chill'],      // Balatro
  1942690:['coop', 'intense'],     // Lethal Company
  252490: ['coop', 'intense'],     // Rust
  550:    ['coop', 'intense'],     // Left 4 Dead 2
  620:    ['coop', 'chill'],       // Portal 2
  4000:   ['coop', 'chill'],       // Garry's Mod
  292030: ['story'],               // Witcher 3
  489830: ['story'],               // Skyrim
  1245620:['intense', 'story'],    // Elden Ring
  271590: ['story', 'intense'],    // GTA V
  1172470:['intense', 'coop'],     // Apex Legends
  570:    ['intense', 'coop'],     // Dota 2
  252950: ['quick', 'coop'],       // Rocket League
  219740: ['chill', 'coop'],       // Don't Starve
  289070: ['chill', 'story'],      // Civilization VI
  367520: ['intense', 'quick'],    // Hollow Knight
  582010: ['intense', 'story'],    // Monster Hunter World
  814380: ['intense'],             // Sekiro
  504230: ['intense', 'quick'],    // Celeste
  646570: ['intense', 'quick'],    // Slay the Spire
  242760: ['chill', 'coop'],       // The Forest
  1172620:['chill', 'coop'],       // Sea of Thieves
  548430: ['coop', 'chill'],       // Deep Rock Galactic
  1623730:['chill', 'coop'],       // Palworld
  739630: ['coop', 'intense'],     // Phasmophobia
  381210: ['coop', 'intense'],     // Dead by Daylight
  230410: ['intense', 'coop'],     // Warframe
  1085660:['intense', 'story'],    // Destiny 2
  1426210:['chill', 'coop'],       // It Takes Two
  440:    ['intense', 'coop'],     // Team Fortress 2
  236850: ['story'],               // Europa Universalis IV
  281990: ['story', 'chill'],      // Stellaris
  1151640:['story'],               // Horizon Zero Dawn
  1593500:['story', 'intense'],    // God of War
  1817070:['story', 'intense'],    // Spider-Man Remastered
  1174180:['story', 'intense'],    // Red Dead Redemption 2
  221100: ['story'],               // Dishonored
  200510: ['story'],               // XCOM: Enemy Unknown
  70:     ['intense', 'story'],    // Half-Life
  220:    ['intense', 'story'],    // Half-Life 2
  400:    ['chill'],               // Portal
  203770: ['intense'],             // Hotline Miami
  218620: ['coop', 'intense'],     // PAYDAY 2
  250900: ['quick', 'chill'],      // The Binding of Isaac: Rebirth
  311690: ['quick', 'chill'],      // Enter the Gungeon
  1794680:['quick', 'chill'],      // Vampire Survivors
  883710: ['story', 'intense'],    // Resident Evil 2
  1196590:['story', 'intense'],    // Resident Evil Village
  431960: ['chill'],               // Wallpaper Engine
}

// Secondary Heuristics for Unmapped Games to Ensure 100% Coverage
const HEURISTIC_PATTERNS = {
  chill: /sim|farm|cozy|puzzle|build|city|park|craft|card|board|deck|tycoon|truck|flight|relax|casual|indie|tabletop|golf|fishing|chess|rhythm/i,
  intense: /action|shooter|fps|war|combat|battle|arena|fight|slasher|racing|rally|speed|survival|zombie|horror|strike|defense|tactics/i,
  story: /rpg|role-playing|adventure|story|quest|legend|chronicle|tales|fantasy|mystery|detective|visual novel|choice|saga|empire|kingdom/i,
  quick: /arcade|rogue|run|dash|jump|platform|arena|blitz|party|micro|minigame|score|endless|brawl/i,
  coop: /multiplayer|co-op|coop|online|squad|party|team|versus|mmo|together|friends/i
}

export function getGameMoodTags(game) {
  if (!game) return ['chill']

  const tags = new Set()

  // 1. Explicit Steam AppID lookup
  if (game.appid && STEAM_APP_GENRES[game.appid]) {
    STEAM_APP_GENRES[game.appid].forEach(t => tags.add(t))
    return Array.from(tags)
  }

  // 2. Check Steam API genres array if provided
  if (Array.isArray(game.genres) && game.genres.length > 0) {
    const genreStr = game.genres.map(g => (g.description || g).toLowerCase()).join(' ')
    if (genreStr.includes('casual') || genreStr.includes('simulation') || genreStr.includes('indie')) tags.add('chill')
    if (genreStr.includes('action') || genreStr.includes('sports') || genreStr.includes('racing')) tags.add('intense')
    if (genreStr.includes('rpg') || genreStr.includes('adventure') || genreStr.includes('strategy')) tags.add('story')
    if (genreStr.includes('arcade')) tags.add('quick')
    if (genreStr.includes('multi-player') || genreStr.includes('co-op') || genreStr.includes('mmo')) tags.add('coop')
  }

  // 3. Fallback Heuristics on Title Name
  const name = (game.name || '').toLowerCase()
  if (HEURISTIC_PATTERNS.chill.test(name)) tags.add('chill')
  if (HEURISTIC_PATTERNS.intense.test(name)) tags.add('intense')
  if (HEURISTIC_PATTERNS.story.test(name)) tags.add('story')
  if (HEURISTIC_PATTERNS.quick.test(name)) tags.add('quick')
  if (HEURISTIC_PATTERNS.coop.test(name)) tags.add('coop')

  // 4. GUARANTEE 100% COVERAGE: Fallback by Playtime Profile so NO game is left unmapped!
  if (tags.size === 0) {
    const hours = (game.playtime_forever || 0) / 60
    if (hours === 0 || hours < 2) {
      tags.add('chill')
      tags.add('quick')
    } else if (hours > 20) {
      tags.add('story')
      tags.add('intense')
    } else {
      tags.add('chill')
      tags.add('story')
    }
  }

  return Array.from(tags)
}
