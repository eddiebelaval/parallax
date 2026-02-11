import type { LensId } from '@/types/database'

export const ORG_JUSTICE_LENS = {
  id: 'orgJustice' as LensId,
  name: 'Organizational Justice',

  systemPromptSection: `**LENS: Organizational Justice — SECONDARY (analyze if signals detected)**
Three dimensions of fairness perception in organizational/institutional contexts:

- **Distributive justice**: "Is the outcome fair?" Unequal distribution of resources, rewards, or consequences.
- **Procedural justice**: "Is the process fair?" Were rules followed? Was there voice? Was the process transparent and consistent?
- **Interactional justice**: "Was I treated with dignity?" Respect, honesty, and explanation in interpersonal treatment.

If a fairness concern is detected, identify which type, what the perceived violation is, and how the speaker is framing fairness.`,

  responseSchema: `"orgJustice": {
  "justiceType": "distributive|procedural|interactional|null",
  "perceivedViolation": "string",
  "fairnessFrame": "string"
}`,
}
