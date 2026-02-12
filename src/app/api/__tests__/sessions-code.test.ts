import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@/lib/supabase'
import { makeSession } from '@/__tests__/helpers/fixtures'
import { GET } from '@/app/api/sessions/[code]/route'

beforeEach(() => {
  vi.restoreAllMocks()
})

function makeRequest() {
  return new Request('http://localhost/api/sessions/ABC234', { method: 'GET' })
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

describe('GET /api/sessions/[code]', () => {
  it('returns session by room_code (uppercased)', async () => {
    const session = makeSession()
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: session, error: null })

    const response = await GET(makeRequest(), {
      params: Promise.resolve({ code: 'abc234' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.room_code).toBe('ABC234')
    expect(chain.eq).toHaveBeenCalledWith('room_code', 'ABC234')
  })

  it('returns 404 when session not found (PGRST116)', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    })

    const response = await GET(makeRequest(), {
      params: Promise.resolve({ code: 'XXXXXX' }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Session not found')
  })

  it('returns 500 on other Supabase errors', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({
      data: null,
      error: { message: 'Connection failed' },
    })

    const response = await GET(makeRequest(), {
      params: Promise.resolve({ code: 'ABC234' }),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Connection failed')
  })
})
