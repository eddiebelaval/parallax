import type { ContextMode } from '@/types/database'
import type { Scenario } from '../types'
import { FAMILY_SCENARIOS } from './family'
import { INTIMATE_SCENARIOS } from './intimate'
import { PROFESSIONAL_PEER_SCENARIOS } from './professional-peer'
import { PROFESSIONAL_HIERARCHICAL_SCENARIOS } from './professional-hierarchical'
import { TRANSACTIONAL_SCENARIOS } from './transactional'
import { CIVIL_STRUCTURAL_SCENARIOS } from './civil-structural'

/**
 * Registry mapping context modes to their arena scenario sets.
 *
 * 90 total scenarios across 6 context modes (15 each).
 * Each mode has 5 sub-types with 3 scenarios per sub-type.
 *
 * Coverage:
 *   - Family: parent-adult child, siblings, in-laws, blended family, generational
 *   - Intimate: jealousy/trust, household labor, intimacy mismatch, long-distance, co-parenting
 *   - Professional Peer: co-founder, credit/blame, workload, communication styles, remote friction
 *   - Professional Hierarchical: performance review, promotion bypass, micromanagement, ethics, mentorship
 *   - Transactional: service failures, scope creep, payment disputes, contracts, neighbor boundaries
 *   - Civil/Structural: HOA, landlord-tenant, school board, resource allocation, institutional discrimination
 */
export const ARENA_SCENARIOS: Record<ContextMode, Scenario[]> = {
  family: FAMILY_SCENARIOS,
  intimate: INTIMATE_SCENARIOS,
  professional_peer: PROFESSIONAL_PEER_SCENARIOS,
  professional_hierarchical: PROFESSIONAL_HIERARCHICAL_SCENARIOS,
  transactional: TRANSACTIONAL_SCENARIOS,
  civil_structural: CIVIL_STRUCTURAL_SCENARIOS,
}

export function getScenariosForMode(mode: ContextMode): Scenario[] {
  return ARENA_SCENARIOS[mode]
}

export function getScenarioById(id: string): Scenario | undefined {
  for (const scenarios of Object.values(ARENA_SCENARIOS)) {
    const found = scenarios.find((s) => s.id === id)
    if (found) return found
  }
  return undefined
}

export function getAllScenarios(): Scenario[] {
  return Object.values(ARENA_SCENARIOS).flat()
}

export function getScenarioCount(): Record<ContextMode, number> {
  return Object.fromEntries(
    Object.entries(ARENA_SCENARIOS).map(([mode, scenarios]) => [mode, scenarios.length]),
  ) as Record<ContextMode, number>
}
