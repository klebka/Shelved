import { isRateLimited } from '../library/route.js'

let localVisits = 0

export function parseVercelAnalyticsCount(data) {
  if (!data) return null

  // Check direct pageviews number or object value
  if (typeof data.pageviews === 'number') return data.pageviews
  if (typeof data.pageviews?.value === 'number') return data.pageviews.value
  if (Array.isArray(data.pageviews) && data.pageviews.length > 0) {
    return data.pageviews.reduce((acc, item) => acc + (item.value || item.count || 0), 0)
  }

  // Check visitors number or object value
  if (typeof data.visitors === 'number') return data.visitors
  if (typeof data.visitors?.value === 'number') return data.visitors.value
  if (Array.isArray(data.visitors) && data.visitors.length > 0) {
    return data.visitors.reduce((acc, item) => acc + (item.value || item.count || 0), 0)
  }

  // Fallback to top-level value or total
  if (typeof data.value === 'number') return data.value
  if (typeof data.total === 'number') return data.total

  return null
}

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
    localVisits += 1
  }

  const token = process.env.VERCEL_AUTH_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_GIT_REPO_SLUG
  const teamId = process.env.VERCEL_TEAM_ID

  // If Vercel REST API Token is configured, query Vercel Analytics REST API
  if (token && projectId) {
    try {
      const now = Date.now()
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime()
      
      const apiUrl = new URL('https://api.vercel.com/v1/web/analytics/stats')
      apiUrl.searchParams.set('projectId', projectId)
      if (teamId) apiUrl.searchParams.set('teamId', teamId)
      apiUrl.searchParams.set('environment', 'production')
      apiUrl.searchParams.set('from', String(startOfYear))
      apiUrl.searchParams.set('to', String(now))

      const res = await fetch(apiUrl.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        },
        next: { revalidate: 300 } // Cache API response for 5 minutes
      })

      if (res.ok) {
        const data = await res.json()
        const parsedCount = parseVercelAnalyticsCount(data)
        const count = parsedCount !== null ? parsedCount : localVisits

        return Response.json(
          { count },
          { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600' } }
        )
      }
    } catch (err) {
      console.error('Vercel Analytics REST API query error:', err)
    }
  }

  // Fallback to local memory count for dev / unconfigured environments
  return Response.json(
    { count: localVisits },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
