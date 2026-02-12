import { describe, it, expect, vi, beforeEach } from 'vitest'

// Standalone mock — survives vi.restoreAllMocks() because we re-set it in beforeEach
const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(),
}))

// Import after mock is registered
import Anthropic from '@anthropic-ai/sdk'
import { mediateMessage, conductorMessage, analyzeIssues, summarizeSession } from '../opus'

function setClaudeResponse(text: string) {
  mockCreate.mockResolvedValue({
    content: [{ type: 'text' as const, text }],
    model: 'claude-opus-4-6',
    stop_reason: 'end_turn',
    usage: { input_tokens: 100, output_tokens: 50 },
  })
}

function setClaudeError(err: Error) {
  mockCreate.mockRejectedValue(err)
}

describe('opus.ts — Claude API wrapper', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    setClaudeResponse('{}')
    // Re-apply constructor mock after vi.restoreAllMocks() clears it
    vi.mocked(Anthropic).mockImplementation(function (this: unknown) {
      return { messages: { create: mockCreate } } as unknown as Anthropic
    })
    process.env.ANTHROPIC_API_KEY = 'test-key'
  })

  // --- mediateMessage ---

  describe('mediateMessage', () => {
    it('returns Claude response text', async () => {
      setClaudeResponse('{"observation": "test"}')
      const result = await mediateMessage(
        'I feel unheard', 'person_a', 'Alice', 'Bob', []
      )
      expect(result).toBe('{"observation": "test"}')
    })

    it('calls Claude API with correct model', async () => {
      setClaudeResponse('ok')
      await mediateMessage('msg', 'person_a', 'Alice', 'Bob', [])
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'claude-opus-4-6' })
      )
    })

    it('passes conversation history', async () => {
      setClaudeResponse('ok')
      const history = [{ sender: 'Alice', content: 'hello' }]
      await mediateMessage('msg', 'person_a', 'Alice', 'Bob', history)
      expect(mockCreate).toHaveBeenCalled()
    })

    it('accepts optional contextMode and sessionContext', async () => {
      setClaudeResponse('ok')
      await mediateMessage(
        'msg', 'person_a', 'Alice', 'Bob', [],
        'professional_peer',
        { goals: ['goal 1'], contextSummary: 'summary' }
      )
      expect(mockCreate).toHaveBeenCalled()
    })
  })

  // --- conductorMessage ---

  describe('conductorMessage', () => {
    it('returns Claude response text', async () => {
      setClaudeResponse('Hello there!')
      const result = await conductorMessage('system', 'user')
      expect(result).toBe('Hello there!')
    })

    it('uses default maxTokens of 512', async () => {
      setClaudeResponse('ok')
      await conductorMessage('sys', 'usr')
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ max_tokens: 512 })
      )
    })

    it('accepts custom maxTokens', async () => {
      setClaudeResponse('ok')
      await conductorMessage('sys', 'usr', 1024)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ max_tokens: 1024 })
      )
    })
  })

  // --- analyzeIssues ---

  describe('analyzeIssues', () => {
    it('returns Claude response text', async () => {
      setClaudeResponse('{"newIssues": []}')
      const result = await analyzeIssues(
        'This is unfair', 'person_a', 'Alice', 'Bob', [], []
      )
      expect(result).toBe('{"newIssues": []}')
    })

    it('passes existing issues to prompt', async () => {
      setClaudeResponse('ok')
      const existingIssues = [
        { id: 'i1', label: 'Workload', description: 'desc', raised_by: 'person_a', status: 'unaddressed' },
      ]
      await analyzeIssues('msg', 'person_a', 'Alice', 'Bob', [], existingIssues)
      expect(mockCreate).toHaveBeenCalled()
    })
  })

  // --- summarizeSession ---

  describe('summarizeSession', () => {
    it('returns Claude response text', async () => {
      setClaudeResponse('{"temperatureArc": "hot to cool"}')
      const result = await summarizeSession('Alice', 'Bob', [])
      expect(result).toBe('{"temperatureArc": "hot to cool"}')
    })

    it('includes v3Context when provided', async () => {
      setClaudeResponse('ok')
      const v3Context = [{
        primaryInsight: 'test insight',
        resolutionDirection: 'de-escalating',
        activeLenses: ['nvc', 'gottman'],
      }]
      await summarizeSession('Alice', 'Bob', [], v3Context)
      expect(mockCreate).toHaveBeenCalled()
    })

    it('includes sessionGoals when provided', async () => {
      setClaudeResponse('ok')
      await summarizeSession('Alice', 'Bob', [], undefined, ['goal 1', 'goal 2'])
      expect(mockCreate).toHaveBeenCalled()
    })
  })

  // --- Error handling ---

  describe('error handling', () => {
    it('throws when ANTHROPIC_API_KEY is missing', async () => {
      delete process.env.ANTHROPIC_API_KEY
      await expect(mediateMessage('msg', 'person_a', 'Alice', 'Bob', []))
        .rejects.toThrow('Missing ANTHROPIC_API_KEY')
    })

    it('throws when Claude API returns error', async () => {
      setClaudeError(new Error('API rate limit exceeded'))
      await expect(mediateMessage('msg', 'person_a', 'Alice', 'Bob', []))
        .rejects.toThrow('API rate limit exceeded')
    })
  })
})
