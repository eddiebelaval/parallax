import type { ContextMode, ConflictAnalysis, NvcAnalysis, LensId } from '@/types/database'
import { CONTEXT_MODE_LENSES } from '@/lib/context-modes'
import { stripCodeFences } from '@/lib/conversation'

import { NVC_LENS } from './lens-nvc'
import { GOTTMAN_LENS } from './lens-gottman'
import { CBT_LENS } from './lens-cbt'
import { TKI_LENS } from './lens-tki'
import { DRAMA_TRIANGLE_LENS } from './lens-drama-triangle'
import { NARRATIVE_LENS } from './lens-narrative'
import { ATTACHMENT_LENS } from './lens-attachment'
import { RESTORATIVE_LENS } from './lens-restorative'
import { SCARF_LENS } from './lens-scarf'
import { ORG_JUSTICE_LENS } from './lens-org-justice'
import { PSYCH_SAFETY_LENS } from './lens-psych-safety'
import { JEHNS_LENS } from './lens-jehns'
import { POWER_LENS } from './lens-power'
import { IBR_LENS } from './lens-ibr'

const LENS_MODULES: Record<LensId, { systemPromptSection: string; responseSchema: string }> = {
  nvc: NVC_LENS,
  gottman: GOTTMAN_LENS,
  cbt: CBT_LENS,
  tki: TKI_LENS,
  dramaTriangle: DRAMA_TRIANGLE_LENS,
  narrative: NARRATIVE_LENS,
  attachment: ATTACHMENT_LENS,
  restorative: RESTORATIVE_LENS,
  scarf: SCARF_LENS,
  orgJustice: ORG_JUSTICE_LENS,
  psychSafety: PSYCH_SAFETY_LENS,
  jehns: JEHNS_LENS,
  power: POWER_LENS,
  ibr: IBR_LENS,
}

const PREAMBLE = `You are Parallax, a Conflict Intelligence Engine trained in multiple frameworks for understanding human conflict. Two people are having a difficult conversation. Your role is to help each person understand what's really being said — not just the words, but the deep patterns beneath them.

You never take sides. You assume both people have valid feelings and unmet needs. You see past accusations to the hurt underneath, past defensiveness to the fear underneath, past silence to the exhaustion underneath.

CRITICAL RULES:
- Never judge either person. Both are doing the best they can with what they have.
- Name specific feelings (anxious, hurt, frustrated, lonely, overwhelmed) not vague ones (upset, bad, unhappy).
- Blind spots must be constructive — frame them as invitations to see a different perspective, not criticisms.
- NVC translations must sound HUMAN — warm, vulnerable, real. Not clinical or robotic.
- Keep analysis concise. Quality over quantity.
- For SECONDARY lenses: only include analysis if you detect relevant signals. If no signals, omit that lens entirely from the response (do not return null or empty objects — just omit the key).

CONTEXT: You will receive the conversation history and the latest message. Analyze ONLY the latest message, but use the conversation history to understand the evolving dynamic.`

/**
 * Builds the complete system prompt for a given context mode.
 * Concatenates preamble + context framing + active lens sections + response schema.
 */
export function buildConflictIntelligencePrompt(
  contextMode: ContextMode,
  sessionContext?: { goals?: string[]; contextSummary?: string },
): string {
  const activeLenses = CONTEXT_MODE_LENSES[contextMode]

  const lensInstructions = activeLenses
    .map((id) => LENS_MODULES[id].systemPromptSection)
    .join('\n\n')

  const lensSchemas = activeLenses
    .filter((id) => id !== 'nvc') // NVC schema is at root level
    .map((id) => LENS_MODULES[id].responseSchema)
    .join(',\n    ')

  let sessionContextBlock = ''
  if (sessionContext?.goals && sessionContext.goals.length > 0) {
    sessionContextBlock += `\n\nSESSION GOALS (established during onboarding):\n${sessionContext.goals.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\nWhen analyzing, note if this message advances or undermines these goals in your primaryInsight.`
  }
  if (sessionContext?.contextSummary) {
    sessionContextBlock += `\n\nSESSION CONTEXT (mediator's synthesis of both perspectives):\n${sessionContext.contextSummary}`
  }

  return `${PREAMBLE}

CONTEXT MODE: ${contextMode}
The following lenses are active for this context. Analyze through each one:

${lensInstructions}${sessionContextBlock}

---

Respond with ONLY a JSON object matching this schema (no markdown, no code fences, no explanation):
{
  "observation": "string",
  "feeling": "string",
  "need": "string",
  "request": "string",
  "subtext": "string",
  "blindSpots": ["string"],
  "unmetNeeds": ["string"],
  "nvcTranslation": "string",
  "emotionalTemperature": 0.0,
  "lenses": {
    ${lensSchemas}
  },
  "meta": {
    "contextMode": "${contextMode}",
    "activeLenses": ${JSON.stringify(activeLenses)},
    "primaryInsight": "One sentence synthesizing the most important insight across ALL active lenses. This is the headline — make it count.",
    "overallSeverity": 0.0,
    "resolutionDirection": "escalating|stable|de-escalating"
  }
}

IMPORTANT:
- The root-level fields (observation, feeling, need, request, subtext, blindSpots, unmetNeeds, nvcTranslation, emotionalTemperature) MUST always be present.
- For SECONDARY lenses, omit the key entirely from "lenses" if no signals detected. Do NOT include empty or null entries.
- Every included lens object MUST contain a "confidence" field (0.0-1.0) representing how confident you are in the analysis. 0.8+ means clear signals detected; 0.3-0.7 means tentative pattern; below 0.3 means weak signal — consider omitting the lens instead.
- "overallSeverity" is a 0.0-1.0 composite score: weight emotional temperature (40%), lens signal density (30%), and escalation patterns (30%).
- "resolutionDirection" compares this message to the conversation arc: is it escalating, holding stable, or de-escalating?
- "primaryInsight" must be a single sentence that a non-therapist could understand. Avoid jargon.
${activeLenses.length >= 7 ? '- IMPORTANT: With ' + activeLenses.length + ' active lenses, keep each lens analysis to 2-3 key findings. Prioritize signal density over exhaustiveness.' : ''}`
}

/**
 * Parse Claude's V3 response into a ConflictAnalysis.
 * Gracefully handles V1 format (wraps in V3 envelope) and missing lenses.
 */
export function parseConflictAnalysis(raw: string, contextMode: ContextMode): ConflictAnalysis | null {
  try {
    const parsed = JSON.parse(stripCodeFences(raw))

    // Validate required NVC root fields
    if (!parsed.observation || !parsed.feeling || !parsed.subtext) {
      return null
    }

    // Build NVC root (V1 compat)
    const nvcRoot: NvcAnalysis = {
      observation: String(parsed.observation),
      feeling: String(parsed.feeling),
      need: String(parsed.need || ''),
      request: String(parsed.request || ''),
      subtext: String(parsed.subtext),
      blindSpots: Array.isArray(parsed.blindSpots) ? parsed.blindSpots.map(String) : [],
      unmetNeeds: Array.isArray(parsed.unmetNeeds) ? parsed.unmetNeeds.map(String) : [],
      nvcTranslation: String(parsed.nvcTranslation || ''),
      emotionalTemperature: typeof parsed.emotionalTemperature === 'number'
        ? Math.max(0, Math.min(1, parsed.emotionalTemperature))
        : 0.5,
    }

    // If V1 format (no lenses/meta), wrap in V3 envelope
    if (!parsed.lenses && !parsed.meta) {
      const activeLenses = CONTEXT_MODE_LENSES[contextMode]
      return {
        ...nvcRoot,
        lenses: { nvc: nvcRoot },
        meta: {
          contextMode,
          activeLenses,
          primaryInsight: nvcRoot.subtext,
          overallSeverity: nvcRoot.emotionalTemperature,
          resolutionDirection: 'stable',
        },
      }
    }

    // V3 format — parse lenses (each lens validated independently)
    const lenses = parsed.lenses && typeof parsed.lenses === 'object' ? parsed.lenses : {}

    // Build meta with fallbacks
    const meta = parsed.meta && typeof parsed.meta === 'object' ? parsed.meta : {}
    const activeLenses = CONTEXT_MODE_LENSES[contextMode]

    return {
      ...nvcRoot,
      lenses,
      meta: {
        contextMode,
        activeLenses: Array.isArray(meta.activeLenses) ? meta.activeLenses : activeLenses,
        primaryInsight: String(meta.primaryInsight || nvcRoot.subtext),
        overallSeverity: typeof meta.overallSeverity === 'number'
          ? Math.max(0, Math.min(1, meta.overallSeverity))
          : nvcRoot.emotionalTemperature,
        resolutionDirection: ['escalating', 'stable', 'de-escalating'].includes(meta.resolutionDirection)
          ? meta.resolutionDirection
          : 'stable',
      },
    }
  } catch {
    return null
  }
}

/**
 * Build the user message for the mediation call.
 * Re-exported from old prompts.ts location for backward compat.
 */
export function buildMediationPrompt(
  conversationHistory: Array<{ sender: string; content: string }>,
  targetMessage: { sender: string; senderName: string; content: string },
  otherPersonName: string
): string {
  const historyBlock = conversationHistory.length > 0
    ? conversationHistory
        .map((msg) => `[${msg.sender}]: ${msg.content}`)
        .join('\n')
    : '(This is the first message in the conversation.)'

  return `CONVERSATION SO FAR:
${historyBlock}

ANALYZE THIS MESSAGE:
[${targetMessage.senderName}]: ${targetMessage.content}

The other person in this conversation is ${otherPersonName}.`
}

/**
 * Returns the recommended max_tokens for a given context mode.
 * Modes with more lenses need larger response budgets.
 */
export function getMaxTokensForMode(contextMode: ContextMode): number {
  const lensCount = CONTEXT_MODE_LENSES[contextMode].length
  return lensCount >= 7 ? 4096 : 2560
}
