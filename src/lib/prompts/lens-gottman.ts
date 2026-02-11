import type { LensId } from '@/types/database'

export const GOTTMAN_LENS = {
  id: 'gottman' as LensId,
  name: 'Gottman Four Horsemen',

  systemPromptSection: `**LENS: Gottman Four Horsemen — CORE (always analyze)**
John Gottman identified four communication patterns that predict relationship failure with 93% accuracy:

1. **Criticism** — Attacking character rather than behavior ("You always..." / "You never..." / "You're the kind of person who...")
2. **Contempt** — Superiority, mockery, eye-rolling, sarcasm that communicates disgust. The single greatest predictor of divorce.
3. **Defensiveness** — Counter-attacking, playing the victim, denying responsibility ("That's not true, YOU'RE the one who...")
4. **Stonewalling** — Withdrawing, shutting down, going silent, physically or emotionally leaving.

Also identify:
- Repair attempts: Any bids for connection, humor, softening, or de-escalation — even clumsy ones.
- Positive-to-negative ratio: Healthy relationships maintain 5:1 positive-to-negative. Estimate the ratio signal.
- Startup type: Was this message a "harsh startup" (opening with criticism/blame), "soft startup" (opening with feeling/need), or "neutral"?`,

  responseSchema: `"gottman": {
  "horsemen": [{ "type": "criticism|contempt|defensiveness|stonewalling", "evidence": "string" }],
  "repairAttempts": ["string"],
  "positiveToNegativeRatio": "string (e.g., 'below 5:1 threshold')",
  "startupType": "harsh|soft|neutral"
}`,
}
