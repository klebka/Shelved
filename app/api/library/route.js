import { isValidSteamId } from '@/lib/steam'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const steamid = searchParams.get('steamid')?.trim()

  if (!steamid) {
    return Response.json(
      { error: 'Missing steamid parameter' },
      { status: 400 }
    )
  }
  if (!isValidSteamId(steamid)) {
    return Response.json(
      { error: 'Invalid Steam ID. Must be a 17-digit number.' },
      { status: 422 }
    )
  }

  const apiKey = process.env.STEAM_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'Server configuration error: STEAM_API_KEY is not configured.' },
      { status: 500 }
    )
  }

  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    if (!data.response || !data.response.games) {
      return Response.json(
        { error: 'No games found. Profile may be private.' },
        { status: 404 }
      )
    }

    return Response.json(data.response.games, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' }
    })

  } catch (error) {
    console.error('Steam API error:', error.message)
    return Response.json(
      { error: 'Failed to fetch from Steam' },
      { status: 500 }
    )
  }
}