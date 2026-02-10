# How We Built Parallax

A build journal for Parallax — real-time conflict resolution powered by Claude.

We used a **stage-gated pipeline**: each stage has a clear definition of done, a verification gate, and only progresses when the gate passes. This keeps scope tight and quality high under hackathon pressure.

---

## Stage 1-3: Concept, Scope, Architecture (Pre-build)

**The problem:** Professional mediation costs $300-500/hr. Most couples, roommates, and coworkers never get help with conflict — they just let it fester. What if AI could make conflict resolution accessible to everyone?

**The concept:** Two people, one shared screen, Claude as invisible infrastructure cleaning the signal from the noise between them. Not a chatbot — a translator. You say what you feel; Parallax shows what you mean.

**Scope fence:** Layer 2 only (two-person mediation). No solo mode, no group mode, no async. One thing, done well.

**Architecture decisions:**
- Single-device split-screen (simpler than WebSockets, more intimate)
- Turn-based messaging (prevents talking over each other — the core problem in conflict)
- Supabase Realtime for reactive updates (both sides see analysis without polling)
- NVC (Nonviolent Communication) as the analytical framework — Marshall Rosenberg's 40 years of conflict resolution research, translated into structured AI analysis

---

## Stage 4: Foundation Pour (Day 1)

**Goal:** Can two people exchange messages in real-time?

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

**Goal:** Does Claude's NVC analysis actually work?

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

**Goal:** Does the visual transformation work?

The Melt is Parallax's visual signature — noise particles dissolve and NVC understanding crystallizes. This is where the product becomes a demo.

**Planned:**
- The Melt animation (raw message noise dissolves, structured NVC bullets emerge)
- Signal Rail (vertical temperature timeline showing how the conversation's emotional charge evolves)
- MessageCard visual polish

---

## What's Ahead

| Stage | Name | Day | Goal |
|-------|------|-----|------|
| 5c | Voice + Flow | Day 4 | Voice input via Web Speech API, session summary |
| 6+8 | Integration + Polish | Day 5 | Error handling, landing page, responsive layout |
| 9+10 | Ship | Day 6 | Demo video, README, submission by 3 PM |

---

*Built by Eddie Belaval (id8Labs) for the Claude Code Hackathon, Feb 10-16, 2026.*
