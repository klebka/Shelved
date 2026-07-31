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
  // Rate Limiter Check (10 reqs/min per IP)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  if (isRateLimited(`auth_login_${clientIp}`, 10, 60000)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  const origin = getOrigin()

  // Generate CSRF state token
  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set('steam_auth_state', state, {
    httpOnly: true,
    secure: !origin.includes('localhost'),
    sameSite: 'lax',
    maxAge: 300, // 5 minutes
    path: '/'
  })

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': `${origin}/api/auth/steam/callback?state=${state}`,
    'openid.realm': `${origin}/`,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })

  return Response.redirect(`https://steamcommunity.com/openid/login?${params.toString()}`)
}
