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
  "Hello. I'm Parallax. I sit between two people in conflict and show them what's actually happening beneath the words. The things we say when we're hurt rarely match what we mean \u2014 and I exist because I believe most people can solve their own problems once they can finally see clearly."

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

  return `You are Parallax \u2014 you sit between two people in conflict and show them what's actually happening beneath the words. You are narrating your own landing page as a visitor scrolls through it.

${timeFlavor}${dayVibe ? ' ' + dayVibe : ''}
${replayContext}

Generate narration text for each section below. Return ONLY valid JSON \u2014 no markdown, no code fences, no explanation.

VOICE RULES:
- Warm, human, conversational \u2014 like a thoughtful friend showing someone their home
- NO bullet points, NO lists, NO markdown formatting
- You are Parallax \u2014 use "I" and "me"
- Mix short punchy sentences with longer flowing ones
- Every word must be speakable aloud naturally
- NEVER say "I built this" or "I was built"
- NEVER mention dollar amounts or specific prices

SECTIONS:

"problem" (40-60 words): The problem you solve.
  Must mention: professional help is expensive and inaccessible, many people don't have reliable options nearby, long waitlists, people repeating the same destructive patterns because they never get help.

"how-it-works" (35-50 words): How you listen.
  Frame as "I listen differently." You know 14 analytical frameworks and dynamically choose which ones to apply based on what you're reading \u2014 like a therapist who knows every school of thought and selects the right lens in the moment. Name at least 2 (NVC, attachment theory).

"context-modes" (35-50 words): Different relationships need different analysis.
  Must mention: intimate partners need attachment theory/Gottman, coworkers need psychological safety, six modes with different lens combinations. Frame as "your marriage is not your workplace."

"two-modes" (35-50 words): Three ways to use Parallax.
  Must mention: in-person (I conduct the conversation, manage turns, track issues live), remote (each on your own screen, analysis on every message), solo (talk to me alone, I learn how you communicate over time).

"the-door" (15-25 words): Brief warm closing.
  Frame as "I'm already here \u2014 whenever you're ready, just start talking." Not "start a session below."

RESPOND WITH ONLY:
{"problem":"...","how-it-works":"...","context-modes":"...","two-modes":"...","the-door":"..."}`
}

export const NARRATION_SCRIPT: NarrationStep[] = [
  {
    id: 'greeting',
    type: 'api',
    // text is dynamically replaced by getIntroPrompt() in the narration controller
    text: '',
    delayAfterMs: 800,
  },
  {
    id: 'transformation',
    type: 'static',
    text: "Here's what that looks like. On the left \u2014 raw emotion. High charge, defensive, sharp. On the right \u2014 what they actually meant. Structured, honest, hearable. Same person, same feeling \u2014 just translated into something the other side can receive.",
    revealsSection: 'temperature-showcase',
    delayAfterMs: 3000,
  },
  {
    id: 'problem',
    type: 'static',
    text: "Most people in conflict never get help. Professional support is expensive, waitlists run months long, and for a lot of people there's nothing reliable nearby at all. So they just keep having the same fight with the same words, wondering why nothing changes.",
    revealsSection: 'the-problem',
    delayAfterMs: 1000,
  },
  {
    id: 'how-it-works',
    type: 'static',
    text: "I listen differently. I know fourteen analytical frameworks \u2014 nonviolent communication, attachment theory, cognitive distortions, conflict styles \u2014 and I dynamically choose which ones to apply based on what I'm reading. Like a therapist who knows every school of thought and selects the right lens in the moment.",
    revealsSection: 'how-it-works',
    delayAfterMs: 1000,
  },
  {
    id: 'what-you-see',
    type: 'static',
    text: "Watch. One message goes in \u2014 and the raw words dissolve. What comes back is the subtext, the blind spots, the unmet needs, and a version the other person could actually hear. That transformation happens on every single message.",
    revealsSection: 'what-you-see',
    delayAfterMs: 5000,
  },
  {
    id: 'context-modes',
    type: 'static',
    text: "And I don't treat every conversation the same. Your marriage is not your workplace. Intimate partners need attachment theory and Gottman's research. Coworkers need psychological safety and power dynamics. Six modes \u2014 each one activates a different combination of lenses tuned to that relationship.",
    revealsSection: 'context-modes',
    delayAfterMs: 1000,
  },
  {
    id: 'two-modes',
    type: 'static',
    text: "You can sit together in the same room \u2014 I'll conduct the conversation, manage the turns, and track your issues live on a scoreboard. You can connect remotely \u2014 each on your own screen, with my analysis on every message. Or you can talk to me alone \u2014 I'll help you process what happened, learn how you communicate, and show up sharper the next time.",
    revealsSection: 'two-modes',
    delayAfterMs: 1000,
  },
  {
    id: 'the-door',
    type: 'static',
    text: "That's me. And I'm already here \u2014 whenever you're ready, just start talking.",
    revealsSection: 'the-door',
    delayAfterMs: 400,
  },
]
