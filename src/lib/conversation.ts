import type { Message, MessageSender, Session } from '@/types/database'
import type { ConversationEntry } from '@/lib/opus'

export function buildNameMap(session: {
  person_a_name: string | null
  person_b_name: string | null
}): Record<MessageSender, string> {
  return {
    person_a: session.person_a_name ?? 'Person A',
    person_b: session.person_b_name ?? 'Person B',
    mediator: 'Parallax',
  }
}

export function toConversationHistory(
  messages: Message[],
  nameMap: Record<MessageSender, string>,
): ConversationEntry[] {
  return messages.map((m) => ({
    sender: nameMap[m.sender],
    content: m.content,
  }))
}

export function stripCodeFences(raw: string): string {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  return cleaned
}

/**
 * Display name for a sender identifier.
 */
export function senderLabel(
  sender: string,
  personAName: string,
  personBName: string,
): string {
  if (sender === 'mediator') return 'Parallax'
  if (sender === 'person_a') return personAName
  return personBName
}

/**
 * Tailwind text color class for a sender.
 */
export function senderColor(sender: string): string {
  if (sender === 'mediator') return 'text-temp-cool'
  if (sender === 'person_a') return 'text-temp-warm'
  return 'text-temp-hot'
}
