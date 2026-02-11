import type { ConflictAnalysis, ContextMode, LensId } from '@/types/database'

// --- Scenario authoring types ---

export interface Persona {
  name: string
  role: string
  backstory: string
  emotionalState: string
  attachmentStyle?: string
  communicationPattern?: string
}

export interface ConversationTurn {
  speaker: 'person_a' | 'person_b'
  content: string
  turnNumber: number
}

export interface Scenario {
  id: string
  category: ContextMode
  title: string
  description: string
  personA: Persona
  personB: Persona
  trigger: string
  plantedPatterns: string[]
  expectedTrajectory: 'escalating' | 'cyclical' | 'stonewalling' | 'explosive'
  conversation: ConversationTurn[]
  tags: string[]
}

// --- Simulation result types ---

export interface TurnScores {
  deEscalation: number
  blindSpotDetection: number
  translationQuality: number
  lensRelevance: number
  insightDepth: number
}

export interface TurnResult {
  turnNumber: number
  speaker: 'person_a' | 'person_b'
  analysis: ConflictAnalysis
  scores: TurnScores
}

export interface AggregateScore {
  overall: number
  deEscalationRate: number
  patternCoverage: number
  avgTranslationQuality: number
  avgInsightDepth: number
  resolutionArc: 'resolved' | 'improved' | 'stable' | 'worsened'
}

export interface SimulationRun {
  id: string
  scenarioId: string
  contextMode: ContextMode
  activeLenses: LensId[]
  turnResults: TurnResult[]
  aggregateScore: AggregateScore
  timestamp: string
}
