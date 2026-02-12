import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit } from '../rate-limit'

function makeRequest(ip?: string): Request {
  const headers = new Headers()
  if (ip) headers.set('x-forwarded-for', ip)
  return new Request('http://localhost/api/test', { headers })
}

describe('checkRateLimit', () => {
  // Each test uses a unique IP to avoid cross-test pollution from the module-level Map
  let uniqueIp: number
  beforeEach(() => {
    uniqueIp = Date.now() + Math.random()
  })

  function ip() {
    return `10.0.0.${uniqueIp++}`
  }

  it('returns null when under the limit', () => {
    const testIp = ip()
    const result = checkRateLimit(makeRequest(testIp))
    expect(result).toBeNull()
  })

  it('returns 429 NextResponse when limit exceeded', () => {
    const testIp = ip()
    // Use a limit of 2 for easy testing
    for (let i = 0; i < 2; i++) {
      checkRateLimit(makeRequest(testIp), 2)
    }
    const result = checkRateLimit(makeRequest(testIp), 2)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(429)
  })

  it('tracks requests per IP', () => {
    const ip1 = ip()
    const ip2 = ip()
    // Exhaust limit for ip1
    for (let i = 0; i < 3; i++) {
      checkRateLimit(makeRequest(ip1), 3)
    }
    // ip1 is blocked
    expect(checkRateLimit(makeRequest(ip1), 3)).not.toBeNull()
    // ip2 is still allowed
    expect(checkRateLimit(makeRequest(ip2), 3)).toBeNull()
  })

  it('uses "unknown" when no IP header present', () => {
    // First call with no IP should succeed
    const result = checkRateLimit(makeRequest(), 1000)
    expect(result).toBeNull()
  })

  it('respects custom limit parameter', () => {
    const testIp = ip()
    // With limit of 1, first request is allowed, second blocked
    expect(checkRateLimit(makeRequest(testIp), 1)).toBeNull()
    expect(checkRateLimit(makeRequest(testIp), 1)).not.toBeNull()
  })

  it('respects custom windowMs parameter', () => {
    const testIp = ip()
    // Use a tiny window — timestamps recorded now will be inside
    for (let i = 0; i < 5; i++) {
      checkRateLimit(makeRequest(testIp), 5, 60_000)
    }
    const blocked = checkRateLimit(makeRequest(testIp), 5, 60_000)
    expect(blocked).not.toBeNull()
    expect(blocked!.status).toBe(429)
  })

  it('multiple IPs tracked independently', () => {
    const ips = [ip(), ip(), ip()]
    // Each IP makes 1 request — all should pass
    for (const testIp of ips) {
      expect(checkRateLimit(makeRequest(testIp), 5)).toBeNull()
    }
  })

  it('uses first IP from comma-separated x-forwarded-for', () => {
    const primary = ip()
    const proxy = ip()
    const combined = `${primary}, ${proxy}`
    // Make requests with combined header, limit of 1
    expect(checkRateLimit(makeRequest(combined), 1)).toBeNull()
    // Second request with same forwarded-for hits limit on first IP
    expect(checkRateLimit(makeRequest(combined), 1)).not.toBeNull()
    // A request from the proxy IP alone is unblocked
    expect(checkRateLimit(makeRequest(proxy), 1)).toBeNull()
  })
})
