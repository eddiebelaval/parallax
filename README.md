# Parallax

> See the conversation you're actually having.

Real-time conflict resolution powered by Claude. Two people take turns expressing themselves — via text or voice — and Claude surfaces the subtext, blind spots, and unmet needs beneath every message. Professional mediation costs $300-500/hr. Parallax makes it accessible to everyone.

**Live:** [parallax-ebon-three.vercel.app](https://parallax-ebon-three.vercel.app)

---

## How It Works

1. **Choose your context** — Intimate partners? Co-workers? Family? The context determines which analytical lenses activate (5-7 frameworks per mode).
2. **Start a session** — One person creates a room. The other joins with a 6-character code. Remote (split screen) or in-person (shared device) modes available.
3. **Take turns speaking** — Type or hold-to-speak. Turn-based messaging prevents talking over each other (the core problem in conflict).
4. **Claude analyzes through multiple lenses** — Each message passes through 5-7 analytical frameworks simultaneously. A visual transformation ("The Melt") dissolves raw emotion into structured understanding.
5. **See what's beneath** — Expand any message to reveal subtext, blind spots, unmet needs, an NVC translation, and a multi-lens analysis with confidence-ranked lens chips.

## Why 14 Lenses?

NVC is powerful but incomplete. It sees feelings and needs, but misses the structural patterns that keep conflicts stuck:

- **NVC is pattern-blind** — it can't track the Four Horsemen over time (Gottman fills this gap)
- **NVC is power-blind** — it assumes equal footing, which fails in boss-employee or institutional conflicts (Power Analysis + SCARF fills this gap)
- **NVC is thinking-error-blind** — "You always..." and "You never..." are cognitive distortions, not feelings (CBT fills this gap)
- **NVC is role-blind** — persecutor/victim/rescuer dynamics repeat invisibly (Drama Triangle fills this gap)
- **NVC is narrative-blind** — "You're the kind of person who..." is identity construction, not observation (Narrative Therapy fills this gap)

So Parallax layers 14 analytical frameworks on top of NVC, activated by context:

| Lens | What It Detects | Category |
|------|----------------|----------|
| **NVC** (Rosenberg) | Feelings, needs, observations, requests | Communication |
| **Gottman Four Horsemen** | Criticism, contempt, defensiveness, stonewalling | Relational |
| **CBT Cognitive Distortions** | Mind-reading, catastrophizing, all-or-nothing | Cognitive |
| **Thomas-Kilmann Modes** | Competing, collaborating, avoiding, accommodating | Resolution |
| **Karpman Drama Triangle** | Persecutor, victim, rescuer role dynamics | Relational |
| **Narrative Therapy** | Totalizing narratives, identity claims | Cognitive |
| **Attachment Theory** | Secure/anxious/avoidant patterns, pursue-withdraw | Relational |
| **Restorative Justice** | Harm acknowledgment, accountability, repair | Resolution |
| **SCARF Model** (Rock) | Status, certainty, autonomy, relatedness, fairness threats | Systemic |
| **Organizational Justice** | Distributive, procedural, interactional fairness | Systemic |
| **Psychological Safety** (Edmondson) | Voice suppression, fear signals, silence markers | Systemic |
| **Jehn's Conflict Types** | Task vs. relationship vs. process conflict | Systemic |
| **Power Dynamics** | Asymmetric power, directive language, silencing | Systemic |
| **Interest-Based Relational** | Positions vs. interests, common ground | Resolution |

## 6 Context Modes

Not all conflicts are the same. A couple arguing about dishes needs different lenses than a board member challenging a CEO. When you start a session, you choose the context:

| Mode | Active Lenses | Example |
|------|--------------|---------|
| **Intimate Partners** | NVC, Gottman, CBT, Drama Triangle, Attachment, Narrative | "We need to talk about the dishes" |
| **Family** | NVC, Gottman, Narrative, Drama Triangle, Attachment, Power, Restorative | "Mom always sides with you" |
| **Professional Peers** | NVC, CBT, TKI, SCARF, Jehn's, Psych Safety | "You keep taking credit for my work" |
| **Professional Hierarchy** | NVC, CBT, TKI, SCARF, Org Justice, Psych Safety, Power | "I was passed over again" |
| **Transactional** | NVC, CBT, TKI, IBR, SCARF | "You promised Friday delivery" |
| **Civil/Structural** | NVC, Narrative, Power, Org Justice, Restorative, IBR | "The policy affects us differently" |

The temperature drives the UI: cool teal for calm messages, warm amber for tension, hot red for high charge. A Signal Rail alongside the conversation paints the emotional arc over time.

## Architecture

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16 (App Router, TypeScript strict) | Server components, Turbopack |
| Realtime | Supabase Postgres + Realtime subscriptions | Both sides see analysis instantly without polling |
| AI | Claude Opus (non-streaming, fire-and-forget) | 14-lens conflict intelligence engine returning structured JSON |
| Animation | CSS custom properties + Knuth hash particles | GPU-accelerated, deterministic (no hydration mismatch) |
| Voice | Web Speech API (Chrome) | Push-to-talk, SSR-safe detection |
| Deploy | Vercel | Auto-deploy on merge |

**Mediation pipeline:** User sends message -> fire-and-forget POST to `/api/mediate` -> context mode determines active lenses (5-7 frameworks) -> `buildConflictIntelligencePrompt()` assembles modular prompt -> Claude analyzes through all lenses in a single call -> `parseConflictAnalysis()` validates + wraps response -> patches Supabase JSONB row -> Realtime pushes UPDATE to both sides -> UI renders with progressive disclosure (primary insight -> NVC analysis -> confidence-ranked lens chips -> expandable lens detail panels). No streaming, no SSE, no partial JSON parsing.

## The Build Process

Built in 6 days using the **ID8 Pipeline** — a stage-gated methodology where every stage has a hard gate question that must be answered before advancing. The git log reads as a build narrative:

| Stage | What We Built | Gate |
|-------|--------------|------|
| 4: Foundation | Supabase schema, Realtime messaging, split-screen, turn logic | Two tabs can chat in real-time |
| 5a: Opus Engine | Dual-lens NVC prompt (core IP), mediation pipeline, temperature UI | Claude analyzes and UI renders analysis |
| 5b: The Melt | 3-phase animation (dissolve/crystallize/settled), Signal Rail | Animation plays on new analysis |
| 5c: Voice + Flow | Push-to-talk, session summary, end session flow | Full conversation lifecycle works |
| 6+8: Polish | Error handling, PersonPanel extraction, landing page, mobile responsive | Nothing breaks with stupid input |
| V3: Intelligence Engine | 14 modular lenses, 6 context modes, progressive disclosure UI, confidence scores | Any context mode produces valid multi-lens analysis |

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
