# The Hackathon Journey

The Claude Code Hackathon runs February 10-16, 2026. Parallax was built from an empty repository to a production-deployed, multi-modal conflict resolution platform in seven days. This is the story of each day.

## Day 1 — February 10: The Foundation

Everything started with a scaffold. Next.js 16, Supabase, TypeScript strict mode. The first PR laid the entire infrastructure: database schema (sessions, messages, issues tables), API routes, Realtime subscription hooks, lobby UI with room code generation, split-screen layout, and the MessageCard component.

But the real breakthrough came in the second PR that same day: the NVC dual-lens prompt. This is Parallax's core intellectual property — a system prompt that analyzes every message through two lenses simultaneously. Classic NVC (Marshall Rosenberg's observation/feeling/need/request) gives structure. "Beneath the Surface" (subtext, blind spots, unmet needs, NVC translation, emotional temperature) gives depth. The combination sees things that neither lens catches alone.

By the end of Day 1, the core loop worked: two people could send messages, Claude would analyze each one through both lenses, and the analysis would appear in real-time via Supabase Realtime. The fire-and-forget pattern — send message, trigger analysis asynchronously, let Realtime deliver the result — proved simpler and more reliable than streaming.

## Day 2 — February 11: Visual Identity

Day 2 brought The Melt — the signature visual transformation that makes Parallax feel different from any other AI tool. When analysis completes, the raw message text dissolves into particles (using Knuth hash for deterministic positioning), then crystallizes into structured NVC insight, then settles into its final form. Three phases: dissolve, crystallize, settled.

The SignalRail arrived too — a temperature timeline running alongside the conversation that visualizes the emotional arc in real-time. Each message gets a backlit glow based on its emotional temperature: cool teal for calm observations, warm amber for moderate tension, hot rust for high emotional charge.

This was also the day of the product reframing. The original concept had two people sitting at the same device. But the real insight was that the split-screen remote mode isn't for the participants — it's a therapist/counselor review interface. A therapist gets the room code and sees both sides with all the NVC analysis layered in. Parallax isn't replacing therapists. It's giving them an auxiliary brain.

## Day 3 — February 12: Voice and Polish

Voice input landed via the Web Speech API (Chrome only, with graceful degradation for other browsers — the mic button shows "Voice requires Chrome" rather than disappearing entirely). Session summaries arrived: at the end of a conversation, Claude analyzes the full arc and generates takeaways for each person.

PR #6 was a hardening pass. PersonPanel was extracted from SessionView (328 lines down to 204), shared icons replaced five inline SVG duplicates, error states became visible inline rather than silent failures, and the landing page got its hero section: "See the conversation you're actually having."

## Day 4 — February 13: The Depth Play

This was the most ambitious day. The V3 Conflict Intelligence Engine introduced 14 analytical lenses — going far beyond NVC alone. The insight was that NVC has blind spots. It doesn't detect cognitive distortions (CBT). It doesn't see power dynamics. It doesn't recognize attachment patterns or systemic fairness issues.

The 14 lenses span five categories: Communication (NVC), Relational (Gottman, Drama Triangle, Attachment), Cognitive (CBT, Narrative), Systemic (SCARF, Organizational Justice, Psychological Safety, Jehn's, Power), and Resolution (Thomas-Kilmann, Restorative Justice, Interest-Based Relational). Six context modes route the right lenses to the right conflicts.

The User Intelligence Layer research also began — a vision for persistent, interview-built psychological profiles that would let Claude enter mediation already understanding each person. Full research documented in docs/research/user-intelligence-layer.md.

The conductor onboarding system for remote mode was built: a phase-based state machine (greeting, gather context from person A, gather from person B, synthesize, begin) that gives structure to the first minutes of a session.

## Day 5 — February 14: In-Person Mode

The X-Ray Scoreboard brought visual issue tracking to in-person sessions. As people talk, discrete issues are extracted and displayed as cards. Each card tracks whether it's been addressed, well-addressed, or made worse — giving a real-time scorecard of progress.

The Strategy Arena concept emerged: a backtesting framework for conflict resolution, inspired by algorithmic trading. Pre-authored conflict scenarios serve as "market data," and different lens configurations serve as "strategies." The arena runs scenarios through the real mediation pipeline and scores outcomes across five dimensions: de-escalation effectiveness, blind spot detection, NVC translation quality, lens activation relevance, and insight depth.

Stage Mode — a more structured format for guided conversations — was designed but deferred. The vision lives in BUILDING.md and the stage mode blueprint artifact.

## Day 6 — February 15: Parallax Speaks

The Conversational Layer. The idea that changed everything: what if Parallax could explain itself?

Two tiers, one infrastructure. The Explorer lets judges and developers talk to the product itself — ask about the architecture, the journey, the decisions. The Guide helps users understand and operate the product — explaining features, answering questions, eventually managing settings.

This is the feature you're using right now, if you're reading this through the Explorer.

## Day 7 — February 16: Ship

Final polish. Demo video recording. README expansion for judges. Submission.

## Key Pivots

Several pivots shaped the product during the build:

Pause became Parallax when the NVC analysis proved to be the breakthrough, not the reflection framework. The product identity shifted from mindfulness to conflict resolution.

Single-lens NVC became 14-lens Conflict Intelligence when research revealed NVC's blind spots. The single framework was elegant but incomplete. The multi-lens approach fills every gap.

Stateless mediation became conductor-driven when it became clear that cold-start sessions felt jarring. The conductor gathers context from both people before mediation begins, so Claude enters the conversation warm.

What was cut: multi-device real-time sync (too complex for hackathon scope — single device or room-code sharing instead), persistent user profiles in V1 (designed but not implemented — documented as V2 vision), and Stage Mode (designed as blueprint, zero code).

## The Numbers

- 6 merged PRs, 13 gate passes
- 86 tests across 6 suites, all passing
- 14 analytical lenses, 6 context modes
- Production deployed to Vercel
- Zero external dependencies beyond Next.js, Supabase, Claude, and Tailwind
