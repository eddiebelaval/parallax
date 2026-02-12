import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@/lib/supabase'
import { makeMessage } from '@/__tests__/helpers/fixtures'
import { POST } from '@/app/api/messages/route'

beforeEach(() => {
  vi.restoreAllMocks()
})

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

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

describe('POST /api/messages', () => {
  it('creates message with session_id, sender, content', async () => {
    const message = makeMessage({ content: 'Hello' })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: message, error: null })

    const response = await POST(
      makeRequest({
        session_id: 'test-session-id',
        sender: 'person_a',
        content: 'Hello',
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.content).toBe('Hello')
    expect(data.sender).toBe('person_a')
  })

  it('trims content whitespace', async () => {
    const message = makeMessage({ content: 'Hello' })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: message, error: null })

    await POST(
      makeRequest({
        session_id: 'test-session-id',
        sender: 'person_a',
        content: '  Hello  ',
      }),
    )

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'Hello' }),
    )
  })

  it('returns 400 when content is empty', async () => {
    const response = await POST(
      makeRequest({
        session_id: 'test-session-id',
        sender: 'person_a',
        content: '',
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Content is required')
  })

  it('returns 400 when content is only whitespace', async () => {
    const response = await POST(
      makeRequest({
        session_id: 'test-session-id',
        sender: 'person_a',
        content: '   ',
      }),
    )

    expect(response.status).toBe(400)
  })

  it('returns 400 when content is missing', async () => {
    const response = await POST(
      makeRequest({
        session_id: 'test-session-id',
        sender: 'person_a',
      }),
    )

    expect(response.status).toBe(400)
  })

  it('returns 500 on Supabase error', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({
      data: null,
      error: { message: 'Insert failed' },
    })

    const response = await POST(
      makeRequest({
        session_id: 'test-session-id',
        sender: 'person_a',
        content: 'Hello',
      }),
    )
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Insert failed')
  })
})
