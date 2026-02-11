import { NextResponse } from 'next/server'

const requestMap = new Map<string, number[]>()

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamps] of requestMap.entries()) {
    const recent = timestamps.filter((t) => now - t < 60_000)
    if (recent.length === 0) {
      requestMap.delete(ip)
    } else {
      requestMap.set(ip, recent)
    }
  }
}, 300_000)

/**
 * In-memory rate limiter. Returns a 429 response if limit exceeded,
 * or null if the request is allowed.
 */
export function checkRateLimit(
  request: Request,
  limit = 30,
  windowMs = 60_000,
): NextResponse | null {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

  const now = Date.now()
  const timestamps = requestMap.get(ip) || []
  const recent = timestamps.filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 },
    )
  }

  recent.push(now)
  requestMap.set(ip, recent)
  return null
}
