import { describe, it, expect } from 'vitest'
import {
  measureDeEscalation,
  checkBlindSpotDetection,
  scoreTurn,
  scoreSimulation,
} from '../arena/evaluate'
import type { ConflictAnalysis } from '@/types/database'
import type { Scenario, TurnResult } from '../arena/types'

// --- Helpers to build mock data ---

function mockAnalysis(overrides: Partial<ConflictAnalysis> = {}): ConflictAnalysis {
  return {
    observation: 'Speaker raised their voice during the discussion',
    feeling: 'Frustrated and unheard',
    need: 'To feel respected',
    request: 'Could we take turns speaking?',
    subtext: 'I feel like my opinions do not matter',
    blindSpots: ['Dismissing partner feelings'],
    unmetNeeds: ['Respect', 'Autonomy'],
    nvcTranslation: 'When I notice raised voices, I feel frustrated because I need mutual respect.',
    emotionalTemperature: 0.6,
    lenses: {
      nvc: {
        observation: 'Speaker raised their voice',
        feeling: 'Frustrated',
        need: 'Respect',
        request: 'Take turns',
        subtext: 'Opinions do not matter',
        blindSpots: ['Dismissing feelings'],
        unmetNeeds: ['Respect'],
        nvcTranslation: 'I feel frustrated when voices are raised.',
        emotionalTemperature: 0.6,
      },
      dramaTriangle: {
        role: 'victim',
        roleShifts: ['victim to persecutor shift'],
        rescuerTrap: false,
      },
      gottman: {
        horsemen: [{ type: 'criticism', evidence: 'harsh startup detected' }],
        repairAttempts: [],
        positiveToNegativeRatio: '1:3',
        startupType: 'harsh',
      },
    },
    meta: {
      contextMode: 'family',
      activeLenses: ['nvc', 'gottman', 'narrative', 'dramaTriangle', 'attachment', 'power', 'restorative'],
      primaryInsight: 'The speaker fears losing control of the conversation, masking vulnerability with frustration.',
      overallSeverity: 0.6,
      resolutionDirection: 'stable',
    },
    ...overrides,
  }
}

function mockScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'test-001',
    category: 'family',
    title: 'Test Scenario',
    description: 'A test scenario',
    personA: {
      name: 'Alice',
      role: 'adult_child',
      backstory: 'Test backstory',
      emotionalState: 'Anxious',
    },
    personB: {
      name: 'Bob',
      role: 'parent',
      backstory: 'Test backstory',
      emotionalState: 'Defensive',
    },
    trigger: 'Test trigger',
    plantedPatterns: [
      'Drama Triangle: victim to persecutor shift',
      'Gottman: harsh startup with criticism',
      'Power asymmetry: parent authority override',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      { speaker: 'person_a', content: 'Test message A', turnNumber: 1 },
      { speaker: 'person_b', content: 'Test message B', turnNumber: 2 },
    ],
    tags: ['test'],
    ...overrides,
  }
}

// --- measureDeEscalation ---

describe('measureDeEscalation', () => {
  it('returns 0.5 for the first turn (no previous)', () => {
    expect(measureDeEscalation(0.6, null)).toBe(0.5)
  })

  it('returns 1.0 for a significant temperature drop', () => {
    expect(measureDeEscalation(0.3, 0.7)).toBe(1.0) // delta = 0.4
  })

  it('returns 0.8 for a moderate drop', () => {
    expect(measureDeEscalation(0.5, 0.65)).toBe(0.8) // delta = 0.15
  })

  it('returns 0.6 for a small drop', () => {
    expect(measureDeEscalation(0.55, 0.6)).toBe(0.6) // delta = 0.05
  })

  it('returns 0.4 for no change', () => {
    expect(measureDeEscalation(0.5, 0.5)).toBe(0.4)
  })

  it('returns 0.3 for a small spike', () => {
    expect(measureDeEscalation(0.55, 0.5)).toBe(0.3) // delta = -0.05
  })

  it('returns 0.0 for a significant spike', () => {
    expect(measureDeEscalation(0.9, 0.5)).toBe(0.0) // delta = -0.4
  })

  it('handles edge case of 0 to 0', () => {
    expect(measureDeEscalation(0, 0)).toBe(0.4)
  })

  it('handles edge case of 1 to 0', () => {
    expect(measureDeEscalation(0, 1)).toBe(1.0)
  })
})

// --- checkBlindSpotDetection ---

describe('checkBlindSpotDetection', () => {
  it('returns 1.0 when no patterns are planted', () => {
    const analysis = mockAnalysis()
    expect(checkBlindSpotDetection(analysis, [])).toBe(1.0)
  })

  it('detects Drama Triangle patterns from analysis fields', () => {
    const analysis = mockAnalysis({
      lenses: {
        dramaTriangle: {
          role: 'victim',
          roleShifts: ['victim to persecutor shift detected'],
          rescuerTrap: false,
        },
      },
    })
    const patterns = ['Drama Triangle: victim to persecutor shift']
    const score = checkBlindSpotDetection(analysis, patterns)
    expect(score).toBeGreaterThan(0)
  })

  it('detects Gottman patterns from horsemen data', () => {
    const analysis = mockAnalysis({
      lenses: {
        gottman: {
          horsemen: [{ type: 'criticism', evidence: 'harsh startup language detected' }],
          repairAttempts: [],
          positiveToNegativeRatio: '1:3',
          startupType: 'harsh',
        },
      },
    })
    const patterns = ['Gottman: harsh startup with criticism']
    const score = checkBlindSpotDetection(analysis, patterns)
    expect(score).toBeGreaterThan(0)
  })

  it('returns 0 when no patterns match', () => {
    const analysis = mockAnalysis({
      lenses: {},
      blindSpots: [],
      meta: {
        contextMode: 'family',
        activeLenses: ['nvc'],
        primaryInsight: 'Nothing relevant here.',
        overallSeverity: 0.3,
        resolutionDirection: 'stable',
      },
    })
    const patterns = ['SCARF: extreme status threat in workplace context']
    const score = checkBlindSpotDetection(analysis, patterns)
    expect(score).toBe(0)
  })

  it('handles partial detection across multiple patterns', () => {
    const analysis = mockAnalysis()
    // First two patterns should partially match, third won't
    const patterns = [
      'Drama Triangle: victim role shifting',
      'Gottman: harsh startup criticism',
      'IBR: hidden interests behind negotiation positions',
    ]
    const score = checkBlindSpotDetection(analysis, patterns)
    // Should be between 0 and 1 (some detected, some not)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})

// --- scoreTurn ---

describe('scoreTurn', () => {
  it('produces scores in the 0-1 range for all dimensions', () => {
    const analysis = mockAnalysis()
    const scenario = mockScenario()
    const scores = scoreTurn(analysis, scenario, 0, null)

    expect(scores.deEscalation).toBeGreaterThanOrEqual(0)
    expect(scores.deEscalation).toBeLessThanOrEqual(1)
    expect(scores.blindSpotDetection).toBeGreaterThanOrEqual(0)
    expect(scores.blindSpotDetection).toBeLessThanOrEqual(1)
    expect(scores.translationQuality).toBeGreaterThanOrEqual(0)
    expect(scores.translationQuality).toBeLessThanOrEqual(1)
    expect(scores.lensRelevance).toBeGreaterThanOrEqual(0)
    expect(scores.lensRelevance).toBeLessThanOrEqual(1)
    expect(scores.insightDepth).toBeGreaterThanOrEqual(0)
    expect(scores.insightDepth).toBeLessThanOrEqual(1)
  })

  it('scores de-escalation relative to previous turn', () => {
    const current = mockAnalysis({ emotionalTemperature: 0.3 })
    const previous = mockAnalysis({ emotionalTemperature: 0.7 })
    const scenario = mockScenario()
    const scores = scoreTurn(current, scenario, 1, previous)
    // Temperature dropped 0.4 — should score high
    expect(scores.deEscalation).toBe(1.0)
  })

  it('gives neutral de-escalation score for first turn', () => {
    const analysis = mockAnalysis()
    const scenario = mockScenario()
    const scores = scoreTurn(analysis, scenario, 0, null)
    expect(scores.deEscalation).toBe(0.5)
  })
})

// --- scoreSimulation ---

describe('scoreSimulation', () => {
  it('returns zero scores for empty turn results', () => {
    const scenario = mockScenario()
    const agg = scoreSimulation([], scenario)
    expect(agg.overall).toBe(0)
    expect(agg.deEscalationRate).toBe(0)
    expect(agg.patternCoverage).toBe(0)
    expect(agg.resolutionArc).toBe('stable')
  })

  it('computes weighted overall score correctly', () => {
    const turns: TurnResult[] = [
      {
        turnNumber: 1,
        speaker: 'person_a',
        analysis: mockAnalysis({ emotionalTemperature: 0.8 }),
        scores: {
          deEscalation: 0.5,
          blindSpotDetection: 0.8,
          translationQuality: 0.7,
          lensRelevance: 0.6,
          insightDepth: 0.9,
        },
      },
      {
        turnNumber: 2,
        speaker: 'person_b',
        analysis: mockAnalysis({ emotionalTemperature: 0.5 }),
        scores: {
          deEscalation: 0.8,
          blindSpotDetection: 0.6,
          translationQuality: 0.8,
          lensRelevance: 0.7,
          insightDepth: 0.7,
        },
      },
    ]

    const scenario = mockScenario()
    const agg = scoreSimulation(turns, scenario)

    // Verify overall is a weighted average
    const expectedOverall =
      ((0.5 + 0.8) / 2) * 0.25 +  // deEscalation
      ((0.8 + 0.6) / 2) * 0.25 +  // blindSpotDetection
      ((0.7 + 0.8) / 2) * 0.20 +  // translationQuality
      ((0.6 + 0.7) / 2) * 0.15 +  // lensRelevance
      ((0.9 + 0.7) / 2) * 0.15    // insightDepth

    expect(agg.overall).toBeCloseTo(expectedOverall, 2)
  })

  it('classifies resolution arc based on temperature delta', () => {
    const makeTurn = (temp: number, turnNum: number): TurnResult => ({
      turnNumber: turnNum,
      speaker: 'person_a',
      analysis: mockAnalysis({ emotionalTemperature: temp }),
      scores: { deEscalation: 0.5, blindSpotDetection: 0.5, translationQuality: 0.5, lensRelevance: 0.5, insightDepth: 0.5 },
    })

    const scenario = mockScenario()

    // Resolved: large drop (0.8 -> 0.3 = delta 0.5)
    const resolved = scoreSimulation([makeTurn(0.8, 1), makeTurn(0.3, 2)], scenario)
    expect(resolved.resolutionArc).toBe('resolved')

    // Improved: moderate drop (0.7 -> 0.5 = delta 0.2)
    const improved = scoreSimulation([makeTurn(0.7, 1), makeTurn(0.5, 2)], scenario)
    expect(improved.resolutionArc).toBe('improved')

    // Stable: no significant change (0.6 -> 0.55 = delta 0.05)
    const stable = scoreSimulation([makeTurn(0.6, 1), makeTurn(0.55, 2)], scenario)
    expect(stable.resolutionArc).toBe('stable')

    // Worsened: temperature increased (0.4 -> 0.8 = delta -0.4)
    const worsened = scoreSimulation([makeTurn(0.4, 1), makeTurn(0.8, 2)], scenario)
    expect(worsened.resolutionArc).toBe('worsened')
  })

  it('takes best pattern coverage across all turns', () => {
    const turns: TurnResult[] = [
      {
        turnNumber: 1,
        speaker: 'person_a',
        analysis: mockAnalysis(),
        scores: { deEscalation: 0.5, blindSpotDetection: 0.3, translationQuality: 0.5, lensRelevance: 0.5, insightDepth: 0.5 },
      },
      {
        turnNumber: 2,
        speaker: 'person_b',
        analysis: mockAnalysis(),
        scores: { deEscalation: 0.5, blindSpotDetection: 0.9, translationQuality: 0.5, lensRelevance: 0.5, insightDepth: 0.5 },
      },
    ]
    const agg = scoreSimulation(turns, mockScenario())
    // Should take the max (0.9), not the average
    expect(agg.patternCoverage).toBe(0.9)
  })
})

// --- Scenario validation ---

describe('scenario validation', () => {
  it('mock scenario has all required fields', () => {
    const s = mockScenario()
    expect(s.id).toBeTruthy()
    expect(s.category).toBeTruthy()
    expect(s.title).toBeTruthy()
    expect(s.personA.name).toBeTruthy()
    expect(s.personB.name).toBeTruthy()
    expect(s.trigger).toBeTruthy()
    expect(s.plantedPatterns.length).toBeGreaterThan(0)
    expect(s.conversation.length).toBeGreaterThan(0)
    expect(s.tags.length).toBeGreaterThan(0)
  })
})
