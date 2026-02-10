# Parallax

> See the conversation you're actually having.

Real-time conflict resolution powered by Claude. Two people take turns expressing themselves — via text or voice — and Claude surfaces the subtext, blind spots, and unmet needs beneath every message. Professional mediation costs $300-500/hr. Parallax makes it accessible to everyone.

**Live:** [parallax-ebon-three.vercel.app](https://parallax-ebon-three.vercel.app)

---

## How It Works

1. **Start a session** — One person creates a room. The other joins with a 6-character code.
2. **Take turns speaking** — Type or hold-to-speak. Turn-based messaging prevents talking over each other (the core problem in conflict).
3. **Claude analyzes** — Each message passes through a dual-lens NVC (Nonviolent Communication) analysis. A visual transformation ("The Melt") dissolves raw emotion into structured understanding.
4. **See what's beneath** — Expand any message to reveal subtext, blind spots, unmet needs, and a translated version that could actually be heard.

## The NVC Lens

Every message is analyzed through two lenses:

**Classic NVC** (Marshall Rosenberg) — Observation, Feeling, Need, Request. Four decades of conflict resolution research, structured for AI.

**Beneath the Surface** (Parallax) — Subtext (what they're really saying), Blind Spots (what the speaker can't see), Unmet Needs (labeled), NVC Translation (the message rewritten so it lands), and Emotional Temperature (0.0-1.0 scale).

The temperature drives the UI: cool teal for calm messages, warm amber for tension, hot red for high charge. A Signal Rail alongside the conversation paints the emotional arc over time.

## Architecture

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16 (App Router, TypeScript strict) | Server components, Turbopack |
| Realtime | Supabase Postgres + Realtime subscriptions | Both sides see analysis instantly without polling |
| AI | Claude Opus (non-streaming, fire-and-forget) | Multi-pass NVC analysis returning structured JSON |
| Animation | CSS custom properties + Knuth hash particles | GPU-accelerated, deterministic (no hydration mismatch) |
| Voice | Web Speech API (Chrome) | Push-to-talk, SSR-safe detection |
| Deploy | Vercel | Auto-deploy on merge |

**Mediation pipeline:** User sends message -> fire-and-forget POST to `/api/mediate` -> Claude analyzes through both lenses -> patches Supabase row -> Realtime pushes UPDATE to both sides -> UI re-renders with temperature colors and expandable analysis. Simple. No streaming, no SSE, no partial JSON parsing.

## The Build Process

Built in 6 days using the **ID8 Pipeline** — a stage-gated methodology where every stage has a hard gate question that must be answered before advancing. The git log reads as a build narrative:

| Stage | What We Built | Gate |
|-------|--------------|------|
| 4: Foundation | Supabase schema, Realtime messaging, split-screen, turn logic | Two tabs can chat in real-time |
| 5a: Opus Engine | Dual-lens NVC prompt (core IP), mediation pipeline, temperature UI | Claude analyzes and UI renders analysis |
| 5b: The Melt | 3-phase animation (dissolve/crystallize/settled), Signal Rail | Animation plays on new analysis |
| 5c: Voice + Flow | Push-to-talk, session summary, end session flow | Full conversation lifecycle works |
| 6+8: Polish | Error handling, PersonPanel extraction, landing page, mobile responsive | Nothing breaks with stupid input |

Full build journal with decisions and reasoning: [`BUILDING.md`](./BUILDING.md)

Interactive artifacts (open in browser):
| Artifact | What It Shows |
|----------|---------------|
| [`parallax-blueprint.html`](./artifacts/parallax-blueprint.html) | Full build plan — phases, parallel batches, dependency graph |
| [`parallax-stage-mode-blueprint.html`](./artifacts/parallax-stage-mode-blueprint.html) | Stage Mode expansion vision — X-ray scoreboard concept |
| [`id8pipeline-sdk-architecture.html`](./artifacts/id8pipeline-sdk-architecture.html) | Pipeline methodology mapped to Claude Code SDK features |
| [`claude-code-hackathon-kickoff-transcript.html`](./artifacts/claude-code-hackathon-kickoff-transcript.html) | Hackathon kickoff session — judging criteria, north star |

## Getting Started

```bash
git clone https://github.com/eddiebelaval/parallax.git
cd parallax
npm install
cp .env.example .env.local
# Fill in Supabase + Anthropic API keys
npm run dev
```

Requires: Node 20+, a Supabase project with `sessions` and `messages` tables, an Anthropic API key with Claude Opus access.

## Design System

Factory-inspired: near-black `#020202`, near-white `#eeeeee`, warm neutral grays, orange `#ef6f2e` accent. Geist + Geist Mono fonts. No shadows, no gradients, no glow. Temperature colors: teal (cool) -> amber (warm) -> red (hot).

## License

MIT

---

*Built by Eddie Belaval ([id8Labs](https://id8labs.app)) for the Claude Code Hackathon, Feb 10-16, 2026.*
