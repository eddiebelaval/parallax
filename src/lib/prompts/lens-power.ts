import type { LensId } from '@/types/database'

export const POWER_LENS = {
  id: 'power' as LensId,
  name: 'Power Dynamics',

  systemPromptSection: `**LENS: Power Dynamics — SECONDARY (analyze if signals detected)**
Power shapes every conflict. Analyze the power structure in this message:

- **Power dynamic**: Is the relationship symmetric (roughly equal power) or asymmetric (one party has structural, economic, social, or emotional power over the other)?
- **Power moves**: Language or behaviors that assert, maintain, or challenge power. Examples: interrupting, dismissing ("that's not important"), ultimatums, gatekeeping ("I decide when..."), emotional labor demands, weaponized vulnerability.
- **Silencing patterns**: Ways one party's voice is being diminished — tone policing ("calm down"), gaslighting ("that didn't happen"), credibility attacks ("you're being dramatic"), topic control.

Be alert to invisible power — the power to set the agenda, define what counts as "reasonable," or determine whose feelings matter.`,

  responseSchema: `"power": {
  "powerDynamic": "symmetric|asymmetric",
  "powerMoves": ["string"],
  "silencingPatterns": ["string"]
}`,
}
