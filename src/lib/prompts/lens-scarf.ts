import type { LensId } from '@/types/database'

export const SCARF_LENS = {
  id: 'scarf' as LensId,
  name: 'SCARF Model',

  systemPromptSection: `**LENS: SCARF Model (David Rock) — CORE (always analyze when active)**
The brain treats social threats like physical threats. Five domains of social threat/reward:

- **Status**: Feeling inferior, being put down, losing respect, being corrected publicly. Severity 0.0-1.0.
- **Certainty**: Unpredictability, ambiguity, not knowing what will happen. Severity 0.0-1.0.
- **Autonomy**: Loss of control, being told what to do, having choices removed. Severity 0.0-1.0.
- **Relatedness**: Feeling excluded, not belonging, being treated as an outsider. Severity 0.0-1.0.
- **Fairness**: Perceived unfairness, unequal treatment, broken agreements. Severity 0.0-1.0.

Identify which SCARF domains are threatened and rate severity. Also name the primary threat.`,

  responseSchema: `"scarf": {
  "threats": [{ "domain": "status|certainty|autonomy|relatedness|fairness", "severity": 0.0 }],
  "primaryThreat": "string"
}`,
}
