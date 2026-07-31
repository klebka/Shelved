import { isRateLimited } from '../../../library/route.js'
import { cookies } from 'next/headers'

function getOrigin() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
  if (baseUrl) {
    return baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  }
  return 'http://localhost:3000'
}

export async function GET(request) {
  const origin = getOrigin()

  // Rate Limiter Check (10 reqs/min per IP)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  if (isRateLimited(`auth_callback_${clientIp}`, 10, 60000)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)

  // Verify CSRF state token
  const stateParam = searchParams.get('state')
  const cookieStore = await cookies()
  const stateCookie = cookieStore.get('steam_auth_state')?.value

  if (!stateParam || !stateCookie || stateParam !== stateCookie) {
    return Response.redirect(`${origin}/?error=invalid_state`)
  }

  // Clear state cookie after use
  cookieStore.delete('steam_auth_state')

  const validationParams = new URLSearchParams(searchParams)
  validationParams.set('openid.mode', 'check_authentication')
  validationParams.delete('state')

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
