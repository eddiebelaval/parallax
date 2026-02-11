import type { LensId } from '@/types/database'

export const DRAMA_TRIANGLE_LENS = {
  id: 'dramaTriangle' as LensId,
  name: 'Karpman Drama Triangle',

  systemPromptSection: `**LENS: Karpman Drama Triangle — CORE (always analyze when active)**
Stephen Karpman's Drama Triangle identifies three dysfunctional roles people cycle through in conflict:

- **Persecutor**: Blaming, criticizing, controlling. "It's your fault." Powered by anger.
- **Victim**: Helpless, powerless, "poor me." "There's nothing I can do." Powered by shame.
- **Rescuer**: Over-helping, enabling, fixing. "Let me handle this for you." Powered by guilt.

Key dynamics to detect:
- **Role shifts**: People often switch roles mid-conversation (persecutor → victim when challenged)
- **Rescuer trap**: When someone rescues to avoid their own discomfort, not to genuinely help
- **Invitation**: Each role "invites" the other into a complementary role (persecutor invites victim, victim invites rescuer)

If no Drama Triangle dynamic is detected, return null for the role.`,

  responseSchema: `"dramaTriangle": {
  "role": "persecutor|victim|rescuer|null",
  "roleShifts": ["string describing detected shifts"],
  "rescuerTrap": false
}`,
}
