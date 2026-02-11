import type { ContextMode, MessageSender } from '@/types/database'
import type { Scenario, SimulationRun, TurnResult } from './types'
import { CONTEXT_MODE_LENSES } from '@/lib/context-modes'
import { mediateMessage, type ConversationEntry } from '@/lib/opus'
import { parseConflictAnalysis } from '@/lib/prompts/index'
import { scoreTurn, scoreSimulation } from './evaluate'

/**
 * Run a full simulation against a pre-authored scenario.
 *
 * This is the Arena's core loop — the backtest engine. For each turn in the
 * scenario's conversation:
 *   1. Build conversation history from previous turns
 *   2. Call mediateMessage() — the exact same pipeline live users hit
 *   3. Parse the result with parseConflictAnalysis()
 *   4. Score the analysis against the scenario's planted patterns
 *   5. Accumulate into a SimulationRun
 *
 * Key design decision: The runner does NOT generate conversations dynamically.
 * It takes pre-authored conversations (the "market data") and runs the strategy
 * (lens analysis) against them. This is what makes it a backtest.
 */
export async function runSimulation(
  scenario: Scenario,
  contextMode: ContextMode,
): Promise<SimulationRun> {
  const activeLenses = CONTEXT_MODE_LENSES[contextMode]
  const turnResults: TurnResult[] = []
  const conversationHistory: ConversationEntry[] = []

  for (const turn of scenario.conversation) {
    const sender: MessageSender = turn.speaker === 'person_a' ? 'person_a' : 'person_b'
    const senderName = turn.speaker === 'person_a' ? scenario.personA.name : scenario.personB.name
    const otherName = turn.speaker === 'person_a' ? scenario.personB.name : scenario.personA.name

    // Call the real mediation pipeline
    const rawResponse = await mediateMessage(
      turn.content,
      sender,
      senderName,
      otherName,
      conversationHistory,
      contextMode,
    )

    const analysis = parseConflictAnalysis(rawResponse, contextMode)
    if (!analysis) {
      // If parsing fails, skip this turn — don't crash the simulation
      conversationHistory.push({ sender: senderName, content: turn.content })
      continue
    }

    // Score against scenario ground truth
    const previousAnalysis = turnResults.length > 0
      ? turnResults[turnResults.length - 1].analysis
      : null

    const scores = scoreTurn(analysis, scenario, turn.turnNumber, previousAnalysis)

    turnResults.push({
      turnNumber: turn.turnNumber,
      speaker: turn.speaker,
      analysis,
      scores,
    })

    // Add to conversation history for next turn's context
    conversationHistory.push({ sender: senderName, content: turn.content })
  }

  const aggregateScore = scoreSimulation(turnResults, scenario)

  return {
    id: `sim-${scenario.id}-${Date.now()}`,
    scenarioId: scenario.id,
    contextMode,
    activeLenses,
    turnResults,
    aggregateScore,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Run simulations for all scenarios in a given context mode.
 * Returns results as they complete (does NOT parallelize API calls
 * to avoid rate limiting — runs sequentially).
 */
export async function runAllForMode(
  contextMode: ContextMode,
  scenarios: Scenario[],
): Promise<SimulationRun[]> {
  const results: SimulationRun[] = []

  for (const scenario of scenarios) {
    const result = await runSimulation(scenario, contextMode)
    results.push(result)
  }

  return results
}
