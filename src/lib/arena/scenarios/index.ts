import type { ContextMode } from '@/types/database'
import type { Scenario } from '../types'
import { FAMILY_SCENARIOS } from './family'

/**
 * Registry mapping context modes to their arena scenario sets.
 *
 * Family is the pilot category (15 scenarios, fully authored).
 * Other categories are stubbed for post-hackathon expansion —
 * each would follow the same sub-type structure with 15 scenarios.
 */
export const ARENA_SCENARIOS: Record<ContextMode, Scenario[]> = {
  family: FAMILY_SCENARIOS,

  // TODO: 15 scenarios post-hackathon
  // Sub-types: jealousy/trust, household labor, intimacy mismatch,
  // long-distance strain, co-parenting disagreement
  // Key lenses: Gottman (Four Horsemen peak here), Attachment (secure base),
  // Drama Triangle (pursuer-distancer), CBT (mind-reading, catastrophizing)
  intimate: [],

  // TODO: 15 scenarios post-hackathon
  // Sub-types: co-founder disputes, credit/blame, workload imbalance,
  // communication styles, remote vs in-office friction
  // Key lenses: SCARF (status/fairness threats), Jehn's (task vs relationship),
  // TKI (competing vs collaborating), Psych Safety (fear of speaking up)
  professional_peer: [],

  // TODO: 15 scenarios post-hackathon
  // Sub-types: performance review disagreements, promotion bypasses,
  // micromanagement, whistleblowing, mentorship boundary violations
  // Key lenses: Power (structural asymmetry), Org Justice (procedural fairness),
  // Psych Safety (retaliation fear), SCARF (autonomy/status threats)
  professional_hierarchical: [],

  // TODO: 15 scenarios post-hackathon
  // Sub-types: service failures, scope creep, payment disputes,
  // contract misunderstandings, neighbor boundary issues
  // Key lenses: IBR (interests vs positions), TKI (negotiation modes),
  // CBT (catastrophizing, all-or-nothing), SCARF (fairness)
  transactional: [],

  // TODO: 15 scenarios post-hackathon
  // Sub-types: HOA disputes, landlord-tenant conflicts,
  // school board disagreements, community resource allocation,
  // institutional discrimination claims
  // Key lenses: Power (structural/institutional), Narrative (community stories),
  // Org Justice (systemic fairness), Restorative (community repair),
  // IBR (collective interests)
  civil_structural: [],
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
