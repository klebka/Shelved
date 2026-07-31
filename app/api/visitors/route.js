import { isRateLimited } from '../library/route.js'

let localVisits = 0

export function parseVercelAnalyticsCount(data) {
  if (!data) return null

  function extractVal(entry) {
    if (typeof entry === 'number') return entry
    if (!entry || typeof entry !== 'object') return null
    if (typeof entry.visitors === 'number') return entry.visitors
    if (typeof entry.visitors?.value === 'number') return entry.visitors.value
    if (Array.isArray(entry.visitors) && entry.visitors.length > 0) {
      return entry.visitors.reduce((acc, item) => acc + (extractVal(item) || 0), 0)
    }
    if (typeof entry.uniqueVisitors === 'number') return entry.uniqueVisitors
    if (typeof entry.pageviews === 'number') return entry.pageviews
    if (typeof entry.pageviews?.value === 'number') return entry.pageviews.value
    if (Array.isArray(entry.pageviews) && entry.pageviews.length > 0) {
      return entry.pageviews.reduce((acc, item) => acc + (extractVal(item) || 0), 0)
    }
    if (typeof entry.value === 'number') return entry.value
    if (typeof entry.count === 'number') return entry.count
    if (typeof entry.total === 'number') return entry.total
    return null
  }

  // Direct check on root payload
  const direct = extractVal(data)
  if (direct !== null) return direct

  // Check data property if payload is wrapped: { data: ... }
  if (data.data) {
    const wrapped = extractVal(data.data)
    if (wrapped !== null) return wrapped
    if (Array.isArray(data.data) && data.data.length > 0) {
      const sum = data.data.reduce((acc, item) => acc + (extractVal(item) || 0), 0)
      if (sum > 0) return sum
    }
  }

  // Check if root payload is an array of entries
  if (Array.isArray(data) && data.length > 0) {
    const sum = data.reduce((acc, item) => acc + (extractVal(item) || 0), 0)
    if (sum > 0) return sum
  }

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
  const projectId = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_GIT_REPO_SLUG || 'shelvedgames'
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
