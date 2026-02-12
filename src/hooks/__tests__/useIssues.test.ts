import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useIssues } from '../useIssues'
import { supabase } from '@/lib/supabase'
import { makeIssue } from '@/__tests__/helpers/fixtures'
import type { Issue } from '@/types/database'

let realtimeHandlers: Record<string, ((payload: { new: Issue }) => void)[]>
const mockChannel = {
  on: vi.fn((_type: string, filter: { event: string }, handler: (payload: { new: Issue }) => void) => {
    const event = filter.event || 'INSERT'
    if (!realtimeHandlers[event]) realtimeHandlers[event] = []
    realtimeHandlers[event].push(handler)
    return mockChannel
  }),
  subscribe: vi.fn().mockReturnThis(),
}

function mockSupabaseFrom(data: Issue[] = [], error: null | { message: string } = null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(supabase as any).from = vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  }))
}

beforeEach(() => {
  realtimeHandlers = {}
  vi.mocked(supabase.channel).mockReturnValue(mockChannel as unknown as ReturnType<typeof supabase.channel>)
  vi.mocked(supabase.removeChannel).mockReturnValue(undefined as unknown as ReturnType<typeof supabase.removeChannel>)
  mockSupabaseFrom()
})

describe('useIssues', () => {
  it('starts with loading = true and empty issues', () => {
    const { result } = renderHook(() => useIssues('session-1'))
    expect(result.current.loading).toBe(true)
    expect(result.current.issues).toEqual([])
  })

  it('sets loading to false when no sessionId', async () => {
    const { result } = renderHook(() => useIssues(undefined))
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('fetches issues on mount', async () => {
    const issues = [makeIssue({ label: 'Communication' })]
    mockSupabaseFrom(issues)

    const { result } = renderHook(() => useIssues('session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.issues).toHaveLength(1)
    expect(result.current.issues[0].label).toBe('Communication')
  })

  it('subscribes to Realtime channel', () => {
    renderHook(() => useIssues('session-1'))
    expect(supabase.channel).toHaveBeenCalledWith('issues-session-1')
  })

  it('adds new issues from Realtime INSERT', async () => {
    const { result } = renderHook(() => useIssues('session-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newIssue = makeIssue({ id: 'new-issue', label: 'New Problem' })
    act(() => {
      const handlers = realtimeHandlers['INSERT'] || []
      for (const handler of handlers) handler({ new: newIssue })
    })

    expect(result.current.issues).toContainEqual(expect.objectContaining({ id: 'new-issue' }))
  })

  it('updates existing issues from Realtime UPDATE', async () => {
    const original = makeIssue({ id: 'issue-1', status: 'unaddressed' })
    mockSupabaseFrom([original])

    const { result } = renderHook(() => useIssues('session-1'))
    await waitFor(() => expect(result.current.issues).toHaveLength(1))

    const updated = { ...original, status: 'well_addressed' as const }
    act(() => {
      const handlers = realtimeHandlers['UPDATE'] || []
      for (const handler of handlers) handler({ new: updated })
    })

    expect(result.current.issues[0].status).toBe('well_addressed')
  })

  it('prevents duplicate issues from INSERT', async () => {
    const issue = makeIssue({ id: 'dup-issue' })
    mockSupabaseFrom([issue])

    const { result } = renderHook(() => useIssues('session-1'))
    await waitFor(() => expect(result.current.issues).toHaveLength(1))

    act(() => {
      const handlers = realtimeHandlers['INSERT'] || []
      for (const handler of handlers) handler({ new: issue })
    })

    expect(result.current.issues).toHaveLength(1)
  })

  it('cleans up Realtime channel on unmount', () => {
    const { unmount } = renderHook(() => useIssues('session-1'))
    unmount()
    expect(supabase.removeChannel).toHaveBeenCalled()
  })

  // --- Derived data ---

  it('splits issues by person (personAIssues / personBIssues)', async () => {
    const issues = [
      makeIssue({ id: 'a1', raised_by: 'person_a' }),
      makeIssue({ id: 'b1', raised_by: 'person_b' }),
      makeIssue({ id: 'a2', raised_by: 'person_a' }),
    ]
    mockSupabaseFrom(issues)

    const { result } = renderHook(() => useIssues('session-1'))
    await waitFor(() => expect(result.current.issues).toHaveLength(3))
    expect(result.current.personAIssues).toHaveLength(2)
    expect(result.current.personBIssues).toHaveLength(1)
  })

  // --- updateIssueStatus ---

  it('updateIssueStatus calls supabase update and optimistically updates state', async () => {
    const issue = makeIssue({ id: 'issue-1', status: 'unaddressed' })
    mockSupabaseFrom([issue])

    const { result } = renderHook(() => useIssues('session-1'))
    await waitFor(() => expect(result.current.issues).toHaveLength(1))

    await act(async () => {
      await result.current.updateIssueStatus('issue-1', 'deferred')
    })
    expect(result.current.issues[0].status).toBe('deferred')
  })

  // --- refreshIssues ---

  it('refreshIssues re-fetches from supabase', async () => {
    mockSupabaseFrom([makeIssue({ label: 'Original' })])
    const { result } = renderHook(() => useIssues('session-1'))
    await waitFor(() => expect(result.current.issues).toHaveLength(1))

    // Mock new data for refresh
    mockSupabaseFrom([makeIssue({ label: 'Refreshed' })])
    await act(async () => {
      await result.current.refreshIssues()
    })
    expect(result.current.issues[0].label).toBe('Refreshed')
  })
})
