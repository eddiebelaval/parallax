# How We Built Parallax

A build journal for Parallax — real-time conflict resolution powered by Claude.

---

## The Pipeline: How We Build

Parallax was built using the **ID8 Pipeline** — a stage-gated development methodology designed for building AI-powered products under pressure. Every id8Labs product flows through this pipeline.

### Why a pipeline for a hackathon?

Hackathons reward speed. But speed without structure leads to half-built features, integration nightmares on Day 5, and demos that crash. The pipeline ensures we ship vertical slices — complete, working features — instead of a wide, shallow prototype.

### How it works

The pipeline has **11 stages**, each with a hard gate:

| Stage | Name | Gate Question |
|-------|------|---------------|
| 1 | **Concept Lock** | "What's the one-liner?" |
| 2 | **Scope Fence** | "What are we NOT building?" |
| 3 | **Architecture Sketch** | "Draw me the boxes and arrows." |
| 4 | **Foundation Pour** | "Can we deploy an empty shell?" |
| 5 | **Feature Blocks** | "Does this feature work completely, right now?" |
| 6 | **Integration Pass** | "Do all the pieces talk to each other?" |
| 7 | **Test Coverage** | "Are all tests green?" |
| 8 | **Polish & Harden** | "What breaks if I do something stupid?" |
| 9 | **Launch Prep** | "Could a stranger use this without asking me questions?" |
| 10 | **Ship** | "Is it live and are people using it?" |
| 11 | **Listen & Iterate** | "What did we learn?" |

**The rules are simple:**
- You cannot advance to the next stage without passing the gate
- Each stage has a clear checkpoint question — if you can't answer it, you're not done
- Every gate is verified before moving on (in our commits, look for `verify: gate PASSED`)
- If something is out of scope, it stays out until its stage arrives

### How we adapted it for the hackathon

For a 6-day hackathon, we compressed the 11 stages:

- **Stages 1-3** (concept, scope, architecture) were completed pre-build using an interactive blueprint tool
- **Stage 5** was split into sub-stages (5a, 5b, 5c) because the feature work has natural boundaries: AI engine, then visuals, then voice
- **Stage 7** (test coverage) was replaced by manual gate verification at each stage — hackathon pace
- **Stages 6+8** and **9+10** were merged into single days

### How we use Claude Code with this pipeline

The pipeline isn't just a planning tool — it's integrated into how we use Claude Code:

- **Team system:** Claude Code's team feature lets us spin up specialized agents (a frontend lead, a realtime engineer, a QA tester) for each stage, then shut them down at the gate
- **Director pattern:** Claude Opus orchestrates the team — writes the critical prompts, reviews every PR, runs gate verification. The agents implement; the director integrates
- **Branch protocol:** Each stage gets its own branch (`parallax/stage-{N}-{name}`), merged to main at the gate
- **Commit convention:** Every commit is prefixed with its stage (`[Stage 5a: Opus Engine] feat: ...`) so the git log reads as a build narrative

### How to read our commit history

```
[Stage 3: Architecture]  — Project setup, config, environment
[Stage 4: Foundation]    — Scaffold, database, real-time messaging, UI shell
[Stage 5a: Opus Engine]  — NVC prompt engineering, Claude API, analysis UI
[Stage 5b: The Melt]     — Visual transformation animation
[Stage 5c: Voice + Flow] — Voice input, session flow, summary
```

Each stage ends with a `verify: gate PASSED` commit — that's our sign-off that everything works before moving on.

---

## Stage 1-3: Concept, Scope, Architecture (Pre-build)

**The problem:** Professional mediation costs $300-500/hr. Most couples, roommates, and coworkers never get help with conflict — they just let it fester. What if AI could make conflict resolution accessible to everyone?

**The concept:** Two people, one shared screen, Claude as invisible infrastructure cleaning the signal from the noise between them. Not a chatbot — a translator. You say what you feel; Parallax shows what you mean.

**Scope fence (Stage 2):** Layer 2 only (two-person mediation). No solo mode, no group mode, no async. One thing, done well.

**Architecture decisions (Stage 3):**
- Single-device split-screen (simpler than WebSockets, more intimate)
- Turn-based messaging (prevents talking over each other — the core problem in conflict)
- Supabase Realtime for reactive updates (both sides see analysis without polling)
- NVC (Nonviolent Communication) as the analytical framework — Marshall Rosenberg's 40 years of conflict resolution research, translated into structured AI analysis

---

## Stage 4: Foundation Pour (Day 1)

**Gate question:** "Can we deploy an empty shell?"

**What we built:**
- Next.js 16 project with TypeScript strict mode
- Factory-inspired dark design system (near-black backgrounds, orange accents, warm grays)
- Supabase schema: `sessions` table (room codes, participant names, status) + `messages` table (sender, content, NVC analysis fields)
- Session lobby: create a room, get a 6-character code, share it
- Split-screen layout: Person A on the left, Person B on the right
- Real-time messaging via Supabase `postgres_changes` subscriptions
- Turn-based logic: alternating turns, disabled input when it's not your turn

**Key decision:** We chose Supabase Realtime over WebSockets because it gives us reactive database updates for free — when Claude's analysis patches a message row, both tabs see it instantly without additional plumbing.

**Gate verification:**
- Two browser tabs can create/join a session with a room code
- Messages appear in real-time on both tabs
- Turn-based logic works (alternating turns)
- Build passes, deployed to Vercel

**Gate: PASSED**

---

## Stage 5a: Opus Mediation Engine (Day 2)

**Gate question:** "Does this feature work completely, right now?"

This was the critical stage. The NVC system prompt is the core intellectual property of Parallax — it's what transforms raw conflict into structured understanding.

**The dual-lens prompt:**

We spent significant time crafting a prompt that analyzes each message through two lenses:

1. **Classic NVC (Marshall Rosenberg):** Observation (what happened, no judgment), Feeling (precise emotion), Need (universal human need), Request (concrete positive action)

2. **Beneath the Surface (Parallax):** Subtext (what they're really saying), Blind Spots (what the speaker can't see about their own communication), Unmet Needs (structured labels), NVC Translation (the message rewritten so it could actually be heard), Emotional Temperature (0.0-1.0 scale of how charged the message is)

**The mediation pipeline:**
1. User sends message
2. UI fires a request to `/api/mediate` (fire-and-forget)
3. API fetches the message, conversation history, and participant names
4. Claude analyzes through both lenses, returns structured JSON
5. API patches the message row in Supabase with the analysis
6. Supabase Realtime pushes the UPDATE to both tabs
7. UI re-renders the MessageCard with temperature-colored borders and expandable analysis

**Key decision:** We chose non-streaming over streaming. The initial plan was to stream Claude's response for visual wow-factor, but Supabase Realtime already handles reactive updates. Streaming would have added SSE encoding, partial JSON parsing, and client-side assembly with zero UX benefit. Simpler architecture, fewer failure modes.

**What the UI shows:**
- Temperature-colored left border on each message (neutral white, cool teal, warm amber, hot red)
- "What's beneath" expand trigger revealing: Subtext, Blind Spots, Unmet Needs (pill tags), NVC Translation (teal highlight)
- Pulsing "Analyzing" indicator while Claude processes

**Bonus:** Built a session summary endpoint for analyzing the full conversation arc at session end.

**Gate verification:**
- NVC analysis pipeline complete (9-step reactive chain)
- Type alignment unified across all files
- Temperature colors mapped correctly (4-tier scale)
- Realtime UPDATE wiring delivers analysis to both tabs
- Build passes, TypeScript clean

**Gate: PASSED**

---

## Stage 5b: The Melt (Day 3) — NEXT

**Gate question:** "Does this feature work completely, right now?"

The Melt is Parallax's visual signature — noise particles dissolve and NVC understanding crystallizes. This is where the product becomes a demo.

**Planned:**
- The Melt animation (raw message noise dissolves, structured NVC bullets emerge)
- Signal Rail (vertical temperature timeline showing how the conversation's emotional charge evolves)
- MessageCard visual polish

---

## What's Ahead

| Stage | Name | Day | Gate Question |
|-------|------|-----|---------------|
| 5c | Voice + Flow | Day 4 | Does voice-enabled flow work end-to-end? |
| 6+8 | Integration + Polish | Day 5 | What breaks if someone does something stupid? |
| 9+10 | Ship | Day 6 | Is it submitted before 3 PM? |

---

*Built by Eddie Belaval (id8Labs) for the Claude Code Hackathon, Feb 10-16, 2026.*
*Pipeline: [ID8 Pipeline](https://github.com/eddiebelaval) — stage-gated development for AI-powered products.*
