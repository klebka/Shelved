import { isValidSteamId } from '@/lib/steam'
import { isRateLimited } from '../library/route.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const steamid = searchParams.get('steamid')?.trim()

  if (!steamid || !isValidSteamId(steamid)) {
    return Response.json(
      { error: 'Invalid or missing steamid parameter' },
      { status: 400 }
    )
  }

  // Rate Limiter Check (30 reqs/min per IP)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  if (isRateLimited(`player_${clientIp}`, 30, 60000)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  const apiKey = process.env.STEAM_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'STEAM_API_KEY not configured' },
      { status: 500 }
    )
  }

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamid}`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    const player = data?.response?.players?.[0]
    if (!player) {
      return Response.json({ steamid, personaname: steamid })
    }

    return Response.json(
      {
        steamid: player.steamid,
        personaname: player.personaname || steamid,
        avatar: player.avatarfull || player.avatar
      },
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch (error) {
    return Response.json({ steamid, personaname: steamid })
  }
}
