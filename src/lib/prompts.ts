/**
 * V3: This file is now a re-export shim.
 * The modular prompt system lives in src/lib/prompts/.
 * Existing imports (parseNvcAnalysis, buildMediationPrompt, etc.) are preserved.
 */

import type { NvcAnalysis } from '@/types/database'
import { stripCodeFences } from '@/lib/conversation'

// Re-export the new prompt builder and parser
export { buildConflictIntelligencePrompt, parseConflictAnalysis, buildMediationPrompt, getMaxTokensForMode } from '@/lib/prompts/index'

// Legacy: NVC_SYSTEM_PROMPT string for backward compat with opus.ts (removed in Phase 3)
export { NVC_SYSTEM_PROMPT } from '@/lib/prompts/legacy-nvc-prompt'

/**
 * Legacy parser — wraps the V1 NVC parsing logic.
 * Still used by any code that hasn't migrated to parseConflictAnalysis.
 */
export function parseNvcAnalysis(raw: string): NvcAnalysis | null {
  try {
    const parsed = JSON.parse(stripCodeFences(raw))

    if (!parsed.observation || !parsed.feeling || !parsed.subtext) {
      return null
    }

    return {
      observation: String(parsed.observation),
      feeling: String(parsed.feeling),
      need: String(parsed.need || ''),
      request: String(parsed.request || ''),
      subtext: String(parsed.subtext),
      blindSpots: Array.isArray(parsed.blindSpots)
        ? parsed.blindSpots.map(String)
        : [],
      unmetNeeds: Array.isArray(parsed.unmetNeeds)
        ? parsed.unmetNeeds.map(String)
        : [],
      nvcTranslation: String(parsed.nvcTranslation || parsed.translated_message || ''),
      emotionalTemperature: typeof parsed.emotionalTemperature === 'number'
        ? Math.max(0, Math.min(1, parsed.emotionalTemperature))
        : 0.5,
    }
  } catch {
    return null
  }
}

/**
 * Issue Analysis Prompt — used by the X-Ray Scoreboard in in-person mode.
 */
export const ISSUE_ANALYSIS_PROMPT = `You are Parallax's issue tracker. Given a conversation between two people in conflict, identify the discrete issues being raised and track how each one evolves.

For each new issue, provide a short label and description. For existing issues, grade whether the latest message made them BETTER, WORSE, or had NO_CHANGE.

Respond with ONLY a JSON object:
{
  "newIssues": [{ "label": "string", "description": "string", "raised_by": "person_a|person_b" }],
  "issueUpdates": [{ "id": "string", "status": "better|worse|no_change", "reason": "string" }]
}`

/**
 * Build the user message for issue analysis.
 */
export function buildIssueAnalysisPrompt(
  conversationHistory: Array<{ sender: string; content: string }>,
  targetMessage: { sender: string; senderName: string; content: string },
  otherPersonName: string,
  existingIssues: Array<{ id: string; label: string; description: string; raised_by: string; status: string }>,
): string {
  const historyBlock = conversationHistory.length > 0
    ? conversationHistory
        .map((msg) => `[${msg.sender}]: ${msg.content}`)
        .join('\n')
    : '(This is the first message in the conversation.)'

  const issuesBlock = existingIssues.length > 0
    ? existingIssues
        .map((issue) => `- [${issue.id}] "${issue.label}" (raised by ${issue.raised_by}, status: ${issue.status}): ${issue.description}`)
        .join('\n')
    : '(No issues tracked yet.)'

  return `CONVERSATION SO FAR:
${historyBlock}

EXISTING ISSUES:
${issuesBlock}

ANALYZE THIS MESSAGE:
[${targetMessage.senderName}]: ${targetMessage.content}

The other person in this conversation is ${otherPersonName}. Identify any new issues raised and grade how existing issues were affected.`
}

/**
 * Session summary prompt — analyzes the full conversation arc.
 */
export const SESSION_SUMMARY_PROMPT = `You are Parallax, reviewing a complete conversation between two people in conflict. Analyze the full arc of their dialogue and provide a compassionate summary.

Focus on:
1. How the emotional temperature changed over the conversation
2. Key moments where understanding grew (or barriers went up)
3. The core needs each person was expressing throughout
4. What each person could take away from this conversation
5. One thing each person did well in communicating

Be warm, specific, and hopeful. Even difficult conversations contain moments of connection — find them.

Respond with a JSON object:
{
  "temperatureArc": "string describing how emotions shifted",
  "keyMoments": ["string describing pivotal moments"],
  "personANeeds": "what Person A was really seeking",
  "personBNeeds": "what Person B was really seeking",
  "personATakeaway": "insight for Person A",
  "personBTakeaway": "insight for Person B",
  "personAStrength": "what Person A did well",
  "personBStrength": "what Person B did well",
  "overallInsight": "one sentence capturing the heart of this conversation"
}`

export interface ExtractedIssue {
  label: string
  description: string
}

export interface GradedIssue {
  issueId: string
  status: 'well_addressed' | 'poorly_addressed'
  rationale: string
}

export interface IssueAnalysisResult {
  newIssues: ExtractedIssue[]
  gradedIssues: GradedIssue[]
}

/**
 * Parse Claude's issue analysis response.
 */
export function parseIssueAnalysis(raw: string): IssueAnalysisResult | null {
  try {
    const parsed = JSON.parse(stripCodeFences(raw))

    return {
      newIssues: Array.isArray(parsed.newIssues)
        ? parsed.newIssues
            .filter((i: { label?: string; description?: string }) => i.label && i.description)
            .map((i: { label: string; description: string }) => ({
              label: String(i.label),
              description: String(i.description),
            }))
        : [],
      gradedIssues: Array.isArray(parsed.gradedIssues)
        ? parsed.gradedIssues
            .filter((g: { issueId?: string; status?: string }) =>
              g.issueId && (g.status === 'well_addressed' || g.status === 'poorly_addressed'))
            .map((g: { issueId: string; status: string; rationale?: string }) => ({
              issueId: String(g.issueId),
              status: g.status as 'well_addressed' | 'poorly_addressed',
              rationale: String(g.rationale || ''),
            }))
        : [],
    }
  } catch {
    return null
  }
}
