import { vi } from 'vitest'

/**
 * Mock for @anthropic-ai/sdk
 *
 * Usage:
 *   vi.mock('@anthropic-ai/sdk', () => getMockAnthropicModule())
 *   setClaudeResponse('{"observation": "...", ...}')
 *
 * The mock returns a response that matches the Anthropic SDK shape:
 *   { content: [{ type: 'text', text: <your text> }] }
 */

let claudeResponseText = '{}'
let claudeError: Error | null = null

export function setClaudeResponse(text: string): void {
  claudeResponseText = text
  claudeError = null
}

export function setClaudeError(err: Error): void {
  claudeError = err
}

export function resetClaudeMock(): void {
  claudeResponseText = '{}'
  claudeError = null
}

const mockCreate = vi.fn(async () => {
  if (claudeError) throw claudeError
  return {
    content: [{ type: 'text' as const, text: claudeResponseText }],
    model: 'claude-opus-4-6',
    stop_reason: 'end_turn',
    usage: { input_tokens: 100, output_tokens: 50 },
  }
})

export function getMockAnthropicModule() {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    })),
  }
}

/** Direct access to the mock create function for assertions */
export const mockClaudeCreate = mockCreate
