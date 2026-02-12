import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@/lib/supabase'
import { makeSession, makeMessage } from '@/__tests__/helpers/fixtures'

vi.mock('@/lib/opus', () => ({
  analyzeIssues: vi.fn(),
}))

vi.mock('@/lib/prompts', () => ({
  parseIssueAnalysis: vi.fn(),
  buildIssueAnalysisPrompt: vi.fn(() => 'mock-prompt'),
  ISSUE_ANALYSIS_PROMPT: 'mock-system-prompt',
}))

vi.mock('@/lib/conversation', () => ({
  buildNameMap: vi.fn(() => ({
    person_a: 'Alice',
    person_b: 'Bob',
    mediator: 'Parallax',
  })),
  toConversationHistory: vi.fn(() => []),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}))

import { POST } from '@/app/api/issues/analyze/route'
import { analyzeIssues } from '@/lib/opus'
import { parseIssueAnalysis } from '@/lib/prompts'
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

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/issues/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/issues/analyze', () => {
  it('returns 400 when missing session_id', async () => {
    const response = await POST(makeRequest({ message_id: 'msg-1' }))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('session_id and message_id required')
  })

  it('returns 400 when missing message_id', async () => {
    const response = await POST(makeRequest({ session_id: 'sess-1' }))
    const data = await response.json()
    expect(response.status).toBe(400)
  })

  it('returns 404 when session or message not found', async () => {
    const { chain } = mockSupabase()
    // Promise.all: 4 queries. session(.single), message(.single), messages(no single), issues(no single)
    chain.single
      .mockResolvedValueOnce({ data: null, error: null }) // session not found
      .mockResolvedValueOnce({ data: null, error: null }) // message not found

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()
    expect(response.status).toBe(404)
    expect(data.error).toContain('Session or message not found')
  })

  it('returns 400 when mode is not in_person', async () => {
    const session = makeSession({ id: 'sess-1', mode: 'remote' })
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: message, error: null })

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('in-person mode')
  })

  it('calls analyzeIssues with correct params', async () => {
    const session = makeSession({ id: 'sess-1', mode: 'in_person' })
    const message = makeMessage({
      id: 'msg-1',
      session_id: 'sess-1',
      content: 'I feel unheard',
      created_at: '2026-02-10T12:00:00Z',
    })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: message, error: null })

    vi.mocked(analyzeIssues).mockResolvedValue('{"newIssues":[],"gradedIssues":[]}')
    vi.mocked(parseIssueAnalysis).mockReturnValue({ newIssues: [], gradedIssues: [] })

    await POST(makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }))

    expect(vi.mocked(analyzeIssues)).toHaveBeenCalledWith(
      'I feel unheard',
      'person_a',
      'Alice',
      'Bob',
      expect.any(Array),
      expect.any(Array),
    )
  })

  it('inserts new issues into Supabase', async () => {
    const session = makeSession({ id: 'sess-1', mode: 'in_person' })
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: message, error: null })

    vi.mocked(analyzeIssues).mockResolvedValue('raw')
    vi.mocked(parseIssueAnalysis).mockReturnValue({
      newIssues: [
        { label: 'Communication gap', description: 'Feels unheard', raised_by: 'person_a' },
      ],
      gradedIssues: [],
    })

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.newIssues).toBe(1)
    expect(data.gradedIssues).toBe(0)
    expect(chain.insert).toHaveBeenCalled()
  })

  it('updates graded issues', async () => {
    const session = makeSession({ id: 'sess-1', mode: 'in_person' })
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: message, error: null })

    vi.mocked(analyzeIssues).mockResolvedValue('raw')
    vi.mocked(parseIssueAnalysis).mockReturnValue({
      newIssues: [],
      gradedIssues: [
        { issueId: 'issue-1', status: 'well_addressed', rationale: 'Good response' },
      ],
    })

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.gradedIssues).toBe(1)
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'well_addressed',
        addressed_by_message_id: 'msg-1',
        grading_rationale: 'Good response',
      }),
    )
  })

  it('returns counts of new and graded issues', async () => {
    const session = makeSession({ id: 'sess-1', mode: 'in_person' })
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: message, error: null })

    vi.mocked(analyzeIssues).mockResolvedValue('raw')
    vi.mocked(parseIssueAnalysis).mockReturnValue({
      newIssues: [
        { label: 'Issue A', description: 'desc' },
        { label: 'Issue B', description: 'desc' },
      ],
      gradedIssues: [
        { issueId: 'i-1', status: 'well_addressed', rationale: 'ok' },
      ],
    })

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()

    expect(data.newIssues).toBe(2)
    expect(data.gradedIssues).toBe(1)
  })

  it('returns 500 when issue analysis parsing fails', async () => {
    const session = makeSession({ id: 'sess-1', mode: 'in_person' })
    const message = makeMessage({ id: 'msg-1', session_id: 'sess-1' })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: message, error: null })

    vi.mocked(analyzeIssues).mockResolvedValue('garbage')
    vi.mocked(parseIssueAnalysis).mockReturnValue(null)

    const response = await POST(
      makeRequest({ session_id: 'sess-1', message_id: 'msg-1' }),
    )
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.error).toContain('Failed to parse')
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
  })
})
