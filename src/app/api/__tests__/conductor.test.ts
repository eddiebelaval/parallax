import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerClient } from '@/lib/supabase'
import {
  makeSession,
  makeMessage,
  makeConflictAnalysis,
} from '@/__tests__/helpers/fixtures'

vi.mock('@/lib/opus', () => ({
  conductorMessage: vi.fn(),
}))

vi.mock('@/lib/prompts/conductor', () => ({
  buildGreetingPrompt: vi.fn(() => ({ system: 'sys', user: 'usr' })),
  buildGreetingAPrompt: vi.fn(() => ({ system: 'sys', user: 'usr' })),
  buildProcessAPrompt: vi.fn(() => ({ system: 'sys', user: 'usr' })),
  buildWaitingChatPrompt: vi.fn(() => ({ system: 'sys', user: 'usr' })),
  buildGreetingBPrompt: vi.fn(() => ({ system: 'sys', user: 'usr' })),
  buildAcknowledgeAPrompt: vi.fn(() => ({ system: 'sys', user: 'usr' })),
  buildSynthesisPrompt: vi.fn(() => ({ system: 'sys', user: 'usr' })),
  buildInterventionPrompt: vi.fn(() => ({ system: 'sys', user: 'usr' })),
  buildAdaptivePrompt: vi.fn(() => ({ system: 'sys', user: 'usr' })),
}))

vi.mock('@/lib/conductor/interventions', () => ({
  checkForIntervention: vi.fn(() => ({ shouldIntervene: false, type: null })),
}))

vi.mock('@/lib/conversation', () => ({
  buildNameMap: vi.fn(() => ({
    person_a: 'Alice',
    person_b: 'Bob',
    mediator: 'Ava',
  })),
  toConversationHistory: vi.fn(() => []),
  stripCodeFences: vi.fn((s: string) => s),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}))

import { POST } from '@/app/api/conductor/route'
import { conductorMessage } from '@/lib/opus'
import { checkForIntervention } from '@/lib/conductor/interventions'
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
  return new Request('http://localhost/api/conductor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/conductor', () => {
  // --- Validation ---

  it('returns 400 when missing session_id', async () => {
    const response = await POST(makeRequest({ trigger: 'session_active' }))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('session_id and trigger are required')
  })

  it('returns 400 when missing trigger', async () => {
    const response = await POST(makeRequest({ session_id: 'sess-1' }))
    expect(response.status).toBe(400)
  })

  it('returns 404 when session not found', async () => {
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    })

    const response = await POST(
      makeRequest({ session_id: 'sess-1', trigger: 'session_active' }),
    )
    const data = await response.json()
    expect(response.status).toBe(404)
    expect(data.error).toBe('Session not found')
  })

  it('returns 400 for unknown trigger', async () => {
    const session = makeSession({ id: 'sess-1' })
    const { chain } = mockSupabase()
    chain.single.mockResolvedValue({ data: session, error: null })

    const response = await POST(
      makeRequest({ session_id: 'sess-1', trigger: 'unknown_trigger' }),
    )
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Unknown trigger')
  })

  it('returns 429 when rate limited', async () => {
    const { NextResponse } = await import('next/server')
    vi.mocked(checkRateLimit).mockReturnValue(
      NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }),
    )

    const response = await POST(
      makeRequest({ session_id: 'sess-1', trigger: 'session_active' }),
    )
    expect(response.status).toBe(429)
  })

  // --- session_active trigger ---

  describe('trigger: session_active', () => {
    it('sends greeting and advances to gather_a', async () => {
      const session = makeSession({ id: 'sess-1', onboarding_context: null })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })
      vi.mocked(conductorMessage).mockResolvedValue('Welcome to Ava!')

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'session_active' }),
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.phase).toBe('gather_a')
      expect(data.message).toBe('Welcome to Ava!')

      // Verify mediator message was inserted
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'sess-1',
          sender: 'mediator',
          content: 'Welcome to Ava!',
        }),
      )
    })

    it('handles Claude failure gracefully (advances to active)', async () => {
      const session = makeSession({ id: 'sess-1', onboarding_context: null })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })
      vi.mocked(conductorMessage).mockRejectedValue(new Error('API error'))

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'session_active' }),
      )
      const data = await response.json()

      expect(response.status).toBe(502)
      expect(data.phase).toBe('active')
    })
  })

  // --- message_sent trigger ---

  describe('trigger: message_sent', () => {
    it('returns 400 without message_id', async () => {
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'gather_a' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'message_sent' }),
      )
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toContain('message_id required')
    })

    it('gather_a phase: processes A context and advances to waiting_for_b', async () => {
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'gather_a' },
      })
      const message = makeMessage({ id: 'msg-1', content: 'I feel ignored' })
      const { chain } = mockSupabase()

      // 1st single: session, 2nd single: message
      chain.single
        .mockResolvedValueOnce({ data: session, error: null })
        .mockResolvedValueOnce({ data: message, error: null })

      // The conductor now calls buildProcessAPrompt and returns JSON with message + name
      vi.mocked(conductorMessage).mockResolvedValue(JSON.stringify({
        message: 'I hear you, Alice. Let me share the room code with your partner.',
        name: 'Alice',
      }))

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'message_sent', message_id: 'msg-1' }),
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.phase).toBe('waiting_for_b')
      expect(data.message).toBeDefined()

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          sender: 'mediator',
        }),
      )
    })

    it('gather_b phase: synthesizes and advances to active with goals', async () => {
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: {
          conductorPhase: 'gather_b',
          personAContext: 'I feel ignored',
        },
      })
      const message = makeMessage({ id: 'msg-2', content: 'I am overwhelmed' })
      const { chain } = mockSupabase()

      chain.single
        .mockResolvedValueOnce({ data: session, error: null })
        .mockResolvedValueOnce({ data: message, error: null })

      const synthesisResponse = JSON.stringify({
        message: 'Both of you want connection.',
        goals: ['Understand each other', 'Find compromise'],
        contextSummary: 'Alice feels ignored, Bob is overwhelmed',
      })
      vi.mocked(conductorMessage).mockResolvedValue(synthesisResponse)

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'message_sent', message_id: 'msg-2' }),
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.phase).toBe('active')
      expect(data.goals).toContain('Understand each other')
      expect(data.contextSummary).toBe('Alice feels ignored, Bob is overwhelmed')
    })

    it('active phase: returns current phase', async () => {
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'active' },
      })
      const message = makeMessage({ id: 'msg-3' })
      const { chain } = mockSupabase()

      chain.single
        .mockResolvedValueOnce({ data: session, error: null })
        .mockResolvedValueOnce({ data: message, error: null })

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'message_sent', message_id: 'msg-3' }),
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.phase).toBe('active')
    })

    it('gather_a phase handles Claude failure gracefully (advances to waiting_for_b)', async () => {
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'gather_a' },
      })
      const message = makeMessage({ id: 'msg-1', content: 'My thoughts' })
      const { chain } = mockSupabase()

      chain.single
        .mockResolvedValueOnce({ data: session, error: null })
        .mockResolvedValueOnce({ data: message, error: null })

      vi.mocked(conductorMessage).mockRejectedValue(new Error('API error'))

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'message_sent', message_id: 'msg-1' }),
      )
      const data = await response.json()

      expect(data.phase).toBe('waiting_for_b')
    })

    it('gather_b phase handles synthesis failure gracefully', async () => {
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: {
          conductorPhase: 'gather_b',
          personAContext: 'context',
        },
      })
      const message = makeMessage({ id: 'msg-2', content: 'My side' })
      const { chain } = mockSupabase()

      chain.single
        .mockResolvedValueOnce({ data: session, error: null })
        .mockResolvedValueOnce({ data: message, error: null })

      vi.mocked(conductorMessage).mockRejectedValue(new Error('API error'))

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'message_sent', message_id: 'msg-2' }),
      )
      const data = await response.json()

      expect(data.phase).toBe('active')
    })

    it('gather_b phase uses raw text when JSON parsing fails', async () => {
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: {
          conductorPhase: 'gather_b',
          personAContext: 'context',
        },
      })
      const message = makeMessage({ id: 'msg-2', content: 'My side' })
      const { chain } = mockSupabase()

      chain.single
        .mockResolvedValueOnce({ data: session, error: null })
        .mockResolvedValueOnce({ data: message, error: null })

      vi.mocked(conductorMessage).mockResolvedValue('This is plain text, not JSON.')

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'message_sent', message_id: 'msg-2' }),
      )
      const data = await response.json()

      expect(data.phase).toBe('active')
      expect(data.message).toBe('This is plain text, not JSON.')
    })
  })

  // --- check_intervention trigger ---

  describe('trigger: check_intervention', () => {
    it('no intervention when not active phase', async () => {
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'gather_a' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'check_intervention' }),
      )
      const data = await response.json()
      expect(data.intervened).toBe(false)
      expect(data.phase).toBe('gather_a')
    })

    it('no intervention when no analyzed messages', async () => {
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'active' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      // Messages query: .order() returns messages without analysis
      chain.order.mockReturnValueOnce(
        Promise.resolve({
          data: [makeMessage({ nvc_analysis: null })],
          error: null,
        }),
      )

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'check_intervention' }),
      )
      const data = await response.json()
      expect(data.intervened).toBe(false)
    })

    it('triggers escalation intervention', async () => {
      const analysis = makeConflictAnalysis({
        meta: {
          contextMode: 'intimate',
          activeLenses: [],
          primaryInsight: 'test',
          overallSeverity: 0.9,
          resolutionDirection: 'escalating',
        },
      })
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'active' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({
          data: [makeMessage({ nvc_analysis: analysis })],
          error: null,
        }),
      )

      vi.mocked(checkForIntervention).mockReturnValue({
        shouldIntervene: true,
        type: 'escalation',
      })
      vi.mocked(conductorMessage).mockResolvedValue('Let us take a breath.')

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'check_intervention' }),
      )
      const data = await response.json()

      expect(data.intervened).toBe(true)
      expect(data.interventionType).toBe('escalation')
      expect(data.message).toBe('Let us take a breath.')
    })

    it('triggers dominance intervention', async () => {
      const analysis = makeConflictAnalysis()
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'active' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({
          data: [makeMessage({ sender: 'person_a', nvc_analysis: analysis })],
          error: null,
        }),
      )

      vi.mocked(checkForIntervention).mockReturnValue({
        shouldIntervene: true,
        type: 'dominance',
      })
      vi.mocked(conductorMessage).mockResolvedValue('Bob, I would love to hear your side.')

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'check_intervention' }),
      )
      const data = await response.json()

      expect(data.intervened).toBe(true)
      expect(data.interventionType).toBe('dominance')
    })

    it('inserts mediator intervention message', async () => {
      const analysis = makeConflictAnalysis()
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'active' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({
          data: [makeMessage({ nvc_analysis: analysis })],
          error: null,
        }),
      )

      vi.mocked(checkForIntervention).mockReturnValue({
        shouldIntervene: true,
        type: 'escalation',
      })
      vi.mocked(conductorMessage).mockResolvedValue('Intervention message')

      await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'check_intervention' }),
      )

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'sess-1',
          sender: 'mediator',
          content: 'Intervention message',
        }),
      )
    })

    it('no intervention when checkForIntervention returns false', async () => {
      const analysis = makeConflictAnalysis()
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'active' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({
          data: [makeMessage({ nvc_analysis: analysis })],
          error: null,
        }),
      )

      vi.mocked(checkForIntervention).mockReturnValue({
        shouldIntervene: false,
        type: null,
      })

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'check_intervention' }),
      )
      const data = await response.json()
      expect(data.intervened).toBe(false)
    })

    it('handles conductor message failure during intervention', async () => {
      const analysis = makeConflictAnalysis()
      const session = makeSession({
        id: 'sess-1',
        onboarding_context: { conductorPhase: 'active' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({
          data: [makeMessage({ nvc_analysis: analysis })],
          error: null,
        }),
      )

      vi.mocked(checkForIntervention).mockReturnValue({
        shouldIntervene: true,
        type: 'escalation',
      })
      vi.mocked(conductorMessage).mockRejectedValue(new Error('API fail'))

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'check_intervention' }),
      )
      const data = await response.json()
      expect(data.intervened).toBe(false)
    })
  })

  // --- in_person_message trigger ---

  describe('trigger: in_person_message', () => {
    it('sends adaptive prompt with full history', async () => {
      const session = makeSession({
        id: 'sess-1',
        mode: 'in_person',
        onboarding_context: { conductorPhase: 'onboarding' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({
          data: [makeMessage({ content: 'Hi' })],
          error: null,
        }),
      )

      const adaptiveResponse = JSON.stringify({
        action: 'continue',
        message: 'Welcome! Who am I speaking with?',
        directed_to: 'person_a',
      })
      vi.mocked(conductorMessage).mockResolvedValue(adaptiveResponse)

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'in_person_message' }),
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.phase).toBe('onboarding')
      expect(data.message).toBe('Welcome! Who am I speaking with?')
      expect(data.directed_to).toBe('person_a')
    })

    it('handles synthesize action — updates to active with goals', async () => {
      const session = makeSession({
        id: 'sess-1',
        mode: 'in_person',
        onboarding_context: { conductorPhase: 'onboarding' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({ data: [], error: null }),
      )

      const synthesizeResponse = JSON.stringify({
        action: 'synthesize',
        message: 'I see both sides.',
        directed_to: 'person_a',
        goals: ['Goal 1', 'Goal 2'],
        contextSummary: 'Both want connection',
      })
      vi.mocked(conductorMessage).mockResolvedValue(synthesizeResponse)

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'in_person_message' }),
      )
      const data = await response.json()

      expect(data.phase).toBe('active')
      expect(data.goals).toContain('Goal 1')
      expect(data.goals).toContain('Goal 2')
    })

    it('extracts names from Claude response', async () => {
      const session = makeSession({
        id: 'sess-1',
        mode: 'in_person',
        person_a_name: null,
        person_b_name: null,
        onboarding_context: { conductorPhase: 'onboarding' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({ data: [], error: null }),
      )

      const responseWithNames = JSON.stringify({
        action: 'continue',
        message: 'Nice to meet you, Sarah!',
        directed_to: 'person_b',
        names: { a: 'Sarah', b: null },
      })
      vi.mocked(conductorMessage).mockResolvedValue(responseWithNames)

      await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'in_person_message' }),
      )

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          person_a_name: 'Sarah',
        }),
      )
    })

    it('handles Claude failure gracefully during onboarding', async () => {
      const session = makeSession({
        id: 'sess-1',
        mode: 'in_person',
        onboarding_context: { conductorPhase: 'onboarding' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({ data: [], error: null }),
      )

      vi.mocked(conductorMessage).mockRejectedValue(new Error('API down'))

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'in_person_message' }),
      )
      const data = await response.json()

      expect(response.status).toBe(502)
      expect(data.phase).toBe('active')

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          onboarding_context: expect.objectContaining({
            conductorPhase: 'active',
          }),
        }),
      )
    })

    it('handles non-JSON Claude response with fallback', async () => {
      const session = makeSession({
        id: 'sess-1',
        mode: 'in_person',
        onboarding_context: { conductorPhase: 'onboarding' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({ data: [], error: null }),
      )

      vi.mocked(conductorMessage).mockResolvedValue('Just plain text, no JSON.')

      const response = await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'in_person_message' }),
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Just plain text, no JSON.')
    })

    it('inserts mediator message', async () => {
      const session = makeSession({
        id: 'sess-1',
        mode: 'in_person',
        onboarding_context: { conductorPhase: 'onboarding' },
      })
      const { chain } = mockSupabase()
      chain.single.mockResolvedValue({ data: session, error: null })

      chain.order.mockReturnValueOnce(
        Promise.resolve({ data: [], error: null }),
      )

      vi.mocked(conductorMessage).mockResolvedValue(JSON.stringify({
        action: 'continue',
        message: 'Hello there!',
        directed_to: 'person_a',
      }))

      await POST(
        makeRequest({ session_id: 'sess-1', trigger: 'in_person_message' }),
      )

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'sess-1',
          sender: 'mediator',
          content: 'Hello there!',
        }),
      )
    })
  })
})
