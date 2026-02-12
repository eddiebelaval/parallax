import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs'
import { join, basename } from 'path'
import type { DiagnosisResult, FailureDiagnosis } from './diagnose'

/**
 * Prompt Refinement Engine
 *
 * Takes diagnosis results from diagnose.ts and generates concrete
 * prompt patches. Each patch is a before/after diff of a specific
 * lens prompt file, with the diagnosis that motivated it.
 *
 * The refinement workflow:
 *   1. Aggregate diagnoses across all weak turns
 *   2. Group by affected lens (multiple failures may point to the same prompt)
 *   3. Generate a PromptPatch for each lens that needs editing
 *   4. Present patches for human approval
 *   5. Apply approved patches (with automatic backup)
 *
 * IMPORTANT: This module does NOT auto-apply patches. It generates
 * them for review. The apply step requires explicit confirmation.
 */

const PROMPTS_DIR = join(process.cwd(), 'src', 'lib', 'prompts')
const BACKUP_DIR = join(process.cwd(), 'arena-results', '_prompt-backups')

export interface PromptPatch {
  lensId: string
  lensFile: string
  diagnoses: FailureDiagnosis[]
  currentPromptSection: string
  suggestedEdits: string[]
  combinedSuggestion: string
  confidence: number
  riskOfRegression: 'low' | 'medium' | 'high'
}

export interface RefinementPlan {
  timestamp: string
  totalDiagnoses: number
  patchCount: number
  patches: PromptPatch[]
  skippedLenses: Array<{ lensId: string; reason: string }>
}

/**
 * Map lens IDs to their prompt file paths.
 */
const LENS_FILE_MAP: Record<string, string> = {
  nvc: 'lens-nvc.ts',
  gottman: 'lens-gottman.ts',
  cbt: 'lens-cbt.ts',
  tki: 'lens-tki.ts',
  dramaTriangle: 'lens-drama-triangle.ts',
  narrative: 'lens-narrative.ts',
  attachment: 'lens-attachment.ts',
  restorative: 'lens-restorative.ts',
  scarf: 'lens-scarf.ts',
  orgJustice: 'lens-org-justice.ts',
  psychSafety: 'lens-psych-safety.ts',
  jehns: 'lens-jehns.ts',
  power: 'lens-power.ts',
  ibr: 'lens-ibr.ts',
  preamble: 'index.ts',
}

/**
 * Generate a refinement plan from diagnosis results.
 *
 * Groups failures by lens, aggregates their suggestions, and
 * produces a set of PromptPatches ready for human review.
 */
export function generateRefinementPlan(diagnoses: DiagnosisResult[]): RefinementPlan {
  // Flatten all failures across all diagnosed turns
  const allFailures = diagnoses.flatMap((d) => d.failures)

  // Group by affected lens
  const byLens = new Map<string, FailureDiagnosis[]>()
  for (const failure of allFailures) {
    const lens = failure.affectedLens
    if (!byLens.has(lens)) byLens.set(lens, [])
    byLens.get(lens)!.push(failure)
  }

  const patches: PromptPatch[] = []
  const skippedLenses: Array<{ lensId: string; reason: string }> = []

  for (const [lensId, failures] of byLens) {
    const lensFile = LENS_FILE_MAP[lensId]
    if (!lensFile) {
      skippedLenses.push({ lensId, reason: 'Unknown lens ID — no file mapping' })
      continue
    }

    // Read the current prompt file
    const filePath = join(PROMPTS_DIR, lensFile)
    let currentContent = ''
    try {
      currentContent = readFileSync(filePath, 'utf-8')
    } catch {
      skippedLenses.push({ lensId, reason: `Cannot read ${lensFile}` })
      continue
    }

    // Extract just the systemPromptSection string
    const promptMatch = currentContent.match(/systemPromptSection:\s*`([\s\S]*?)`/)
    const currentPromptSection = promptMatch?.[1] ?? '(could not extract prompt section)'

    // Skip if all failures are low confidence
    const avgConfidence = failures.reduce((s, f) => s + f.confidence, 0) / failures.length
    if (avgConfidence < 0.3) {
      skippedLenses.push({ lensId, reason: `Low confidence (${avgConfidence.toFixed(2)}) — not worth the regression risk` })
      continue
    }

    // Aggregate suggestions
    const suggestedEdits = failures.map((f) => f.suggestedFix)
    const combinedSuggestion = synthesizeSuggestions(failures)

    // Risk = highest risk among component diagnoses
    const riskLevels = diagnoses
      .filter((d) => d.failures.some((f) => f.affectedLens === lensId))
      .map((d) => d.riskOfRegression)
    const highestRisk = riskLevels.includes('high') ? 'high'
      : riskLevels.includes('medium') ? 'medium'
      : 'low'

    patches.push({
      lensId,
      lensFile,
      diagnoses: failures,
      currentPromptSection,
      suggestedEdits,
      combinedSuggestion,
      confidence: avgConfidence,
      riskOfRegression: highestRisk as 'low' | 'medium' | 'high',
    })
  }

  // Sort by confidence (highest first)
  patches.sort((a, b) => b.confidence - a.confidence)

  return {
    timestamp: new Date().toISOString(),
    totalDiagnoses: allFailures.length,
    patchCount: patches.length,
    patches,
    skippedLenses,
  }
}

/**
 * Synthesize multiple failure suggestions into a single coherent edit.
 * When multiple diagnoses point to the same lens, their suggestions
 * may overlap or conflict — this combines them intelligently.
 */
function synthesizeSuggestions(failures: FailureDiagnosis[]): string {
  if (failures.length === 1) return failures[0].suggestedFix

  // Group by root cause for cleaner synthesis
  const byRootCause = new Map<string, FailureDiagnosis[]>()
  for (const f of failures) {
    if (!byRootCause.has(f.rootCause)) byRootCause.set(f.rootCause, [])
    byRootCause.get(f.rootCause)!.push(f)
  }

  const parts: string[] = []

  for (const [cause, causeFailures] of byRootCause) {
    if (causeFailures.length === 1) {
      parts.push(`[${cause}] ${causeFailures[0].suggestedFix}`)
    } else {
      parts.push(`[${cause}] Multiple signals:`)
      for (const f of causeFailures) {
        parts.push(`  - ${f.suggestedFix}`)
      }
    }
  }

  return parts.join('\n')
}

/**
 * Back up a lens prompt file before applying a patch.
 * Backups are timestamped so you can always revert.
 */
export function backupPromptFile(lensFile: string): string {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
  }

  const srcPath = join(PROMPTS_DIR, lensFile)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupName = `${basename(lensFile, '.ts')}-${timestamp}.ts`
  const backupPath = join(BACKUP_DIR, backupName)

  copyFileSync(srcPath, backupPath)
  return backupPath
}

/**
 * Format a refinement plan as a human-readable report.
 * This is what gets shown for approval before any changes are made.
 */
export function formatPlanForReview(plan: RefinementPlan): string {
  const lines: string[] = [
    `# Arena Refinement Plan`,
    `Generated: ${plan.timestamp}`,
    `Total diagnoses: ${plan.totalDiagnoses} | Patches: ${plan.patchCount}`,
    '',
  ]

  for (const patch of plan.patches) {
    lines.push(`## Lens: ${patch.lensId} (${patch.lensFile})`)
    lines.push(`Confidence: ${(patch.confidence * 100).toFixed(0)}% | Regression risk: ${patch.riskOfRegression}`)
    lines.push('')
    lines.push(`### Diagnoses:`)
    for (const d of patch.diagnoses) {
      lines.push(`- [${d.severity}] ${d.dimension}: ${d.diagnosis}`)
      lines.push(`  Root cause: ${d.rootCause}`)
    }
    lines.push('')
    lines.push(`### Suggested Edit:`)
    lines.push(patch.combinedSuggestion)
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  if (plan.skippedLenses.length > 0) {
    lines.push(`## Skipped Lenses:`)
    for (const s of plan.skippedLenses) {
      lines.push(`- ${s.lensId}: ${s.reason}`)
    }
  }

  return lines.join('\n')
}
