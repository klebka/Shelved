import { isRateLimited } from '../library/route.js'

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
  PHP: '₱',
  BRL: 'R$',
  KRW: '₩',
  INR: '₹',
  RUB: '₽',
  CNY: '¥'
}

// Allowlisted country codes for Steam Store regional pricing
const ALLOWED_CC = new Set([
  'us', 'ca', 'mx', 'br', 'ar', 'cl', 'co', 'pe', 'uy',
  'gb', 'de', 'fr', 'es', 'it', 'nl', 'be', 'at', 'ch', 'se', 'no', 'dk', 'fi', 'pl', 'cz', 'hu', 'ro', 'bg', 'hr', 'sk', 'si', 'ee', 'lv', 'lt', 'pt', 'ie', 'gr', 'cy', 'mt', 'lu',
  'au', 'nz', 'jp', 'kr', 'cn', 'tw', 'hk', 'sg', 'my', 'ph', 'th', 'vn', 'id', 'in',
  'ru', 'ua', 'kz', 'tr', 'za', 'il', 'ae', 'sa', 'qa', 'kw', 'pk', 'bd'
])

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const appidsParam = searchParams.get('appids')?.trim()

  // Auto-detect region country code or fallback to 'us'
  const headerCc = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || 'us'
  let cc = (searchParams.get('cc') || headerCc).toLowerCase().trim()

  // Validate country code against allowlist
  if (!ALLOWED_CC.has(cc)) {
    cc = 'us'
  }

  if (!appidsParam) {
    return Response.json(
      { error: 'Missing appids parameter' },
      { status: 400 }
    )
  }

  // Rate Limiter Check (30 reqs/min per IP)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  if (isRateLimited(`prices_${clientIp}`, 30, 60000)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Validate and filter appids to numeric only
  const appids = appidsParam.split(',').slice(0, 25).filter(id => /^\d+$/.test(id.trim())).map(id => id.trim())

  if (appids.length === 0) {
    return Response.json(
      { error: 'No valid appids provided. Must be numeric.' },
      { status: 422 }
    )
  }

  try {
    let detectedCurrency = 'USD'
    let detectedSymbol = '$'

    const fetchPromises = appids.map(appid =>
      fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&cc=${cc}&filters=price_overview`, { next: { revalidate: 86400 } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const appData = data?.[appid]?.data?.price_overview
          if (appData && typeof appData.final === 'number') {
            if (appData.currency) {
              detectedCurrency = appData.currency
              detectedSymbol = CURRENCY_SYMBOLS[appData.currency] || appData.currency + ' '
            }
            return { appid, price: appData.final / 100 }
          }
          return { appid, price: 0 }
        })
        .catch(() => ({ appid, price: 0 }))
    )

    const priceResults = await Promise.all(fetchPromises)
    const priceMap = {}
    priceResults.forEach(item => {
      if (item && item.appid) {
        priceMap[item.appid] = item.price
      }
    })

    return Response.json(
      {
        prices: priceMap,
        currency: detectedCurrency,
        symbol: detectedSymbol,
        cc: cc.toUpperCase()
      },
      { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' } }
    )
  } catch (error) {
    return Response.json({ prices: {}, currency: 'USD', symbol: '$', cc: 'US' })
  }
}
