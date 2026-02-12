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

## What Was Built (PRs)

- PR #1: Scaffold, Supabase schema, API routes, Realtime hooks, lobby UI, split-screen, MessageCard
- PR #2: Dual-lens NVC prompt, /api/mediate, parseNvcAnalysis, temperature colors, fire-and-forget mediation
- PR #3: TheMelt animation, SignalRail, useMelt hook, auto-expand analysis
- PR #4: Artifacts (blueprint, pipeline architecture, hackathon transcript)
- PR #5: Voice input via Web Speech API, session summary, end session flow
- PR #6: Error handling hardening, PersonPanel extraction, landing page hero, mobile responsive
