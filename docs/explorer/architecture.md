# Parallax Explorer — Architecture & Build Knowledge

## Architecture

- Next.js 16 App Router with TypeScript strict mode
- Supabase for Postgres + Realtime subscriptions (messages arrive via channel subscriptions, not polling)
- Claude Opus 4.6 for NVC mediation analysis (non-streaming, fire-and-forget pattern)
- Ember design system — warm chocolate dark mode, temperature-reactive colors where light encodes data
- Web Speech API for voice input (Chrome only, graceful degradation elsewhere)
- Web Audio API for real-time orb waveform visualization (mic -> AudioContext -> AnalyserNode -> SVG bezier path)

## The NVC Dual-Lens System (Core IP)

- Classic NVC (Marshall Rosenberg): observation, feeling, need, request
- "Beneath the Surface" (my unique lens): subtext, blind spots, unmet needs, NVC translation, emotional temperature
- Both lenses analyze every message. The dual perspective catches what single-lens NVC misses.

## The Conflict Intelligence Engine (V3)

- 14 analytical lenses across 5 categories: Communication, Relational, Cognitive, Systemic, Resolution
- 6 context modes that activate the right lens stack: Intimate, Family, Professional Peer, Professional Hierarchical, Transactional, Civil/Structural
- Tiered activation: core lenses always analyze, secondary lenses fire on signal detection
- One prompt, one API call per message — all active lenses concatenated for cross-lens coherence

## Key Patterns

- Mediation pipeline: message -> POST /api/mediate -> Claude analyzes -> patch Supabase row -> Realtime UPDATE -> UI re-renders (fire-and-forget, simpler than streaming)
- Conductor system: phase-based state machine for remote mode onboarding (greeting -> gather_a -> gather_b -> synthesize -> active)
- The Melt: three-phase visual transformation (dissolve -> crystallize -> settled) using Knuth hash particles
- SignalRail: temperature timeline with backlit glow, showing emotional arc

## What Was Built

42+ PRs merged across 4 days. Key milestones:

- **Foundation (Day 1):** Supabase schema, API routes, Realtime hooks, split-screen layout, dual-lens NVC prompt, fire-and-forget mediation, TheMelt animation, SignalRail, voice input, session summaries
- **Visual Identity (Day 2):** Ember design system, audio waveform orbs, in-person mode, light mode, 475 tests across 47 files, ElevenLabs TTS, Conversational Layer (Explorer + Guide), self-narrating landing page
- **Intelligence (Day 3):** Integration audit, Intelligence Network (interview-built behavioral profiles), remote session redesign, interview page rebuild, branch consolidation
- **Entity (Day 4):** Ava named, solo mode, continuous conductor flow, global Ava pill + voice-first concierge, ParallaxOrb, anonymous auth, hands-free mode, turn-based timers, profile section

Every PR is documented in BUILDING.md with architectural reasoning and gate pass notes.
