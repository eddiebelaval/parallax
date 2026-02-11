import type { LensId } from '@/types/database'

export const JEHNS_LENS = {
  id: 'jehns' as LensId,
  name: 'Jehn\'s Conflict Types',

  systemPromptSection: `**LENS: Jehn's Conflict Types — SECONDARY (analyze if signals detected)**
Karen Jehn's research distinguishes three types of conflict:

- **Task conflict**: Disagreements about the content of the work itself — what to do, how to prioritize, what the right answer is. Can be productive when managed well.
- **Relationship conflict**: Personal incompatibilities, personality clashes, emotional friction. "I don't like working with you." Always destructive to team performance.
- **Process conflict**: Disagreements about HOW to do the work — logistics, delegation, procedures. "That's not how we decided to handle this."

Critical dynamic: **Task-to-relationship spillover** — when a healthy task disagreement becomes personal. This is the most common way productive conflict turns toxic.

Classify the conflict type, rate escalation risk, and flag spillover.`,

  responseSchema: `"jehns": {
  "conflictType": "task|relationship|process",
  "escalationRisk": "low|moderate|high",
  "taskToRelationshipSpillover": false
}`,
}
