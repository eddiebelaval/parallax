import Anthropic from '@anthropic-ai/sdk'
import { NVC_SYSTEM_PROMPT, SESSION_SUMMARY_PROMPT, buildMediationPrompt } from '@/lib/prompts'
import type { MessageSender } from '@/types/database'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY — add it to .env.local')
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ConversationEntry {
  sender: string
  content: string
}

/**
 * Call Claude to produce an NVC mediation analysis for a message.
 *
 * Returns the raw text from Claude's response. The caller should
 * parse it with parseNvcAnalysis() from prompts.ts.
 */
export async function mediateMessage(
  messageContent: string,
  sender: MessageSender,
  senderName: string,
  otherPersonName: string,
  conversationHistory: ConversationEntry[],
): Promise<string> {
  const userPrompt = buildMediationPrompt(
    conversationHistory,
    { sender, senderName, content: messageContent },
    otherPersonName,
  )

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: NVC_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  // Extract text from the response content blocks
  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')

  return text
}

/**
 * Call Claude to produce a session summary analyzing the full conversation arc.
 *
 * Returns the raw text from Claude's response. The caller should
 * parse it with parseSessionSummary().
 */
export async function summarizeSession(
  personAName: string,
  personBName: string,
  conversationHistory: ConversationEntry[],
): Promise<string> {
  const transcript = conversationHistory
    .map((m) => `[${m.sender}]: ${m.content}`)
    .join('\n')

  const userPrompt = `PARTICIPANTS:
- Person A: ${personAName}
- Person B: ${personBName}

FULL CONVERSATION:
${transcript}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: SESSION_SUMMARY_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')

  return text
}
