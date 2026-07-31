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
  if (isRateLimited(`reviews_${clientIp}`, 30, 60000)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  try {
    const res = await fetch(
      `https://store.steampowered.com/appreviews/${appid}?json=1&language=all&purchase_type=all&num_per_page=0`,
      { next: { revalidate: 86400 } }
    )
    const data = await res.json()

    const summary = data?.query_summary
    if (!summary || typeof summary.total_reviews !== 'number') {
      return Response.json({ score: null, total: 0, description: null })
    }

    const total = summary.total_reviews
    const positive = summary.total_positive
    const pct = total > 0 ? Math.round((positive / total) * 100) : 0

    // Match Steam's review description thresholds
    let description = 'Mixed'
    if (total < 10) description = null
    else if (pct >= 95) description = 'Overwhelmingly Positive'
    else if (pct >= 80) description = 'Very Positive'
    else if (pct >= 70) description = 'Mostly Positive'
    else if (pct >= 40) description = 'Mixed'
    else if (pct >= 20) description = 'Mostly Negative'
    else description = 'Overwhelmingly Negative'

    return Response.json(
      { score: pct, total, positive, description },
      { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' } }
    )
  } catch (error) {
    return Response.json({ score: null, total: 0, description: null })
  }
}
