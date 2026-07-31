import { isRateLimited } from '../library/route.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const appid = searchParams.get('appid')?.trim()

  if (!appid || !/^\d+$/.test(appid)) {
    return Response.json(
      { error: 'Missing or invalid appid. Must be numeric.' },
      { status: 400 }
    )
  }

  // Rate Limiter Check (30 reqs/min per IP)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  if (isRateLimited(`players_${clientIp}`, 30, 60000)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appid}`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()

    const count = data?.response?.player_count
    if (typeof count !== 'number') {
      return Response.json({ count: null })
    }

    return Response.json(
      { count },
      { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (error) {
    return Response.json({ count: null })
  }
}
