import type { ContextMode, LensId } from '@/types/database'

/**
 * Maps each context mode to the lenses that should be activated.
 * NVC is always included as the foundational lens.
 *
 * Lens selection rationale:
 * - Intimate: relationship-focused (Gottman, Attachment, Drama Triangle)
 * - Family: multi-generational patterns (Narrative, Power, Restorative)
 * - Professional Peer: workplace dynamics (SCARF, Jehn's, TKI)
 * - Professional Hierarchical: power-aware (Org Justice, Psych Safety, Power)
 * - Transactional: interest-based (IBR, TKI, CBT)
 * - Civil/Structural: systemic (Power, Narrative, Org Justice, Restorative)
 */
export const CONTEXT_MODE_LENSES: Record<ContextMode, LensId[]> = {
  intimate: ['nvc', 'gottman', 'cbt', 'dramaTriangle', 'attachment', 'narrative'],
  family: ['nvc', 'gottman', 'narrative', 'dramaTriangle', 'attachment', 'power', 'restorative'],
  professional_peer: ['nvc', 'cbt', 'tki', 'scarf', 'jehns', 'psychSafety'],
  professional_hierarchical: ['nvc', 'cbt', 'tki', 'scarf', 'orgJustice', 'psychSafety', 'power'],
  transactional: ['nvc', 'cbt', 'tki', 'ibr', 'scarf'],
  civil_structural: ['nvc', 'narrative', 'power', 'orgJustice', 'restorative', 'ibr'],
}

type LensCategory = 'communication' | 'relational' | 'cognitive' | 'systemic' | 'resolution'

interface LensMeta {
  name: string
  shortName: string
  category: LensCategory
  description: string
}

export const LENS_METADATA: Record<LensId, LensMeta> = {
  nvc: {
    name: 'Nonviolent Communication',
    shortName: 'NVC',
    category: 'communication',
    description: 'Marshall Rosenberg\'s observation-feeling-need-request framework',
  },
  gottman: {
    name: 'Gottman Four Horsemen',
    shortName: 'Gottman',
    category: 'relational',
    description: 'Criticism, contempt, defensiveness, stonewalling — the four predictors of relationship failure',
  },
  cbt: {
    name: 'Cognitive Distortions',
    shortName: 'CBT',
    category: 'cognitive',
    description: 'Thinking traps like catastrophizing, mind-reading, all-or-nothing, and emotional reasoning',
  },
  tki: {
    name: 'Thomas-Kilmann Modes',
    shortName: 'TKI',
    category: 'resolution',
    description: 'Conflict-handling style: competing, collaborating, compromising, avoiding, or accommodating',
  },
  dramaTriangle: {
    name: 'Karpman Drama Triangle',
    shortName: 'Drama',
    category: 'relational',
    description: 'Persecutor-victim-rescuer role dynamics and their shifts during conflict',
  },
  narrative: {
    name: 'Narrative Therapy',
    shortName: 'Narrative',
    category: 'cognitive',
    description: 'Totalizing narratives, identity claims, and opportunities for re-authoring the conflict story',
  },
  attachment: {
    name: 'Attachment Theory',
    shortName: 'Attach',
    category: 'relational',
    description: 'Secure, anxious, avoidant, or disorganized attachment styles and pursue-withdraw dynamics',
  },
  restorative: {
    name: 'Restorative Justice',
    shortName: 'Restore',
    category: 'resolution',
    description: 'Identifying harm, naming needs of both parties, and pathways toward repair',
  },
  scarf: {
    name: 'SCARF Model',
    shortName: 'SCARF',
    category: 'systemic',
    description: 'Status, certainty, autonomy, relatedness, fairness — social threat detection in the brain',
  },
  orgJustice: {
    name: 'Organizational Justice',
    shortName: 'Justice',
    category: 'systemic',
    description: 'Distributive, procedural, and interactional fairness perceptions',
  },
  psychSafety: {
    name: 'Psychological Safety',
    shortName: 'Psych Safe',
    category: 'systemic',
    description: 'Team safety level, risk signals, and topics being silenced',
  },
  jehns: {
    name: 'Jehn\'s Conflict Types',
    shortName: 'Jehn\'s',
    category: 'systemic',
    description: 'Task vs relationship vs process conflict, and spillover risk between types',
  },
  power: {
    name: 'Power Dynamics',
    shortName: 'Power',
    category: 'systemic',
    description: 'Symmetric vs asymmetric power, power moves, and silencing patterns',
  },
  ibr: {
    name: 'Interest-Based Relational',
    shortName: 'IBR',
    category: 'resolution',
    description: 'Separating interests from positions, finding hidden common ground',
  },
}

interface ContextModeInfo {
  name: string
  description: string
  example: string
  group: 'personal' | 'professional' | 'formal'
}

export const CONTEXT_MODE_INFO: Record<ContextMode, ContextModeInfo> = {
  intimate: {
    name: 'Intimate Partners',
    description: 'Romantic relationships, close partnerships',
    example: '"We need to talk about the dishes" (but it\'s never about the dishes)',
    group: 'personal',
  },
  family: {
    name: 'Family',
    description: 'Parents, siblings, extended family dynamics',
    example: '"Mom always sides with you" or "You sound just like Dad"',
    group: 'personal',
  },
  professional_peer: {
    name: 'Professional Peers',
    description: 'Coworkers, team members, collaborators',
    example: '"You keep taking credit for my work in meetings"',
    group: 'professional',
  },
  professional_hierarchical: {
    name: 'Professional Hierarchy',
    description: 'Boss-employee, mentor-mentee, authority dynamics',
    example: '"I was passed over for the promotion again"',
    group: 'professional',
  },
  transactional: {
    name: 'Transactional',
    description: 'Customer-vendor, neighbor, one-time disputes',
    example: '"You promised delivery by Friday and it\'s still not here"',
    group: 'formal',
  },
  civil_structural: {
    name: 'Civil / Structural',
    description: 'Community disputes, institutional conflicts, systemic issues',
    example: '"The HOA policy affects our family differently than yours"',
    group: 'formal',
  },
}
