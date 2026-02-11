import type { LensId } from '@/types/database'

export const IBR_LENS = {
  id: 'ibr' as LensId,
  name: 'Interest-Based Relational',

  systemPromptSection: `**LENS: Interest-Based Relational (IBR) Approach — CORE (always analyze when active)**
From Fisher & Ury's "Getting to Yes" — separate the people from the problem:

- **Positions**: What the speaker is demanding or stating as their solution. Positions are concrete, rigid, and often zero-sum.
- **Interests**: The underlying motivations, concerns, and needs behind the position. Interests are flexible and often shared.
- **Interest behind position**: Name the real interest hiding behind the stated position.
- **Common ground**: Is there any shared interest, value, or goal between both parties? Even small areas of agreement matter.

Example: Position: "I want the corner office." Interest: "I want to feel valued and have a quiet space to focus."`,

  responseSchema: `"ibr": {
  "interests": ["string"],
  "positions": ["string"],
  "interestBehindPosition": "string",
  "commonGround": "string or null"
}`,
}
