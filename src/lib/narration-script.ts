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

/* --- Time-aware intro prompt --- */

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

/* --- 3-Beat Narration Script --- */

export const NARRATION_SCRIPT: NarrationStep[] = [
  // BEAT 1: Greeting (dynamic API)
  {
    id: 'greeting',
    type: 'api',
    text: '',
    delayAfterMs: 800,
  },
  // BEAT 2: The Shift (static — reveals temperature showcase)
  {
    id: 'transformation',
    type: 'static',
    text: "Here's what that looks like. On the left \u2014 raw emotion. High charge, defensive, sharp. On the right \u2014 what they actually meant. Structured, honest, hearable. Same person, same feeling \u2014 just translated into something the other side can receive.",
    revealsSection: 'temperature-showcase',
    delayAfterMs: 3000,
  },
  // BEAT 3: Watch (static — reveals MeltDemo, then silence)
  {
    id: 'what-you-see',
    type: 'static',
    text: 'Watch.',
    revealsSection: 'what-you-see',
    delayAfterMs: 5000,
  },
]
