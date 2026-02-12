# Parallax

> See the conversation you're actually having.

Real-time two-person conflict resolution powered by Claude. Two people take turns expressing themselves — via text or voice — and Claude surfaces the subtext, blind spots, and unmet needs beneath every message through 14 analytical frameworks. Professional mediation costs $300-500/hr. Parallax makes it accessible to everyone.

**Live:** [parallax-ebon-three.vercel.app](https://parallax-ebon-three.vercel.app)

---

## What Makes This Different

Most "AI mediation" tools wrap a single framework (usually NVC) around a chatbot. Parallax is a **Conflict Intelligence Engine** — 14 validated psychological frameworks layered on Claude Opus, activated by context. It doesn't join the conversation. It analyzes each message through the relevant lenses and surfaces what both people are missing.

### The Product Has a Voice

Parallax speaks. Literally. ElevenLabs TTS with a teal waveform orb that animates with real audio data. When Claude finishes analyzing, the orb pulses, the text typewriters in character-by-character, and the voice reads the response. It creates a "third presence in the room" — the mediator.

The product can also explain itself. A **Conversational Layer** lets judges (or users) ask Parallax anything about its own architecture, methodology, or hackathon journey. It answers in first person, citing specific files and PRs from its own documentation.

---

## How It Works

1. **Profile Interview** — Before your first session, Parallax has a conversational interview with each person. Not a quiz — a real conversation across 4 phases (context, communication profiling, deep dive, narrative capture). This builds a persistent behavioral profile with 9 signal types, each with confidence scores.

2. **Choose your context** — Intimate partners? Co-workers? Family? The context determines which analytical lenses activate (5-7 frameworks per mode).

3. **Start a session** — Create a room (6-character code). Remote (split screen) or in-person (shared device with X-Ray Glance view).

4. **Take turns speaking** — Type or hold-to-speak. Parallax's orb breathes while listening, pulses while thinking, and speaks while delivering analysis.

5. **Claude analyzes through multiple lenses** — Each message passes through 5-7 frameworks simultaneously. A visual transformation ("The Melt") dissolves raw emotion into structured understanding.

6. **See what's beneath** — Expand any message to reveal subtext, blind spots, unmet needs, an NVC translation, and confidence-ranked lens chips.

---

## 14 Analytical Lenses

NVC alone has blind spots. It sees feelings and needs, but misses the structural patterns that keep conflicts stuck:

- **Pattern-blind** — can't track the Four Horsemen over time (Gottman fills this gap)
- **Power-blind** — assumes equal footing, fails in hierarchical conflicts (Power Analysis + SCARF)
- **Thinking-error-blind** — "You always..." and "You never..." are cognitive distortions (CBT)
- **Role-blind** — persecutor/victim/rescuer dynamics repeat invisibly (Drama Triangle)
- **Narrative-blind** — "You're the kind of person who..." is identity construction (Narrative Therapy)

| Lens | What It Detects | Category |
|------|----------------|----------|
| **NVC** (Rosenberg) | Feelings, needs, observations, requests | Communication |
| **Gottman Four Horsemen** | Criticism, contempt, defensiveness, stonewalling | Relational |
| **CBT Cognitive Distortions** | Mind-reading, catastrophizing, all-or-nothing | Cognitive |
| **Thomas-Kilmann Modes** | Competing, collaborating, avoiding, accommodating | Resolution |
| **Karpman Drama Triangle** | Persecutor, victim, rescuer role dynamics | Relational |
| **Narrative Therapy** | Totalizing narratives, identity claims | Cognitive |
| **Attachment Theory** | Secure/anxious/avoidant, pursue-withdraw | Relational |
| **Restorative Justice** | Harm acknowledgment, accountability, repair | Resolution |
| **SCARF Model** (Rock) | Status, certainty, autonomy, relatedness, fairness | Systemic |
| **Organizational Justice** | Distributive, procedural, interactional fairness | Systemic |
| **Psychological Safety** (Edmondson) | Voice suppression, fear signals, silence markers | Systemic |
| **Jehn's Conflict Types** | Task vs. relationship vs. process conflict | Systemic |
| **Power Dynamics** | Asymmetric power, directive language, silencing | Systemic |
| **Interest-Based Relational** | Positions vs. interests, common ground | Resolution |

### 6 Context Modes

| Mode | Active Lenses | Example |
|------|--------------|---------|
| **Intimate Partners** | NVC, Gottman, CBT, Drama Triangle, Attachment, Narrative | "We need to talk about the dishes" |
| **Family** | NVC, Gottman, Narrative, Drama Triangle, Attachment, Power, Restorative | "Mom always sides with you" |
| **Professional Peers** | NVC, CBT, TKI, SCARF, Jehn's, Psych Safety | "You keep taking credit for my work" |
| **Professional Hierarchy** | NVC, CBT, TKI, SCARF, Org Justice, Psych Safety, Power | "I was passed over again" |
| **Transactional** | NVC, CBT, TKI, IBR, SCARF | "You promised Friday delivery" |
| **Civil/Structural** | NVC, Narrative, Power, Org Justice, Restorative, IBR | "The policy affects us differently" |

---

## Intelligence Network

Each user gets a persistent behavioral profile built through a conversational interview. 9 signal types extracted via Claude Structured Outputs:

| Signal | What It Captures |
|--------|-----------------|
| Conflict Style | Thomas-Kilmann mode (competing/collaborating/avoiding/accommodating/compromising) |
| Communication Pattern | Direct/indirect, emotional expression level, reassurance-seeking |
| Emotional Regulation | Awareness, strategies, triggers, clarity-under-stress rating |
| Attachment Orientation | Anxiety/avoidance dimensions, pursue-withdraw tendency |
| Fairness Sensitivity | SCARF domain weights, perceived equity thresholds |
| Narrative Frame | Dominant story, role in conflict, totalizing language patterns |
| Values Hierarchy | Top 3-5 values with contextual priority ranking |
| Strengths | Communication strengths with confidence scores |
| Growth Areas | Areas for development with evidence count |

Profiles are **private by default** — Person A's data never flows to Person B's view. Claude uses each profile to understand that person's messages, never to reveal private information to the other party.

---

## Architecture

| Layer | Technology | What It Does |
|-------|-----------|-------------|
| Frontend | Next.js 16 (App Router, TypeScript strict) | Server components, SSR, Turbopack dev |
| Database | Supabase Postgres + Realtime | Session state, messages, profiles with RLS. Realtime subscriptions for live sync |
| AI Engine | Claude Opus 4.6 (non-streaming) | 14-lens conflict analysis, interview profiling, session summaries |
| Voice Output | ElevenLabs TTS + Web Audio API | Real-time waveform orb driven by actual audio data at 60fps |
| Voice Input | Web Speech API (Chrome) | Push-to-talk with SSR-safe detection |
| Animation | CSS custom properties + Knuth hash | GPU-accelerated "Melt" dissolve/crystallize |
| Design | Ember design system (Tailwind v4) | Temperature-reactive backlit glow, warm organics |
| Deploy | Vercel | Auto-deploy on merge to main |

### API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/sessions` | Create session with room code |
| `POST /api/sessions/[code]/join` | Join existing session |
| `POST /api/sessions/[code]/end` | End session, trigger summary |
| `POST /api/sessions/[code]/onboarding` | In-person mode state machine |
| `POST /api/messages` | Send message |
| `POST /api/mediate` | Claude NVC + multi-lens analysis |
| `POST /api/issues/analyze` | Issue extraction + grading |
| `POST /api/conductor` | Adaptive conversation orchestrator |
| `POST /api/interview` | Profile interview AI pipeline |
| `POST /api/converse` | Conversational Layer (Explorer/Guide) |
| `POST /api/coach` | Private coaching during sessions |
| `POST /api/tts` | ElevenLabs voice proxy |
| `GET /api/health` | Health check for monitoring |

---

## Design System: Ember

**"Light = Data."** Glow color and intensity encode emotional temperature — never decorative.

- **Dark mode:** Deep chocolate (#0f0b08), warm brown neutrals, teal/amber/hot accent glow
- **Light mode (default):** Warm parchment (#f5efe6), "watercolor stain" glows
- **Typography:** Source Serif 4 (headings), Source Sans 3 (body), IBM Plex Mono (labels)
- **Temperature:** Cool teal (0.0-0.4) -> Warm amber (0.5-0.7) -> Hot rust (0.8-1.0)
- **Orbs:** Real-time SVG waveform per participant (Person A warm, Parallax teal, Person B hot)
- **Backlit glow:** CSS `radial-gradient` borders that radiate outward, encoding temperature

---

## Built with Claude Code

This entire project was built using Claude Code as the primary development tool. Here's how:

### Claude Code Features Used

| Feature | How We Used It |
|---------|---------------|
| **Multi-agent teams** | TeamCreate with specialized agents (frontend, Realtime, QA, test writers) working in parallel |
| **Plan mode** | Every major feature planned in plan mode before implementation (interview rebuild, intelligence network, landing page) |
| **Subagents** | Explore agents for codebase audits, code-reviewer for PR quality, code-simplifier for cleanup |
| **Custom skills** | `/polish` (code review + simplify), `/visualize` (interactive HTML artifacts), `/integration-audit` |
| **Task tools** | TaskCreate/TaskUpdate for multi-step implementations with progress tracking |
| **MCP servers** | Supabase MCP for database operations, GitHub MCP for PR management |
| **Hooks** | Pre-tool-use hook blocking writes to main branch, security reminder hook |

### Build Stats

| Metric | Value |
|--------|-------|
| Total commits | 136 |
| Pull requests | 29 (all reviewed, zero direct-to-main) |
| Test coverage | 475 tests across 47 files (426 Vitest + 49 Playwright E2E) |
| Build time | 3 days (Feb 10-12, 2026) |
| BUILDING.md | 1,650+ lines of documented decisions |
| Interactive artifacts | 16 HTML visualizations |

### The Pipeline

Built using the **ID8 Pipeline** — an 11-stage methodology where every stage has a gate question:

| Stage | What | Gate |
|-------|------|------|
| 1-3 | Concept, scope, architecture | One-liner locked, scope fenced, boxes drawn |
| 4 | Foundation pour | Two tabs chat in real-time (PR #1, +8,832 lines) |
| 5 | Feature blocks | Opus engine, The Melt, voice + flow (PRs #2, #3, #5) |
| 6+8 | Integration + polish | Error handling, mobile, component extraction (PR #6) |
| 7 | Test coverage | 475 tests, all green (PR #25) |
| 8 | In-person mode | X-Ray Glance view, shared device UX (PRs #12, #21) |
| 9 | Launch prep | Integration audit, intelligence network, session redesign |
| 10 | Ship | README, LICENSE, Opus 4.6 upgrade, production deploy |

Full build journal: [`BUILDING.md`](./BUILDING.md)

---

## Getting Started

```bash
git clone https://github.com/eddiebelaval/parallax.git
cd parallax
npm install
cp .env.example .env.local
# Fill in your keys (see below)
npm run dev
```

### Environment Variables

| Variable | Where to Get It |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings (keep secret) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) — needs Claude Opus access |
| `ELEVENLABS_API_KEY` | [elevenlabs.io](https://elevenlabs.io) — optional, falls back to browser TTS |

### Testing

```bash
npm run test:run          # 426 Vitest tests
npm run test:coverage     # With coverage report
npm run test:e2e          # 49 Playwright E2E specs
npm run test:all          # Everything
```

---

## Interactive Artifacts

16 HTML visualizations documenting the build process, architecture decisions, and design explorations. Open any in a browser:

| Artifact | What It Shows |
|----------|---------------|
| `parallax-blueprint.html` | Build plan — phases, batches, dependency graph |
| `parallax-day-one.html` | Day 1 build retrospective |
| `parallax-ember-design-system.html` | Ember design system deep dive |
| `parallax-conflict-intelligence-blueprint.html` | V3 14-lens engine architecture |
| `parallax-user-intelligence-layer-blueprint.html` | V2 interview + profile system |
| `parallax-conversational-layer-blueprint.html` | Explorer + Guide architecture |
| `integration-audit.html` | Full integration audit results |
| `v3-conflict-intelligence-engine.html` | V3 lens activation visualization |

All artifacts in [`artifacts/`](./artifacts/).

---

## License

MIT

---

*Built by Eddie Belaval ([id8Labs](https://id8labs.app)) for the Claude Code Hackathon, Feb 10-16, 2026.*
*Powered by Claude Opus 4.6. Built entirely with Claude Code.*
