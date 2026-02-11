import type { ContextMode } from '@/types/database'

/**
 * Conductor Prompt Builders
 *
 * Each function returns { system, user } prompt pairs for a specific
 * phase of the conductor's conversational onboarding flow.
 *
 * The conductor speaks as "Parallax" — a warm, skilled mediator who
 * guides both parties through context-sharing before the real
 * conversation begins.
 */

const CONDUCTOR_PERSONA = `You are Parallax — a warm, skilled mediator facilitating a conversation between two people in conflict. You speak in first person as "I." You are NOT a therapist, psychologist, or doctor. You are a neutral facilitator armed with emotional intelligence.

VOICE RULES:
- Warm, grounded, brief. 2-4 sentences max unless synthesizing.
- No bullet points. No numbered lists. No framework jargon.
- Never mention NVC, analysis tools, lenses, or your internal processes.
- Speak naturally — like a wise friend, not a chatbot.
- Use their names. Make it personal.`

export type InterventionType = 'escalation' | 'dominance' | 'breakthrough'

export function buildGreetingPrompt(
  personAName: string,
  personBName: string,
  contextMode: ContextMode,
): { system: string; user: string } {
  return {
    system: CONDUCTOR_PERSONA,
    user: `You are opening a ${contextMode.replace(/_/g, ' ')} mediation session.

The two people are ${personAName} and ${personBName}. They've both just joined.

Welcome them warmly. Briefly explain that you'll help them understand each other better. Then ask ${personAName} to share what brought them here today — what's on their mind, in their own words.

Do NOT ask both people at once. Address ${personAName} first. Keep it to 2-3 sentences.`,
  }
}

export function buildAcknowledgeAPrompt(
  personAName: string,
  personBName: string,
  personAContext: string,
): { system: string; user: string } {
  return {
    system: CONDUCTOR_PERSONA,
    user: `${personAName} just shared their perspective:

"${personAContext}"

Acknowledge what ${personAName} shared in 1-2 sentences. Don't parrot it back — show you heard the essence. Then invite ${personBName} to share their perspective on what's been happening.

Keep it to 2-3 sentences total.`,
  }
}

export function buildSynthesisPrompt(
  personAName: string,
  personBName: string,
  personAContext: string,
  personBContext: string,
  contextMode: ContextMode,
): { system: string; user: string } {
  return {
    system: `${CONDUCTOR_PERSONA}

IMPORTANT: Your response must be a JSON object with this exact shape:
{
  "message": "Your spoken message to both people (3-5 sentences)",
  "goals": ["goal 1", "goal 2", "goal 3"],
  "contextSummary": "A 1-2 sentence synthesis of both perspectives for internal use"
}

The "message" should:
1. Briefly reflect what you heard from both — find common ground AND name the tension
2. Propose 2-3 concrete goals for this session (what they'll try to accomplish together)
3. Transition to open conversation — invite them to begin

The "goals" should be specific and actionable (e.g., "Understand what each person needs around household responsibilities" not "Communicate better").

The "contextSummary" is internal context for the analysis engine — concise and factual.`,
    user: `This is a ${contextMode.replace(/_/g, ' ')} mediation. Here's what both people shared:

${personAName}'s perspective:
"${personAContext}"

${personBName}'s perspective:
"${personBContext}"

Synthesize what you've heard. Find the thread connecting their experiences. Propose session goals and open the floor for conversation.`,
  }
}

export function buildInterventionPrompt(
  personAName: string,
  personBName: string,
  recentMessages: Array<{ sender: string; content: string }>,
  interventionType: InterventionType,
  sessionGoals: string[],
  contextMode: ContextMode,
): { system: string; user: string } {
  const typeInstructions: Record<InterventionType, string> = {
    escalation: `The conversation is escalating — emotions are running hot. Your job is to gently slow things down. Acknowledge the intensity without dismissing it. Redirect toward one of the session goals. Do NOT take sides.`,
    dominance: `One person is dominating the conversation. The other person hasn't had space to speak. Gently create an opening for the quieter person without shaming the talker.`,
    breakthrough: `Something positive just happened — a moment of vulnerability, acknowledgment, or genuine understanding. Briefly name what you noticed and encourage them to stay in this space.`,
  }

  const recentBlock = recentMessages
    .map((m) => `[${m.sender}]: ${m.content}`)
    .join('\n')

  const goalsBlock = sessionGoals.length > 0
    ? `\nSession goals:\n${sessionGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}`
    : ''

  return {
    system: CONDUCTOR_PERSONA,
    user: `This is a ${contextMode.replace(/_/g, ' ')} mediation between ${personAName} and ${personBName}.
${goalsBlock}

Recent messages:
${recentBlock}

${typeInstructions[interventionType]}

Speak as the mediator. 1-3 sentences. Reference a session goal if relevant.`,
  }
}
