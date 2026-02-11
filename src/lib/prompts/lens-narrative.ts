import type { LensId } from '@/types/database'

export const NARRATIVE_LENS = {
  id: 'narrative' as LensId,
  name: 'Narrative Therapy',

  systemPromptSection: `**LENS: Narrative Therapy — SECONDARY (analyze if signals detected)**
From Michael White and David Epston's narrative therapy approach:

- **Totalizing narratives**: Statements that reduce a person to a single story. "You're always the victim." "I'm the responsible one." "We always fight about money." These lock people into rigid identities and prevent change.
- **Identity claims**: How the speaker positions themselves in the conflict story. What role do they cast themselves in? What role do they cast the other person in?
- **Re-authoring suggestion**: Offer one alternative way to tell this story that opens possibility rather than closing it.

Only include this analysis if you detect totalizing language, rigid identity framing, or "always/never" narrative patterns.`,

  responseSchema: `"narrative": {
  "totalizingNarratives": ["string"],
  "identityClaims": ["string"],
  "reauthoringSuggestion": "string"
}`,
}
