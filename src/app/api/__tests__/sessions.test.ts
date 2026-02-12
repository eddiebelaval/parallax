import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@/lib/supabase'
import { makeSession } from '@/__tests__/helpers/fixtures'
import { POST } from '@/app/api/sessions/route'

beforeEach(() => {
  vi.restoreAllMocks()
})

function makeRequest(body: Record<string, unknown> = {}) {
  return new Request('http://localhost/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Creates a shared-chain mock where from() always returns the same chain object */
function mockSupabase() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const fluent = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'lt', 'gt', 'lte', 'gte',
    'in', 'is', 'like', 'ilike', 'order', 'limit',
    'range', 'filter', 'not', 'or', 'match', 'textSearch',
  ]
  for (const m of fluent) {
    chain[m] = vi.fn(() => chain)
  }
  chain.single = vi.fn()
  chain.maybeSingle = vi.fn()
  ;(chain as Record<string, unknown>).then = undefined

  const client = {
    from: vi.fn(() => chain),
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
  }

  vi.mocked(createServerClient).mockReturnValue(client as never)
  return { client, chain }
}

describe('POST /api/sessions', () => {
  it('creates session with default values', async () => {
    const session = makeSession({ person_a_name: null })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: session, error: null })

    const response = await POST(makeRequest({}))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.room_code).toBe(session.room_code)
  })

  it('sets person_a_name when provided', async () => {
    const session = makeSession({ person_a_name: 'Alice' })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: session, error: null })

    const response = await POST(makeRequest({ person_a_name: 'Alice' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.person_a_name).toBe('Alice')
  })

  it('sets mode, status, and onboarding_step for in_person mode', async () => {
    const session = makeSession({
      mode: 'in_person',
      status: 'active',
      onboarding_step: 'complete',
    })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: session, error: null })

    const response = await POST(makeRequest({ mode: 'in_person' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.mode).toBe('in_person')
    expect(data.status).toBe('active')
    expect(data.onboarding_step).toBe('complete')
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'in_person',
        status: 'active',
        onboarding_step: 'complete',
      }),
    )
  })

  it('sets valid context_mode', async () => {
    const session = makeSession({ context_mode: 'professional_peer' })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: session, error: null })

    const response = await POST(makeRequest({ context_mode: 'professional_peer' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.context_mode).toBe('professional_peer')
  })

  it('ignores invalid context_mode (defaults to intimate)', async () => {
    const session = makeSession({ context_mode: 'intimate' })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: session, error: null })

    await POST(makeRequest({ context_mode: 'invalid_mode' }))

    expect(chain.insert).toHaveBeenCalledWith(
      expect.not.objectContaining({ context_mode: 'invalid_mode' }),
    )
  })

  it('returns 500 on non-23505 Supabase error', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({
      data: null,
      error: { message: 'DB connection error', code: 'PGRST000' },
    })

    const response = await POST(makeRequest({}))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('DB connection error')
  })

  it('retries on 23505 room_code collision', async () => {
    const session = makeSession()
    const { chain } = mockSupabase()
    chain.single
      .mockResolvedValueOnce({ data: null, error: { message: 'duplicate key', code: '23505' } })
      .mockResolvedValueOnce({ data: session, error: null })

    const response = await POST(makeRequest({}))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.room_code).toBe(session.room_code)
  })

  it('returns 500 after 3 retries fail with 23505', async () => {
    const { chain } = mockSupabase()
    chain.single
      .mockResolvedValueOnce({ data: null, error: { message: 'dup', code: '23505' } })
      .mockResolvedValueOnce({ data: null, error: { message: 'dup', code: '23505' } })
      .mockResolvedValueOnce({ data: null, error: { message: 'dup', code: '23505' } })

    const response = await POST(makeRequest({}))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('unique room code')
  })
})
