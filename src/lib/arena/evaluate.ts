import type { ConflictAnalysis } from '@/types/database'
import type { Scenario, TurnScores, TurnResult, AggregateScore } from './types'

// Scoring weights — must sum to 1.0
const WEIGHTS = {
  deEscalation: 0.25,
  blindSpotDetection: 0.25,
  translationQuality: 0.20,
  lensRelevance: 0.15,
  insightDepth: 0.15,
} as const

/**
 * Measure de-escalation between consecutive turns.
 * Returns 0-1 where 1 means temperature dropped significantly.
 */
export function measureDeEscalation(
  currentTemp: number,
  previousTemp: number | null,
): number {
  if (previousTemp === null) return 0.5 // First turn — neutral score
  const delta = previousTemp - currentTemp
  if (delta > 0.2) return 1.0   // Significant drop — excellent
  if (delta > 0.1) return 0.8   // Moderate drop
  if (delta > 0) return 0.6     // Small drop
  if (delta === 0) return 0.4   // No change — slightly below neutral
  if (delta > -0.1) return 0.3  // Small spike
  if (delta > -0.2) return 0.15 // Moderate spike
  return 0.0                    // Significant spike — worst case
}

/**
 * Check how many of the scenario's planted patterns were detected
 * by the analysis. Uses fuzzy keyword matching against all text
 * fields in the analysis to catch partial detections.
 */
export function checkBlindSpotDetection(
  analysis: ConflictAnalysis,
  plantedPatterns: string[],
): number {
  if (plantedPatterns.length === 0) return 1.0

  // Build a searchable text corpus from the analysis
  const corpus = buildSearchCorpus(analysis)

  let detected = 0
  for (const pattern of plantedPatterns) {
    const keywords = extractKeywords(pattern)
    const matchCount = keywords.filter((kw) => corpus.includes(kw)).length
    // A pattern is "detected" if at least 40% of its keywords appear
    if (matchCount / keywords.length >= 0.4) {
      detected++
    }
  }

  return detected / plantedPatterns.length
}

/**
 * Score the quality of the NVC translation.
 * Checks for: presence, length, absence of clinical jargon,
 * and use of first-person language.
 */
function scoreTranslationQuality(analysis: ConflictAnalysis): number {
  const translation = analysis.nvcTranslation
  if (!translation || translation.length < 10) return 0.0

  let score = 0.4 // Base score for having a translation

  // Length check — too short is shallow, too long is unfocused
  if (translation.length >= 40 && translation.length <= 300) score += 0.2

  // First-person language — good NVC translations use "I" statements
  if (/\bI feel\b|\bI need\b|\bI notice\b|\bwhen I\b/i.test(translation)) score += 0.2

  // Absence of clinical jargon (signs of robotic output)
  const jargon = /\bcognitive distortion\b|\battachment style\b|\bdrama triangle\b|\bstonewalling\b/i
  if (!jargon.test(translation)) score += 0.2

  return Math.min(1.0, score)
}

/**
 * Score how relevant the activated lenses were for this scenario.
 * Checks if the analysis populated lens-specific results that
 * correspond to the scenario's planted patterns.
 */
function scoreLensRelevance(analysis: ConflictAnalysis): number {
  const activeLenses = analysis.meta.activeLenses
  const populatedLenses = Object.keys(analysis.lenses).filter(
    (key) => analysis.lenses[key as keyof typeof analysis.lenses] != null,
  )

  if (activeLenses.length === 0) return 0.0

  // Ratio of populated to active lenses — higher means more lenses
  // found relevant signals (but we don't want to penalize too heavily
  // since secondary lenses are supposed to be omitted when no signals)
  const ratio = populatedLenses.length / activeLenses.length

  // 30-70% activation is ideal (not everything fires, but enough does)
  if (ratio >= 0.3 && ratio <= 0.7) return 1.0
  if (ratio > 0.7) return 0.8 // Slightly over-activated
  if (ratio >= 0.15) return 0.6
  return 0.3 // Very few lenses activated — may be missing signals
}

/**
 * Score the depth and usefulness of the primary insight.
 */
function scoreInsightDepth(analysis: ConflictAnalysis): number {
  const insight = analysis.meta.primaryInsight
  if (!insight || insight.length < 10) return 0.0

  let score = 0.3 // Base for having an insight

  // Length — a meaningful insight is typically 50-200 chars
  if (insight.length >= 50 && insight.length <= 200) score += 0.2

  // Specificity — references to actual relationship dynamics
  if (/\b(fear|need|protect|avoid|control|guilt|hurt|trust)\b/i.test(insight)) score += 0.25

  // Not a generic platitude
  const platitudes = /\bboth parties\b|\bcommunication is key\b|\bmutual respect\b/i
  if (!platitudes.test(insight)) score += 0.25

  return Math.min(1.0, score)
}

/**
 * Score a single turn of the simulation.
 */
export function scoreTurn(
  analysis: ConflictAnalysis,
  scenario: Scenario,
  turnIndex: number,
  previousAnalysis: ConflictAnalysis | null,
): TurnScores {
  const previousTemp = previousAnalysis?.emotionalTemperature ?? null
  const currentTemp = analysis.emotionalTemperature

  return {
    deEscalation: measureDeEscalation(currentTemp, previousTemp),
    blindSpotDetection: checkBlindSpotDetection(analysis, scenario.plantedPatterns),
    translationQuality: scoreTranslationQuality(analysis),
    lensRelevance: scoreLensRelevance(analysis),
    insightDepth: scoreInsightDepth(analysis),
  }
}

/**
 * Compute the aggregate score across all turns of a simulation.
 */
export function scoreSimulation(
  turnResults: TurnResult[],
  scenario: Scenario,
): AggregateScore {
  if (turnResults.length === 0) {
    return {
      overall: 0,
      deEscalationRate: 0,
      patternCoverage: 0,
      avgTranslationQuality: 0,
      avgInsightDepth: 0,
      resolutionArc: 'stable',
    }
  }

  // Compute averages
  const avgScores = {
    deEscalation: avg(turnResults.map((t) => t.scores.deEscalation)),
    blindSpotDetection: avg(turnResults.map((t) => t.scores.blindSpotDetection)),
    translationQuality: avg(turnResults.map((t) => t.scores.translationQuality)),
    lensRelevance: avg(turnResults.map((t) => t.scores.lensRelevance)),
    insightDepth: avg(turnResults.map((t) => t.scores.insightDepth)),
  }

  // Weighted composite
  const overall =
    avgScores.deEscalation * WEIGHTS.deEscalation +
    avgScores.blindSpotDetection * WEIGHTS.blindSpotDetection +
    avgScores.translationQuality * WEIGHTS.translationQuality +
    avgScores.lensRelevance * WEIGHTS.lensRelevance +
    avgScores.insightDepth * WEIGHTS.insightDepth

  // De-escalation rate: % of turns (after the first) where temp dropped
  const deEscalationRate = turnResults.length > 1
    ? turnResults.slice(1).filter((t) => t.scores.deEscalation > 0.5).length /
      (turnResults.length - 1)
    : 0

  // Best pattern coverage across any single turn
  const patternCoverage = Math.max(...turnResults.map((t) => t.scores.blindSpotDetection))

  // Resolution arc — compare first and last turn temperatures
  const firstTemp = turnResults[0].analysis.emotionalTemperature
  const lastTemp = turnResults[turnResults.length - 1].analysis.emotionalTemperature
  const tempDelta = firstTemp - lastTemp

  let resolutionArc: AggregateScore['resolutionArc']
  if (tempDelta > 0.3) resolutionArc = 'resolved'
  else if (tempDelta > 0.1) resolutionArc = 'improved'
  else if (tempDelta > -0.1) resolutionArc = 'stable'
  else resolutionArc = 'worsened'

  return {
    overall: round(overall),
    deEscalationRate: round(deEscalationRate),
    patternCoverage: round(patternCoverage),
    avgTranslationQuality: round(avgScores.translationQuality),
    avgInsightDepth: round(avgScores.insightDepth),
    resolutionArc,
  }
}

// --- Helpers ---

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}

/**
 * Extract meaningful keywords from a planted pattern description.
 * Filters out common stop words and short fragments.
 */
function extractKeywords(pattern: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'shall', 'should', 'may', 'might', 'must', 'can', 'could',
    'would', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'from',
    'by', 'as', 'into', 'through', 'during', 'before', 'after',
    'and', 'but', 'or', 'not', 'no', 'nor', 'so', 'yet', 'both',
    'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other',
    'some', 'such', 'than', 'too', 'very', 'just', 'that', 'this',
    'these', 'those', 'it', 'its',
  ])

  return pattern
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
}

/**
 * Build a lowercase text corpus from all searchable fields in a ConflictAnalysis.
 * Used for fuzzy pattern matching during blind spot detection scoring.
 */
function buildSearchCorpus(analysis: ConflictAnalysis): string {
  const parts: string[] = [
    analysis.observation,
    analysis.feeling,
    analysis.need,
    analysis.subtext,
    analysis.nvcTranslation,
    ...analysis.blindSpots,
    ...analysis.unmetNeeds,
    analysis.meta.primaryInsight,
  ]

  // Include lens-specific text if available
  const lenses = analysis.lenses
  if (lenses.dramaTriangle) {
    parts.push(lenses.dramaTriangle.role || '')
    parts.push(...lenses.dramaTriangle.roleShifts)
  }
  if (lenses.narrative) {
    parts.push(...lenses.narrative.totalizingNarratives)
    parts.push(...lenses.narrative.identityClaims)
    parts.push(lenses.narrative.reauthoringSuggestion)
  }
  if (lenses.gottman) {
    parts.push(...lenses.gottman.horsemen.map((h) => `${h.type} ${h.evidence}`))
    parts.push(lenses.gottman.startupType)
  }
  if (lenses.attachment) {
    parts.push(lenses.attachment.style)
    parts.push(lenses.attachment.activationSignal)
  }
  if (lenses.power) {
    parts.push(lenses.power.powerDynamic)
    parts.push(...lenses.power.powerMoves)
    parts.push(...lenses.power.silencingPatterns)
  }
  if (lenses.cbt) {
    parts.push(...lenses.cbt.distortions.map((d) => `${d.type} ${d.evidence}`))
    parts.push(lenses.cbt.coreBeliefHint)
  }
  if (lenses.restorative) {
    parts.push(lenses.restorative.harmIdentified)
    parts.push(...lenses.restorative.needsOfHarmed)
    parts.push(...lenses.restorative.needsOfHarmer)
    parts.push(lenses.restorative.repairPathway)
  }
  if (lenses.nvc) {
    parts.push(lenses.nvc.subtext)
    parts.push(...lenses.nvc.blindSpots)
  }

  return parts.filter(Boolean).join(' ').toLowerCase()
}
