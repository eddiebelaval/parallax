import Anthropic from '@anthropic-ai/sdk'
import { NVC_SYSTEM_PROMPT, SESSION_SUMMARY_PROMPT, buildMediationPrompt } from '@/lib/prompts'
import type { MessageSender } from '@/types/database'

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY — add it to .env.local')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export interface ConversationEntry {
  sender: string
  content: string
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
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

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: NVC_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return extractText(response)
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

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: SESSION_SUMMARY_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return extractText(response)
}
