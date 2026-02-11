# Parallax — Claude Code Context

## What Is This
Real-time two-person conflict resolution powered by Claude. Built for the Claude Code Hackathon (Feb 10-16, 2026).

Two people in conflict sit at the same device (or connect via room code). They take turns expressing themselves — via text or voice. Claude Opus analyzes each message through the lens of Nonviolent Communication (NVC), surfacing subtext, blind spots, unmet needs, and a translated "what they actually mean." A visual transformation ("The Melt") dissolves raw emotion into structured understanding.

## Tech Stack
- **Next.js 16** — App Router, TypeScript strict mode
- **Supabase** — Postgres + Realtime subscriptions
- **Claude Opus** — NVC mediation analysis (streaming)
- **Tailwind CSS v4** — Ember design system tokens
- **Vercel** — Deployment
- **Web Speech API** — Voice input (Chrome)

## Design System: Ember (NOT id8Labs White Paper)

**IMPORTANT:** The parent `id8/CLAUDE.md` defines a monochromatic "White Paper Edition" design. **IGNORE THAT.** Parallax uses the Ember design system — warm, alive, amber-toned.

### Core Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--ember-black` | `#0a0806` | Main background (warm near-black) |
| `--ember-white` | `#f0ebe4` | Main text (warm near-white) |
| `--ember-50`–`--ember-950` | warm neutrals | 11-step scale with amber/brown undertones (NEVER cool/blue grays) |
| `--ember-orange` | `#ef6f2e` | Primary accent — buttons, links, interactive |
| `--ember-amber` | `#f59e0b` | Secondary accent — highlights, warnings |
| `--ember-teal` | `#4ecdc4` | Success — connection, cool temperature, NVC translations |

### Temperature Colors (Conversation Heat)
| Temperature | Color | Meaning |
|------------|-------|---------|
| Hot (0.8-1.0) | `#ef4444` | High emotional charge |
| Warm (0.5-0.7) | `#f59e0b` | Moderate tension |
| Cool (0.2-0.4) | `#4ecdc4` | Calming down |
| Neutral (0.0-0.1) | `#f0ebe4` | Balanced |

### Typography
- **Headings:** Source Serif 4, weight 400, `letter-spacing: -0.02em` (serif = warmth)
- **Body:** Source Sans 3, weight 400, `line-height: 1.6`
- **Mono:** IBM Plex Mono for labels, codes, indicators, section markers

### Tailwind Token Usage
Use `ember-*` classes: `text-ember-400`, `bg-ember-600`, `border-ember-800`, `text-ember-teal`, etc.
Semantic tokens also available: `bg-background`, `text-foreground`, `text-muted`, `bg-surface`, `border-border`, `text-accent`, `text-success`.

### Special Effects
- **Backlit glow**: `.backlit` + `.backlit-hot` / `.backlit-warm` / `.backlit-cool` / `.backlit-accent` — subtle radial gradient `::before` at 12% opacity
- **Ambient backgrounds**: `.ambient-warm` / `.ambient-cool` — full-section atmospheric radial gradients at 4% opacity
- **Section indicators**: orange dot + uppercase monospace label (`.section-indicator` class)

### Rules
- NO shadows
- NO heavy gradients (backlit glow is the only exception — subtle, purpose-driven)
- Animations: staggered fadeSlideUp (`.hero-stagger`), scroll reveals (`.scroll-reveal`), The Melt dissolve/crystallize

## Architecture

```
src/
  app/
    page.tsx                         # Landing page (mode selection, join)
    globals.css                      # Ember design system tokens + animations
    layout.tsx                       # Root layout (fonts, header)
    session/[code]/page.tsx          # Main session view
    api/
      sessions/route.ts              # Create session
      sessions/[code]/route.ts       # Get/join session
      sessions/[code]/join/route.ts  # Join session
      sessions/[code]/end/route.ts   # End session
      sessions/[code]/onboarding/route.ts  # In-person onboarding state machine
      sessions/[code]/summary/route.ts     # Session summary generation
      messages/route.ts              # Send message
      mediate/route.ts               # Claude Opus NVC analysis (streaming)
      issues/analyze/route.ts        # Issue extraction + grading
  components/
    SessionView.tsx                  # Mode branch: remote vs in-person
    MessageCard.tsx                  # Message with NVC analysis + The Melt
    MessageInput.tsx                 # Text input bar
    MessageArea.tsx                  # Message list + SignalRail
    VoiceInput.tsx                   # Web Speech API voice input
    TheMelt.tsx                      # Core dissolve → crystallize animation
    SignalRail.tsx                   # Temperature timeline
    PersonPanel.tsx                  # Remote mode: per-person panel
    NameEntry.tsx                    # Name input for remote joining
    SessionSummary.tsx               # End-of-session summary
    inperson/
      OnboardingFlow.tsx             # 3-step guided onboarding
      XRayView.tsx                   # Main in-person orchestrator
      XRayScoreboard.tsx             # Two-column issue board
      IssueCard.tsx                  # Single issue with status color
      ActiveSpeakerBar.tsx           # Turn indicator + input
  hooks/
    useSession.ts
    useMessages.ts
    useIssues.ts                     # Issues Realtime hook
  lib/
    supabase.ts                      # Client setup
    opus.ts                          # Claude API wrapper
    prompts.ts                       # NVC system prompt (core IP)
    room-code.ts                     # 6-char code generator
  types/
    database.ts                      # Session, Message, Issue, OnboardingStep types
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
