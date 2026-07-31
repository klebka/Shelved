import { isValidSteamId } from '@/lib/steam'
import { isRateLimited } from '../library/route.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const steamid = searchParams.get('steamid')?.trim()
  const appid = searchParams.get('appid')?.trim()

  if (!steamid || !appid) {
    return Response.json(
      { error: 'Missing steamid or appid parameter' },
      { status: 400 }
    )
  }

  if (!isValidSteamId(steamid)) {
    return Response.json(
      { error: 'Invalid Steam ID.' },
      { status: 422 }
    )
  }

  // Validate appid is numeric
  if (!/^\d+$/.test(appid)) {
    return Response.json(
      { error: 'Invalid appid. Must be numeric.' },
      { status: 422 }
    )
  }

  // Rate Limiter Check (30 requests per minute per IP)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  if (isRateLimited(`achievements_${clientIp}`, 30, 60000)) {
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

  const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamid}&appid=${appid}`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    const achievements = data?.playerstats?.achievements
    if (!achievements || !Array.isArray(achievements) || achievements.length === 0) {
      return Response.json({ percentage: null, total: 0, unlocked: 0 })
    }

    const unlocked = achievements.filter(a => a.achieved === 1).length
    const percentage = Math.round((unlocked / achievements.length) * 100)

    return Response.json(
      { percentage, total: achievements.length, unlocked },
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch (error) {
    return Response.json({ percentage: null, total: 0, unlocked: 0 })
  }
}
