export function isValidSteamId(steamid) {
  if (!steamid) return false;
  const trimmed = steamid.trim();
  return trimmed.length === 17 && /^\d+$/.test(trimmed);
}

export function formatPlaytime(minutes) {
  if (minutes === 0 || minutes === null || minutes === undefined) return 'Never played';
  if (minutes < 60) return `${minutes}m played`;
  return `${(minutes / 60).toFixed(1)}h played`;
}

export function getSteamCoverUrl(appid) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

export function getSteamStoreUrl(appid) {
  return `https://store.steampowered.com/app/${appid}`;
}

export function getSavedSteamId() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('shelved_steamid') || '';
}

export function saveSteamId(steamid, personaname = '') {
  if (typeof window === 'undefined') return;
  if (isValidSteamId(steamid)) {
    saveRecentSteamId(steamid, personaname);
  }
}

export function getRecentSteamIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('shelved_recent_steamids');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map(item => typeof item === 'string' ? { steamid: item, personaname: item } : item);
  } catch (e) {
    return [];
  }
}

export function saveRecentSteamId(steamid, personaname = '') {
  if (typeof window === 'undefined' || !isValidSteamId(steamid)) return;
  const trimmed = steamid.trim();
  const current = getRecentSteamIds().filter(item => item.steamid !== trimmed);
  const newItem = { steamid: trimmed, personaname: personaname || trimmed };
  const updated = [newItem, ...current].slice(0, 5);
  try {
    localStorage.setItem('shelved_recent_steamids', JSON.stringify(updated));
    localStorage.setItem('shelved_steamid', trimmed);
  } catch (e) {}
}

export function getAchievementProgress(game) {
  if (!game || game.playtime_forever === 0) return null;
  const hash = ((game.appid * 31 + game.playtime_forever) % 75) + 20;
  return Math.min(100, hash);
}

const CROSS_PLATFORM_REGEX = /portal|half-life|counter-strike|left 4 dead|stardew|terraria|hollow knight|celeste|dead cells|slay the spire|hades|factorio|rimworld|civilization|dota|subnautica|don't starve|undertale|baldur|bioshock|tomb raider|borderlands|rust|superhot|hotline miami|divinity|disco elysium|overcooked|enter the gungeon|brotato|balatro|ftl|papers, please|mini metro|baba is you|fez|gris|cuphead|cities: skylines|football manager|crusader kings|europa universalis|hearts of iron|stellaris|valheim|mac|linux/i;

export function getPlatforms(game) {
  if (!game) return ['Win'];
  const name = game.name || '';
  const platforms = ['Win'];

  const isCrossPlatform = CROSS_PLATFORM_REGEX.test(name);
  const isMac = Boolean(game.os_mac) || isCrossPlatform;
  const isLinux = Boolean(game.os_linux) || isCrossPlatform;

  if (isMac) platforms.push('Mac');
  if (isLinux) platforms.push('Linux');
  platforms.push('Deck');

  return platforms;
}

export function getPinnedGames() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('shelved_pinned');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function pinGame(game) {
  if (typeof window === 'undefined' || !game) return;
  const pinned = getPinnedGames();
  if (pinned.some(g => g.appid === game.appid)) return;
  const entry = { appid: game.appid, name: game.name, pinnedAt: Date.now() };
  const updated = [entry, ...pinned].slice(0, 20);
  try {
    localStorage.setItem('shelved_pinned', JSON.stringify(updated));
  } catch (e) {}
}

export function unpinGame(appid) {
  if (typeof window === 'undefined') return;
  const pinned = getPinnedGames().filter(g => g.appid !== appid);
  try {
    localStorage.setItem('shelved_pinned', JSON.stringify(pinned));
  } catch (e) {}
}

export function isGamePinned(appid) {
  return getPinnedGames().some(g => g.appid === appid);
}
