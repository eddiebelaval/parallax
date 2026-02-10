# How We Built Parallax

A build journal for Parallax — real-time conflict resolution powered by Claude.

**Visual artifacts:** The [`artifacts/`](./artifacts/) folder contains interactive HTML visualizations of our architecture, build plan, and process. Open them in a browser to explore the system spatially.

| Artifact | What It Shows |
|----------|---------------|
| [`parallax-blueprint.html`](./artifacts/parallax-blueprint.html) | The full interactive build plan — phases, parallel batches, task prompts, dependency graph. Created during Stage 3 (Architecture Sketch) to plan the entire 6-day build before writing a single line of code. |
| [`id8pipeline-sdk-architecture.html`](./artifacts/id8pipeline-sdk-architecture.html) | How the ID8 Pipeline methodology maps onto Claude Code SDK features — team orchestration, task management, gate verification. Created to visualize the relationship between our build process and the tools powering it. |
| [`claude-code-hackathon-kickoff-transcript.html`](./artifacts/claude-code-hackathon-kickoff-transcript.html) | The hackathon organizers' kickoff session — judging criteria, submission requirements, what "Break the Barriers" means. Our north star. Every decision we make gets checked against this. |

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

## Stage 5b: The Melt (Day 3)

**Gate question:** "Does this feature work completely, right now?"

The Melt is Parallax's visual signature — noise particles dissolve and NVC understanding crystallizes. This is where the product becomes a demo.

**What we built:**

### TheMelt.tsx — The Core Animation Engine (112 lines)

The Melt is a three-phase state machine:
1. **Idle** — message displays normally, waiting for Claude's analysis
2. **Dissolving** — each character scatters outward with blur and fade (1.2s). This is the "noise breaking apart" moment.
3. **Crystallizing** — text reforms, NVC analysis sections slide in with staggered timing (0.5s per section, 150ms offsets). This is "understanding emerging."
4. **Settled** — static state. Messages loaded from history skip directly here (no animation replay).

**Key technical decisions:**
- **Knuth multiplicative hash** for particle scatter directions. We need deterministic randomness because `Math.random()` would cause React hydration mismatches (server and client generate different values). The Knuth hash `(index * 2654435761) >>> 0` is deterministic per character index — same scatter every render.
- **CSS custom properties bridge:** JavaScript computes `--melt-dx`, `--melt-dy`, `--melt-delay`, `--melt-color` per character. CSS `@keyframes melt-dissolve` consumes them via `var()`. This keeps animation logic in CSS (GPU-accelerated) while keeping the math in JS (composable).
- **History-skip via `useRef`:** The `useMelt` hook captures whether analysis was already present on mount. If so, it returns "settled" immediately — users scrolling through history don't see animations replay.

### SignalRail.tsx — Temperature Timeline (33 lines)

A 4px-wide vertical bar running alongside the conversation. Each message gets a segment colored by its emotional temperature. As the conversation progresses, the rail paints a visual story: hot reds at the top (conflict) fading to cool teals at the bottom (resolution). The latest segment pulses gently.

**Key decision:** We render one `div` per message with `flex-1` so segments auto-size to equal height. No absolute positioning, no calculation — flexbox handles the proportional layout. Messages without analysis yet show a warm gray (`#3a3632`) placeholder.

### MessageCard Integration

The existing MessageCard was rewired to use the Melt:
- `useMelt(hasAnalysis)` drives the phase state machine
- `MeltText` replaces the static `<p>` tag — it renders normal text in idle/settled, character-level particles during dissolve
- Analysis sections auto-expand during crystallize (no user click needed)
- The expand/collapse toggle hides during the animation so the crystallize effect is uninterrupted

**Gate verification (Casey, 9/9 criteria):**
- [x] Dissolve animation plays on new NVC arrival
- [x] Crystallize animation plays after dissolve
- [x] History messages skip animation (settled on mount)
- [x] Signal Rail renders with correct temperature colors
- [x] Signal Rail latest segment pulses
- [x] MessageCard expand/collapse still works post-animation
- [x] Melt phases transition correctly (idle → dissolving → crystallizing → settled)
- [x] Build passes (`npm run build && npx tsc --noEmit`)
- [x] No regressions in existing mediation flow

**Gate: PASSED**

---

## Stage 5c: Voice + Flow (Day 4)

**Gate question:** "Does this feature work completely, right now?"

This stage transforms Parallax from a text-messaging app into a full conversation experience. People in conflict don't want to carefully compose text — they want to speak. And when the conversation ends, they need a summary of what happened, not just a scroll of messages.

**What we built:**

### VoiceInput.tsx — Web Speech API Push-to-Talk (186 lines)

A hold-to-speak button that transcribes voice into text using the browser's `SpeechRecognition` API (Chrome). Three states: idle (gray mic, "Hold to speak"), listening (pulsing orange ring with live interim transcript), unsupported (graceful fallback message).

**Key technical decisions:**
- **SSR-safe support detection:** Browser APIs don't exist during Next.js server rendering. We defer the `isSupported()` check to a `useEffect` so the initial render is hydration-safe.
- **`finalTranscriptRef` pattern:** The `onresult` callback needs to accumulate final transcript segments across multiple events. Using a ref instead of state avoids stale closure issues — the callback always reads the latest accumulated value.
- **`onMouseLeave` guard:** If a user presses the mic button and drags their mouse off it, we stop recognition. Without this, the user would have no way to release.

### SessionSummary.tsx — Conversation Arc Analysis (170 lines)

When the session ends, Claude analyzes the full conversation arc and produces a structured summary. The UI displays:
- **Overall Insight** — a hero quote with orange left border (the emotional landing)
- **Temperature Arc** — how emotions shifted over the conversation
- **Key Moments** — pivotal points with orange dot markers
- **Per-person sections** (side by side): what they needed, their takeaway, what they did well (teal highlight for strengths)

**Key decision:** The summary API endpoint was built as forward work in Stage 5a (River saw it coming). The SessionSummary UI calls POST `/api/sessions/{code}/summary` on mount and uses a discriminated union state (`loading | error | ready`) for clean state management. Claude generates the summary after the session ends — this takes 2-4 seconds, during which a pulsing loading state plays.

### End Session Flow

Either person can click "End" in their session header. The flow:
1. POST `/api/sessions/{code}/end` sets status to `'completed'`
2. Supabase Realtime pushes the UPDATE to both sides
3. `useSession` receives the update, `session.status` changes to `'completed'`
4. `SessionView` detects `isCompleted` and renders `<SessionSummary>` full-width instead of the split-screen message panels
5. Both people see the same summary simultaneously

### Voice/Text Toggle + Session Header Polish

Each side of the split-screen gets:
- **Room code** in small monospace (so participants can reference it)
- **Turn indicator** with pulsing orange dot on the active turn
- **"End" button** to conclude the session
- **Mic/keyboard toggle** in the input bar — independent per side (Person A can speak while Person B types)

Voice transcripts flow through the exact same `handleSendA`/`handleSendB` → `triggerMediation` pipeline as typed messages. Zero code duplication — voice is just another way to produce a string.

**Gate verification (Casey, 11/11 criteria):**
- [x] VoiceInput exists, uses Web Speech API
- [x] VoiceInput handles unsupported browsers gracefully
- [x] Voice/text toggle independent per side
- [x] Session summary API returns valid data
- [x] SessionSummary UI displays all 8 fields
- [x] "End Session" button visible and functional (both sides)
- [x] Ending session triggers summary on both sides via Realtime
- [x] Turn indicator with pulsing orange dot
- [x] Room code displayed in session header
- [x] Build passes (`npm run build && npx tsc --noEmit`)
- [x] No regressions in messaging, NVC analysis, Melt, Signal Rail

**Gate: PASSED**

---

## What's Ahead

| Stage | Name | Day | Gate Question |
|-------|------|-----|---------------|
| 6+8 | Integration + Polish | Day 5 | What breaks if someone does something stupid? |
| 9+10 | Ship | Day 6 | Is it submitted before 3 PM? |

---

*Built by Eddie Belaval (id8Labs) for the Claude Code Hackathon, Feb 10-16, 2026.*
*Pipeline: [ID8 Pipeline](https://github.com/eddiebelaval) — stage-gated development for AI-powered products.*
