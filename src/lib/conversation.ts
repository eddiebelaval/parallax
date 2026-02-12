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
