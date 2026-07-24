export default function manifest() {
  return {
    name: 'Shelved - RNG Game Picker',
    short_name: 'Shelved',
    description: 'Let RNG pick your next Steam game and eliminate backlog decision paralysis.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090a0f',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
