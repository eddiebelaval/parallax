import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSystemPrompt } from '@/lib/knowledge-base'
import { GUIDE_TOOLS, executeGuideToolCall } from '@/lib/guide-tools'
import type { ConversationalMode, ConversationMessage, ConverseResponse, ToolResult } from '@/types/conversation'

const VALID_MODES: ConversationalMode[] = ['explorer', 'guide']

const MAX_TOKENS: Record<ConversationalMode, number> = {
  explorer: 1024,
  guide: 512,
}

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
}

function buildMessages(
  history: ConversationMessage[],
  newMessage: string,
): Anthropic.MessageParam[] {
  const messages: Anthropic.MessageParam[] = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))
  messages.push({ role: 'user', content: newMessage })
  return messages
}

/**
 * POST /api/converse
 *
 * Handles both Explorer and Guide conversations. The mode determines
 * which knowledge base, system prompt, and tools are used.
 *
 * Explorer: read-only, no tools
 * Guide: has tools (update_setting, get_settings) — handles the
 *   tool_use loop internally and returns final text + tool results
 *
 * Body: { mode: 'explorer' | 'guide', message: string, history: ConversationMessage[] }
 */
export async function POST(request: Request) {
  let body: { mode?: string; message?: string; history?: ConversationMessage[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { mode, message, history = [] } = body

  if (!mode || !VALID_MODES.includes(mode as ConversationalMode)) {
    return NextResponse.json(
      { error: `Invalid mode. Must be one of: ${VALID_MODES.join(', ')}` },
      { status: 400 },
    )
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const conversationalMode = mode as ConversationalMode

  try {
    const client = getClient()
    const systemPrompt = getSystemPrompt(conversationalMode)
    const messages = buildMessages(history, message.trim())

    // Guide mode gets tools; Explorer mode is read-only
    const tools = conversationalMode === 'guide' ? GUIDE_TOOLS : undefined

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: MAX_TOKENS[conversationalMode],
      system: systemPrompt,
      messages,
      ...(tools ? { tools } : {}),
    })

    // If no tool use, return the text directly
    if (response.stop_reason !== 'tool_use') {
      return NextResponse.json({ message: extractText(response) })
    }

    // Tool use loop — execute tools and continue the conversation
    const collectedToolResults: ToolResult[] = []
    let currentMessages: Anthropic.MessageParam[] = [...messages]
    let currentResponse = response

    // Allow up to 3 rounds of tool use (safety limit)
    for (let round = 0; round < 3; round++) {
      // Add the assistant's response (with tool_use blocks) to message history
      currentMessages = [
        ...currentMessages,
        { role: 'assistant' as const, content: currentResponse.content },
      ]

      // Execute each tool call and build tool_result messages
      const toolResultBlocks: Anthropic.ToolResultBlockParam[] = []

      for (const block of currentResponse.content) {
        if (block.type === 'tool_use') {
          const toolResult = executeGuideToolCall(
            block.name,
            block.input as Record<string, unknown>,
          )
          collectedToolResults.push(toolResult)

          toolResultBlocks.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: toolResult.output,
            is_error: !toolResult.success,
          })
        }
      }

      // Send tool results back to Claude
      currentMessages = [
        ...currentMessages,
        { role: 'user' as const, content: toolResultBlocks },
      ]

      currentResponse = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: MAX_TOKENS[conversationalMode],
        system: systemPrompt,
        messages: currentMessages,
        tools,
      })

      // If Claude is done with tools, break out
      if (currentResponse.stop_reason !== 'tool_use') break
    }

    const result: ConverseResponse = {
      message: extractText(currentResponse),
      toolResults: collectedToolResults.length > 0 ? collectedToolResults : undefined,
    }

    return NextResponse.json(result)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Conversation failed: ${errorMessage}` },
      { status: 500 },
    )
  }
}
