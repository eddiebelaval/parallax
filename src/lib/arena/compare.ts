import type { SimulationRun, AggregateScore, TurnScores } from './types'

/**
 * Comparison engine for arena simulation runs.
 *
 * Compares two SimulationRuns (typically "before" and "after" a prompt edit)
 * and produces a structured delta showing exactly what improved, what regressed,
 * and what stayed flat — per dimension, per scenario, and per lens.
 */

export interface DimensionDelta {
  dimension: string
  before: number
  after: number
  delta: number
  direction: 'improved' | 'regressed' | 'stable'
}

export interface ScenarioComparison {
  scenarioId: string
  overallDelta: number
  direction: 'improved' | 'regressed' | 'stable'
  dimensions: DimensionDelta[]
  arcBefore: AggregateScore['resolutionArc']
  arcAfter: AggregateScore['resolutionArc']
}

export interface RunComparison {
  beforeId: string
  afterId: string
  contextMode: string
  overallDelta: number
  direction: 'improved' | 'regressed' | 'stable'
  scenarioComparisons: ScenarioComparison[]
  bestImprovement: ScenarioComparison | null
  worstRegression: ScenarioComparison | null
  dimensionSummary: DimensionDelta[]
}

/**
 * Compare two runs of the same scenario.
 */
export function compareScenarioRuns(
  before: SimulationRun,
  after: SimulationRun,
): ScenarioComparison {
  const dimensions = compareDimensions(before.aggregateScore, after.aggregateScore)
  const overallDelta = after.aggregateScore.overall - before.aggregateScore.overall

  return {
    scenarioId: before.scenarioId,
    overallDelta: round(overallDelta),
    direction: classifyDelta(overallDelta),
    dimensions,
    arcBefore: before.aggregateScore.resolutionArc,
    arcAfter: after.aggregateScore.resolutionArc,
  }
}

/**
 * Compare two batches of runs (e.g., before/after a prompt edit across all scenarios).
 * Matches scenarios by scenarioId.
 */
export function compareRunBatches(
  beforeBatch: SimulationRun[],
  afterBatch: SimulationRun[],
): RunComparison {
  const afterMap = new Map(afterBatch.map((r) => [r.scenarioId, r]))

  const scenarioComparisons: ScenarioComparison[] = []

  for (const before of beforeBatch) {
    const after = afterMap.get(before.scenarioId)
    if (!after) continue
    scenarioComparisons.push(compareScenarioRuns(before, after))
  }

  // Aggregate dimension deltas across all scenarios
  const dimensionSummary = aggregateDimensionDeltas(scenarioComparisons)

  // Overall average delta
  const overallDelta = scenarioComparisons.length > 0
    ? round(scenarioComparisons.reduce((s, c) => s + c.overallDelta, 0) / scenarioComparisons.length)
    : 0

  // Find extremes
  const sorted = [...scenarioComparisons].sort((a, b) => b.overallDelta - a.overallDelta)

  return {
    beforeId: beforeBatch[0]?.id ?? '',
    afterId: afterBatch[0]?.id ?? '',
    contextMode: beforeBatch[0]?.contextMode ?? '',
    overallDelta,
    direction: classifyDelta(overallDelta),
    scenarioComparisons,
    bestImprovement: sorted.find((c) => c.overallDelta > 0) ?? null,
    worstRegression: sorted.findLast((c) => c.overallDelta < 0) ?? null,
    dimensionSummary,
  }
}

/**
 * Compare individual scoring dimensions between two aggregate scores.
 */
function compareDimensions(before: AggregateScore, after: AggregateScore): DimensionDelta[] {
  const pairs: Array<[string, number, number]> = [
    ['overall', before.overall, after.overall],
    ['deEscalationRate', before.deEscalationRate, after.deEscalationRate],
    ['patternCoverage', before.patternCoverage, after.patternCoverage],
    ['avgTranslationQuality', before.avgTranslationQuality, after.avgTranslationQuality],
    ['avgInsightDepth', before.avgInsightDepth, after.avgInsightDepth],
  ]

  return pairs.map(([dimension, bVal, aVal]) => {
    const delta = round(aVal - bVal)
    return {
      dimension,
      before: bVal,
      after: aVal,
      delta,
      direction: classifyDelta(delta),
    }
  })
}

/**
 * Aggregate dimension deltas across multiple scenario comparisons.
 * Returns the average delta per dimension.
 */
function aggregateDimensionDeltas(comparisons: ScenarioComparison[]): DimensionDelta[] {
  if (comparisons.length === 0) return []

  const dimensionNames = comparisons[0].dimensions.map((d) => d.dimension)

  return dimensionNames.map((name) => {
    const relevantDeltas = comparisons
      .map((c) => c.dimensions.find((d) => d.dimension === name))
      .filter((d): d is DimensionDelta => d !== null && d !== undefined)

    const avgBefore = avg(relevantDeltas.map((d) => d.before))
    const avgAfter = avg(relevantDeltas.map((d) => d.after))
    const avgDelta = avg(relevantDeltas.map((d) => d.delta))

    return {
      dimension: name,
      before: round(avgBefore),
      after: round(avgAfter),
      delta: round(avgDelta),
      direction: classifyDelta(avgDelta),
    }
  })
}

/**
 * Identify which specific turns had the largest score changes.
 * Useful for pinpointing exactly where a prompt edit helped or hurt.
 */
export function findTurnDeltas(
  before: SimulationRun,
  after: SimulationRun,
): Array<{ turnNumber: number; speaker: string; scoreDelta: number; weakestDimension: string }> {
  const results: Array<{ turnNumber: number; speaker: string; scoreDelta: number; weakestDimension: string }> = []

  for (const afterTurn of after.turnResults) {
    const beforeTurn = before.turnResults.find((t) => t.turnNumber === afterTurn.turnNumber)
    if (!beforeTurn) continue

    const beforeAvg = turnScoreAvg(beforeTurn.scores)
    const afterAvg = turnScoreAvg(afterTurn.scores)

    // Find which dimension changed most negatively
    const dims: Array<[string, number]> = [
      ['deEscalation', afterTurn.scores.deEscalation - beforeTurn.scores.deEscalation],
      ['blindSpotDetection', afterTurn.scores.blindSpotDetection - beforeTurn.scores.blindSpotDetection],
      ['translationQuality', afterTurn.scores.translationQuality - beforeTurn.scores.translationQuality],
      ['lensRelevance', afterTurn.scores.lensRelevance - beforeTurn.scores.lensRelevance],
      ['insightDepth', afterTurn.scores.insightDepth - beforeTurn.scores.insightDepth],
    ]
    const weakest = dims.sort((a, b) => a[1] - b[1])[0]

    results.push({
      turnNumber: afterTurn.turnNumber,
      speaker: afterTurn.speaker,
      scoreDelta: round(afterAvg - beforeAvg),
      weakestDimension: weakest[0],
    })
  }

  return results.sort((a, b) => a.scoreDelta - b.scoreDelta)
}

// --- Helpers ---

function classifyDelta(delta: number): 'improved' | 'regressed' | 'stable' {
  if (delta > 0.02) return 'improved'
  if (delta < -0.02) return 'regressed'
  return 'stable'
}

function turnScoreAvg(scores: TurnScores): number {
  return (
    scores.deEscalation +
    scores.blindSpotDetection +
    scores.translationQuality +
    scores.lensRelevance +
    scores.insightDepth
  ) / 5
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}
