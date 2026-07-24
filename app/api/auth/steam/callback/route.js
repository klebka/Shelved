export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  const validationParams = new URLSearchParams(searchParams)
  validationParams.set('openid.mode', 'check_authentication')

  try {
    const res = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: validationParams.toString(),
    })
    const text = await res.text()

    if (text.includes('is_valid:true')) {
      const claimedId = searchParams.get('openid.claimed_id') || ''
      const steamid = claimedId.split('/').pop()
      if (steamid && steamid.length === 17 && /^\d+$/.test(steamid)) {
        return Response.redirect(`${origin}/?steamid=${steamid}`)
      }
    }
  } catch (err) {
    console.error('Steam OpenID callback error:', err)
  }

  return Response.redirect(`${origin}/?error=steam_auth_failed`)
}
