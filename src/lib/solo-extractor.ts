import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase'

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

interface ExtractedSignal {
  signal_type: string
  signal_value: Record<string, unknown>
  confidence: number
}

const EXTRACTION_PROMPT = `You are analyzing a person's messages from a 1:1 conversation with an AI companion. Extract behavioral signals that reveal their communication patterns, emotional tendencies, and conflict style.

Analyze the messages for these signal types (only include those with clear evidence):
- attachment_style: { primary: "secure"|"anxious"|"avoidant"|"disorganized", confidence: 0-1 }
- conflict_mode: { primary: "competing"|"collaborating"|"compromising"|"avoiding"|"accommodating", assertiveness: 0-1, cooperativeness: 0-1 }
- regulation_pattern: { style: "regulated"|"dysregulated"|"over_regulated", triggerSensitivity: 0-1 }
- values: { core: string[], communication: string[], unmetNeeds: string[] }
- narrative_themes: { totalizingNarratives: string[], identityClaims: string[], recurringEmotions: string[] }
- drama_triangle: { defaultRole: "persecutor"|"victim"|"rescuer"|null, rescuerTrapRisk: 0-1 }

RULES:
- Only extract signals you have genuine evidence for. Quality over quantity.
- Confidence should reflect evidence strength: 0.3 = hint, 0.5 = moderate, 0.8+ = strong pattern.
- Return valid JSON only. No explanation text.

Return format:
{ "signals": [ { "signal_type": "...", "signal_value": {...}, "confidence": 0.X }, ... ] }`

/**
 * Extract behavioral signals from solo conversation messages.
 * Uses Sonnet for cost efficiency — this is background processing.
 * Upserts into behavioral_signals so signals accumulate over time.
 */
export async function extractSoloSignals(
  userId: string,
  userMessages: string[],
): Promise<void> {
  if (userMessages.length === 0) return

  const messageBlock = userMessages
    .map((m, i) => `[Message ${i + 1}]: ${m}`)
    .join('\n')

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: EXTRACTION_PROMPT,
    messages: [{ role: 'user', content: `MESSAGES:\n${messageBlock}` }],
  })

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')

  let signals: ExtractedSignal[]
  try {
    const parsed = JSON.parse(text)
    signals = parsed.signals || []
  } catch {
    return // Non-critical — parsing failure is acceptable
  }

  if (signals.length === 0) return

  const supabase = createServerClient()

  for (const signal of signals) {
    // Upsert: update existing signal of same type, or insert new
    const { data: existing } = await supabase
      .from('behavioral_signals')
      .select('id')
      .eq('user_id', userId)
      .eq('signal_type', signal.signal_type)
      .single()

    if (existing) {
      await supabase
        .from('behavioral_signals')
        .update({
          signal_value: signal.signal_value,
          confidence: signal.confidence,
          source: 'session_observation',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('behavioral_signals').insert({
        user_id: userId,
        signal_type: signal.signal_type,
        signal_value: signal.signal_value,
        confidence: signal.confidence,
        source: 'session_observation',
      })
    }
  }
}
