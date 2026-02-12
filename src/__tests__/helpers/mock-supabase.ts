import { vi } from 'vitest'

type MockResponse = { data: unknown; error: null } | { data: null; error: { message: string; code?: string } }

/**
 * Chainable Supabase query mock.
 *
 * Usage:
 *   const mock = createMockSupabase()
 *   mock.setResponse('sessions', { data: makeSession(), error: null })
 *   vi.mocked(createServerClient).mockReturnValue(mock.client)
 */
export function createMockSupabase() {
  const responses = new Map<string, MockResponse>()
  const insertedData: Record<string, unknown[]> = {}
  const updatedData: Record<string, unknown[]> = {}

  function setResponse(table: string, response: MockResponse) {
    responses.set(table, response)
  }

  function getResponse(table: string): MockResponse {
    return responses.get(table) ?? { data: null, error: { message: `No mock configured for table: ${table}` } }
  }

  function createChain(table: string) {
    const chain: Record<string, unknown> = {}

    // Each method returns the chain for fluent API
    const methods = [
      'select', 'insert', 'update', 'delete', 'upsert',
      'eq', 'neq', 'lt', 'gt', 'lte', 'gte',
      'in', 'is', 'like', 'ilike',
      'order', 'limit', 'range', 'filter',
      'not', 'or', 'match', 'textSearch',
    ]

    for (const method of methods) {
      chain[method] = vi.fn((...args: unknown[]) => {
        // Track inserts and updates
        if (method === 'insert' && args[0]) {
          if (!insertedData[table]) insertedData[table] = []
          insertedData[table].push(args[0])
        }
        if (method === 'update' && args[0]) {
          if (!updatedData[table]) updatedData[table] = []
          updatedData[table].push(args[0])
        }
        return chain
      })
    }

    // Terminal methods that return the response
    chain.single = vi.fn(() => Promise.resolve(getResponse(table)))
    chain.maybeSingle = vi.fn(() => Promise.resolve(getResponse(table)))
    chain.then = undefined // Not a promise itself; single()/maybeSingle() resolve

    return chain
  }

  // Realtime channel mock
  const channels: Record<string, MockChannel> = {}

  interface MockChannel {
    on: ReturnType<typeof vi.fn>
    subscribe: ReturnType<typeof vi.fn>
    _handlers: Map<string, ((payload: unknown) => void)[]>
    _trigger: (event: string, payload: unknown) => void
  }

  function createChannel(name: string): MockChannel {
    const handlers = new Map<string, ((payload: unknown) => void)[]>()

    const channel: MockChannel = {
      on: vi.fn((_type: string, _filter: unknown, handler: (payload: unknown) => void) => {
        const event = typeof _filter === 'object' && _filter !== null && 'event' in _filter
          ? (_filter as { event: string }).event
          : 'UPDATE'
        if (!handlers.has(event)) handlers.set(event, [])
        handlers.get(event)!.push(handler)
        return channel
      }),
      subscribe: vi.fn(() => channel),
      _handlers: handlers,
      _trigger: (event: string, payload: unknown) => {
        const fns = handlers.get(event) || []
        for (const fn of fns) fn(payload)
      },
    }

    channels[name] = channel
    return channel
  }

  const removedChannels: string[] = []

  const client = {
    from: vi.fn((table: string) => createChain(table)),
    channel: vi.fn((name: string) => createChannel(name)),
    removeChannel: vi.fn((channel: unknown) => {
      removedChannels.push(String(channel))
    }),
  }

  return {
    client,
    setResponse,
    channels,
    removedChannels,
    insertedData,
    updatedData,
  }
}
