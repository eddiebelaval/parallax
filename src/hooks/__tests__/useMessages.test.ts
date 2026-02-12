import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useMessages } from '../useMessages'
import { supabase } from '@/lib/supabase'
import { makeMessage } from '@/__tests__/helpers/fixtures'
import type { Message } from '@/types/database'

// Track INSERT and UPDATE handlers for Realtime simulation
let realtimeHandlers: Record<string, ((payload: { new: Message }) => void)[]>
const mockChannel = {
  on: vi.fn((_type: string, filter: { event: string }, handler: (payload: { new: Message }) => void) => {
    const event = filter.event || 'INSERT'
    if (!realtimeHandlers[event]) realtimeHandlers[event] = []
    realtimeHandlers[event].push(handler)
    return mockChannel
  }),
  subscribe: vi.fn().mockReturnThis(),
}

const mockFrom = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
}

beforeEach(() => {
  realtimeHandlers = {}
  vi.mocked(supabase.channel).mockReturnValue(mockChannel as unknown as ReturnType<typeof supabase.channel>)
  vi.mocked(supabase.removeChannel).mockReturnValue(undefined as unknown as ReturnType<typeof supabase.removeChannel>)

  // Default: supabase.from returns empty data
  const fromResult = { ...mockFrom, then: undefined }
  // Make terminal call return promise
  Object.defineProperty(fromResult, 'order', {
    value: vi.fn().mockResolvedValue({ data: [], error: null }),
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(supabase as any).from = vi.fn(() => {
    const chain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }
    return chain
  })
})

describe('useMessages', () => {
  it('starts with loading = true and empty messages', () => {
    const { result } = renderHook(() => useMessages('session-1'))
    expect(result.current.loading).toBe(true)
    expect(result.current.messages).toEqual([])
  })

  it('sets loading to false when no sessionId', async () => {
    const { result } = renderHook(() => useMessages(undefined))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.messages).toEqual([])
  })

  it('fetches messages on mount', async () => {
    const msgs = [makeMessage({ content: 'Hello' })]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: msgs, error: null }),
        }),
      }),
    }))

    const { result } = renderHook(() => useMessages('session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toBe('Hello')
  })

  it('subscribes to Realtime INSERT events', () => {
    renderHook(() => useMessages('session-1'))
    expect(supabase.channel).toHaveBeenCalledWith('messages-session-1')
    expect(mockChannel.on).toHaveBeenCalled()
  })

  it('adds new messages from Realtime INSERT', async () => {
    const { result } = renderHook(() => useMessages('session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newMsg = makeMessage({ id: 'new-1', content: 'Realtime msg' })
    act(() => {
      const handlers = realtimeHandlers['INSERT'] || []
      for (const handler of handlers) handler({ new: newMsg })
    })

    expect(result.current.messages).toContainEqual(expect.objectContaining({ id: 'new-1' }))
  })

  it('updates existing messages from Realtime UPDATE', async () => {
    const original = makeMessage({ id: 'msg-1', content: 'Original' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [original], error: null }),
        }),
      }),
    }))

    const { result } = renderHook(() => useMessages('session-1'))
    await waitFor(() => expect(result.current.messages).toHaveLength(1))

    const updated = { ...original, content: 'Updated' }
    act(() => {
      const handlers = realtimeHandlers['UPDATE'] || []
      for (const handler of handlers) handler({ new: updated })
    })

    expect(result.current.messages[0].content).toBe('Updated')
  })

  it('prevents duplicate messages from INSERT', async () => {
    const msg = makeMessage({ id: 'dup-1' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [msg], error: null }),
        }),
      }),
    }))

    const { result } = renderHook(() => useMessages('session-1'))
    await waitFor(() => expect(result.current.messages).toHaveLength(1))

    // Fire INSERT for same message
    act(() => {
      const handlers = realtimeHandlers['INSERT'] || []
      for (const handler of handlers) handler({ new: msg })
    })

    expect(result.current.messages).toHaveLength(1)
  })

  it('cleans up Realtime channel on unmount', () => {
    const { unmount } = renderHook(() => useMessages('session-1'))
    unmount()
    expect(supabase.removeChannel).toHaveBeenCalled()
  })

  // --- sendMessage ---

  it('sendMessage POSTs and returns message', async () => {
    const sentMsg = makeMessage({ content: 'Sent!' })
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(sentMsg), { status: 200 })
    )

    const { result } = renderHook(() => useMessages('session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let sent: unknown
    await act(async () => {
      sent = await result.current.sendMessage('person_a', 'Sent!')
    })
    expect(sent).toMatchObject({ content: 'Sent!' })
  })

  it('sendMessage returns null when no sessionId', async () => {
    const { result } = renderHook(() => useMessages(undefined))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let sent: unknown
    await act(async () => {
      sent = await result.current.sendMessage('person_a', 'test')
    })
    expect(sent).toBeNull()
  })

  it('sendMessage returns null on failure', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response('Error', { status: 500 })
    )

    const { result } = renderHook(() => useMessages('session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let sent: unknown
    await act(async () => {
      sent = await result.current.sendMessage('person_a', 'test')
    })
    expect(sent).toBeNull()
  })

  // --- currentTurn ---

  it('currentTurn starts with person_a when no messages', async () => {
    const { result } = renderHook(() => useMessages('session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.currentTurn).toBe('person_a')
  })

  it('currentTurn alternates based on last human message', async () => {
    const msgs = [
      makeMessage({ sender: 'person_a' }),
      makeMessage({ sender: 'mediator' }),
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: msgs, error: null }),
        }),
      }),
    }))

    const { result } = renderHook(() => useMessages('session-1'))
    await waitFor(() => expect(result.current.messages).toHaveLength(2))
    // Last human message is person_a, so next turn is person_b
    expect(result.current.currentTurn).toBe('person_b')
  })
})
