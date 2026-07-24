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

export function saveSteamId(steamid) {
  if (typeof window === 'undefined') return;
  if (isValidSteamId(steamid)) {
    localStorage.setItem('shelved_steamid', steamid.trim());
  }
}

const CROSS_PLATFORM_GAMES = {
  mac: [
    'portal', 'half-life', 'counter-strike', 'left 4 dead', 'stardew valley', 'terraria',
    'hollow knight', 'celeste', 'dead cells', 'slay the spire', 'hades', 'factorio', 'rimworld',
    'civilization', 'dota 2', 'subnautica', 'don\'t starve', 'undertale', 'baldur\'s gate 3',
    'bioshock', 'tomb raider', 'borderlands 2', 'rust', 'superhot', 'hotline miami', 'divinity',
    'disco elysium', 'overcooked', 'enter the gungeon', 'brotato', 'balatro', 'ftl', 'papers, please',
    'mini metro', 'baba is you', 'fez', 'gris', 'cuphead', 'cities: skylines', 'football manager',
    'crusader kings', 'europa universalis', 'hearts of iron', 'stellaris', 'mac'
  ],
  linux: [
    'portal', 'half-life', 'counter-strike', 'left 4 dead', 'stardew valley', 'terraria',
    'hollow knight', 'celeste', 'dead cells', 'slay the spire', 'hades', 'factorio', 'rimworld',
    'civilization', 'dota 2', 'subnautica', 'don\'t starve', 'undertale', 'rust', 'valheim',
    'superhot', 'hotline miami', 'enter the gungeon', 'brotato', 'balatro', 'ftl', 'papers, please',
    'mini metro', 'baba is you', 'fez', 'gris', 'cities: skylines', 'crusader kings', 'stellaris', 'linux'
  ]
};

export function getPlatforms(game) {
  if (!game) return ['Win'];
  const nameLower = (game.name || '').toLowerCase();
  const platforms = ['Win'];

  const isMac = Boolean(game.os_mac) || CROSS_PLATFORM_GAMES.mac.some(kw => nameLower.includes(kw));
  const isLinux = Boolean(game.os_linux) || CROSS_PLATFORM_GAMES.linux.some(kw => nameLower.includes(kw));

  if (isMac) platforms.push('Mac');
  if (isLinux) platforms.push('Linux');
  platforms.push('Deck');

  return platforms;
}
