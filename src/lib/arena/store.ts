import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import type { SimulationRun } from './types'

/**
 * File-based persistence for arena simulation runs.
 *
 * Results are stored as JSON files in a local directory, organized by
 * context mode. This keeps the feedback loop self-contained — no
 * Supabase dependency, works offline, and diffs cleanly in git.
 *
 * Directory structure:
 *   arena-results/
 *     family/
 *       sim-family-001-1707600000000.json
 *     intimate/
 *       sim-intimate-001-1707600000000.json
 *     _baselines/
 *       family-baseline.json      (locked "known good" run)
 */

const RESULTS_DIR = join(process.cwd(), 'arena-results')

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/**
 * Save a simulation run to disk.
 * Returns the file path for reference.
 */
export function saveRun(run: SimulationRun): string {
  const modeDir = join(RESULTS_DIR, run.contextMode)
  ensureDir(modeDir)

  const filename = `${run.id}.json`
  const filepath = join(modeDir, filename)
  writeFileSync(filepath, JSON.stringify(run, null, 2))
  return filepath
}

/**
 * Save multiple runs from a batch (e.g., runAllForMode result).
 */
export function saveRunBatch(runs: SimulationRun[]): string[] {
  return runs.map(saveRun)
}

/**
 * Load a specific run by its ID and context mode.
 */
export function loadRun(contextMode: string, runId: string): SimulationRun | null {
  const filepath = join(RESULTS_DIR, contextMode, `${runId}.json`)
  if (!existsSync(filepath)) return null

  try {
    return JSON.parse(readFileSync(filepath, 'utf-8')) as SimulationRun
  } catch {
    return null
  }
}

/**
 * Load all runs for a given context mode, sorted newest first.
 */
export function loadRunsForMode(contextMode: string): SimulationRun[] {
  const modeDir = join(RESULTS_DIR, contextMode)
  if (!existsSync(modeDir)) return []

  const files = readdirSync(modeDir)
    .filter((f) => f.endsWith('.json') && f.startsWith('sim-'))
    .sort()
    .reverse()

  return files
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(modeDir, f), 'utf-8')) as SimulationRun
      } catch {
        return null
      }
    })
    .filter((r): r is SimulationRun => r !== null)
}

/**
 * Load the most recent run for a given scenario ID.
 */
export function loadLatestForScenario(contextMode: string, scenarioId: string): SimulationRun | null {
  const runs = loadRunsForMode(contextMode)
  return runs.find((r) => r.scenarioId === scenarioId) ?? null
}

/**
 * Save a run as the baseline for its context mode.
 * Baselines are the "known good" reference point for comparison.
 */
export function saveBaseline(run: SimulationRun): string {
  const baselineDir = join(RESULTS_DIR, '_baselines')
  ensureDir(baselineDir)

  const filepath = join(baselineDir, `${run.contextMode}-baseline.json`)
  writeFileSync(filepath, JSON.stringify(run, null, 2))
  return filepath
}

/**
 * Load the baseline for a given context mode.
 */
export function loadBaseline(contextMode: string): SimulationRun | null {
  const filepath = join(RESULTS_DIR, '_baselines', `${contextMode}-baseline.json`)
  if (!existsSync(filepath)) return null

  try {
    return JSON.parse(readFileSync(filepath, 'utf-8')) as SimulationRun
  } catch {
    return null
  }
}

/**
 * List all available context modes that have stored results.
 */
export function listStoredModes(): string[] {
  if (!existsSync(RESULTS_DIR)) return []

  return readdirSync(RESULTS_DIR)
    .filter((f) => !f.startsWith('_') && !f.startsWith('.'))
}
