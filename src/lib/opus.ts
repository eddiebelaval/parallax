import Anthropic from '@anthropic-ai/sdk'
import { NVC_SYSTEM_PROMPT, buildMediationPrompt } from '@/lib/prompts'
import type { MessageSender } from '@/types/database'

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
