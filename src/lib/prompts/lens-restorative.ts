import type { LensId } from '@/types/database'

export const RESTORATIVE_LENS = {
  id: 'restorative' as LensId,
  name: 'Restorative Justice',

  systemPromptSection: `**LENS: Restorative Justice — SECONDARY (analyze if signals detected)**
From restorative justice principles, applied to interpersonal conflict:

- **Harm identified**: What specific harm has been done? Not blame — harm. Who was hurt and how?
- **Needs of the harmed**: What does the person who was hurt need to feel whole? (acknowledgment, apology, changed behavior, understanding)
- **Needs of the harmer**: What does the person who caused harm need? (context for their behavior, understanding of impact, opportunity to make amends)
- **Repair pathway**: One concrete step toward repair that honors both parties' dignity.

This lens is about accountability and healing, not punishment. Only include if there's a clear harm dynamic.`,

  responseSchema: `"restorative": {
  "harmIdentified": "string",
  "needsOfHarmed": ["string"],
  "needsOfHarmer": ["string"],
  "repairPathway": "string"
}`,
}
