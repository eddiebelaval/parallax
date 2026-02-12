import Anthropic from '@anthropic-ai/sdk'
import type { ConflictAnalysis, LensId } from '@/types/database'
import type { SimulationRun, Scenario, TurnResult } from './types'
import { LENS_METADATA } from '@/lib/context-modes'

/**
 * AI-Assisted Diagnosis Engine
 *
 * When the arena identifies low-scoring turns, this module feeds the
 * failure context to Claude using a META-ANALYST persona — separate
 * from the mediation persona. The meta-analyst examines what the
 * mediator produced and explains WHY it missed what it missed.
 *
 * The key insight: Claude-as-diagnostician uses a different system
 * prompt than Claude-as-mediator. It's reviewing its own work from
 * the outside, not trying to re-do the mediation.
 */

const META_ANALYST_PROMPT = `You are a prompt engineering specialist reviewing conflict analysis outputs. Your job is to diagnose WHY an AI mediator missed specific patterns in a conversation.

You will receive:
1. The original message that was analyzed
2. The conversation context
3. The analysis the mediator produced
4. The patterns it SHOULD have detected but didn't (planted by scenario authors)
5. The scores it received on each dimension

Your diagnosis should be:
- SPECIFIC: Point to exact phrases in the prompt instructions that are vague, missing, or misleading
- ACTIONABLE: Suggest concrete prompt edits (add this instruction, reword that section, add this example)
- CONSERVATIVE: Suggest the minimum change needed. Don't rewrite the whole prompt.
- AWARE OF TRADE-OFFS: Note if fixing one thing might break another

Respond with JSON matching this schema:
{
  "failures": [
    {
      "dimension": "string (which scoring dimension failed)",
      "severity": "minor|moderate|critical",
      "diagnosis": "string (why the mediator missed this)",
      "rootCause": "prompt_gap|prompt_ambiguity|schema_mismatch|context_insufficient",
      "affectedLens": "string (which lens prompt needs editing, or 'preamble' for the shared intro)",
      "suggestedFix": "string (specific prompt edit to try)",
      "confidence": 0.0
    }
  ],
  "overallAssessment": "string (1-2 sentence summary of what's going wrong)",
  "riskOfRegression": "low|medium|high (will the suggested fixes break other scenarios?)"
}`

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export interface FailureDiagnosis {
  dimension: string
  severity: 'minor' | 'moderate' | 'critical'
  diagnosis: string
  rootCause: 'prompt_gap' | 'prompt_ambiguity' | 'schema_mismatch' | 'context_insufficient'
  affectedLens: string
  suggestedFix: string
  confidence: number
}

export interface DiagnosisResult {
  scenarioId: string
  turnNumber: number
  failures: FailureDiagnosis[]
  overallAssessment: string
  riskOfRegression: 'low' | 'medium' | 'high'
}

/**
 * Find the worst-performing turns in a simulation run.
 * Returns turns sorted by composite score (lowest first).
 */
export function findWeakestTurns(
  run: SimulationRun,
  threshold: number = 0.5,
): TurnResult[] {
  return run.turnResults
    .filter((t) => {
      const avg = (
        t.scores.deEscalation +
        t.scores.blindSpotDetection +
        t.scores.translationQuality +
        t.scores.lensRelevance +
        t.scores.insightDepth
      ) / 5
      return avg < threshold
    })
    .sort((a, b) => {
      const avgA = Object.values(a.scores).reduce((s, v) => s + v, 0) / 5
      const avgB = Object.values(b.scores).reduce((s, v) => s + v, 0) / 5
      return avgA - avgB
    })
}

/**
 * Diagnose why a specific turn scored poorly.
 *
 * Sends the turn context to Claude's meta-analyst persona,
 * which examines the analysis output and explains the failures.
 */
export async function diagnoseTurn(
  scenario: Scenario,
  turn: TurnResult,
  lensPrompts: Record<string, string>,
): Promise<DiagnosisResult> {
  const speaker = turn.speaker === 'person_a' ? scenario.personA : scenario.personB
  const otherPerson = turn.speaker === 'person_a' ? scenario.personB : scenario.personA

  const conversationContext = scenario.conversation
    .filter((t) => t.turnNumber <= turn.turnNumber)
    .map((t) => {
      const name = t.speaker === 'person_a' ? scenario.personA.name : scenario.personB.name
      return `[${name}]: ${t.content}`
    })
    .join('\n')

  const currentMessage = scenario.conversation.find((t) => t.turnNumber === turn.turnNumber)

  // Build the lens prompt sections that were active
  const activeLensPrompts = turn.analysis.meta.activeLenses
    .map((id) => {
      const meta = LENS_METADATA[id]
      const prompt = lensPrompts[id] ?? '(prompt not provided)'
      return `### ${meta?.name ?? id}\n${prompt}`
    })
    .join('\n\n')

  const userPrompt = `## Scenario: ${scenario.title}
${scenario.description}

## Planted Patterns (ground truth — these should have been detected):
${scenario.plantedPatterns.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Conversation Context:
${conversationContext}

## Message Being Analyzed:
[${speaker.name}]: ${currentMessage?.content ?? '(unknown)'}
Speaker backstory: ${speaker.backstory}
Speaker emotional state: ${speaker.emotionalState}
Other person: ${otherPerson.name} — ${otherPerson.backstory}

## Analysis Produced by the Mediator:
${JSON.stringify(turn.analysis, null, 2)}

## Scores:
- De-escalation: ${turn.scores.deEscalation}
- Blind spot detection: ${turn.scores.blindSpotDetection}
- Translation quality: ${turn.scores.translationQuality}
- Lens relevance: ${turn.scores.lensRelevance}
- Insight depth: ${turn.scores.insightDepth}

## Active Lens Prompts (what the mediator was told):
${activeLensPrompts}

---

Diagnose why the mediator's analysis scored poorly. Focus on the lowest-scoring dimensions. What specific instructions were missing or ambiguous?`

  const client = getClient()
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: META_ANALYST_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    return {
      scenarioId: scenario.id,
      turnNumber: turn.turnNumber,
      failures: parsed.failures ?? [],
      overallAssessment: parsed.overallAssessment ?? '',
      riskOfRegression: parsed.riskOfRegression ?? 'medium',
    }
  } catch {
    return {
      scenarioId: scenario.id,
      turnNumber: turn.turnNumber,
      failures: [],
      overallAssessment: `Failed to parse diagnosis: ${text.slice(0, 200)}`,
      riskOfRegression: 'medium',
    }
  }
}

/**
 * Diagnose all weak turns across a full simulation run.
 * Limits to the N worst turns to control API costs.
 */
export async function diagnoseRun(
  run: SimulationRun,
  scenario: Scenario,
  lensPrompts: Record<string, string>,
  maxTurns: number = 3,
): Promise<DiagnosisResult[]> {
  const weakest = findWeakestTurns(run).slice(0, maxTurns)

  const results: DiagnosisResult[] = []
  for (const turn of weakest) {
    const diagnosis = await diagnoseTurn(scenario, turn, lensPrompts)
    results.push(diagnosis)
  }

  return results
}
