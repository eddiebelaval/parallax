# Parallax — Claude Code Context

## What Is This
Real-time two-person conflict resolution powered by Claude. Built for the Claude Code Hackathon (Feb 10-16, 2026).

Two people in conflict sit at the same device (or connect via room code). They take turns expressing themselves — via text or voice. Claude Opus analyzes each message through the lens of Nonviolent Communication (NVC), surfacing subtext, blind spots, unmet needs, and a translated "what they actually mean." A visual transformation ("The Melt") dissolves raw emotion into structured understanding.

## Tech Stack
- **Next.js 16** — App Router, TypeScript strict mode
- **Supabase** — Postgres + Realtime subscriptions
- **Claude Opus** — NVC mediation analysis (streaming)
- **Tailwind CSS v4** — Factory design system tokens
- **Vercel** — Deployment
- **Web Speech API** — Voice input (Chrome)

## Design System: Factory-Inspired (NOT id8Labs White Paper)

**IMPORTANT:** The parent `id8/CLAUDE.md` defines a monochromatic "White Paper Edition" design. **IGNORE THAT.** Parallax uses the Factory-Inspired design system.

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#020202` | Main background (near-black, not pure black) |
| `--text-primary` | `#eeeeee` | Main text (near-white, not pure white) |
| `--gray-warm-*` | brownish grays | Borders, secondary text (NEVER cool/blue grays) |
| `--accent-primary` | `#ef6f2e` | Orange — buttons, links, interactive elements |
| `--accent-secondary` | `#f59e0b` | Amber — highlights, warnings |
| `--accent-success` | `#4ecdc4` | Teal — success states, cool temperature |

### Temperature Colors (Conversation Heat)
| Temperature | Color | Meaning |
|------------|-------|---------|
| Hot (0.8-1.0) | `#ef4444` | High emotional charge |
| Warm (0.5-0.7) | `#f59e0b` | Moderate tension |
| Cool (0.2-0.4) | `#4ecdc4` | Calming down |
| Neutral (0.0-0.1) | `#eeeeee` | Balanced |

### Typography
- **Font:** Geist + Geist Mono (system fallbacks: -apple-system, BlinkMacSystemFont, sans-serif)
- **Headings:** font-weight 400 (light!) with `letter-spacing: -0.02em`
- **Body:** font-weight 400, `line-height: 1.6`
- **Mono:** Geist Mono for labels, codes, indicators

### Rules
- NO shadows
- NO gradients
- NO glow effects
- Section indicators: orange dot + uppercase monospace label

## Architecture

```
src/
  app/
    page.tsx                    # Session lobby (create/join)
    session/[code]/page.tsx     # Main session view
    api/
      sessions/route.ts         # Create session
      sessions/[code]/route.ts  # Get/join session
      messages/route.ts         # Send message
      mediate/route.ts          # Claude Opus NVC analysis (streaming)
  components/
    SessionLobby.tsx
    SessionView.tsx
    MessageCard.tsx
    MessageInput.tsx
    VoiceInput.tsx
    TheMelt.tsx                 # Core animation
    SignalRail.tsx              # Temperature timeline
    WaitingState.tsx
  hooks/
    useSession.ts
    useMessages.ts
    useVoiceInput.ts
  lib/
    supabase.ts                # Client setup
    opus.ts                    # Claude API wrapper
    prompts.ts                 # NVC system prompt (core IP)
    room-code.ts               # 6-char code generator
```

## Branch Protocol
- Work on `parallax/stage-{N}-{name}` branches
- Never commit to `main` directly
- Squash merge via PR at each stage gate

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```
