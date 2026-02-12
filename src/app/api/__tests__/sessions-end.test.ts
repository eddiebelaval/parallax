import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@/lib/supabase'
import { makeSession } from '@/__tests__/helpers/fixtures'
import { POST } from '@/app/api/sessions/[code]/end/route'

beforeEach(() => {
  vi.restoreAllMocks()
})

function makeRequest() {
  return new Request('http://localhost/api/sessions/ABC234/end', { method: 'POST' })
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

describe('POST /api/sessions/[code]/end', () => {
  it('sets status to completed', async () => {
    const session = makeSession({ status: 'completed' })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: session, error: null })

    const response = await POST(makeRequest(), {
      params: Promise.resolve({ code: 'ABC234' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('completed')
    expect(chain.update).toHaveBeenCalledWith({ status: 'completed' })
  })

  it('uppercases the room code', async () => {
    const session = makeSession({ status: 'completed' })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: session, error: null })

    await POST(makeRequest(), {
      params: Promise.resolve({ code: 'abc234' }),
    })

    expect(chain.eq).toHaveBeenCalledWith('room_code', 'ABC234')
  })

  it('returns 404 when session not found (PGRST116)', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    })

    const response = await POST(makeRequest(), {
      params: Promise.resolve({ code: 'XXXXXX' }),
    })

    expect(response.status).toBe(404)
  })

  it('returns 500 on other errors', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({
      data: null,
      error: { message: 'Connection lost', code: 'PGRST000' },
    })

    const response = await POST(makeRequest(), {
      params: Promise.resolve({ code: 'ABC234' }),
    })

    expect(response.status).toBe(500)
  })

  it('returns error when data is null (no error object)', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: null, error: null })

    const response = await POST(makeRequest(), {
      params: Promise.resolve({ code: 'ABC234' }),
    })

    // !data path: error is null → message is 'Session not found'
    expect(response.status).toBe(500)
  })
})
