export type NarrationStepType = 'api' | 'static'

export interface NarrationStep {
  id: string
  type: NarrationStepType
  /** For 'api' steps: the prompt to send to Explorer. For 'static': the narration text. */
  text: string
  /** data-narration-id of the section to reveal (if any) */
  revealsSection?: string
  /** Extra delay after this step before proceeding (ms) */
  delayAfterMs?: number
}

/* ─── Time-aware intro prompt ─── */

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

function getDayVibe(): string {
  const day = new Date().getDay()
  if (day === 0) return 'It\'s Sunday \u2014 a good day for reflection.'
  if (day === 6) return 'It\'s Saturday \u2014 weekend energy.'
  if (day === 1) return 'It\'s Monday \u2014 fresh start.'
  if (day === 5) return 'It\'s Friday \u2014 almost there.'
  return ''
}

const TIME_FLAVOR: Record<string, string> = {
  morning: 'It\'s morning where they are. Be bright and energized.',
  afternoon: 'It\'s the afternoon. Be warm and focused.',
  evening: 'It\'s evening. Be calm and reflective.',
  night: 'It\'s late at night. Acknowledge they\'re burning the midnight oil \u2014 thank them for being here this late.',
}

/**
 * Generates a fresh intro prompt based on time of day, day of week,
 * and how many times the user has replayed the narration.
 */
export function getIntroPrompt(replayCount: number): string {
  // Easter egg: 3rd replay gets a joke
  if (replayCount >= 3) {
    return 'The visitor has clicked "Listen" three times now. They clearly like you. Start with a short, warm joke about how they keep coming back \u2014 something like "Okay, at this point we\'re basically friends." Then do your normal intro but keep it to 1-2 sentences since they\'ve heard it before. Be playful and self-aware. Do NOT use bullet points.'
  }

  // Returning visitor (replay 2) gets a shorter, self-aware intro
  if (replayCount >= 1) {
    return 'The visitor clicked "Listen" again \u2014 they\'ve seen this before. Start with "Welcome back" or "Hey again" and give a fresh, shorter intro (1-2 sentences). Vary your phrasing from last time. Be warm. Do NOT use bullet points.'
  }

  // First visit: time-aware fresh intro
  const timeOfDay = getTimeOfDay()
  const dayVibe = getDayVibe()
  const timeFlavor = TIME_FLAVOR[timeOfDay]

  return `A visitor just clicked "Listen." Start with the word "Hello" and then warmly introduce yourself in 2-3 sentences. You are Parallax \u2014 you help people in conflict see what they are actually saying to each other. Be warm, human, and brief. ${timeFlavor}${dayVibe ? ' ' + dayVibe : ''} Do NOT use bullet points.`
}

/** Fallback intro if the API call fails or times out */
export const FALLBACK_INTRO =
  "Hello. I'm Parallax \u2014 I help people in conflict see what they're actually saying to each other. When two people argue, there are always two conversations happening: the words on the surface and the feelings underneath. I give you vision into both."

/* ─── Dynamic full-script generation ─── */

/** Steps eligible for dynamic generation. 'what-you-see' excluded (MeltDemo timing lock). */
export const DYNAMIC_STEP_IDS = ['problem', 'how-it-works', 'context-modes', 'two-modes', 'the-door'] as const
export type DynamicStepId = (typeof DYNAMIC_STEP_IDS)[number]
export type GeneratedNarration = Record<DynamicStepId, string>

/**
 * Builds a single prompt that generates fresh narration for all dynamic steps.
 * Called once per narration start, runs in parallel with the greeting.
 * 'greeting' uses getIntroPrompt() separately. 'what-you-see' stays static.
 */
export function buildFullNarrationPrompt(replayCount: number): string {
  const timeOfDay = getTimeOfDay()
  const dayVibe = getDayVibe()
  const timeFlavor = TIME_FLAVOR[timeOfDay]

  const replayContext = replayCount === 0
    ? 'This is their first time hearing the full narration.'
    : replayCount < 3
      ? `They've listened ${replayCount} time${replayCount > 1 ? 's' : ''} before. Use the same structure but vary your phrasing \u2014 same ideas, fresh words. Don't repeat yourself.`
      : `They've listened ${replayCount} times. They love this. Be playful and self-aware about the repetition while still covering everything.`

  return `You are Parallax \u2014 you help people in conflict see what they're actually saying to each other. You are narrating your own landing page as a visitor scrolls through it.

${timeFlavor}${dayVibe ? ' ' + dayVibe : ''}
${replayContext}

Generate narration text for each section below. Return ONLY valid JSON \u2014 no markdown, no code fences, no explanation.

VOICE RULES:
- Warm, human, conversational \u2014 like a thoughtful friend explaining what you do
- NO bullet points, NO lists, NO markdown formatting
- You are Parallax \u2014 use "I" and "me"
- Mix short punchy sentences with longer flowing ones
- Every word must be speakable aloud naturally
- NEVER say "I built this" or "I was built"

SECTIONS:

"problem" (40-60 words): The problem you solve.
  Must mention: $300/hr mediation, long waitlists, people repeating the same destructive patterns.

"how-it-works" (35-50 words): How you work.
  Must mention: voice or text input, 14 analytical lenses working simultaneously, name at least 2 specific frameworks (NVC, attachment theory, cognitive distortions, conflict styles).

"context-modes" (35-50 words): Different relationships need different analysis.
  Must mention: intimate partners need attachment theory/Gottman, coworkers need psychological safety, six modes with different lens combinations.

"two-modes" (35-50 words): Two ways to use Parallax.
  Must mention: in-person (voice-first, AI conductor, live issue scoreboard) and remote (split screens, NVC analysis on every message).

"the-door" (15-25 words): Brief warm invitation to start.
  Must mention: start a session, or ask me anything. Keep it short and inviting.

RESPOND WITH ONLY:
{"problem":"...","how-it-works":"...","context-modes":"...","two-modes":"...","the-door":"..."}`
}

export const NARRATION_SCRIPT: NarrationStep[] = [
  {
    id: 'greeting',
    type: 'api',
    // text is dynamically replaced by getIntroPrompt() in the narration controller
    text: '',
    delayAfterMs: 1200,
  },
  {
    id: 'problem',
    type: 'static',
    text: "Here's the thing. When people fight, they almost never say what they actually mean. And the help that exists \u2014 $300-an-hour mediators, six-month therapy waitlists \u2014 most people never get there. So they just keep hurting each other with the same words, over and over.",
    revealsSection: 'the-problem',
    delayAfterMs: 1000,
  },
  {
    id: 'how-it-works',
    type: 'static',
    text: "That's where I come in. You talk \u2014 by voice or by typing \u2014 and I listen through 14 analytical lenses. Nonviolent Communication, attachment theory, cognitive distortions, conflict styles. I hear what's underneath.",
    revealsSection: 'how-it-works',
    delayAfterMs: 1000,
  },
  {
    id: 'what-you-see',
    type: 'static',
    text: "Watch this. A single message goes in, and the raw words dissolve. What comes back is the subtext, the blind spots, the unmet needs \u2014 and a translation the other person could actually hear. Take a moment. Read what Parallax sees.",
    revealsSection: 'what-you-see',
    delayAfterMs: 7000,
  },
  {
    id: 'context-modes',
    type: 'static',
    text: "And I don't treat every conversation the same. Intimate partners need attachment theory and Gottman's research. Coworkers need psychological safety and power dynamics. I have six modes \u2014 each one activates a different combination of lenses.",
    revealsSection: 'context-modes',
    delayAfterMs: 1000,
  },
  {
    id: 'two-modes',
    type: 'static',
    text: "You can use me two ways. Sit together in the same room \u2014 I'll guide the conversation with voice and track your issues live. Or connect remotely \u2014 each on your own screen, with my analysis on every message.",
    revealsSection: 'two-modes',
    delayAfterMs: 1000,
  },
  {
    id: 'the-door',
    type: 'static',
    text: "That's me. When you're ready, start a session below \u2014 or ask me anything. I'm here.",
    revealsSection: 'the-door',
    delayAfterMs: 400,
  },
]
