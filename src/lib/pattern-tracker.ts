/**
 * Cross-Message Pattern Tracker — V4 Foundation
 *
 * Tracks patterns that emerge across multiple messages in a conversation.
 * Currently a type skeleton + utilities. The actual tracking will be
 * wired into the mediation pipeline in a future iteration.
 *
 * Key insight: single-message analysis is powerful but misses temporal patterns.
 * The same person using criticism 3x in a row is qualitatively different from
 * criticism once. This module will detect and surface those multi-turn patterns.
 */

import type { ConflictAnalysis, LensId } from '@/types/database'

// A pattern detected across multiple messages
export interface ConversationPattern {
  id: string
  type: PatternType
  description: string
  severity: 'low' | 'moderate' | 'high' | 'critical'
  firstSeenAt: number     // message index
  lastSeenAt: number      // message index
  occurrences: number
  lens: LensId            // which lens detected this pattern
  affectedParty: 'person_a' | 'person_b' | 'both'
}

export type PatternType =
  | 'horseman_escalation'       // Gottman: same horseman repeated 3+ times
  | 'pursue_withdraw_cycle'     // Attachment: A pushes, B withdraws, repeat
  | 'role_lock'                 // Drama Triangle: stuck in one role across messages
  | 'distortion_chain'          // CBT: compounding distortions building on each other
  | 'temperature_trend'         // Temperature rising or falling over N messages
  | 'repair_ignored'            // Gottman: repair attempt followed by escalation
  | 'power_asymmetry_deepening' // Power: imbalance growing over the conversation
  | 'narrative_hardening'       // Narrative: "always/never" language intensifying

// Aggregate patterns for the full conversation
export interface ConversationPatterns {
  sessionId: string
  messageCount: number
  patterns: ConversationPattern[]
  temperatureArc: number[]  // temperature per message
  dominantDynamic: string   // one-sentence summary of the conversation's core dynamic
}

/**
 * Analyze a sequence of analyses to detect cross-message patterns.
 * Returns only patterns with 2+ occurrences (single-message patterns
 * are already handled by individual lenses).
 */
export function detectPatterns(
  _sessionId: string,
  _analyses: ConflictAnalysis[],
): ConversationPatterns {
  // V4 TODO: Implement pattern detection algorithms
  // For now, return empty patterns with the temperature arc
  return {
    sessionId: _sessionId,
    messageCount: _analyses.length,
    patterns: [],
    temperatureArc: _analyses.map((a) => a.emotionalTemperature),
    dominantDynamic: '',
  }
}

/**
 * Check if a specific pattern type has been detected.
 * Utility for conditional UI rendering.
 */
export function hasPattern(patterns: ConversationPatterns, type: PatternType): boolean {
  return patterns.patterns.some((p) => p.type === type)
}

/**
 * Get the most severe pattern in the conversation.
 * Returns null if no patterns detected.
 */
export function getMostSeverePattern(patterns: ConversationPatterns): ConversationPattern | null {
  const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 }
  const sorted = [...patterns.patterns].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  )
  return sorted[0] ?? null
}
