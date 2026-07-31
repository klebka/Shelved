import { isRateLimited } from '../library/route.js'

let totalVisits = 0

export async function GET(request) {
  // Rate Limiter Check (30 reqs/min per IP)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  if (isRateLimited(`visitors_${clientIp}`, 30, 60000)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)
  const isReadOnly = searchParams.get('readOnly') === 'true'

  if (!isReadOnly) {
    totalVisits += 1
  }

  return Response.json(
    { count: totalVisits },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
