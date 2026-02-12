import type { SimulationRun } from './types'
import type { RunComparison, ScenarioComparison } from './compare'
import { LENS_METADATA } from '@/lib/context-modes'

/**
 * Report Generator for Arena Simulation Runs
 *
 * Produces human-readable summaries of simulation results and comparisons.
 * These reports are designed to be read in a terminal or saved as markdown.
 */

/**
 * Generate a summary report for a single simulation run.
 */
export function reportSingleRun(run: SimulationRun): string {
  const lines: string[] = [
    `# Arena Run: ${run.scenarioId}`,
    `Mode: ${run.contextMode} | Lenses: ${run.activeLenses.join(', ')}`,
    `Time: ${run.timestamp}`,
    '',
    `## Aggregate Scores`,
    `  Overall:              ${bar(run.aggregateScore.overall)} ${pct(run.aggregateScore.overall)}`,
    `  De-escalation rate:   ${bar(run.aggregateScore.deEscalationRate)} ${pct(run.aggregateScore.deEscalationRate)}`,
    `  Pattern coverage:     ${bar(run.aggregateScore.patternCoverage)} ${pct(run.aggregateScore.patternCoverage)}`,
    `  Translation quality:  ${bar(run.aggregateScore.avgTranslationQuality)} ${pct(run.aggregateScore.avgTranslationQuality)}`,
    `  Insight depth:        ${bar(run.aggregateScore.avgInsightDepth)} ${pct(run.aggregateScore.avgInsightDepth)}`,
    `  Resolution arc:       ${arcLabel(run.aggregateScore.resolutionArc)}`,
    '',
    `## Per-Turn Breakdown`,
  ]

  for (const turn of run.turnResults) {
    const avg = (
      turn.scores.deEscalation +
      turn.scores.blindSpotDetection +
      turn.scores.translationQuality +
      turn.scores.lensRelevance +
      turn.scores.insightDepth
    ) / 5

    lines.push(`  Turn ${turn.turnNumber} [${turn.speaker}]: ${bar(avg)} ${pct(avg)}`)
    lines.push(`    temp=${turn.analysis.emotionalTemperature.toFixed(2)} | deEsc=${turn.scores.deEscalation.toFixed(2)} blind=${turn.scores.blindSpotDetection.toFixed(2)} trans=${turn.scores.translationQuality.toFixed(2)} lens=${turn.scores.lensRelevance.toFixed(2)} depth=${turn.scores.insightDepth.toFixed(2)}`)

    // Show primary insight
    if (turn.analysis.meta.primaryInsight) {
      lines.push(`    "${truncate(turn.analysis.meta.primaryInsight, 100)}"`)
    }

    // Show active lens results
    const populatedLenses = Object.keys(turn.analysis.lenses).filter(
      (k) => turn.analysis.lenses[k as keyof typeof turn.analysis.lenses] != null,
    )
    if (populatedLenses.length > 0) {
      const lensNames = populatedLenses
        .map((id) => LENS_METADATA[id as keyof typeof LENS_METADATA]?.shortName ?? id)
        .join(', ')
      lines.push(`    Lenses fired: ${lensNames}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generate a summary report for a batch of simulation runs (one context mode).
 */
export function reportBatch(runs: SimulationRun[]): string {
  if (runs.length === 0) return 'No simulation runs to report.'

  const contextMode = runs[0].contextMode
  const overallAvg = runs.reduce((s, r) => s + r.aggregateScore.overall, 0) / runs.length
  const patternAvg = runs.reduce((s, r) => s + r.aggregateScore.patternCoverage, 0) / runs.length

  const lines: string[] = [
    `# Arena Batch Report: ${contextMode}`,
    `Scenarios: ${runs.length} | Average overall: ${pct(overallAvg)} | Pattern coverage: ${pct(patternAvg)}`,
    '',
    `## Scenario Scores (sorted worst to best)`,
  ]

  const sorted = [...runs].sort((a, b) => a.aggregateScore.overall - b.aggregateScore.overall)

  for (const run of sorted) {
    const grade = gradeScore(run.aggregateScore.overall)
    lines.push(`  ${grade} ${run.scenarioId.padEnd(20)} ${bar(run.aggregateScore.overall)} ${pct(run.aggregateScore.overall)} [${arcLabel(run.aggregateScore.resolutionArc)}]`)
  }

  lines.push('')

  // Identify weakest dimension across all runs
  const dimAvgs = {
    deEscalation: runs.reduce((s, r) => s + r.aggregateScore.deEscalationRate, 0) / runs.length,
    patternCoverage: runs.reduce((s, r) => s + r.aggregateScore.patternCoverage, 0) / runs.length,
    translationQuality: runs.reduce((s, r) => s + r.aggregateScore.avgTranslationQuality, 0) / runs.length,
    insightDepth: runs.reduce((s, r) => s + r.aggregateScore.avgInsightDepth, 0) / runs.length,
  }

  const weakest = Object.entries(dimAvgs).sort((a, b) => a[1] - b[1])[0]
  const strongest = Object.entries(dimAvgs).sort((a, b) => b[1] - a[1])[0]

  lines.push(`## Dimension Analysis`)
  lines.push(`  Strongest: ${weakest ? strongest[0] : 'N/A'} (${strongest ? pct(strongest[1]) : 'N/A'})`)
  lines.push(`  Weakest:   ${weakest ? weakest[0] : 'N/A'} (${weakest ? pct(weakest[1]) : 'N/A'})`)

  return lines.join('\n')
}

/**
 * Generate a comparison report between two runs or batches.
 */
export function reportComparison(comparison: RunComparison): string {
  const lines: string[] = [
    `# Arena Comparison: ${comparison.contextMode}`,
    `Direction: ${deltaLabel(comparison.direction, comparison.overallDelta)}`,
    '',
    `## Dimension Deltas`,
  ]

  for (const dim of comparison.dimensionSummary) {
    const arrow = dim.delta > 0 ? '+' : dim.delta < 0 ? '' : ' '
    lines.push(`  ${dim.dimension.padEnd(24)} ${pct(dim.before)} -> ${pct(dim.after)} (${arrow}${(dim.delta * 100).toFixed(1)}%)`)
  }

  lines.push('')

  if (comparison.bestImprovement) {
    lines.push(`## Best Improvement: ${comparison.bestImprovement.scenarioId}`)
    lines.push(`  Delta: +${(comparison.bestImprovement.overallDelta * 100).toFixed(1)}%`)
    lines.push(`  Arc: ${arcLabel(comparison.bestImprovement.arcBefore)} -> ${arcLabel(comparison.bestImprovement.arcAfter)}`)
    lines.push('')
  }

  if (comparison.worstRegression) {
    lines.push(`## Worst Regression: ${comparison.worstRegression.scenarioId}`)
    lines.push(`  Delta: ${(comparison.worstRegression.overallDelta * 100).toFixed(1)}%`)
    lines.push(`  Arc: ${arcLabel(comparison.worstRegression.arcBefore)} -> ${arcLabel(comparison.worstRegression.arcAfter)}`)
    lines.push('')
  }

  lines.push(`## All Scenarios`)
  const sorted = [...comparison.scenarioComparisons].sort((a, b) => b.overallDelta - a.overallDelta)
  for (const sc of sorted) {
    const arrow = sc.overallDelta > 0 ? '+' : sc.overallDelta < 0 ? '' : ' '
    const icon = sc.direction === 'improved' ? '[+]' : sc.direction === 'regressed' ? '[-]' : '[ ]'
    lines.push(`  ${icon} ${sc.scenarioId.padEnd(20)} ${arrow}${(sc.overallDelta * 100).toFixed(1)}%`)
  }

  return lines.join('\n')
}

// --- Formatting helpers ---

function bar(value: number): string {
  const filled = Math.round(value * 20)
  return '[' + '#'.repeat(filled) + '.'.repeat(20 - filled) + ']'
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function arcLabel(arc: string): string {
  switch (arc) {
    case 'resolved': return 'RESOLVED'
    case 'improved': return 'IMPROVED'
    case 'stable': return 'STABLE'
    case 'worsened': return 'WORSENED'
    default: return arc.toUpperCase()
  }
}

function gradeScore(score: number): string {
  if (score >= 0.8) return 'A'
  if (score >= 0.65) return 'B'
  if (score >= 0.5) return 'C'
  if (score >= 0.35) return 'D'
  return 'F'
}

function deltaLabel(direction: string, delta: number): string {
  const pctDelta = (delta * 100).toFixed(1)
  switch (direction) {
    case 'improved': return `IMPROVED (+${pctDelta}%)`
    case 'regressed': return `REGRESSED (${pctDelta}%)`
    default: return `STABLE (${pctDelta}%)`
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 3) + '...' : s
}
