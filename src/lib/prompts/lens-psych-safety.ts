import type { LensId } from '@/types/database'

export const PSYCH_SAFETY_LENS = {
  id: 'psychSafety' as LensId,
  name: 'Psychological Safety',

  systemPromptSection: `**LENS: Psychological Safety (Amy Edmondson) — SECONDARY (analyze if signals detected)**
Psychological safety is the shared belief that the team is safe for interpersonal risk-taking.

- **Safety level**: high (speaks freely, admits mistakes), moderate (some hedging, careful phrasing), low (guarded, defensive, self-censoring).
- **Risk signals**: Signs of low safety — hedging language ("I might be wrong but..."), apologies before opinions, over-qualifying, silence on important topics.
- **Silenced topics**: What isn't being said? What feels off-limits? What topics does the speaker seem to dance around?

Only include if you detect signals of safety concern in communication.`,

  responseSchema: `"psychSafety": {
  "safetyLevel": "high|moderate|low",
  "riskSignals": ["string"],
  "silencedTopics": ["string"]
}`,
}
