import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@/lib/supabase'
import { makeSession } from '@/__tests__/helpers/fixtures'
import { POST } from '@/app/api/sessions/[code]/join/route'

beforeEach(() => {
  vi.restoreAllMocks()
})

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/sessions/ABC234/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const params = Promise.resolve({ code: 'ABC234' })

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

describe('POST /api/sessions/[code]/join', () => {
  it('joins as person_a', async () => {
    const session = makeSession({ person_a_name: null, person_b_name: 'Bob' })
    const updatedSession = { ...session, person_a_name: 'Alice', status: 'active' }
    const { chain } = mockSupabase()

    // First single(): fetch session; second single(): update result
    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: updatedSession, error: null })

    const response = await POST(makeRequest({ name: 'Alice', side: 'a' }), { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.person_a_name).toBe('Alice')
    expect(data.status).toBe('active')
  })

  it('joins as person_b', async () => {
    const session = makeSession({ person_a_name: 'Alice', person_b_name: null })
    const updatedSession = { ...session, person_b_name: 'Bob', status: 'active' }
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: updatedSession, error: null })

    const response = await POST(makeRequest({ name: 'Bob', side: 'b' }), { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.person_b_name).toBe('Bob')
  })

  it('trims whitespace from name', async () => {
    const session = makeSession({ person_a_name: null, person_b_name: 'Bob' })
    const updatedSession = { ...session, person_a_name: 'Alice' }
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: updatedSession, error: null })

    await POST(makeRequest({ name: '  Alice  ', side: 'a' }), { params })

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ person_a_name: 'Alice' }),
    )
  })

  it('returns 400 when name is empty', async () => {
    const response = await POST(makeRequest({ name: '', side: 'a' }), { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name is required')
  })

  it('returns 400 when name is only whitespace', async () => {
    const response = await POST(makeRequest({ name: '   ', side: 'a' }), { params })
    expect(response.status).toBe(400)
  })

  it('returns 404 when session not found', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    })

    const response = await POST(makeRequest({ name: 'Alice', side: 'a' }), { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Session not found')
  })

  it('returns 409 when slot already taken', async () => {
    const session = makeSession({ person_a_name: 'Alice', person_b_name: 'Bob' })
    const { chain } = mockSupabase()

    // First single(): fetch session (slot already filled);
    // Second single(): conditional update returns PGRST116 (no matching rows — slot was not null)
    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'No rows found', code: 'PGRST116' } })

    const response = await POST(makeRequest({ name: 'Charlie', side: 'a' }), { params })
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('Person A has already joined')
  })

  it('returns 400 when side is invalid', async () => {
    const response = await POST(makeRequest({ name: 'Alice', side: 'x' }), { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('side must be "a" or "b"')
  })

  it('sets status to active when both people present', async () => {
    const session = makeSession({ person_a_name: null, person_b_name: 'Bob' })
    const updatedSession = { ...session, person_a_name: 'Alice', status: 'active' }
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: updatedSession, error: null })

    await POST(makeRequest({ name: 'Alice', side: 'a' }), { params })

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' }),
    )
  })

  it('does not set status when joining first (other slot empty)', async () => {
    const session = makeSession({ person_a_name: null, person_b_name: null })
    const updatedSession = { ...session, person_a_name: 'Alice' }
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: updatedSession, error: null })

    await POST(makeRequest({ name: 'Alice', side: 'a' }), { params })

    // update should be called with just the name, no status
    expect(chain.update).toHaveBeenCalledWith({ person_a_name: 'Alice' })
  })

  it('returns 500 on Supabase update error', async () => {
    const session = makeSession({ person_a_name: null, person_b_name: 'Bob' })
    const { chain } = mockSupabase()

    chain.single
      .mockResolvedValueOnce({ data: session, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Update failed' } })

    const response = await POST(makeRequest({ name: 'Alice', side: 'a' }), { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Update failed')
  })
})
