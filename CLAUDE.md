# Parallax — Claude Code Context

## What Is This
Real-time two-person conflict resolution powered by Claude. Built for the Claude Code Hackathon (Feb 10-16, 2026).

Two people in conflict sit at the same device (or connect via room code). They take turns expressing themselves — via text or voice. Claude Opus analyzes each message through the lens of Nonviolent Communication (NVC), surfacing subtext, blind spots, unmet needs, and a translated "what they actually mean." A visual transformation ("The Melt") dissolves raw emotion into structured understanding.

## Tech Stack
- **Next.js 16** — App Router, TypeScript strict mode
- **Supabase** — Postgres + Realtime subscriptions
- **Claude Opus** — NVC mediation analysis (streaming)
- **Tailwind CSS v4** — Ember design system tokens
- **Web Audio API** — Real-time microphone waveform visualization
- **Vercel** — Deployment
- **Web Speech API** — Voice input (Chrome)

## Design System: Ember

### Philosophy
**Light = Data.** Glow color and intensity encode emotional temperature. The design is warm, organic, and intentionally imperfect — deep chocolate dark mode, warm parchment light mode, earthy tones throughout. No cold blues, no clinical whites.

### Colors — Dark Mode (Default)
| Token | Value | Usage |
|-------|-------|-------|
| `--ember-dark` | `#0f0b08` | Page background (deep chocolate) |
| `--ember-surface` | `#1a1410` | Card surfaces, elevated areas |
| `--ember-elevated` | `#261e16` | Hover states, raised surfaces |
| `--ember-border` | `#3a2e22` | Borders, dividers |
| `--ember-muted` | `#7a6c58` | Muted text, placeholders |
| `--ember-text` | `#c9b9a3` | Body text |
| `--ember-heading` | `#ebe1d4` | Headings, primary text |

### Colors — Light Mode (`.light` class on `<html>`)
| Token | Value | Usage |
|-------|-------|-------|
| `--ember-dark` | `#f5efe6` | Page background (warm parchment) |
| `--foreground` | `#1e1810` | Primary text |
| Accents deepened ~15% for WCAG contrast |

### Temperature Colors
| Temperature | Color | Meaning | Glow Var |
|------------|-------|---------|----------|
| Hot (0.8-1.0) | `#c45c3c` | High emotional charge | `--glow-hot` |
| Warm (0.5-0.7) | `#d4a040` | Moderate tension, primary accent | `--glow-warm` |
| Cool (0.2-0.4) | `#6aab8e` | Calming, Claude/NVC | `--glow-cool` |
| Neutral (0.0-0.1) | `#ebe1d4` | Balanced | (no glow) |

### Typography
- **Headings:** Source Serif 4 — weight 400, `letter-spacing: -0.02em`
- **Body:** Source Sans 3 — clean, readable
- **Labels/Mono:** IBM Plex Mono — uppercase, tracking-wider for indicators
- All loaded via `next/font/google` with CSS variables

### Backlit Glow System
CSS classes for temperature-reactive borders. Glow radiates **outward** (away from text, into the left margin) using `radial-gradient(ellipse at right center, ...)` with `border-radius: 50% 0 0 50%` and `filter: blur()`.

| Class | Effect |
|-------|--------|
| `backlit backlit-hot` | Soft rust glow outward |
| `backlit backlit-warm` | Soft amber glow outward |
| `backlit backlit-cool` | Soft teal glow outward |
| `backlit backlit-hot-strong` | Intense rust glow (latest message) |
| `ambient-glow ambient-hot` | Subtle background pool |

### Orb Waveform System
Each participant gets an SVG orb with a real-time waveform driven by the Web Audio API.

**Architecture:**
- `useAudioAnalyser` hook — manages mic → AudioContext → AnalyserNode → Float32Array waveform data at 60fps
- `AudioWaveformOrb` component — downsamples 1024 points to 12 bezier control points, renders SVG path
- Falls back to CSS `orb-idle` animation when mic unavailable

**Roles → Colors:**
- Person A: `--temp-warm` (#d4a040)
- Person B: `--temp-hot` (#c45c3c)
- Claude: `--temp-cool` (#6aab8e) — always teal

### Rules
- Rounded corners (`rounded`) on interactive elements for organic feel
- NO cool/blue grays — always warm (brownish) neutrals
- Gradients and glow are INFORMATIONAL (encode temperature data), never decorative
- Section indicators: accent dot + uppercase monospace label

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
    AudioWaveformOrb.tsx        # Real-time SVG waveform orb per participant
    SessionLobby.tsx
    SessionView.tsx
    MessageCard.tsx             # Backlit glow borders + NVC analysis reveal
    MessageInput.tsx
    VoiceInput.tsx
    TheMelt.tsx                 # Core animation
    SignalRail.tsx              # Temperature timeline with glow
    WaitingState.tsx
  hooks/
    useSession.ts
    useMessages.ts
    useVoiceInput.ts
    useAudioAnalyser.ts         # Web Audio API mic → waveform data
  lib/
    supabase.ts                # Client setup
    opus.ts                    # Claude API wrapper
    prompts.ts                 # NVC system prompt (core IP)
    room-code.ts               # 6-char code generator
    temperature.ts             # Color + glow class mapping
```

## Branch Protocol
- Work on `parallax/stage-{N}-{name}` or `parallax/{feature}` branches
- Never commit to `main` directly
- Merge via PR at each stage gate

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```
