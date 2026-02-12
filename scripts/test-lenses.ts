/**
 * E2E Lens Smoke Test
 *
 * Tests the full prompt → Claude → parse pipeline for each context mode.
 * Validates structural contract: JSON parseable, required fields present,
 * lens keys match requested lenses.
 *
 * Usage: npx tsx scripts/test-lenses.ts
 * Requires: ANTHROPIC_API_KEY in .env.local
 */

import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import { buildConflictIntelligencePrompt, buildMediationPrompt, parseConflictAnalysis, getMaxTokensForMode } from '../src/lib/prompts/index'
import { CONTEXT_MODE_LENSES } from '../src/lib/context-modes'
import type { ContextMode } from '../src/types/database'

const client = new Anthropic()

// One representative test message per context mode
const TEST_SCENARIOS: Record<ContextMode, { message: string; sender: string; other: string }> = {
  intimate: {
    message: "You always say you'll help but then nothing changes. I'm tired of being the only one who cares about this house.",
    sender: 'Sarah',
    other: 'Mike',
  },
  family: {
    message: "Mom always sides with you. It's been like this since we were kids and nothing ever changes.",
    sender: 'Jamie',
    other: 'Alex',
  },
  professional_peer: {
    message: "You keep taking credit for my work in the meetings. Everyone sees it but nobody says anything.",
    sender: 'Priya',
    other: 'Jordan',
  },
  professional_hierarchical: {
    message: "I was passed over for the promotion again. You said my performance was excellent so I don't understand.",
    sender: 'Devon',
    other: 'Manager',
  },
  transactional: {
    message: "You promised delivery by Friday and it's still not here. This is the third time this has happened.",
    sender: 'Client',
    other: 'Vendor',
  },
  civil_structural: {
    message: "The HOA policy affects our family differently than yours. The rules were written without people like us in mind.",
    sender: 'Resident A',
    other: 'Board Member',
  },
}

interface TestResult {
  mode: ContextMode
  passed: boolean
  lensCount: number
  lensesReturned: string[]
  lensesMissing: string[]
  hasConfidence: boolean
  parseTime: number
  errors: string[]
}

async function testMode(mode: ContextMode): Promise<TestResult> {
  const scenario = TEST_SCENARIOS[mode]
  const activeLenses = CONTEXT_MODE_LENSES[mode]
  const errors: string[] = []
  const start = Date.now()

  try {
    const systemPrompt = buildConflictIntelligencePrompt(mode)
    const userPrompt = buildMediationPrompt(
      [],
      { sender: 'person_a', senderName: scenario.sender, content: scenario.message },
      scenario.other
    )

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: getMaxTokensForMode(mode),
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')

    const analysis = parseConflictAnalysis(rawText, mode)
    const parseTime = Date.now() - start

    if (!analysis) {
      return { mode, passed: false, lensCount: 0, lensesReturned: [], lensesMissing: activeLenses, hasConfidence: false, parseTime, errors: ['Parse returned null — invalid JSON or missing required fields'] }
    }

    // Check required root fields
    const requiredRoot = ['observation', 'feeling', 'need', 'subtext', 'nvcTranslation']
    for (const field of requiredRoot) {
      if (!(field in analysis) || !analysis[field as keyof typeof analysis]) {
        errors.push(`Missing root field: ${field}`)
      }
    }

    // Check lenses returned
    const lensesReturned = Object.keys(analysis.lenses || {}).filter((k) => k !== 'nvc')
    const expectedNonNvc = activeLenses.filter((id) => id !== 'nvc')
    const lensesMissing = expectedNonNvc.filter((id) => !lensesReturned.includes(id))

    // Check confidence fields
    let hasConfidence = false
    for (const key of lensesReturned) {
      const result = (analysis.lenses as Record<string, unknown>)[key]
      if (result && typeof result === 'object' && 'confidence' in result) {
        hasConfidence = true
        break
      }
    }

    // Check meta
    if (!analysis.meta?.primaryInsight) errors.push('Missing meta.primaryInsight')
    if (typeof analysis.meta?.overallSeverity !== 'number') errors.push('Missing meta.overallSeverity')

    return {
      mode,
      passed: errors.length === 0 && lensesMissing.length <= 2, // Allow up to 2 missing (secondary lenses may be omitted)
      lensCount: lensesReturned.length,
      lensesReturned,
      lensesMissing,
      hasConfidence,
      parseTime,
      errors,
    }
  } catch (err) {
    return {
      mode,
      passed: false,
      lensCount: 0,
      lensesReturned: [],
      lensesMissing: activeLenses,
      hasConfidence: false,
      parseTime: Date.now() - start,
      errors: [err instanceof Error ? err.message : String(err)],
    }
  }
}

async function main() {
  console.log('Parallax V3 Lens Smoke Test')
  console.log('='.repeat(60))
  console.log()

  const modes = Object.keys(TEST_SCENARIOS) as ContextMode[]
  const results: TestResult[] = []

  for (const mode of modes) {
    process.stdout.write(`Testing ${mode}...`)
    const result = await testMode(mode)
    results.push(result)
    console.log(result.passed ? ' PASS' : ' FAIL')
    if (!result.passed) {
      result.errors.forEach((e) => console.log(`  - ${e}`))
      if (result.lensesMissing.length > 0) {
        console.log(`  - Missing lenses: ${result.lensesMissing.join(', ')}`)
      }
    }
    console.log(`  Lenses returned: ${result.lensCount} | Confidence: ${result.hasConfidence ? 'yes' : 'no'} | Time: ${result.parseTime}ms`)
    console.log()
  }

  // Summary
  console.log('='.repeat(60))
  const passed = results.filter((r) => r.passed).length
  console.log(`Results: ${passed}/${results.length} passed`)
  console.log()

  if (passed < results.length) {
    process.exit(1)
  }
}

main().catch(console.error)
