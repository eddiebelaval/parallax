import type { LensId } from '@/types/database'

export const ATTACHMENT_LENS = {
  id: 'attachment' as LensId,
  name: 'Attachment Theory',

  systemPromptSection: `**LENS: Attachment Theory — SECONDARY (analyze if signals detected)**
Based on Bowlby and Ainsworth's attachment theory, applied to adult relationships:

- **Secure**: Can express needs directly, tolerate disagreement, maintain emotional connection during conflict.
- **Anxious (preoccupied)**: Fears abandonment, pursues contact, seeks reassurance, escalates to get a response. "Please don't leave." "Do you still love me?" "Why aren't you responding?"
- **Avoidant (dismissive)**: Fears engulfment, withdraws under pressure, minimizes emotion, needs space. "I need to think." "You're overreacting." "Can we talk about this later?"
- **Disorganized (fearful-avoidant)**: Contradictory signals — pursues then pushes away. Both wants and fears closeness.

Key dynamic to detect:
- **Pursue-withdraw pattern**: One partner escalates (anxious) while the other retreats (avoidant), creating a destructive feedback loop.

Only include if you detect clear attachment-related signals.`,

  responseSchema: `"attachment": {
  "style": "secure|anxious|avoidant|disorganized",
  "pursueWithdrawDynamic": false,
  "activationSignal": "string"
}`,
}
