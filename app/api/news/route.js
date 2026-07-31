import { isRateLimited } from '../library/route.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const appid = searchParams.get('appid')?.trim()

  if (!appid || !/^\d+$/.test(appid)) {
    return Response.json(
      { error: 'Missing or invalid appid parameter' },
      { status: 400 }
    )
  }

  // Rate Limiter Check (30 reqs/min per IP)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  if (isRateLimited(`news_${clientIp}`, 30, 60000)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appid}&count=1`

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } })
    const data = await res.json()

    const item = data?.appnews?.newsitems?.[0]
    if (!item || !item.date) {
      return Response.json({ lastUpdate: null, title: '' })
    }

    return Response.json(
      { lastUpdate: item.date, title: item.title || '' },
      { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' } }
    )
  } catch (error) {
    return Response.json({ lastUpdate: null, title: '' })
  }
}
