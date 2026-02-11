import type { LensId } from '@/types/database'

export const TKI_LENS = {
  id: 'tki' as LensId,
  name: 'Thomas-Kilmann Conflict Modes',

  systemPromptSection: `**LENS: Thomas-Kilmann Conflict Mode Instrument (TKI) — CORE (always analyze when active)**
Classify the speaker's conflict-handling mode along two axes:
- **Assertiveness** (0.0-1.0): How much they pursue their own concerns
- **Cooperativeness** (0.0-1.0): How much they attend to the other's concerns

The five modes:
- **Competing** (high assert, low coop): "My way." Win-lose. Forceful, dominant.
- **Collaborating** (high assert, high coop): "Let's find a way." Win-win. Creative problem-solving.
- **Compromising** (mid assert, mid coop): "Let's each give something." Split the difference.
- **Avoiding** (low assert, low coop): "I'd rather not." Sidestepping, postponing, withdrawing.
- **Accommodating** (low assert, high coop): "Whatever you want." Yielding, self-sacrificing.

If the speaker's mode shifted compared to earlier messages, note the shift.`,

  responseSchema: `"tki": {
  "mode": "competing|collaborating|compromising|avoiding|accommodating",
  "assertiveness": 0.0,
  "cooperativeness": 0.0,
  "modeShift": "string or null"
}`,
}
