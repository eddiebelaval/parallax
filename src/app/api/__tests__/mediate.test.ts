import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@/lib/supabase'
import { makeSession, makeMessage, makeConflictAnalysis } from '@/__tests__/helpers/fixtures'

vi.mock('@/lib/opus', () => ({
  mediateMessage: vi.fn(),
}))

vi.mock('@/lib/prompts/index', () => ({
  parseConflictAnalysis: vi.fn(),
  buildMediationPrompt: vi.fn(() => 'mock-user-prompt'),
  buildConflictIntelligencePrompt: vi.fn(() => 'mock-system-prompt'),
  getMaxTokensForMode: vi.fn(() => 2048),
}))

vi.mock('@/lib/conversation', () => ({
  buildNameMap: vi.fn(() => ({
    person_a: 'Alice',
    person_b: 'Bob',
    mediator: 'Ava',
  })),
  toConversationHistory: vi.fn(() => []),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}))

vi.mock('@/lib/context-injector', () => ({
  buildIntelligenceContext: vi.fn(() => Promise.resolve(null)),
  buildIntelligencePromptSection: vi.fn(() => null),
}))

import { POST } from '@/app/api/mediate/route'
import { mediateMessage } from '@/lib/opus'
import { parseConflictAnalysis } from '@/lib/prompts/index'
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
  vi.mocked(parseConflictAnalysis).mockReturnValue(null)
})

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/mediate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/mediate', () => {
  it('returns 400 when missing session_id', async () => {
    const response = await POST(makeRequest({ message_id: 'msg-1' }))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('session_id and message_id are required')
  })

  it('returns 400 when missing message_id', async () => {
    const response = await POST(makeRequest({ session_id: 'sess-1' }))
    const data = await response.json()
    expect(response.status).toBe(400)
  })

  it('returns 404 when message not found', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()
    expect(response.status).toBe(404)
    expect(data.error).toBe('Message not found')
  })

  it('calls mediateMessage with correct params', async () => {
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const session = makeSession({ id: 'sess-1' })
    const analysis = makeConflictAnalysis()
    const { chain } = mockSupabase()

    // 1st single: fetch message, 2nd single: fetch session
    chain.single
      .mockResolvedValueOnce({ data: message, error: null })
      .mockResolvedValueOnce({ data: session, error: null })

    // history query (no single) and update (no single) use chain directly
    vi.mocked(mediateMessage).mockResolvedValue('raw-analysis-text')
    vi.mocked(parseConflictAnalysis).mockReturnValue(analysis)

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )

    expect(vi.mocked(mediateMessage)).toHaveBeenCalledWith(
      message.content,
      message.sender,
      'Alice',
      'Bob',
      expect.any(Array),
      'intimate',
      undefined,
      undefined,
    )
    expect(response.status).toBe(200)
  })

  it('returns analysis and temperature on success', async () => {
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const session = makeSession({ id: 'sess-1' })
    const analysis = makeConflictAnalysis({
      meta: {
        overallSeverity: 0.72,
        contextMode: 'intimate',
        activeLenses: [],
        primaryInsight: 'test',
        resolutionDirection: 'stable',
      },
    })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: message, error: null })
      .mockResolvedValueOnce({ data: session, error: null })

    vi.mocked(mediateMessage).mockResolvedValue('raw-text')
    vi.mocked(parseConflictAnalysis).mockReturnValue(analysis)

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.analysis).toBeDefined()
    expect(data.temperature).toBe(0.72)
  })

  it('returns 502 when Claude fails', async () => {
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const session = makeSession({ id: 'sess-1' })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: message, error: null })
      .mockResolvedValueOnce({ data: session, error: null })

    vi.mocked(mediateMessage).mockRejectedValue(new Error('API timeout'))

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()

    expect(response.status).toBe(502)
    expect(data.error).toBe('API timeout')
  })

  it('returns 502 when analysis parsing fails', async () => {
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const session = makeSession({ id: 'sess-1' })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: message, error: null })
      .mockResolvedValueOnce({ data: session, error: null })

    vi.mocked(mediateMessage).mockResolvedValue('invalid json garbage')
    vi.mocked(parseConflictAnalysis).mockReturnValue(null)

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()

    expect(response.status).toBe(502)
    expect(data.error).toContain('Failed to parse analysis')
  })

  it('returns 429 when rate limited', async () => {
    const { NextResponse } = await import('next/server')
    vi.mocked(checkRateLimit).mockReturnValue(
      NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }),
    )

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('Rate limit exceeded')
  })

  it('passes session goals to mediateMessage when present', async () => {
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const session = makeSession({
      id: 'sess-1',
      onboarding_context: {
        conductorPhase: 'active',
        sessionGoals: ['Goal 1', 'Goal 2'],
        contextSummary: 'Summary of context',
      },
    })
    const analysis = makeConflictAnalysis()
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: message, error: null })
      .mockResolvedValueOnce({ data: session, error: null })

    vi.mocked(mediateMessage).mockResolvedValue('raw-text')
    vi.mocked(parseConflictAnalysis).mockReturnValue(analysis)

    await POST(makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }))

    expect(vi.mocked(mediateMessage)).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(Array),
      'intimate',
      {
        goals: ['Goal 1', 'Goal 2'],
        contextSummary: 'Summary of context',
      },
      undefined,
    )
  })

  it('patches message in Supabase on success', async () => {
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const session = makeSession({ id: 'sess-1' })
    const analysis = makeConflictAnalysis()
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: message, error: null })
      .mockResolvedValueOnce({ data: session, error: null })

    vi.mocked(mediateMessage).mockResolvedValue('raw')
    vi.mocked(parseConflictAnalysis).mockReturnValue(analysis)

    await POST(makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }))

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        nvc_analysis: analysis,
        emotional_temperature: analysis.meta.overallSeverity,
      }),
    )
  })
})
