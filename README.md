# Parallax

> See the conversation you're actually having.

Real-time conflict resolution powered by Claude. Two people take turns expressing themselves -- via text or voice -- and Claude surfaces the subtext, blind spots, and unmet needs beneath every message through **14 analytical lenses** drawn from psychology, mediation, and organizational behavior. Professional mediation costs $300-500/hr. Parallax makes it accessible to everyone.

**Live:** [parallax-ebon-three.vercel.app](https://parallax-ebon-three.vercel.app)

---

## How It Works

1. **Choose your context** -- Intimate partners? Family? Professional peers? Parallax activates different analytical frameworks depending on the relationship.
2. **Start a session** -- One person creates a room. The other joins with a 6-character code (remote) or shares a device (in-person).
3. **Take turns speaking** -- Type or hold-to-speak. Turn-based messaging prevents talking over each other (the core problem in conflict).
4. **Claude analyzes through multiple lenses** -- Each message passes through the Conflict Intelligence Engine. A visual transformation ("The Melt") dissolves raw emotion into structured understanding.
5. **See what's beneath** -- Expand any message to reveal subtext, blind spots, unmet needs, lens-specific insights, and a translated version that could actually be heard.

## V3: The Conflict Intelligence Engine

Parallax V3 moves beyond a single NVC lens to a **multi-lens analysis system** -- the same message viewed through multiple psychological and conflict resolution frameworks simultaneously.

### 14 Analytical Lenses

| Category | Lenses | What They See |
|----------|--------|---------------|
| Communication | **NVC** | Observation, feeling, need, request (Marshall Rosenberg) |
| Relational | **Gottman**, **Drama Triangle**, **Attachment** | Four Horsemen, persecutor-victim-rescuer dynamics, attachment styles |
| Cognitive | **CBT**, **Narrative** | Thinking traps, totalizing narratives, identity claims |
| Systemic | **SCARF**, **Org Justice**, **Psych Safety**, **Jehn's**, **Power** | Social threat detection, fairness violations, silencing patterns |
| Resolution | **TKI**, **IBR**, **Restorative** | Conflict-handling modes, interest-based negotiation, repair pathways |

### 6 Context Modes

Different relationships activate different lens combinations:

- **Intimate Partners** -- NVC + Gottman + CBT + Drama Triangle + Attachment + Narrative
- **Family** -- NVC + Gottman + Narrative + Drama Triangle + Attachment + Power + Restorative
- **Professional Peers** -- NVC + CBT + TKI + SCARF + Jehn's + Psych Safety
- **Professional Hierarchy** -- NVC + CBT + TKI + SCARF + Org Justice + Psych Safety + Power
- **Transactional** -- NVC + CBT + TKI + IBR + SCARF
- **Civil/Structural** -- NVC + Narrative + Power + Org Justice + Restorative + IBR

Each analysis includes a **primary insight** (one-sentence synthesis across all lenses), **overall severity** (composite 0-1 score), and **resolution direction** (escalating/stable/de-escalating).

## V4 Vision: The Strategy Arena

*Currently in backtesting framework stage.*

The Arena takes the same conversation and replays it through **different conflict resolution strategies** -- what if Claude had used Socratic questioning instead of NVC translation? What if it had prioritized emotional validation over cognitive reframing?

Each strategy produces alternative analyses and the system evaluates them against ground truth, creating a **tournament bracket for conflict resolution approaches**. The goal: empirically discover which strategies work best for which types of conflict, building a data-driven playbook for human mediation.

## Architecture

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16 (App Router, TypeScript strict) | Server components, Turbopack |
| Realtime | Supabase Postgres + Realtime subscriptions | Both sides see analysis instantly without polling |
| AI | Claude Opus 4.6 (non-streaming, fire-and-forget) | Multi-lens analysis returning structured JSON |
| Animation | CSS custom properties + Knuth hash particles | GPU-accelerated, deterministic (no hydration mismatch) |
| Voice | Web Speech API (Chrome) | Push-to-talk, SSR-safe detection |
| Deploy | Vercel | Auto-deploy on merge |

**Mediation pipeline:** User sends message -> fire-and-forget POST to `/api/mediate` -> fetch session's `context_mode` -> build lens-specific system prompt -> Claude analyzes through all active lenses -> parse into typed `ConflictAnalysis` -> patch Supabase row -> Realtime pushes UPDATE to both sides -> UI renders `LensBar` + temperature colors + expandable analysis. No streaming, no SSE, no partial JSON parsing.

## The Build Process

Built using the **ID8 Pipeline** -- a stage-gated methodology where every stage has a hard gate question that must be answered before advancing. The git log reads as a build narrative:

| Stage | What We Built | Gate |
|-------|--------------|------|
| 4: Foundation | Supabase schema, Realtime messaging, split-screen, turn logic | Two tabs can chat in real-time |
| 5a: Opus Engine | Dual-lens NVC prompt (core IP), mediation pipeline, temperature UI | Claude analyzes and UI renders analysis |
| 5b: The Melt | 3-phase animation (dissolve/crystallize/settled), Signal Rail | Animation plays on new analysis |
| 5c: Voice + Flow | Push-to-talk, session summary, end session flow | Full conversation lifecycle works |
| 6+8: Polish | Error handling, PersonPanel extraction, landing page, mobile responsive | Nothing breaks with stupid input |
| V3: Conflict Intelligence | 14-lens modular prompt system, context modes, LensBar UI | Family mode session shows multi-lens analysis |
| V4: Strategy Arena | Backtesting framework, strategy evaluation, scoring system | Strategies produce comparable scored results |

Full build journal with decisions and reasoning: [`BUILDING.md`](./BUILDING.md)

Interactive artifacts (open in browser):

| Artifact | What It Shows |
|----------|---------------|
| [`parallax-blueprint.html`](./artifacts/parallax-blueprint.html) | Full build plan -- phases, parallel batches, dependency graph |
| [`parallax-stage-mode-blueprint.html`](./artifacts/parallax-stage-mode-blueprint.html) | Stage Mode expansion vision -- X-ray scoreboard concept |
| [`id8pipeline-sdk-architecture.html`](./artifacts/id8pipeline-sdk-architecture.html) | Pipeline methodology mapped to Claude Code SDK features |

## Getting Started

```bash
git clone https://github.com/eddiebelaval/parallax.git
cd parallax
npm install
cp .env.example .env.local
# Fill in Supabase + Anthropic API keys
npm run dev
```

Requires: Node 20+, a Supabase project with `sessions`, `messages`, and `issues` tables, an Anthropic API key with Claude Opus access.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-side only)
ANTHROPIC_API_KEY=               # Anthropic API key with Claude Opus access
```

## Design System: Ember

Warm, organic, intentionally imperfect. Deep chocolate dark mode, warm parchment light mode, earthy tones throughout. Light = data -- glow color and intensity encode emotional temperature.

- **Temperature colors:** teal (cool/calm) -> amber (warm/tension) -> red (hot/volatile)
- **Typography:** Source Serif 4 (headings), Source Sans 3 (body), IBM Plex Mono (labels)
- **Philosophy:** No cold blues, no clinical whites. Gradients and glow are informational (encode temperature), never decorative.

## Testing

```bash
npm test              # Run all tests (86 tests across 6 suites)
npx tsc --noEmit      # Type check
npm run build         # Production build
```

## License

MIT

---

*Built by Eddie Belaval ([id8Labs](https://id8labs.app)) for the Claude Code Hackathon, Feb 10-16, 2026.*
