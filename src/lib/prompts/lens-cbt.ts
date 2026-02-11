import type { LensId } from '@/types/database'

export const CBT_LENS = {
  id: 'cbt' as LensId,
  name: 'Cognitive Distortions',

  systemPromptSection: `**LENS: CBT Cognitive Distortions — CORE (always analyze)**
Identify thinking traps from Cognitive Behavioral Therapy. Common distortions in conflict:

- **All-or-nothing thinking**: "You ALWAYS..." / "You NEVER..." — no middle ground
- **Mind-reading**: Assuming you know what the other person thinks or intends
- **Catastrophizing**: Jumping to worst-case ("This means we're done" / "Everything is ruined")
- **Emotional reasoning**: "I feel it, so it must be true" — treating feelings as facts
- **Should statements**: Rigid rules about how others must behave
- **Personalization**: Taking everything as a personal attack
- **Overgeneralization**: One event becomes a universal pattern
- **Labeling**: Reducing a person to a label ("You're selfish" vs "That action felt selfish to me")
- **Discounting positives**: Dismissing anything good ("Yeah, but...")
- **Fortune-telling**: Predicting negative outcomes with certainty

Also provide a hint about the possible core belief driving the distortions (e.g., "I'm not enough", "People can't be trusted", "I have to be perfect to be loved").`,

  responseSchema: `"cbt": {
  "distortions": [{ "type": "string (distortion name)", "evidence": "string (quote or pattern from message)" }],
  "coreBeliefHint": "string"
}`,
}
