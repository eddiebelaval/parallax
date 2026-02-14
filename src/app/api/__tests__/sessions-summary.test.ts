import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@/lib/supabase'
import {
  makeSession,
  makeMessage,
  makeSessionSummaryData,
  makeConflictAnalysis,
} from '@/__tests__/helpers/fixtures'

vi.mock('@/lib/opus', () => ({
  summarizeSession: vi.fn(),
}))

vi.mock('@/lib/conversation', () => ({
  buildNameMap: vi.fn(() => ({
    person_a: 'Alice',
    person_b: 'Bob',
    mediator: 'Ava',
  })),
  toConversationHistory: vi.fn(() => [
    { sender: 'Alice', content: 'Hello' },
  ]),
  stripCodeFences: vi.fn((s: string) => s),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}))

import { POST } from '@/app/api/sessions/[code]/summary/route'
import { summarizeSession } from '@/lib/opus'
import { checkRateLimit } from '@/lib/rate-limit'

function mockSupabase() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const fluent = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'lt', 'gt', 'lte', 'gte',
    'in', 'is', 'like', 'order', 'limit', 'range', 'filter',
  ]
  for (const m of fluent) {
    chain[m] = vi.fn(() => chain)
  }
  chain.single = vi.fn()
  ;(chain as Record<string, unknown>).then = undefined

  const client = {
    from: vi.fn(() => chain),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  }

  vi.mocked(createServerClient).mockReturnValue(client as never)
  return { client, chain }
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.mocked(checkRateLimit).mockReturnValue(null)
})

function makeRequest() {
  return new Request('http://localhost/api/sessions/ABC234/summary', {
    method: 'POST',
  })
}

const params = Promise.resolve({ code: 'ABC234' })

describe('POST /api/sessions/[code]/summary', () => {
  it('returns 404 when session not found', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    })

    const response = await POST(makeRequest(), { params })
    const data = await response.json()
    expect(response.status).toBe(404)
    expect(data.error).toBe('Session not found')
  })

  it('returns 400 when no messages', async () => {
    const session = makeSession()
    const { chain } = mockSupabase()

    // session query uses .single()
    chain.single.mockResolvedValueOnce({ data: session, error: null })
    // messages query uses .order() — make it return empty array
    chain.order.mockReturnValueOnce(
      Promise.resolve({ data: [], error: null }),
    )

    const response = await POST(makeRequest(), { params })
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('No messages found')
  })

  it('calls summarizeSession with correct params', async () => {
    const session = makeSession()
    const messages = [makeMessage({ content: 'Hello' })]
    const summaryData = makeSessionSummaryData()
    const { chain } = mockSupabase()

    chain.single.mockResolvedValueOnce({ data: session, error: null })
    chain.order.mockReturnValueOnce(
      Promise.resolve({ data: messages, error: null }),
    )

    vi.mocked(summarizeSession).mockResolvedValue(JSON.stringify(summaryData))

    const response = await POST(makeRequest(), { params })
    const data = await response.json()

    expect(vi.mocked(summarizeSession)).toHaveBeenCalledWith(
      'Alice',
      'Bob',
      expect.any(Array),
      undefined, // no ConflictAnalysis → no v3Context
      undefined, // null onboarding_context → no sessionGoals
      { personA: false, personB: false }, // no user IDs → both false
    )
    expect(response.status).toBe(200)
    expect(data.summary).toBeDefined()
  })

  it('returns 502 when Claude fails', async () => {
    const session = makeSession()
    const messages = [makeMessage()]
    const { chain } = mockSupabase()

    chain.single.mockResolvedValueOnce({ data: session, error: null })
    chain.order.mockReturnValueOnce(
      Promise.resolve({ data: messages, error: null }),
    )

    vi.mocked(summarizeSession).mockRejectedValue(new Error('Claude is down'))

    const response = await POST(makeRequest(), { params })
    const data = await response.json()
    expect(response.status).toBe(502)
    expect(data.error).toBe('Claude is down')
  })

  it('returns 502 when summary parsing fails', async () => {
    const session = makeSession()
    const messages = [makeMessage()]
    const { chain } = mockSupabase()

    chain.single.mockResolvedValueOnce({ data: session, error: null })
    chain.order.mockReturnValueOnce(
      Promise.resolve({ data: messages, error: null }),
    )

    vi.mocked(summarizeSession).mockResolvedValue('not valid json {{{')

    const response = await POST(makeRequest(), { params })
    const data = await response.json()
    expect(response.status).toBe(502)
    expect(data.error).toContain('Failed to parse session summary')
  })

  it('returns summary data on success', async () => {
    const session = makeSession()
    const messages = [makeMessage()]
    const summaryData = makeSessionSummaryData()
    const { chain } = mockSupabase()

    chain.single.mockResolvedValueOnce({ data: session, error: null })
    chain.order.mockReturnValueOnce(
      Promise.resolve({ data: messages, error: null }),
    )

    vi.mocked(summarizeSession).mockResolvedValue(JSON.stringify(summaryData))

    const response = await POST(makeRequest(), { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.summary.temperatureArc).toBeDefined()
    expect(data.summary.keyMoments).toBeInstanceOf(Array)
    expect(data.summary.overallInsight).toBeDefined()
    expect(data.summary.lensInsights).toBeInstanceOf(Array)
    expect(data.summary.resolutionTrajectory).toBeDefined()
  })

  it('passes session goals when present in onboarding_context', async () => {
    const session = makeSession({
      onboarding_context: {
        conductorPhase: 'active',
        sessionGoals: ['Goal 1', 'Goal 2'],
      },
    })
    const messages = [makeMessage()]
    const summaryData = makeSessionSummaryData()
    const { chain } = mockSupabase()

    chain.single.mockResolvedValueOnce({ data: session, error: null })
    chain.order.mockReturnValueOnce(
      Promise.resolve({ data: messages, error: null }),
    )

    vi.mocked(summarizeSession).mockResolvedValue(JSON.stringify(summaryData))

    await POST(makeRequest(), { params })

    expect(vi.mocked(summarizeSession)).toHaveBeenCalledWith(
      'Alice',
      'Bob',
      expect.any(Array),
      undefined, // no ConflictAnalysis on messages → no v3Context
      ['Goal 1', 'Goal 2'],
      { personA: false, personB: false },
    )
  })

  it('extracts V3 context from ConflictAnalysis messages', async () => {
    const analysis = makeConflictAnalysis()
    const session = makeSession()
    const messages = [
      makeMessage({ nvc_analysis: analysis }),
    ]
    const summaryData = makeSessionSummaryData()
    const { chain } = mockSupabase()

    chain.single.mockResolvedValueOnce({ data: session, error: null })
    chain.order.mockReturnValueOnce(
      Promise.resolve({ data: messages, error: null }),
    )

    vi.mocked(summarizeSession).mockResolvedValue(JSON.stringify(summaryData))

    await POST(makeRequest(), { params })

    expect(vi.mocked(summarizeSession)).toHaveBeenCalledWith(
      'Alice',
      'Bob',
      expect.any(Array),
      expect.arrayContaining([
        expect.objectContaining({
          primaryInsight: expect.any(String),
          resolutionDirection: expect.any(String),
          activeLenses: expect.any(Array),
        }),
      ]),
      undefined,
      { personA: false, personB: false },
    )
  })

  it('returns 429 when rate limited', async () => {
    const { NextResponse } = await import('next/server')
    vi.mocked(checkRateLimit).mockReturnValue(
      NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }),
    )

    const response = await POST(makeRequest(), { params })
    const data = await response.json()
    expect(response.status).toBe(429)
  })
})
