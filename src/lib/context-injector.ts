import { createServerClient } from '@/lib/supabase'
import type { BehavioralSignal, ConsentLevel } from '@/types/database'

interface InjectionContext {
  speakerContext: string
  otherPartyContext: string
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
  const empty: InjectionContext = { speakerContext: '', otherPartyContext: '' }

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

  // Check for cross-party signals (requires consent from both parties)
  let otherPartyContext = ''
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

        // Log the access
        for (const signal of otherSignals) {
          await supabase.from('signal_access_log').insert({
            signal_owner_id: otherPartyUserId,
            accessor_session_id: sessionId,
            signal_type: (signal as BehavioralSignal).signal_type,
            consent_level: 'anonymous_signals' as ConsentLevel,
          })
        }
      }
    }
  }

  return { speakerContext, otherPartyContext }
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
  if (!context.speakerContext && !context.otherPartyContext) return ''

  const sections: string[] = [
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
  ]

  if (context.speakerContext) {
    sections.push(context.speakerContext)
    sections.push('')
  }

  if (context.otherPartyContext) {
    sections.push(context.otherPartyContext)
    sections.push('')
  }

  sections.push('=== END PROFILE INTELLIGENCE ===')

  return sections.join('\n')
}
