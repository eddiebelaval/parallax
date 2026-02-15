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

## Day 4 — February 13: Ava Becomes Someone

The product became an entity. She got a name: Ava (Attuned Voice Advocate). The Continuous Conductor Flow made her speak immediately after every message instead of waiting for analysis to complete — because a real mediator doesn't go silent for 10 seconds, they acknowledge what was said. Solo Mode arrived: 1:1 conversations with Ava for people who want to process a conflict on their own, with an intelligence sidebar and HTML session export.

The biggest architectural change: Ava got a persistent presence. A global orb in the header, visible on every page — landing, home, settings, sessions. Click it anywhere and she activates: voice-first concierge with context-aware greetings, mic input, and text fallback. She reads the room — on the landing page she's a host, on internal pages she's a concierge, during sessions she's a supportive friend checking in from the sidelines.

ParallaxOrb replaced the old circle orbs with a canvas-based visualization: inner waveform driven by Web Audio API, orbiting particles that appear during speech and fade on silence. The orb became Ava's physical body — consistent everywhere.

Anonymous auth removed all friction. Turn-based timers gave structure to in-person mediation. Hands-free mode tuning (reduced silence timer, lowered mic gain) made voice input feel natural instead of jumpy.

## Day 5-7 — February 14-16: Polish and Ship

Final hardening, demo preparation, and submission. The remaining days focus on edge case fixes, the demo video, README expansion for judges, and ensuring every flow works end-to-end across solo, remote, and in-person modes.

## Key Pivots

Several pivots shaped the product during the build:

Pause became Parallax when the NVC analysis proved to be the breakthrough, not the reflection framework. The product identity shifted from mindfulness to conflict resolution.

Single-lens NVC became 14-lens Conflict Intelligence when research revealed NVC's blind spots. The single framework was elegant but incomplete. The multi-lens approach fills every gap.

Stateless mediation became conductor-driven when it became clear that cold-start sessions felt jarring. The conductor gathers context from both people before mediation begins, so Claude enters the conversation warm.

The product became an entity when Ava got a name, a voice, a body (the orb), and persistent presence across every page. The shift from "tool with a chatbot" to "entity that participates" is the core thesis of id8Labs.

## The Numbers

- 42+ merged PRs, 140+ commits across 4 days
- 475+ tests across 47 test files, all passing
- 14 analytical lenses, 6 context modes, 9 behavioral signal types
- 3 session modes: solo, remote, in-person
- Production deployed to Vercel
- ElevenLabs TTS with smart browser voice fallback
- Zero external dependencies beyond Next.js, Supabase, Claude, and Tailwind
