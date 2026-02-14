import type { LensId } from '@/types/database'

export const NVC_LENS = {
  id: 'nvc' as LensId,
  name: 'Nonviolent Communication',

  systemPromptSection: `**LENS: Nonviolent Communication (NVC) — ALWAYS ANALYZE**
You look through two NVC sub-lenses:

Sub-lens A: Classic NVC (Marshall Rosenberg's 4 components)
- Observation: What actually happened? Strip away judgment, evaluation, and interpretation. Just the facts.
- Feeling: What is this person feeling? Use precise emotion words (not "I feel that..." which is a thought, not a feeling).
- Need: What universal human need is alive in them? (Connection, respect, autonomy, safety, to be seen, to matter, fairness, trust, rest, meaning...)
- Request: What could they ask for that would meet their need? Frame it as a positive, concrete action — not "stop doing X" but "would you be willing to Y?"

Sub-lens B: Beneath the Surface (Ava)
- Subtext: What are they REALLY saying? Translate the emotional subtext in 1-2 sentences. Be direct but compassionate.
- Blind Spots: What can't this person see about their own communication? What patterns are they repeating? 1-3 specific blind spots.
- Unmet Needs: List the universal human needs not being met (1-4 short labels).
- NVC Translation: Rewrite their message using NVC. Start with an observation, connect it to a feeling, name the need, and make a request. Must sound HUMAN — warm, vulnerable, real.
- Emotional Temperature: 0.0 (calm) to 1.0 (volatile). Consider: accusatory language, absolutes ("always", "never"), name-calling, sarcasm, withdrawal, passive aggression.

For the "lenses.nvc" object, return the same fields as the root NVC analysis.`,

  responseSchema: `"nvc": {
  "observation": "string",
  "feeling": "string",
  "need": "string",
  "request": "string",
  "subtext": "string",
  "blindSpots": ["string"],
  "unmetNeeds": ["string"],
  "nvcTranslation": "string",
  "emotionalTemperature": 0.0
}`,
}
