import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSession } from '../useSession'
import { supabase } from '@/lib/supabase'
import { makeSession } from '@/__tests__/helpers/fixtures'

// The supabase module is globally mocked in setup.ts. We control it per test.
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
}

beforeEach(() => {
  vi.mocked(supabase.channel).mockReturnValue(mockChannel as unknown as ReturnType<typeof supabase.channel>)
  vi.mocked(supabase.removeChannel).mockReturnValue(undefined as unknown as ReturnType<typeof supabase.removeChannel>)

  // Default fetch: return a session
  vi.mocked(globalThis.fetch).mockResolvedValue(
    new Response(JSON.stringify(makeSession({ room_code: 'ABC234' })), { status: 200 })
  )
})

describe('useSession', () => {
  it('starts with loading = true', () => {
    const { result } = renderHook(() => useSession('ABC234'))
    // Before fetch resolves, loading should start as true
    expect(result.current.loading).toBe(true)
  })

  it('fetches session on mount and sets session data', async () => {
    const session = makeSession({ room_code: 'ABC234', person_a_name: 'Alice' })
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(session), { status: 200 })
    )

    const { result } = renderHook(() => useSession('ABC234'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.session).toMatchObject({ person_a_name: 'Alice' })
  })

  it('subscribes to Realtime channel on mount', () => {
    renderHook(() => useSession('ABC234'))
    expect(supabase.channel).toHaveBeenCalledWith('session-room-ABC234')
    expect(mockChannel.on).toHaveBeenCalled()
    expect(mockChannel.subscribe).toHaveBeenCalled()
  })

  it('cleans up channel on unmount', () => {
    const { unmount } = renderHook(() => useSession('ABC234'))
    unmount()
    expect(supabase.removeChannel).toHaveBeenCalled()
  })

  it('sets loading to false even on fetch error', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response('Not Found', { status: 404 })
    )
    const { result } = renderHook(() => useSession('ABC234'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.session).toBeNull()
  })

  // --- createSession ---

  it('createSession POSTs and sets session on success', async () => {
    const newSession = makeSession({ person_a_name: 'Alice' })
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(makeSession()), { status: 200 })) // initial fetch
      .mockResolvedValueOnce(new Response(JSON.stringify(newSession), { status: 200 })) // createSession

    const { result } = renderHook(() => useSession('ABC234'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let created: unknown
    await act(async () => {
      created = await result.current.createSession('Alice')
    })
    expect(created).toMatchObject({ person_a_name: 'Alice' })
  })

  it('createSession sets error on failure', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(makeSession()), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Failed' }), { status: 400 })
      )

    const { result } = renderHook(() => useSession('ABC234'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createSession()
    })
    expect(result.current.error).toBe('Failed')
  })

  // --- joinSession ---

  it('joinSession POSTs with name and side', async () => {
    const joinedSession = makeSession({ person_b_name: 'Bob' })
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(makeSession()), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(joinedSession), { status: 200 }))

    const { result } = renderHook(() => useSession('ABC234'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let joined: unknown
    await act(async () => {
      joined = await result.current.joinSession('Bob', 'b')
    })
    expect(joined).toMatchObject({ person_b_name: 'Bob' })
  })

  it('joinSession sets error on failure', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(makeSession()), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Side taken' }), { status: 400 })
      )

    const { result } = renderHook(() => useSession('ABC234'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.joinSession('Bob', 'b')
    })
    expect(result.current.error).toBe('Side taken')
  })

  // --- advanceOnboarding ---

  it('advanceOnboarding PATCHes the onboarding endpoint', async () => {
    const advancedSession = makeSession({ onboarding_step: 'set_stage' })
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(makeSession()), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(advancedSession), { status: 200 }))

    const { result } = renderHook(() => useSession('ABC234'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.advanceOnboarding({ step: 'set_stage' })
    })
    expect(result.current.session).toMatchObject({ onboarding_step: 'set_stage' })
  })

  // --- refreshSession ---

  it('refreshSession re-fetches session from server', async () => {
    const updatedSession = makeSession({ person_a_name: 'Alice Updated' })
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(makeSession()), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(updatedSession), { status: 200 }))

    const { result } = renderHook(() => useSession('ABC234'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.refreshSession()
    })
    expect(result.current.session).toMatchObject({ person_a_name: 'Alice Updated' })
  })

  it('refreshSession returns null on error', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(makeSession()), { status: 200 }))
      .mockResolvedValueOnce(new Response('Error', { status: 500 }))

    const { result } = renderHook(() => useSession('ABC234'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let refreshResult: unknown
    await act(async () => {
      refreshResult = await result.current.refreshSession()
    })
    expect(refreshResult).toBeNull()
  })
})
