import { createServerClient } from '@/lib/supabase'
import type { BehavioralSignal, ConsentLevel, SoloMemory } from '@/types/database'

interface InjectionContext {
  speakerContext: string
  otherPartyContext: string
  speakerFacilitation: string
  otherPartyFacilitation: string
}

/**
 * Build intelligence context for Claude's mediation system prompt.
 *
 * Checks user profiles and consent levels, then formats behavioral
 * signals into a Claude-readable context block.
 *
 * Returns empty strings if no profiles or consent exist.
 */
export async function buildIntelligenceContext(
  sessionId: string,
  speakerUserId: string | null,
  otherPartyUserId: string | null,
): Promise<InjectionContext> {
  const empty: InjectionContext = {
    speakerContext: '',
    otherPartyContext: '',
    speakerFacilitation: '',
    otherPartyFacilitation: '',
  }

  if (!speakerUserId) return empty

  const supabase = createServerClient()

  // Get speaker's signals (always available if they have a profile)
  const { data: speakerSignals } = await supabase
    .from('behavioral_signals')
    .select('*')
    .eq('user_id', speakerUserId)

  const speakerContext = speakerSignals?.length
    ? formatSignalsForClaude(speakerSignals as BehavioralSignal[], 'Current Speaker')
    : ''

  // Load speaker's solo_memory for communication facilitation
  let speakerFacilitation = ''
  const { data: speakerProfile } = await supabase
    .from('user_profiles')
    .select('solo_memory')
    .eq('user_id', speakerUserId)
    .single()

  if (speakerProfile?.solo_memory &&
    typeof speakerProfile.solo_memory === 'object' &&
    Object.keys(speakerProfile.solo_memory).length > 0) {
    speakerFacilitation = formatFacilitationBlock(
      speakerProfile.solo_memory as SoloMemory,
      'Current Speaker',
    )
  }

  // Check for cross-party signals (requires consent from both parties)
  let otherPartyContext = ''
  let otherPartyFacilitation = ''
  if (otherPartyUserId) {
    const bothConsented = await checkMutualConsent(supabase, sessionId, speakerUserId, otherPartyUserId)

    if (bothConsented) {
      const { data: otherSignals } = await supabase
        .from('behavioral_signals')
        .select('*')
        .eq('user_id', otherPartyUserId)

      if (otherSignals?.length) {
        otherPartyContext = formatSignalsForClaude(
          otherSignals as BehavioralSignal[],
          'Other Party (anonymized)',
        )

        await supabase.from('signal_access_log').insert(
          otherSignals.map((signal) => ({
            signal_owner_id: otherPartyUserId,
            accessor_session_id: sessionId,
            signal_type: (signal as BehavioralSignal).signal_type,
            consent_level: 'anonymous_signals' as ConsentLevel,
          })),
        )
      }

      // Load other party's solo_memory (anonymized, consent required)
      const { data: otherProfile } = await supabase
        .from('user_profiles')
        .select('solo_memory')
        .eq('user_id', otherPartyUserId)
        .single()

      if (otherProfile?.solo_memory &&
        typeof otherProfile.solo_memory === 'object' &&
        Object.keys(otherProfile.solo_memory).length > 0) {
        otherPartyFacilitation = formatFacilitationBlock(
          otherProfile.solo_memory as SoloMemory,
          'Other Party (anonymized)',
        )
      }
    }
  }

  return { speakerContext, otherPartyContext, speakerFacilitation, otherPartyFacilitation }
}

/**
 * Check if both parties have granted anonymous_signals consent for this session.
 */
async function checkMutualConsent(
  supabase: ReturnType<typeof createServerClient>,
  sessionId: string,
  userA: string,
  userB: string,
): Promise<boolean> {
  const { data: consents } = await supabase
    .from('signal_consent')
    .select('user_id, consent_level')
    .eq('session_id', sessionId)
    .is('revoked_at', null)

  if (!consents || consents.length < 2) return false

  const aConsent = consents.find((c) => c.user_id === userA)
  const bConsent = consents.find((c) => c.user_id === userB)

  return (
    aConsent?.consent_level === 'anonymous_signals' &&
    bConsent?.consent_level === 'anonymous_signals'
  )
}

/**
 * Format solo_memory into an abstracted facilitation block for mediation.
 *
 * Privacy rules:
 * - NEVER include specific things said in solo sessions
 * - NEVER reveal personal details shared privately
 * - Only include abstracted patterns: communication style, values, strengths, triggers
 */
function formatFacilitationBlock(memory: SoloMemory, label: string): string {
  const lines: string[] = [`--- ${label} Communication Profile ---`]

  if (memory.values?.length) {
    lines.push(`Core values: ${memory.values.join(', ')}`)
  }

  if (memory.strengths?.length) {
    lines.push(`Communication strengths: ${memory.strengths.join(', ')}`)
  }

  if (memory.patterns?.length) {
    lines.push(`Behavioral patterns: ${memory.patterns.join(', ')}`)
  }

  if (memory.themes?.length) {
    lines.push(`Recurring themes: ${memory.themes.join(', ')}`)
  }

  if (memory.emotionalState) {
    lines.push(`Recent emotional state: ${memory.emotionalState}`)
  }

  lines.push(`--- End ${label} Communication Profile ---`)
  return lines.join('\n')
}

/**
 * Format behavioral signals into a human-readable context block for Claude.
 * This is injected into the system prompt during mediation.
 */
function formatSignalsForClaude(signals: BehavioralSignal[], label: string): string {
  const lines: string[] = [`--- ${label} Profile Intelligence ---`]

  for (const signal of signals) {
    const val = signal.signal_value as Record<string, unknown>

    switch (signal.signal_type) {
      case 'attachment_style':
        lines.push(`Attachment: ${val.primary} (confidence: ${signal.confidence.toFixed(2)})`)
        if (val.secondary) lines.push(`  Secondary: ${val.secondary}`)
        break

      case 'conflict_mode':
        lines.push(`Conflict mode: ${val.primary}${val.secondary ? `, secondary: ${val.secondary}` : ''}`)
        lines.push(`  Assertiveness: ${val.assertiveness}, Cooperativeness: ${val.cooperativeness}`)
        break

      case 'gottman_risk': {
        const horsemen = val.horsemen as string[]
        if (horsemen?.length) {
          lines.push(`Gottman risk: ${horsemen.join(', ')}`)
          lines.push(`  Repair capacity: ${val.repairCapacity}`)
        }
        break
      }

      case 'regulation_pattern':
        lines.push(`Emotional regulation: ${val.style}`)
        if (val.floodingOnset) lines.push(`  Flooding onset: ${val.floodingOnset}`)
        lines.push(`  Trigger sensitivity: ${val.triggerSensitivity}`)
        break

      case 'scarf_sensitivity':
        lines.push(`SCARF primary: ${val.primaryDomain}`)
        break

      case 'drama_triangle':
        if (val.defaultRole) {
          lines.push(`Drama Triangle default: ${val.defaultRole}`)
          lines.push(`  Rescuer trap risk: ${val.rescuerTrapRisk}`)
        }
        break

      case 'values': {
        const core = val.core as string[]
        if (core?.length) lines.push(`Core values: ${core.join(', ')}`)
        const needs = val.unmetNeeds as string[]
        if (needs?.length) lines.push(`Recurring unmet needs: ${needs.join(', ')}`)
        break
      }

      default:
        lines.push(`${signal.signal_type}: ${JSON.stringify(val)}`)
    }
  }

  lines.push('--- End Profile Intelligence ---')
  return lines.join('\n')
}

/**
 * Build the full intelligence injection block for the mediation system prompt.
 */
export function buildIntelligencePromptSection(context: InjectionContext): string {
  const hasSignals = context.speakerContext || context.otherPartyContext
  const hasFacilitation = context.speakerFacilitation || context.otherPartyFacilitation

  if (!hasSignals && !hasFacilitation) return ''

  const sections: string[] = []

  // Behavioral signals section (existing)
  if (hasSignals) {
    sections.push(
      '\n\n=== PROFILE INTELLIGENCE (use to inform your analysis, not to diagnose) ===',
      '',
      'You have access to behavioral signals extracted from the participants\' profiles.',
      'Use these to:',
      '- Predict likely escalation patterns before they happen',
      '- Tailor your language to their communication style',
      '- Identify the dynamic between them (e.g., pursuer-distancer)',
      '- Name patterns by their framework names when helpful',
      '',
      'Do NOT:',
      '- Mention that you have a "profile" on them',
      '- Use clinical language unless they use it first',
      '- Make assumptions beyond what the signals indicate',
      '- Reveal one party\'s signals to the other',
      '',
    )

    if (context.speakerContext) {
      sections.push(context.speakerContext)
      sections.push('')
    }

    if (context.otherPartyContext) {
      sections.push(context.otherPartyContext)
      sections.push('')
    }

    sections.push('=== END PROFILE INTELLIGENCE ===')
  }

  // Communication facilitation section (from solo memory)
  if (hasFacilitation) {
    sections.push(
      '\n\n=== COMMUNICATION FACILITATION CONTEXT ===',
      '',
      'This context helps you facilitate understanding between both parties.',
      'You are NOT taking sides. You are helping each person be UNDERSTOOD.',
      '',
      'Use this to:',
      '- Translate ambiguous statements charitably based on their values',
      '- Anticipate misunderstandings before they happen',
      '- Frame needs in ways the other person can hear',
      '- Recognize when someone\'s communication style is being misread',
      '- Notice when stress is affecting their ability to express themselves',
      '',
      'NEVER:',
      '- Reveal anything from private/solo sessions',
      '- Take one person\'s side over the other',
      '- Reference "your profile" or "I know from before"',
      '- Make either person feel surveilled or analyzed',
      '',
    )

    if (context.speakerFacilitation) {
      sections.push(context.speakerFacilitation)
      sections.push('')
    }

    if (context.otherPartyFacilitation) {
      sections.push(context.otherPartyFacilitation)
      sections.push('')
    }

    sections.push('=== END COMMUNICATION FACILITATION ===')
  }

  return sections.join('\n')
}
