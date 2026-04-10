const rateLimit = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 5

  const entry = rateLimit.get(ip) || { count: 0, start: now }

  if(now - entry.start > windowMs) {
    rateLimit.set(ip, { count: 1, start: now })
    return false
  }

  if (entry.count >= maxRequests) return true

  rateLimit.set(ip, { count: entry.count + 1, start: entry.start })
  return false
}

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if(isRateLimited(ip)) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)
  const steamid = searchParams.get('steamid')

  if(!steamid) {
    return Response.json(
        { error: 'Missing steamid parameter' }, 
        { status: 400 })
  }
  else if(steamid.length != 17){
    return Response.json(
        { error: 'Invalid steamid' }, 
        { status: 422 })
  }
  else if(steamid == /^[0-9\b]+$/){
    return Response.json(
        { error: 'steamid only contains numbers' }, 
        { status: 422 })
  }

  const apiKey = process.env.STEAM_API_KEY
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if(!data.response || !data.response.games) {
      return Response.json(
        { error: 'No games found. Profile may be private.' },
        { status: 404 }
      )
    }

    return Response.json(data.response.games)

  } catch (error) {
    console.log('Exact error:', error.message)
    return Response.json(
        { error: 'Failed to fetch from Steam' }, 
        { status: 500 })
  }
}