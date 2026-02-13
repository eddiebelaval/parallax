import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase'
import type { SoloMemory } from '@/types/database'

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

const EXTRACTION_PROMPT = `You are an insight extraction system. Given a conversation between a person and Parallax (an AI companion), extract structured insights.

Return a JSON object with this exact shape:
{
  "identity": {
    "name": "string or null",
    "bio": "1-2 sentence summary of who they are, or null",
    "importantPeople": [{ "name": "string", "relationship": "string" }]
  },
  "themes": ["recurring life themes, max 8"],
  "patterns": ["behavioral patterns you notice, max 6"],
  "values": ["core values expressed or implied"],
  "strengths": ["things they do well or positive traits"],
  "currentSituation": "what they're currently dealing with, or null",
  "emotionalState": "their current emotional state in 1-3 words, or null",
  "actionItems": [
    {
      "id": "stable-kebab-case-id",
      "text": "actionable suggestion",
      "status": "suggested"
    }
  ]
}

RULES:
- Extract ONLY what's clearly evidenced in the conversation. Don't infer wildly.
- For themes and patterns, look for RECURRING evidence, not one-off mentions.
- Action items should be specific and actionable, not vague advice.
- Use stable IDs for action items (kebab-case derived from the text).
- If existing memory is provided, PRESERVE long-term data unless directly contradicted.
- Update currentSituation and emotionalState to reflect the CURRENT conversation.
- Return ONLY valid JSON. No markdown, no explanation.`

/**
 * Extract sidebar insights from conversation using Haiku.
 *
 * Runs after every Parallax response. Merges new observations with
 * existing memory and persists to user_profiles if authenticated.
 */
export async function extractSidebarInsights(
  messages: Array<{ sender: string; content: string }>,
  existingMemory: SoloMemory | Record<string, never> | null,
  userId?: string,
): Promise<SoloMemory | null> {
  if (messages.length < 2) return null

  const conversationBlock = messages
    .map((m) => `[${m.sender === 'person_a' ? 'User' : 'Parallax'}]: ${m.content}`)
    .join('\n')

  const existingBlock = existingMemory && 'identity' in existingMemory
    ? `\n\nEXISTING MEMORY (preserve and build on this):\n${JSON.stringify(existingMemory, null, 2)}`
    : ''

  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: EXTRACTION_PROMPT,
    messages: [
      {
        role: 'user',
        content: `CONVERSATION:\n${conversationBlock}${existingBlock}\n\nExtract insights as JSON.`,
      },
    ],
  })

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')

  // Clean code fences that LLMs sometimes wrap JSON in
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim()

  let extracted: Record<string, unknown>
  try {
    extracted = JSON.parse(cleaned)
  } catch {
    return null
  }

  // Merge with existing memory
  const existing = existingMemory && 'identity' in existingMemory
    ? existingMemory as SoloMemory
    : null

  const merged: SoloMemory = {
    identity: {
      name: (extracted.identity as Record<string, unknown>)?.name as string || existing?.identity?.name || null,
      bio: (extracted.identity as Record<string, unknown>)?.bio as string || existing?.identity?.bio || null,
      importantPeople: dedup(
        [...(existing?.identity?.importantPeople || []), ...((extracted.identity as Record<string, unknown>)?.importantPeople as Array<{ name: string; relationship: string }> || [])],
        'name',
      ),
    },
    themes: dedupStrings([...(existing?.themes || []), ...(extracted.themes as string[] || [])]).slice(0, 8),
    patterns: dedupStrings([...(existing?.patterns || []), ...(extracted.patterns as string[] || [])]).slice(0, 6),
    values: dedupStrings([...(existing?.values || []), ...(extracted.values as string[] || [])]),
    strengths: dedupStrings([...(existing?.strengths || []), ...(extracted.strengths as string[] || [])]),
    recentSessions: existing?.recentSessions || [],
    currentSituation: extracted.currentSituation as string || null,
    emotionalState: extracted.emotionalState as string || null,
    actionItems: mergeActionItems(
      existing?.actionItems || [],
      (extracted.actionItems as Array<{ id: string; text: string; status: string }>) || [],
    ),
    sessionCount: existing?.sessionCount || 1,
    lastSeenAt: new Date().toISOString(),
  }

  // Persist to DB if authenticated
  if (userId) {
    const supabase = createServerClient()
    await supabase
      .from('user_profiles')
      .update({ solo_memory: merged })
      .eq('user_id', userId)
  }

  return merged
}

/** Deduplicate an array of objects by a key field. */
function dedup<T extends Record<string, unknown>>(arr: T[], key: string): T[] {
  const seen = new Set<unknown>()
  return arr.filter((item) => {
    const val = item[key]
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}

/** Deduplicate strings, case-insensitive. */
function dedupStrings(arr: string[]): string[] {
  const seen = new Set<string>()
  return arr.filter((s) => {
    const lower = s.toLowerCase()
    if (seen.has(lower)) return false
    seen.add(lower)
    return true
  })
}

/** Merge action items — preserve existing statuses, add new ones. */
function mergeActionItems(
  existing: Array<{ id: string; text: string; status: string }>,
  incoming: Array<{ id: string; text: string; status: string }>,
): SoloMemory['actionItems'] {
  const map = new Map(existing.map((a) => [a.id, a]))
  for (const item of incoming) {
    if (!map.has(item.id)) {
      map.set(item.id, item)
    }
  }
  return Array.from(map.values()) as SoloMemory['actionItems']
}
