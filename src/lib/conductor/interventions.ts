import type { Message, ConflictAnalysis, NvcAnalysis } from '@/types/database'
import type { InterventionType } from '@/lib/prompts/conductor'

export interface InterventionCheck {
  shouldIntervene: boolean
  type: InterventionType | null
}

/**
 * Check whether the mediator should intervene based on recent messages
 * and the latest analysis.
 *
 * Triggers (V1 — hackathon scope):
 * - Escalation: temperature >= 0.85 AND jumped > 0.15 from recent average
 * - Dominance: 3+ consecutive messages from same person
 * - Breakthrough: temperature drops from > 0.6 to < 0.3 with de-escalating direction
 *
 * Cooldown: no intervention within 3 human messages of last mediator message.
 */
export function checkForIntervention(
  messages: Message[],
  latestAnalysis: ConflictAnalysis,
): InterventionCheck {
  const none: InterventionCheck = { shouldIntervene: false, type: null }

  // Cooldown: find last mediator message, count human messages since
  const lastMediatorIdx = messages.findLastIndex((m) => m.sender === 'mediator')
  if (lastMediatorIdx >= 0) {
    const humanMessagesSince = messages
      .slice(lastMediatorIdx + 1)
      .filter((m) => m.sender !== 'mediator')
      .length
    if (humanMessagesSince < 3) return none
  }

  // Check escalation
  const currentTemp = latestAnalysis.emotionalTemperature
  if (currentTemp >= 0.85) {
    const recentTemps = getRecentTemperatures(messages, 3)
    if (recentTemps.length > 0) {
      const avg = recentTemps.reduce((a, b) => a + b, 0) / recentTemps.length
      if (currentTemp - avg > 0.15) {
        return { shouldIntervene: true, type: 'escalation' }
      }
    }
  }

  // Check dominance: 3+ consecutive from same human sender
  const humanMessages = messages.filter((m) => m.sender !== 'mediator')
  if (humanMessages.length >= 3) {
    const lastThree = humanMessages.slice(-3)
    const allSameSender = lastThree.every((m) => m.sender === lastThree[0].sender)
    if (allSameSender) {
      return { shouldIntervene: true, type: 'dominance' }
    }
  }

  // Check breakthrough: temp dropped from > 0.6 to < 0.3 with de-escalating
  if (
    currentTemp < 0.3 &&
    latestAnalysis.meta.resolutionDirection === 'de-escalating'
  ) {
    const recentTemps = getRecentTemperatures(messages, 3)
    const hadHighTemp = recentTemps.some((t) => t > 0.6)
    if (hadHighTemp) {
      return { shouldIntervene: true, type: 'breakthrough' }
    }
  }

  // Check resolution: sustained low temperature + de-escalating + enough messages
  // Only trigger after 8+ human messages to avoid premature wrap-up
  if (humanMessages.length >= 8 && currentTemp < 0.35) {
    const recentTemps = getRecentTemperatures(messages, 4)
    const allLow = recentTemps.length >= 3 && recentTemps.every((t) => t < 0.4)
    const isDeescalating = latestAnalysis.meta.resolutionDirection === 'de-escalating'
      || latestAnalysis.meta.resolutionDirection === 'stable'
    if (allLow && isDeescalating) {
      return { shouldIntervene: true, type: 'resolution' }
    }
  }

  return none
}

/**
 * Get emotional temperatures from the N most recent analyzed messages
 * (excluding the latest, which is passed separately).
 */
function getRecentTemperatures(messages: Message[], count: number): number[] {
  const temps: number[] = []
  for (let i = messages.length - 1; i >= 0 && temps.length < count; i--) {
    const analysis = messages[i].nvc_analysis as (NvcAnalysis | ConflictAnalysis) | null
    if (analysis) {
      temps.push(analysis.emotionalTemperature)
    }
  }
  return temps
}

