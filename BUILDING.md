# Building Parallax

## Table of Contents

### Methodology
- [ID8 Pipeline](#methodology-id8-pipeline) — The 11-stage build methodology
- [Gate Log](#gate-log) — Stage 1-5 gate passes and overrides

### Design Documents
- [V2: User Intelligence Layer](#v2-user-intelligence-layer) — Interview-built behavioral profiles
- [V3: Conflict Intelligence Engine](#v3-conflict-intelligence-engine) — 14 analytical lenses, 6 context modes
- [V4: Strategy Arena](#v4-strategy-arena----backtesting-for-conflict-resolution) — Backtesting for conflict resolution

### Build Log (Chronological)

**Day 1 — Feb 10: The 10-Hour Sprint**
- [Stage 4: Foundation Pour](#stage-4-foundation-pour) — PR #1, 8,832 lines, full app skeleton
- [Stage 5: Feature Blocks](#stage-5-feature-blocks--the-core-build) — PRs #2, #3, #5: Opus Engine, The Melt, Voice + Flow
- [Stage 6+8: Integration + Polish](#stage-68-integration--polish) — PR #6, error handling, mobile, cleanup
- [First Ship: Day One](#first-ship-day-one-complete) — PRs #7-10: README, LICENSE, Opus 4.6 upgrade

**Day 2 — Feb 11: Design System + Features**
- [Ember Design System](#ember-design-system--audio-waveform-orbs) — PR #11, visual identity + audio waveform orbs
- [In-Person Mode: First Build](#in-person-mode-first-implementation) — PR #12, shared device UI
- [Light Mode + Theme Toggle](#light-mode--theme-toggle) — PR #14, peer-driven default change
- [Stage 5 Hardening](#stage-5-hardening-assessment-fixes) — PR #18, assessment fixes
- [Stage 7: Test Coverage](#stage-7-test-coverage--full-stack) — PR #25, 475 tests across 47 files
- [Stage 8: In-Person Mode Redesign](#stage-8-in-person-mode--x-ray-glance-view) — PR #21, X-Ray Glance View
- [ElevenLabs Voice](#elevenlabs-voice-integration) — TTS integration
- [Conversational Layer](#conversational-layer-parallax-speaks) — PR #20, Explorer + Guide
- [Self-Narrating Landing Page](#self-narrating-landing-page) — PR #26, dynamic narration + visual redesign

**Day 3 — Feb 12: Polish + Ship**
- [Stage 9: Integration Audit](#stage-9-integration-audit--assessment-fixes) — PRs #23-24, audit + fixes
- [Intelligence Network: Implementation](#intelligence-network-implementation-pr-27) — PR #27
- [Intelligence Network: UI Integration](#intelligence-network-ui-integration--persona-architecture) — Persona architecture
- [Remote Session Redesign](#remote-session-redesign-ux-refinements) — PR #28, TTS, coaching tabs, waiting chat
- [Branch Consolidation](#branch-consolidation--production-deployment-2026-02-12) — 3 PRs merged to main
- [Interview Page Rebuild](#interview-page-conversational-rebuild) — PR #29, conversational design parity

**Day 4 — Feb 13: Features + Merge to Main**
- [Solo Mode](#solo-mode--solo-intelligence) — 1:1 conversations with Parallax, intelligence sidebar, HTML export
- [Turn-Based Timer](#turn-based-timer) — Configurable turn timer for in-person mediation
- [Remote Session Flow](#remote-session-flow-create-or-join) — Create-or-join choice for remote sessions
- [PR #34: Merge to Main](#pr-34-merge-to-main) — All Day 4 work consolidated and merged
- [Home-First Flow](#home-first-flow--embedded-assistant) — Embedded Parallax assistant, settings page, auth wall removal
- [ParallaxOrb](#parallaxorb--canvas-waveform) — Canvas-based orb with inner waveform + orbiting particles
- [Anonymous Auth + Hands-Free Everywhere](#anonymous-auth--hands-free-everywhere) — Zero-friction entry, auto-listen in all modes
- [Mic Tuning](#mic-sensitivity-tuning) — Reduced sensitivity + faster silence timeout

**Philosophy**
- [Opus at the Edge](#opus-at-the-edge-why-this-matters) — Token dashboard, self-assessment, building for Opus 5

---

## Methodology: ID8 Pipeline

This project follows the **ID8 Pipeline** -- an 11-stage build methodology
designed for AI-augmented development. Each stage has a gate question that
must be answered before advancing.

### The 11 Stages

| # | Stage              | Gate Question                                        | Phase    |
|---|--------------------|------------------------------------------------------|----------|
| 1 | Concept Lock       | "What's the one-liner?"                              | Planning |
| 2 | Scope Fence        | "What are we NOT building?"                          | Planning |
| 3 | Architecture Sketch| "Could another dev build from this blueprint?"       | Planning |
| 4 | Foundation Pour    | "Does the skeleton stand?"                           | Building |
| 5 | Feature Blocks     | "Does the core feature work end-to-end?"             | Building |
| 6 | Integration Pass   | "Do all the parts talk to each other?"               | Building |
| 7 | Test Coverage      | "Are the tests green and covering critical paths?"   | Quality  |
| 8 | Polish and Harden  | "Would you show this to a stranger?"                 | Quality  |
| 9 | Launch Prep        | "Is the launch checklist complete?"                  | Launch   |
| 10| Ship               | "Did you tell the world?"                            | Launch   |
| 11| Listen and Iterate | "What did users actually do?"                        | Launch   |

### Gate Rules

- Every commit references its stage: `feat(s5): add payment flow`
- Gates are checked with `id8 check` and advanced with `id8 advance`
- Some gates can be auto-verified; others require human sign-off
- Overrides are allowed but logged permanently: `id8 override --stage N --reason "..."`

### Build Journal

_Entries are added automatically at each gate pass._

---

### Stage 1: Concept Lock
- **Status:** In progress
- **Gate Question:** "What's the one-liner?"
- **Started:** 2026-02-10

---

### Stage 1: Concept Lock -- Override
- **Date:** 2026-02-10
- **Evidence:**
  - Override: Retroactive — concept locked
- **The One-Liner:** Real-time two-person conflict resolution powered by Claude.
- **Origin:** Born from Pause (an earlier id8Labs product for relationship check-ins). The hackathon prompt: what if instead of checking in after fights, you could have Claude in the room during them?
- **Name:** "Parallax" — seeing the same conflict from multiple angles simultaneously.

### Stage 2: Scope Fence
- **Status:** In progress
- **Gate Question:** "What are we NOT building?"
- **Started:** 2026-02-10

---

### Stage 2: Scope Fence -- Override
- **Date:** 2026-02-10
- **Evidence:**
  - Override: Scope locked
- **Building:** Two-person mediation, NVC analysis, real-time messaging, voice input, temperature visualization
- **NOT Building:** Group mediation (3+), mobile native app, payment/subscription, professional therapist tools, video/audio calling
- **Key Decision:** Shared device mode first (two people, one screen), remote mode second. The shared screen creates a theatrical effect — both people watch Claude analyze their words in real time.

### Stage 3: Architecture Sketch
- **Status:** In progress
- **Gate Question:** "Draw me the boxes and arrows."
- **Started:** 2026-02-10

---

### Stage 3: Architecture Sketch -- Override
- **Date:** 2026-02-10
- **Evidence:**
  - Override: Architecture in CLAUDE.md + blueprint
- **Stack:** Next.js 16 (App Router, TypeScript strict), Supabase (Postgres + Realtime), Claude Opus, Tailwind CSS, Vercel
- **Key Architectural Bets:**
  1. **Supabase Realtime for sync** — Both participants see messages, NVC analysis, and session state via Postgres INSERT/UPDATE events. No WebSocket server.
  2. **Claude as mediator, not chatbot** — Claude never joins the conversation. It analyzes each message through NVC, surfacing subtext and blind spots as annotations.
  3. **Temperature as data** — Emotional charge is a measured signal (0-1 float) that drives the entire visual system: glow color, intensity, orb animation.
  4. **API routes over backend** — Next.js API routes keep everything same-origin. No CORS, no separate backend.
- **Blueprint:** Interactive architecture map at `artifacts/parallax-build-plan-blueprint.html`

### Stage 4: Foundation Pour
- **Status:** In progress
- **Gate Question:** "Can we deploy an empty shell?"
- **Started:** 2026-02-10

---

### Stage 4: Foundation Pour -- Passed
- **Date:** 2026-02-10
- **Evidence:**
  - package.json is valid (name: "parallax").
  - Build completed successfully (exit code 0).
  - Next.js config found (next.config.ts) — deployable to Vercel without explicit config.
  - Database configuration found: supabase/config.toml

### Stage 5: Feature Blocks
- **Status:** In progress
- **Gate Question:** "Does this feature work completely?"
- **Started:** 2026-02-10

---

## V2: User Intelligence Layer

### The Problem

V1 Parallax is stateless. Every message is analyzed in isolation — Claude doesn't know who is speaking, what their communication patterns are, or what triggers them. It's like a mediator who walks into a room with no case file, no intake, no context. They have to figure everything out from the words on screen.

Human mediators never work this way. Couples therapists use a **three-session intake model**: one joint session, then individual sessions with each person. They build a case file before mediating. They know who pursues and who withdraws. They know what triggers escalation. They know the story each person tells about the conflict.

V2 gives Claude the same advantage.

### What It Is

A persistent, interview-built knowledge base for each person. Before their first mediation session, each user has a conversational interview with Claude — not a quiz, not a form, but a real conversation. Claude learns their communication style, emotional patterns, conflict tendencies, and the story they tell about their situation.

This profile persists across sessions. When two people enter a conflict, Claude already understands both of them. The mediation starts warm, not cold.

### Research Foundation

This feature was designed from validated psychological frameworks, not invented from intuition. Full research documented in [`docs/research/user-intelligence-layer.md`](docs/research/user-intelligence-layer.md), covering:

- **Psychological assessment frameworks** across all 14 analytical lenses
- **Competitive landscape** analysis of 15+ products (Relish, Maia, Woebot, Replika, BetterHelp, etc.)
- **Privacy and regulatory analysis** (FTC enforcement actions, state health privacy laws, GDPR Article 9)
- **Technical architecture patterns** (ChatGPT memory, Claude context engineering, MemGPT, Zep temporal graphs)
- **Interactive architecture blueprint** at `artifacts/parallax-user-intelligence-layer-blueprint.html`

Key validation: A 2026 clinical study (BDI-FS-GPT) showed AI conversational interviews achieve **higher diagnostic agreement** with clinical experts than paper questionnaires (kappa 0.72 vs 0.55). Audio-based responses produce 3x more data than text. The conversational approach isn't just friendlier — it's more accurate.

### The Interview System

Four phases, 16-22 questions, 10-15 minutes. Audio-first design.

**Phase 1: Context Setting (3-4 questions)**
Relationship type (auto-selects context mode), conflict description, goals, safety screening. This phase establishes trust and frames the conversation.

**Phase 2: Communication Profiling (8-10 questions)**
Mapped to validated instruments — no invented questions:

| Dimension | Validated Source | Sample Question |
|-----------|-----------------|-----------------|
| Conflict style | Thomas-Kilmann (5 modes) | "When you disagree, what's your instinct — fight for your position, find middle ground, give in, avoid, or collaborate?" |
| Emotional regulation | DERS-16 (5 subscales) | "When you're upset, can you still think clearly, or does emotion take over?" |
| Attachment orientation | ECR-RS (anxiety + avoidance) | "When things get tense, do you move toward the other person or need space?" |
| Fairness sensitivity | SCARF Model (5 domains) | "What feels most unfair about this situation?" |

**Phase 3: Context-Specific Deep Dive (3-5 questions)**
Different questions activate based on the relationship type selected in Phase 1:

| Context Mode | Instruments Activated | What It Captures |
|-------------|----------------------|-----------------|
| Intimate | Gottman Four Horsemen + Attachment | Criticism/contempt/defensiveness/stonewalling patterns, pursue-withdraw dynamic |
| Family | Attachment + Drama Triangle | Parent/child dynamics, rescuer/victim/persecutor roles |
| Professional Peer | Jehn's Conflict Typology + Psychological Safety | Is this a task, relationship, or process conflict? Can they speak freely? |
| Professional Hierarchical | Power Analysis + Organizational Justice | Decision-making power distribution, fairness perception |
| Transactional | IBR (Interest-Based Relational) | Positions vs. underlying interests |
| Civil/Structural | Power Analysis + Procedural Justice | Systemic power imbalances, process fairness |

**Phase 4: Narrative Capture (2-3 open-ended)**
- "Tell me what happened from your perspective."
- "What has been the hardest part?"
- "What would making this right look like?"

These open-ended responses are the richest signal. Claude extracts patterns, triggers, blind spots, and the dominant narrative frame — which the Narrative Mediation lens later uses to identify re-authoring opportunities.

### The Profile

Structured data extracted via Claude Structured Outputs (Zod schema, deterministic):

```
{
  attachment_style: { primary: "anxious", confidence: 0.72, evidence_count: 14 },
  communication_patterns: {
    style: "indirect",
    emotional_expression: "high",
    conflict_approach: "avoidant",
    reassurance_seeking: 0.8
  },
  triggers: [
    { trigger: "feeling dismissed", intensity: 0.9, confidence: 0.85, occurrence_count: 3 }
  ],
  strengths: [{ strength: "empathic listening", confidence: 0.7 }],
  growth_areas: [{ area: "expressing needs directly", confidence: 0.8 }],
  nvc_fluency: 0.3,
  default_conflict_mode: "avoiding"
}
```

Every trait has a confidence score (0-1) with calibration bands: 0-0.3 speculative, 0.3-0.6 moderate evidence, 0.6-0.8 strong evidence, 0.8-1.0 very clear pattern. Profiles evolve: reinforcing observations boost confidence (+10% per observation), staleness decays it (-5% per month without reinforcement), contradictions are flagged for resolution.

### Privacy Model: The One-Way Mirror

This is a mental health-adjacent tool handling sensitive psychological data. Privacy isn't a feature — it's a foundational architectural constraint.

**Core principle: private by default, consent-gated sharing.**

During mediation, Claude receives:
- The current speaker's profile (to understand their patterns)
- The shared conversation transcript (visible to both)
- NEVER the other person's private profile data

Person A's interview data never flows to Person B's view. Person B's triggers never appear in Person A's analysis. Claude uses each profile to *understand* that person's messages — not to reveal private information to the other party.

**Consent-gated sharing (optional):**
Users can choose to share specific categories (communication style preferences, conflict approach) while keeping others private (triggers, attachment patterns, narrative). Sharing is revocable at any time.

**Regulatory positioning:** Parallax is positioned as "conflict resolution / communication improvement" — not therapy, not mental health treatment. This avoids the heaviest regulatory burden (California CMIA, FDA SaMD classification) while still requiring:
- FTC Health Breach Notification Rule compliance
- Zero third-party tracking (no Meta Pixel, no Google Analytics on user data pages)
- Anthropic API zero-data-retention mode
- Right to deletion with cascading cleanup
- 18+ age gate

### Safety Architecture

Informed by enforcement actions against BetterHelp ($7.8M), Cerebral ($7.1M), Replika (EUR 5M), and Character.AI (wrongful death settlements).

**Non-negotiable safety features:**
1. **Abuse detection** — Claude's system prompt recognizes coercive control patterns, threats, intimidation, and gaslighting. When detected: route to safety resources, NOT mediation.
2. **"Are you safe?" check** — Private prompt before sessions, invisible to the other party.
3. **Crisis resources** — 988 Suicide & Crisis Lifeline, National Domestic Violence Hotline (1-800-799-7233), Crisis Text Line always visible.
4. **Asymmetric exit** — Either party can leave at any time without the other knowing why.
5. **Manipulation detection** — Behavioral vs. self-report triangulation: compare what users say about themselves (interview) with how they actually communicate (session behavior). Divergence signals gaming.
6. **Prominent disclaimers** — "Not therapy. Not a substitute for professional help."

### Context Injection During Mediation

The profile feeds into Claude's mediation analysis via progressive disclosure — more context surfaces as the conversation deepens:

| Conversation Depth | Profile Data Injected | % of Context Window |
|-------------------|----------------------|---------------------|
| Messages 1-5 | Core traits (attachment style, conflict mode) | ~2-3% |
| Messages 6-15 | Communication patterns, conflict approach | ~4-5% |
| Emotional intensity > 0.7 | Relevant triggers retrieved via semantic search | +5-10% |
| Messages 15+ at high intensity | Historical patterns, past session insights | +5-10% |

**Confirmation bias mitigation:** "Blind analysis first" — Claude analyzes each message without profile context, then with profile context. Both perspectives inform the final output. This prevents the profile from creating tunnel vision (e.g., interpreting everything through "anxious attachment" even when the person is making a valid point).

### Technical Architecture

- **Storage:** Supabase `user_profiles` table with JSONB columns for flexible schema evolution
- **Extraction:** Claude Structured Outputs with Zod schema — guaranteed JSON compliance, deterministic
- **Isolation:** Row-Level Security ensuring users can only access their own profile
- **Encryption:** Application-level AES-256-GCM for sensitive fields (triggers, raw interview transcripts)
- **Audit:** Every profile access logged (who, what, when, why)
- **Search (V3):** pgvector embeddings for semantic retrieval of relevant past insights during mediation
- **Temporal (V3):** Invalidation timestamps tracking when insights were superseded, inspired by Zep's bi-temporal model

### Competitive Position

Research across 15+ products revealed the "high personalization + conflict-focused" market quadrant is **empty**:

- Every relationship app (Relish, Maia, Paired, CoupleWork) focuses on bonding/maintenance, not conflict
- Every conflict tool (Dyspute.ai, TheMediator.AI) handles legal disputes, not interpersonal/emotional conflicts
- Every AI therapy tool (Woebot, Wysa, Replika) is single-user, not dual-perspective
- Nobody combines persistent interview-built profiles + NVC methodology + dual-perspective mediation

The User Intelligence Layer is what transforms Parallax from "NVC wrapper" to "mediator who knows you." It's the difference between a cold read and a warm session — and it's the foundation that makes V3's 14 analytical lenses dramatically more effective.

---

## V3: Conflict Intelligence Engine

> **Status:** Design document. The 14-lens analysis engine and 6 context modes are **fully implemented** in `src/lib/prompts.ts` and the `/api/mediate` pipeline. The context-mode-specific lens activation is production-ready.

### Why 14 Lenses?

NVC alone has blind spots. Marshall Rosenberg's framework is extraordinary for surfacing feelings and needs, but it was never designed to detect:

- **Cognitive distortions** (CBT) -- the thinking traps that make us misread reality
- **Power dynamics** -- who controls the conversation, whose voice gets silenced
- **Attachment patterns** -- why some people pursue and others withdraw under stress
- **Structural fairness** -- when the conflict isn't personal, it's systemic

Parallax V3 addresses this by composing 14 analytical frameworks into a single analysis engine. Each framework sees a different dimension of the same conflict:

| Category | Lenses | What They See |
|----------|--------|---------------|
| Communication | NVC | Feelings, needs, observations, requests |
| Relational | Gottman, Drama Triangle, Attachment | Relationship patterns, role dynamics, attachment styles |
| Cognitive | CBT, Narrative | Thinking traps, totalizing stories, identity claims |
| Systemic | SCARF, Org Justice, Psych Safety, Jehn's, Power | Social threats, fairness, safety, power structures |
| Resolution | TKI, Restorative, IBR | Conflict modes, repair pathways, hidden interests |

### Context Modes

Not every lens is relevant to every conflict. A workplace dispute needs SCARF and Psych Safety; a romantic conflict needs Gottman and Attachment. V3 introduces 6 context modes that activate the right lens stack:

| Mode | Lenses Active | Use Case |
|------|--------------|----------|
| Intimate | NVC, Gottman, CBT, Drama Triangle, Attachment, Narrative | Romantic partners |
| Family | NVC, Gottman, Narrative, Drama Triangle, Attachment, Power, Restorative | Family dynamics |
| Professional Peer | NVC, CBT, TKI, SCARF, Jehn's, Psych Safety | Coworker disputes |
| Professional Hierarchy | NVC, CBT, TKI, SCARF, Org Justice, Psych Safety, Power | Boss-employee |
| Transactional | NVC, CBT, TKI, IBR, SCARF | Customer-vendor disputes |
| Civil/Structural | NVC, Narrative, Power, Org Justice, Restorative, IBR | Community/institutional |

### Architecture Decisions

1. **One prompt, one API call.** All active lenses are concatenated into a single mega-prompt. Claude analyzes through all lenses in one pass, maintaining cross-lens coherence. This is cheaper and faster than sequential calls.

2. **Tiered activation.** Core lenses always analyze. Secondary lenses only analyze if signals are detected. This prevents forced empty analysis and keeps responses focused.

3. **Progressive disclosure UI.** Three tiers: (1) Primary insight sentence always visible, (2) NVC analysis on toggle, (3) Individual lens details on drill-down. Never show 14 lenses at once.

4. **JSONB schema expansion.** The existing `nvc_analysis` JSONB column absorbs the V3 schema. V1 fields remain at root level. New lens data nests under `lenses`. Zero migration risk.

5. **Backward compatibility.** V1 analysis still works. The parser wraps V1 responses in a V3 envelope. Old UI code reading root-level fields continues working.

---

## V4: Strategy Arena -- Backtesting for Conflict Resolution

> **Status:** Design document + framework code. The arena runner, evaluator, and 90 scenarios exist in `src/lib/arena/`. The Compare/Diagnose/Refine AI-assisted feedback loop is implemented. Not yet connected to CI or the production UI — file-based storage via `arena/store.ts`.

### The Insight

Algorithmic traders don't deploy a strategy on live money without backtesting it against historical data first. They replay past market conditions through their strategy, score the outcomes, and iterate before risking real capital.

Parallax V4 applies this exact methodology to conflict resolution. Instead of market data, we have pre-authored arguments. Instead of trading strategies, we have lens stacks. Instead of P&L, we have de-escalation scores, pattern detection accuracy, and translation quality.

The result: **empirical validation of which lens combinations work best for which conflict types.** Anyone can wrap NVC in an API call. Nobody has hundreds of empirically-validated strategy outcomes mapped to conflict categories.

### How It Works: Self-Play Backtesting

```
                     Pre-authored scenarios
                      (the "market data")
                             |
                             v
   +--------------------------------------------------+
   |  ARENA RUNNER                                     |
   |                                                   |
   |  For each conversation turn:                      |
   |    1. Build conversation history                  |
   |    2. Call mediateMessage() (real pipeline)        |
   |    3. Parse with parseConflictAnalysis()          |
   |    4. Score against planted patterns              |
   |    5. Accumulate results                          |
   |                                                   |
   +--------------------------------------------------+
                             |
                             v
                    SimulationRun + scores
                   (strategy performance)
```

The runner calls the **exact same pipeline** that live users hit. No mocks, no shortcuts. The "market data" (conversations) is fixed; the strategy (lens analysis) is what we're evaluating.

### 90 Scenarios Across 6 Categories

Each category has 15 scenarios across 5 sub-types (3 scenarios per sub-type). All 90 are fully authored with personas, backstories, conversation turns, and planted patterns:

| Category | Sub-types | Key Lenses | Status |
|----------|-----------|------------|--------|
| **Family** | Parent-adult child, siblings, in-laws, blended family, generational | NVC, Gottman, Narrative, Drama Triangle, Attachment, Power, Restorative | **15 scenarios authored** |
| **Intimate** | Jealousy/trust, household labor, intimacy mismatch, long-distance, co-parenting | Gottman, Attachment, Drama Triangle, CBT | **15 scenarios authored** |
| **Professional Peer** | Co-founder disputes, credit/blame, workload, communication, remote friction | SCARF, Jehn's, TKI, Psych Safety | **15 scenarios authored** |
| **Professional Hierarchy** | Performance reviews, promotions, micromanagement, ethics, mentorship | Power, Org Justice, Psych Safety, SCARF | **15 scenarios authored** |
| **Transactional** | Service failures, scope creep, payment disputes, contracts, neighbors | IBR, TKI, CBT, SCARF | **15 scenarios authored** |
| **Civil/Structural** | HOA, landlord-tenant, school board, resource allocation, discrimination | Power, Narrative, Org Justice, Restorative, IBR | **15 scenarios authored** |

### Evaluation Dimensions

Each conversation turn is scored across 5 dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| De-escalation effectiveness | 25% | Did emotional temperature drop vs. the previous turn? |
| Blind spot detection accuracy | 25% | Did the lenses catch the patterns we deliberately planted? |
| NVC translation quality | 20% | Does the translation sound human, warm, and jargon-free? |
| Lens activation relevance | 15% | Did the right lenses fire (not too many, not too few)? |
| Insight depth | 15% | Was the primary insight specific and actionable, not a platitude? |

Scores aggregate into a `SimulationRun` with an overall composite, de-escalation rate, pattern coverage, and a resolution arc classification (`resolved | improved | stable | worsened`).

### Family Pilot: What We Built

15 scenarios across 5 family sub-types, each with:

- **Two detailed personas** with backstories, emotional states, and communication patterns
- **A trigger event** that initiates the conflict
- **4-6 pre-authored conversation turns** -- intentionally messy, realistic, and human
- **2-3 planted patterns** -- specific blind spots the lens stack should detect (e.g., "Drama Triangle victim-rescuer flip", "Gottman harsh startup")
- **Tags** for retrieval and categorization

Example planted patterns from the Family pilot:
- Parent-adult child: Drama Triangle (parent as victim), attachment (anxious-anxious), power (sacrifice-based authority)
- Siblings: Narrative (totalizing "you always"), Gottman (criticism/defensiveness cycle), restorative justice (both sides harmed)
- In-laws: Power (family authority structure), Drama Triangle (rescuer trap), narrative (identity erasure)
- Blended family: Gottman (stonewalling + contempt), attachment disruption, narrative identity protection
- Generational: Power (generational authority), NVC (evaluation vs observation), CBT (catastrophizing)

### Architecture Decisions

1. **Static scenarios, not dynamic generation.** V4 uses pre-authored conversations as fixed "market data." Dynamic generation (Claude plays both sides) is V5 -- separating data from strategy keeps the backtest controlled.

2. **Reuse the live pipeline exactly.** `runSimulation()` calls `mediateMessage()` and `parseConflictAnalysis()` -- the same functions the API route uses. If the Arena scores well, we know live performance will match.

3. **Fuzzy keyword matching for pattern detection.** Planted patterns describe what the analysis *should* find. The scorer extracts keywords and checks if 40%+ appear in the analysis corpus. This accommodates Claude using different phrasing than the pattern description.

4. **Aggregate scoring with resolution arc.** Individual turn scores matter, but the trajectory matters more. A simulation that starts hot (0.8) and ends cool (0.3) is "resolved" -- the strategy worked even if individual turns scored differently.

5. **No database storage yet.** Simulation results live in memory during hackathon scope. Post-hackathon: store in Supabase for trend analysis and retrieval during live conversations.

### Arena Feedback Loop (AI-Assisted)

The Arena isn't just about running scenarios — it's a closed-loop system for improving the Conflict Intelligence pipeline. Four modules work together:

| Module | File | What It Does |
|--------|------|-------------|
| **Store** | `arena/store.ts` | Persists SimulationRun results to disk (JSON). Retrieves runs by scenario, context mode, or date range. |
| **Compare** | `arena/compare.ts` | Diffs two runs against the same scenario. Highlights score regressions, lens activation changes, and pattern detection shifts. |
| **Diagnose** | `arena/diagnose.ts` | Sends a failing run to Claude (meta-analyst role) to identify root cause — prompt gaps, lens blind spots, or scoring miscalibration. Returns structured diagnosis with confidence. |
| **Refine** | `arena/refine.ts` | Takes a diagnosis and generates prompt patches — specific system prompt modifications targeting the identified weakness. Patches can be applied and re-tested. |
| **Report** | `arena/report.ts` | Aggregates results across multiple runs into a human-readable summary: overall health, category breakdowns, trending issues, recommended actions. |

**The cycle:** Run scenario → Score → Compare to baseline → Diagnose regressions → Generate patches → Re-run → Compare again. This is how Parallax's prompts improve empirically, not by intuition.

### What's Next (Post-Hackathon)

- Dynamic conversation generation (Claude plays both sides — V5)
- Supabase storage for simulation results (currently file-based via `arena/store.ts`)
- Similarity search: retrieve relevant past Arena results during live conversations
- Automated batch runs across all 90 scenarios (infrastructure exists — `runAllForMode()` + `store.ts`)
- CI integration: run Arena on prompt changes to catch regressions (diagnose + refine modules ready)

---

## Stage 4: Foundation Pour

**Date:** 2026-02-10 | **PR:** [#1](https://github.com/eddiebelaval/parallax/pull/1) (+8,832 lines, 35 files)
**Gate:** "Does the skeleton stand?"

The biggest single PR in the project — 8,832 lines of green. Built the entire application skeleton in one pass with a three-agent team (Luna on frontend, River on Realtime, Casey on QA).

### What Was Built

| Layer | Files | What It Does |
|-------|-------|-------------|
| **Supabase schema** | `supabase/config.toml`, migrations | `sessions` + `messages` tables with RLS, Realtime enabled, 6-char room code generation |
| **API routes** | 4 routes in `src/app/api/` | Create session, get session, join session, send message |
| **Realtime hooks** | `useSession.ts`, `useMessages.ts` | Session state updates + message INSERT/UPDATE events with turn logic |
| **Landing page** | `src/app/page.tsx` | Create/join lobby with room code input |
| **Session view** | `SessionView.tsx`, `PersonPanel.tsx` | Split-screen with name entry, waiting state, turn-based messaging |
| **Message display** | `MessageCard.tsx` | NVC analysis expand/collapse stub, temperature indicator (wired in Stage 5) |
| **Design system** | `globals.css`, `layout.tsx` | Factory-Inspired tokens (Geist fonts, warm grays, orange/amber/teal accents) |

### Gate Verification

- Two browser tabs can create/join session with room code
- Messages appear in real-time on both tabs
- Turn-based logic works (alternating turns)
- Build passes, deployed to Vercel production

---

## Stage 5: Feature Blocks — The Core Build

**Date:** 2026-02-10 | **PRs:** [#2](https://github.com/eddiebelaval/parallax/pull/2), [#3](https://github.com/eddiebelaval/parallax/pull/3), [#5](https://github.com/eddiebelaval/parallax/pull/5)

Three PRs in 90 minutes. Each one added a core capability.

### 5a: Opus Mediation Engine (PR #2, +647/-77)

The beating heart of Parallax. Built the full 9-step reactive NVC analysis pipeline:

1. User sends message → 2. Fire-and-forget mediation trigger → 3. Fetch conversation context → 4. Call Claude with dual-lens NVC prompt → 5. Parse `NvcAnalysis` response → 6. Patch Supabase row → 7. Realtime UPDATE fires → 8. Clear loading state → 9. Render analysis

**The dual-lens system prompt** (core IP, in `src/lib/prompts.ts`):
- **Classic NVC** (Marshall Rosenberg): Observations, feelings, needs, requests
- **"Beneath the Surface"** (Parallax unique lens): Subtext, blind spots, unmet needs, what they actually mean

Each message gets a temperature score (0-1 float) measuring emotional charge. Temperature drives the entire visual system — glow colors, border intensity, orb animation.

### 5b: The Melt (PR #3, +402/-77)

The signature animation. When NVC analysis arrives, the raw message "dissolves" and "crystallizes" into structured understanding:

1. **Idle** → 2. **Dissolving** (particle scatter via Knuth hash) → 3. **Crystallizing** (analysis materializes) → 4. **Settled**

`TheMelt.tsx` uses CSS custom properties bridge for GPU-accelerated animation. History messages skip to settled state. The Signal Rail (`SignalRail.tsx`) renders a temperature timeline — a 4px vertical bar where each segment glows the temperature color of that message. Latest segment pulses.

### 5c: Voice + Flow (PR #5, +609/-30)

Transformed Parallax from text-only to full conversation:

- **VoiceInput.tsx** — Web Speech API push-to-talk. `finalTranscriptRef` pattern prevents duplicate emissions. `onMouseLeave` guard handles accidental release.
- **SessionSummary.tsx** — End-of-session analysis: conversation arc, temperature trajectory, key moments, per-person insights. Discriminated union state management (`idle | loading | ready | error`).
- **End Session flow** — POST endpoint → Realtime UPDATE → both participants see summary simultaneously.

---

## Stage 6+8: Integration + Polish

**Date:** 2026-02-10 | **PR:** [#6](https://github.com/eddiebelaval/parallax/pull/6) (+557/-378, 19 files)
**Gate:** "Do all the parts talk to each other?"

Driven by automated code review + code simplifier audit of all 25 source files. This pass found and fixed every rough edge from the rapid feature build.

| Category | Changes |
|----------|---------|
| **Error handling** | Env validation at init (fail fast, not mid-demo), mediation error UI (not silent), `useSession` race condition fix (subscribe before fetch) |
| **Component extraction** | `SessionView` 328→204 lines. 5 inline SVGs→2 shared icon components. Nested ternary→5-line helper |
| **Landing page** | "See the conversation you're actually having" headline, $300-500/hr problem statement, 3-step how-it-works pills |
| **Mobile responsive** | 44px touch targets (Apple HIG), compact headers, responsive padding |
| **Cleanup** | Shared helpers (`conversation.ts`), dead code removal, type reorganization, room code collision retry |

---

## First Ship: Day One Complete

**Date:** 2026-02-10 | **PRs:** [#7](https://github.com/eddiebelaval/parallax/pull/7), [#8](https://github.com/eddiebelaval/parallax/pull/8), [#9](https://github.com/eddiebelaval/parallax/pull/9), [#10](https://github.com/eddiebelaval/parallax/pull/10)

Four PRs in 2 hours completed the first ship cycle. Parallax went from first commit to production in 6 hours.

| PR | What | Why |
|----|------|-----|
| **#7** | README (23→86 lines), BUILDING.md vision docs, Stage Mode blueprint artifact | Judges need to understand the project without running it |
| **#8** | MIT LICENSE file | Hackathon OSS compliance. GitHub license detection now shows "MIT License" |
| **#9** | Complete BUILDING.md build journal | Stage 6+8 and 9+10 sections, artifact table, commit history reading guide |
| **#10** | Upgrade Sonnet 4.5 → Opus 4.6 | The file is literally called `opus.ts` — now it runs Opus. Hackathon scores 25% on Opus Use. |

### Day One Stats

- **6 PRs merged** (#1-#6) building the product
- **4 PRs merged** (#7-#10) shipping it
- **10,500+ lines of code** written
- **Production deployed** to Vercel
- **10 hours** from first commit to live product

---

## Ember Design System + Audio Waveform Orbs

**Date:** 2026-02-11 | **PR:** [#11](https://github.com/eddiebelaval/parallax/pull/11) (+908/-166, 22 files)

The visual identity transformation. Parallax went from generic dark mode (Factory-Inspired design system) to Ember — a warm, organic aesthetic that matches its purpose.

### Ember: The Design Philosophy

**"Light = Data."** Glow color and intensity encode emotional temperature. It's never decorative.

| Before (Factory) | After (Ember) |
|-------------------|---------------|
| Near-black (#020202) | Deep chocolate (#0f0b08) |
| Cool gray neutrals | Warm brown neutrals |
| Geist + Geist Mono | Source Serif 4 + Source Sans 3 + IBM Plex Mono |
| Orange/amber/teal accents | Same accents, now temperature-reactive with backlit glow borders |

### Audio Waveform Orbs

Real-time audio visualization via Web Audio API:

- `useAudioAnalyser.ts` — `getUserMedia` → `AudioContext` → `AnalyserNode` → Float32Array waveform data at 60fps
- `AudioWaveformOrb.tsx` — Downsamples 1024 points to 12 bezier control points, renders SVG path
- `OrbStrip.tsx` — Three orbs (Person A warm, Claude teal, Person B hot) with turn-based mic routing
- `useSyntheticWaveform.ts` — Multi-harmonic "thinking" pattern for Claude's orb during NVC analysis

**Graceful degradation:** Mic denied → orbs fall back to CSS `orb-idle` breathing animation.

---

## In-Person Mode: First Implementation

**Date:** 2026-02-11 | **PR:** [#12](https://github.com/eddiebelaval/parallax/pull/12) (+1,416/-631, 19 files)

The pivot from remote-only to shared device. Two people sit at the same screen. Instead of split-panel messaging, they share a single conversation view with a turn indicator.

### What Was Built

| Component | Purpose |
|-----------|---------|
| `SessionView` branching | `mode === 'in_person'` routes to entirely different UI |
| `OnboardingFlow` | 3-step guided setup: name entry → context mode selection → first speaker choice |
| `XRayView` | Single-column conversation with turn-based input |
| `XRayScoreboard` | Two-column issue board tracking extracted topics |
| `IssueCard` | Individual issues with status color and grade badge |
| `ActiveSpeakerBar` | Turn indicator + voice/text input with mode toggle |
| Onboarding API | Server-side state machine (`/api/sessions/{code}/onboarding`) managing the 3-step flow |

---

## Light Mode + Theme Toggle

**Date:** 2026-02-11 | **PR:** [#14](https://github.com/eddiebelaval/parallax/pull/14) (+104/-10, 3 files)

Peer feedback drove this change — light themes resonate more for wellness/communication tools.

- **Light mode default** — Warm parchment background (#f5efe6) instead of dark chocolate
- **Theme toggle** — Monospace LIGHT/DARK label in header, localStorage persisted
- **FOUC prevention** — Blocking `<script>` in `<head>` reads localStorage before first paint
- **Adapted glow** — "Watercolor stain" technique for light backgrounds: higher opacity (0.22/0.45 vs 0.10/0.25), solid colored `border-left` anchor, wider 12px blur for soft wash

---

## Stage 5 Hardening: Assessment Fixes

**Date:** 2026-02-11
**Gate:** "Are all known issues from the feature assessment resolved?"

### What We Fixed

After building V3 (Conflict Intelligence Engine) and V4 (Strategy Arena), we ran a systematic assessment of every feature block. This pass hardened the codebase before integration and launch.

| Item | What We Did |
|------|-------------|
| **V3 Pipeline Verification** | Traced context_mode from session DB row through mediateMessage() to buildConflictIntelligencePrompt(). Confirmed working end-to-end -- no fix needed. |
| **parseConflictAnalysis V3 Tests** | Added 15 tests: full V3 payload, sparse lenses, V1 fallback wrapping, missing NVC root fields, invalid JSON, temperature/severity clamping, activeLenses fallback, resolutionDirection validation. |
| **context-modes.ts Tests** | New test file with 13 invariant tests: every ContextMode has non-empty lenses, NVC is always first in every mode, LENS_METADATA covers all 14 LensIds, CONTEXT_MODE_INFO covers all 6 modes, no duplicate lenses per mode, family mode has exactly 7 lenses. |
| **Session Summary V3 Upgrade** | Extended SessionSummaryData type with lensInsights and resolutionTrajectory. Summary route now extracts V3 ConflictAnalysis from message rows and enriches Claude's prompt with resolution direction trends, lens activation counts, and per-message primary insights. SessionSummary.tsx renders "Lens Insights" and "Resolution Trajectory" sections. |
| **VoiceInput UX Polish** | Changed unsupported-browser behavior from hiding the entire component to showing a disabled mic button with "Voice requires Chrome" informational label. Text input remains fully functional. |
| **UI Flow Audit** | Added endingSession state to prevent double-click on "End" button. Verified: send buttons have disabled states, error states are visible inline, mediation analysis has loading indicators, mobile responsive on all components, empty message submission prevented. |
| **Conductor Integration** | Mediator renamed from "Claude" to "Parallax" for brand consistency. Conductor system added for guided onboarding in remote mode (greeting, context gathering, synthesis phases). |
| **README Expansion** | Rewrote for hackathon judges: V3 Conflict Intelligence Engine section (14 lenses, 6 context modes), V4 Strategy Arena vision, updated architecture with lens-aware pipeline, environment variables, testing section. |

### Test Results

- **86 tests across 6 suites** -- all passing
- `npx tsc --noEmit` -- clean
- `npm run build` -- production build succeeds
- UI for browsing Arena results and strategy performance

---

## Stage 8: In-Person Mode — X-Ray Glance View

**Date:** 2026-02-11
**Gate:** "Would you show this to a stranger?"

### What We Built

A complete reimagining of the in-person mode. The old flow used form-based onboarding (3 manual steps: names, stage, goals) followed by a basic XRayView that buried NVC analysis inside expandable MessageCards. Two people sitting down to resolve a conflict shouldn't fill out forms.

**The X-Ray Glance View** is a voice-first, three-column layout where Parallax (the AI mediator) drives the entire session — from introductions through goal-setting to facilitation — via adaptive conversation.

### Architecture

| Component | Purpose |
|-----------|---------|
| `XRayGlanceView.tsx` | Three-column orchestrator: signals left, messages center, signals right |
| `ParallaxPresence.tsx` | Teal orb entity — the AI's visual presence in the room |
| `SignalCard.tsx` | Compact 2-3 line NVC signal card (temperature dot, insight, unmet needs) |
| `ActionPanel.tsx` | Issue tracking panel per person (replaces XRayScoreboard) |
| `IssueDrawer.tsx` | Overlay drawer with full issue board |
| `ActiveSpeakerBar.tsx` | Turn indicator + voice/text input |
| `useParallaxVoice.ts` | ElevenLabs TTS (Ava voice, Turbo v2.5) with browser SpeechSynthesis fallback |

### Key Decisions

1. **Adaptive Conductor** — A single Claude prompt (`buildAdaptivePrompt()`) replaces the 4-phase remote conductor for in-person mode. Claude extracts names from natural speech ("I'm Sarah" → `names.a: "Sarah"`), decides pacing, and transitions to active phase when both sides are heard.

2. **Voice-first** — TTS speaks every mediator message. The ActiveSpeakerBar defaults to voice input. Text is the visual backup layer, not the primary interface.

3. **Retroactive analysis** — When transitioning from onboarding to active phase, the last 2 human messages are retroactively sent to NVC analysis and issue extraction so the side panels seed immediately.

4. **Intervention system** — After each active-phase message, a delayed conductor check detects escalation patterns and can inject mediator interventions. Also detects resolution moments.

### What Got Replaced

The following components were made obsolete by XRayGlanceView and kept as dead code (removed in Stage 9):
- `OnboardingFlow.tsx` — 3-step form-based onboarding
- `XRayView.tsx` — Old in-person message viewer
- `XRayScoreboard.tsx` — Old two-column issue board
- `InsightPanel.tsx` — Unused insight display
- `api/sessions/[code]/onboarding/route.ts` — Form-based onboarding API

---

## Stage 9: Integration Audit & Assessment Fixes

**Date:** 2026-02-12
**Gate:** "Is the launch checklist complete?"

### Integration Audit

Ran a full-stack integration audit across all layers (DB → API → Types → State → UI → Page). Results:

- **17 features** identified across the full stack
- **11 COMPLETE** (73%) — fully wired end-to-end
- **4 ORPHANED** — components replaced by XRayGlanceView (cleaned up below)
- **2 BACKEND ONLY** — Health Check (intentional), Strategy Arena (test-only)

Interactive audit artifact: `artifacts/integration-audit.html`

### Assessment Fixes

| Item | What We Did |
|------|-------------|
| **Remove orphaned components** | Deleted 5 files: OnboardingFlow.tsx, XRayView.tsx, XRayScoreboard.tsx, InsightPanel.tsx, and the onboarding API route. Zero remaining imports — clean removal. |
| **Wire SignalCard into XRayGlanceView** | SignalCard now renders in both side columns: Person A's NVC signals on the left rail, Person B's on the right. Each message with `nvc_analysis` gets a compact signal card showing temperature, primary insight, and unmet needs. |
| **Rate limiting on Claude API routes** | Created `src/lib/rate-limit.ts` — in-memory rate limiter (Map with IP → timestamps, 30 req/min). Wired into all 4 Claude-calling routes: mediate, conductor, issues/analyze, summary. Returns 429 on exceed. |
| **Messages UPDATE RLS policy** | Added migration `20260212000000_add_messages_update_rls.sql` — allows UPDATE on messages table so the mediate route can patch `nvc_analysis` and `emotional_temperature` after Claude analysis completes. |
| **Strategy Arena documentation** | Documented in this file (see V4 section above). The Arena is a backtesting framework that validates Conflict Intelligence output against planted conflict patterns. 15 family scenarios, 5 scoring dimensions, 36 unit tests. Intentionally test-only — no UI needed. Run with `npx vitest run`. |

### Quality Assurance: Strategy Arena

The Strategy Arena (`src/lib/arena/`) is Parallax's empirical validation system. It applies algorithmic trading's backtesting methodology to conflict resolution:

- **What it does:** Replays pre-authored conflict scenarios through the exact same analysis pipeline used in live sessions
- **Scoring:** 5 dimensions — de-escalation effectiveness (25%), blind spot detection (25%), NVC translation quality (20%), lens activation relevance (15%), insight depth (15%)
- **Coverage:** 90 scenarios across 6 context modes (15 each, 5 sub-types per mode, 3 scenarios per sub-type)
- **Feedback loop:** AI-assisted diagnosis (Claude meta-analyst) + prompt patch generation + baseline comparison
- **Tests:** 36 unit tests across 4 test files — all passing
- **Run:** `npx vitest run`
- **Intentionally test-only** — no API routes or UI. The Arena validates the analysis pipeline; results are used to tune prompts, not displayed to users.

### Verification

- **86 tests across 6 suites** — all passing
- `npx tsc --noEmit` — clean
- `npm run build` — production build succeeds
- No orphaned components remaining
- SignalCard visible in three-column layout
- Rate limiting active on all Claude API routes

---

## Intelligence Network: Implementation (PR #27)

**Date:** 2026-02-12
**Branch:** `parallax/intelligence-network`

### From Vision to Code

The V2 section above describes the *why* and the *what*. This section documents what was actually built in PR #27 — the first implementation of the Intelligence Network.

### What Was Built

**8 implementation tasks, executed in dependency order:**

| # | Task | Files | Lines |
|---|------|-------|-------|
| 1 | Database Migration | `supabase/migrations/20260212100000_add_intelligence_network.sql` | 168 |
| 2 | TypeScript Types | `src/types/database.ts` (modified) | +247 |
| 3 | Auth System | `src/lib/auth.ts`, `src/hooks/useAuth.ts`, `src/app/auth/page.tsx` | 225 |
| 4 | Interview Prompts + Signal Extractor | `src/lib/interview-prompts.ts`, `src/lib/signal-extractor.ts` | 440 |
| 5 | Interview API | `src/app/api/interview/route.ts` | 164 |
| 6 | Interview UI | `src/hooks/useInterview.ts`, `src/app/interview/page.tsx` | 335 |
| 7 | Signal Injection into Mediation | `src/lib/context-injector.ts`, modified `src/app/api/mediate/route.ts` + `src/lib/opus.ts` | 225 |
| 8 | Profile Dashboard | `src/app/profile/page.tsx` | 214 |

### Database Schema

Four new tables with Row-Level Security:

```sql
user_profiles          -- One per user. Stores interview state + raw responses.
behavioral_signals     -- Typed signal extractions (9 types). Unique per user+signal_type.
signal_consent         -- Per-session consent records. Default: self_only.
signal_access_log      -- Audit trail. Every signal read is logged.
```

The `sessions` table gains `person_a_user_id` and `person_b_user_id` — nullable foreign keys to `auth.users`. This is the bridge between anonymous room-code sessions and persistent user profiles.

RLS policies enforce strict isolation: users can only read/update their own profile and signals. Consent records are scoped to session participants. The access log is insert-only from the service role.

### The 9 Signal Types

Extracted from interviews via Claude, each with a confidence score (0-1):

| Signal | Type Interface | What It Captures |
|--------|---------------|-----------------|
| `attachment_style` | `AttachmentSignal` | Primary + secondary attachment (secure/anxious/avoidant/disorganized) |
| `conflict_mode` | `ConflictModeSignal` | TKI mode + assertiveness/cooperativeness axes |
| `gottman_risk` | `GottmanRiskSignal` | Which of the Four Horsemen are present + repair capacity |
| `regulation_pattern` | `RegulationSignal` | Regulated/dysregulated/over-regulated + flooding onset |
| `scarf_sensitivity` | `ScarfSignal` | Primary domain + per-domain sensitivity scores |
| `drama_triangle` | `DramaTriangleSignal` | Default role + rescuer trap risk |
| `values` | `ValuesSignal` | Core values, communication values, unmet needs |
| `cbt_patterns` | `Record<string, unknown>` | Cognitive distortion patterns (flexible schema) |
| `narrative_themes` | `Record<string, unknown>` | Dominant narratives, identity claims (flexible schema) |

### Interview Prompt Architecture

Four phases, each with a tailored system prompt. Claude acts as a warm, conversational interviewer — never clinical, never robotic. Each phase extracts structured data via a JSON block appended after a `[PHASE_COMPLETE]` sentinel.

**Phase 1: Context Setting**
Who they are, what brings them here, what kind of relationship is involved. This auto-selects the context mode for Phase 3. Also establishes trust — Claude explains what the interview is for and how the data will be used.

**Phase 2: Communication Profiling**
Scenario-based questions mapped to ECR-RS (attachment), TKI (conflict modes), and DERS-16 (emotional regulation). Not clinical scales — Claude wraps validated instrument items in natural conversation. Example: "When things get tense in a relationship, what's your instinct — do you move toward the other person, or do you need space first?"

**Phase 3: Context-Specific Deep Dive**
Adapts based on the context mode from Phase 1:
- **Intimate** → Gottman Four Horsemen, pursuit-withdrawal dynamics
- **Professional** → SCARF sensitivity, psychological safety signals
- **Family** → Intergenerational patterns, loyalty binds, Drama Triangle roles

**Phase 4: Narrative Capture**
Open-ended storytelling. "Tell me about a conflict that still bothers you." Claude extracts values, growth edges, and narrative themes from free-form responses.

### The Anonymization Boundary

This is the core architectural insight: **signals are classifications, not summaries.**

When Claude extracts "anxious-preoccupied attachment style" from someone's story about their father leaving, the signal contains `{ primary: "anxious", confidence: 0.72 }` — not "my father left when I was 12." The signal is a categorical label derived from a pattern, not a condensed version of the narrative.

This is a **one-way function.** You cannot reconstruct the source narrative from the signal. Multiple completely different life experiences can produce the same attachment classification. This is what makes cross-party sharing safe — sharing "avoidant conflict mode" reveals a behavioral tendency, not a personal story.

### Signal Extraction Pipeline

```
Claude interview response
        ↓
[PHASE_COMPLETE] sentinel detection
        ↓
JSON block extraction (regex parse)
        ↓
Phase-specific signal mapping (switch on phase number)
        ↓
Typed ExtractedSignal[] array
        ↓
Upsert to behavioral_signals (onConflict: user_id + signal_type)
        ↓
Raw extraction saved to user_profiles.raw_responses[]
```

Key design decisions:
- **Upsert, not insert.** Re-interviewing updates existing signals rather than creating duplicates.
- **Raw preservation.** The full extraction JSON is appended to `raw_responses` for audit and potential re-processing.
- **Phase-complete gating.** Signals are only extracted when a phase completes — partial conversations don't pollute the profile.

### Cross-Party Signal Injection

When two people with profiles enter a mediation session:

1. `buildIntelligenceContext()` fetches both parties' behavioral signals
2. `checkMutualConsent()` verifies both have `anonymous_signals` consent for this session (not revoked)
3. `formatSignalsForClaude()` renders signals as human-readable text (e.g., "Conflict Mode: competing (assertiveness: 0.8, cooperativeness: 0.3)")
4. `buildIntelligencePromptSection()` wraps with instructions:
   - "Predict, don't diagnose"
   - "Tailor your language to their communication style"
   - "Name patterns by framework, not by label"
   - "Never reveal one party's signals to the other"
5. The intelligence section is appended to Claude's mediation system prompt

**Zero-disruption guarantee:** When no profiles exist (the common case during hackathon), the intelligence section is an empty string. The system prompt is identical to V1. No behavioral change, no edge cases, no risk.

**Audit trail:** Every signal access is logged to `signal_access_log` with the signal owner, accessor session, signal type, consent level, and timestamp.

### Auth System

Minimal but functional:

| File | What It Does |
|------|-------------|
| `src/lib/auth.ts` | Wraps Supabase Auth: `signUp()`, `signIn()`, `signOut()`, `getUser()`, `getUserProfile()`. Sign-up auto-creates a `user_profiles` row. |
| `src/hooks/useAuth.ts` | React hook returning `{ user, loading }` with auth state subscription via `onAuthStateChange`. |
| `src/app/auth/page.tsx` | Sign up / sign in toggle form. Ember design system. Privacy notice about encryption and RLS. Redirects to `/interview` on success. |

### Interview UI

Conversational interface with full session parity (rebuilt in Stage 9):

- **ParallaxPresence orb** — Teal orb with synthetic waveform while thinking, real audio waveform during TTS
- **Typewriter + TTS** — Each Parallax response reveals character-by-character with synchronized ElevenLabs voice
- **Backlit glow messages** — `backlit-cool` for Parallax, `backlit-warm` for user, matching session design language
- **ActiveSpeakerBar** — Voice-first input (Web Speech API) with text fallback, replaces form input
- **Turn-taking** — Input disabled while Parallax is thinking, typing, or speaking (`isBusy` gate)
- **Phase indicator** — Minimal monospace line ("Phase 1 of 4 · Context Setting"), no progress bar
- **Phase transitions** — 150ms opacity fade, cancel in-progress TTS/typewriter, reset tracking refs
- **Completion screen** — Parallax orb (idle breathing), signal count, profile/session CTAs
- **Auth-gated** — Redirects to `/auth` if not logged in

### Profile Dashboard

Displays behavioral signals in type-specific cards:

| Signal Type | Rendering |
|-------------|-----------|
| `attachment_style` | Primary style (capitalized) + optional secondary |
| `conflict_mode` | Mode + assertiveness/cooperativeness scores |
| `gottman_risk` | Horsemen as colored tags, repair capacity score |
| `regulation_pattern` | Style label + flooding onset |
| `values` | Core values as teal tags |
| Default | Raw JSON (monospace, for unrecognized types) |

Each card shows the signal label and confidence percentage. The page shows interview completion status and total signal count.

### Architecture Decisions

1. **Supabase Auth, not custom.** Supabase provides auth out of the box with RLS integration. Adding a custom auth layer would be over-engineering for hackathon scope and would require managing JWTs, password hashing, and session tokens manually.

2. **Sentinel-based phase detection.** Claude's response includes `[PHASE_COMPLETE]` or `[INTERVIEW_COMPLETE]` markers. The `cleanResponseForDisplay()` function strips these before showing the response to the user. This is simpler than structured output parsing for phase transitions because the phase boundary is a conversation-level decision, not a data extraction.

3. **System prompt append for intelligence context.** The mediation route passes an optional `intelligenceContext` string to `mediateMessage()`, which simply concatenates it to the system prompt. No new API parameter, no structural change to the Claude call. Minimal diff, maximum impact.

4. **Flexible schema for CBT and narrative signals.** These signal types use `Record<string, unknown>` rather than strict interfaces because the extraction format is still evolving. The 7 other signal types have strict interfaces because their schemas are well-defined by their source instruments (ECR-RS, TKI, DERS-16, etc.).

5. **Per-session consent, not global.** A user grants consent for signal sharing on a per-session basis. This means they can share signals with their partner but not their coworker, or vice versa. Consent is revocable — setting `revoked_at` immediately blocks further signal access for that session.

### Type System Integration

The Intelligence Network tables were initially defined as standalone TypeScript interfaces (`UserProfile`, `BehavioralSignal`, etc.) but were not registered in the Supabase `Database` type — the interface that powers `.from()` type inference. This caused all queries to those tables to resolve as `never`.

**Fix:** Added all 4 tables (`user_profiles`, `behavioral_signals`, `signal_consent`, `signal_access_log`) inline to `Database.public.Tables` using primitive types. The standalone interfaces are kept for application-level use, but the `Database` type uses inline definitions to avoid breaking Supabase SDK's deep conditional type resolution.

Additional fixes:
- **tsconfig.json** — Excluded `playwright.config.ts` from type checking (it was outside the `e2e/` exclude but still matched `**/*.ts`)
- **Profile page** — Fixed `unknown && JSX.Element` pattern (React can't render `unknown`; narrowed with `!= null`)
- **Interview route** — Cast `signal_value` from `SignalValue` union to `Record<string, unknown>` for DB insert compatibility

### Verification

- `npm run build` — production build succeeds (clean)
- All 27 files committed to `parallax/intelligence-network` branch
- Arena: 90 scenarios across 6 context modes (15 each) — all importable and type-safe
- Feedback loop: 5 modules (store, compare, diagnose, refine, report) — all compile clean
- Intelligence Network: auth, interview, profile, signal extraction, context injection — all wired

### What's Not Yet Built

| Item | Status | Notes |
|------|--------|-------|
| ~~Supabase migration applied~~ | **Done** | Applied both migrations (messages UPDATE RLS + Intelligence Network) |
| Email Auth enabled | Pending | Toggle in Supabase dashboard |
| ~~Voice input in interview~~ | **Done** | Rebuilt interview page with ActiveSpeakerBar (voice + text), ParallaxPresence orb, typewriter reveals, TTS |
| ~~Auth state in nav~~ | **Done** | AuthSlot in header: sign in link → user initial circle + sign out |
| ~~"Enrich Profile" CTA~~ | **Done** | Landing page Intelligence Network section + session summary profile suggestion |
| Profile evolution | V3 | Post-session observation extraction, confidence reinforcement/decay |
| Progressive disclosure | V3 | Context injection that deepens with conversation length and intensity |
| Blind analysis first | V3 | Analyze without profile, then with — prevents tunnel vision |

### Visualization

Interactive architecture artifact: `artifacts/parallax/parallax-intelligence-network.html`

7-tab visualization covering: Vision, Interview Flow, Privacy Wall, Cross-Party Flow, Three Modes, Security, and Assessment. The Assessment tab includes 8 actionable items with copy-paste Claude Code prompts and localStorage-persistent checkboxes.

---

## Intelligence Network: UI Integration & Persona Architecture

**Date:** 2026-02-12
**Branch:** `parallax/intelligence-network`

### The Problem

PR #27 built the entire Intelligence Network backend — auth, interview, signal extraction, context injection, profile dashboard. But the pages were **invisible islands.** `/auth`, `/interview`, and `/profile` existed but were unreachable from the main UI. The header had no auth awareness. Session creation was fully anonymous and never linked `user_id` to sessions, so `context-injector.ts` never fired because `person_a_user_id` / `person_b_user_id` were always `null`.

Separately, Parallax's personality was fragile — identity, voice rules, and Intelligence Network pitch content were scattered across inline TypeScript strings in `knowledge-base.ts`. Any personality change required editing code, not docs.

### What Was Built

**Two things in one commit: full UI wiring + persona architecture refactor.**

#### UI Integration (8 touchpoints, ~115 lines across 8 files)

| # | Change | Files |
|---|--------|-------|
| 1 | **Auth-aware header** | `layout.tsx` — `AuthSlot` component: sign in link (logged out), user initial circle + sign out (logged in), nothing while loading |
| 2 | **Smart post-auth routing** | `auth/page.tsx` — Already authenticated? Redirect to `/profile` or `/interview` based on `interview_completed`. Sign-up → `/interview`. Sign-in → checks profile. |
| 3 | **Session create accepts user_id** | `api/sessions/route.ts` — Optional `user_id` in body → sets `person_a_user_id` |
| 4 | **Session join accepts user_id** | `api/sessions/[code]/join/route.ts` — Optional `user_id` → sets `person_a_user_id` or `person_b_user_id` based on side |
| 5 | **Hook plumbing** | `useSession.ts` — `createSession(name?, userId?)` and `joinSession(name, side, userId?)` |
| 6 | **TheDoor passes user_id** | `TheDoor.tsx` — Imports `useAuth`, passes `user?.id` in session creation |
| 7 | **SessionView passes user_id** | `SessionView.tsx` — Passes `user?.id` through `handleNameA` and `handleNameB` |
| 8 | **Landing page discovery** | `page.tsx` — Intelligence Network section with auth-aware CTA, feature pills, privacy subtext |

**The key design decision: pull-based, not push-based.** Auth is entirely optional. Users experience Parallax freely — start sessions, talk, get analysis. The Intelligence Network is discovered organically through the landing page section and session summary suggestions. Nobody hits a wall. The motivation to sign up comes from wanting deeper personalization, not from being locked out.

#### Persona Architecture Refactor

Replaced inline TypeScript personality strings with structured markdown files:

| File | Purpose |
|------|---------|
| `docs/parallax/soul.md` | Identity, origin, philosophy — who Parallax IS |
| `docs/parallax/voice.md` | Tone rules, first-person mandate, mode-specific adjustments |
| `docs/parallax/intelligence.md` | How to naturally pitch the Intelligence Network in conversation |
| `docs/parallax/boundaries.md` | What she cannot do, what she is not, privacy commitments |
| `docs/parallax/knowledge-map.md` | 18-row topic table mapping every topic to source file and mode |

`knowledge-base.ts` was rewritten as a **pure loader** — zero inline persona strings. Three-layer prompt assembly:

```
[shared persona: docs/parallax/*.md]     ← WHO she is (both modes)
[mode framing: one-line constant]         ← CONTEXT for this mode
[mode knowledge: docs/explorer/ or guide/] ← WHAT she knows
```

Module-level lazy caching (`_personaCache`, `_explorerCache`, `_guideCache`) ensures `fs.readFileSync` calls only happen once per process, not once per API request.

#### Additional Improvements

| Item | What Changed |
|------|-------------|
| **Explorer docs rename** | `docs/explorer/voice.md` → `architecture.md` (via `git mv`). Content was always architecture, not voice. |
| **FAQ expansion** | 4 new entries in `docs/guide/faq.md`: profile, interview, signals, privacy |
| **Session summary awareness** | `summarizeSession()` now accepts `hasProfiles` — when neither participant has a profile, the summary gently mentions the Intelligence Network. One sentence, an invitation, not a pitch. |
| **Auth callback route** | `src/app/auth/callback/route.ts` for OAuth redirect handling |
| **Home dashboard** | `src/app/home/page.tsx` with `ProfileSummary` and `SessionHistory` components |

### Architecture Decisions

1. **Optional user_id everywhere.** Every `user_id` parameter is optional — `user_id?: string`. When absent, the session works exactly as V1. When present, `context-injector.ts` can find and inject behavioral signals. Zero behavioral change for anonymous users.

2. **Auth redirect chain.** `/auth` → check if already authenticated → if so, check `interview_completed` → route to `/profile` or `/interview`. This prevents authenticated users from seeing the auth form and always lands them at the most useful next step.

3. **Markdown over TypeScript for personality.** Parallax's identity should be iterable by editing prose, not code. The OpenClaw/HYDRA pattern (soul.md, voice.md) works. `knowledge-base.ts` becomes infrastructure, not content.

4. **Module-level caching.** `readDirMarkdown()` runs `fs.readFileSync` synchronously. Without caching, every `/api/converse` call re-reads the entire `docs/parallax/` directory. With lazy caching, the first call populates the cache and all subsequent calls return instantly.

5. **Knowledge map as documentation.** `knowledge-map.md` is both human-readable documentation AND a reference for maintaining the knowledge base. When adding a new doc, update one table row — not multiple TypeScript imports.

### Visualizations

- **Persona Architecture:** `artifacts/parallax/parallax-persona-architecture.html` — 6-tab interactive visualization covering prompt assembly, file map, Explorer vs Guide comparison, before/after refactor, and assessment with actionable prompts.
- **Intelligence Network (backend):** `artifacts/parallax/parallax-intelligence-network.html` — 7-tab visualization covering interview flow, privacy wall, cross-party signal injection, and security model.

### Verification

- `npm run build` — production build succeeds (clean)
- 31 files changed, +998/-192 lines
- Anonymous session flow unaffected — no `user_id` required anywhere
- Supabase migrations applied (messages UPDATE RLS + Intelligence Network tables)

---

## Stage 7: Test Coverage — Full Stack

**Date:** 2026-02-11
**Gate:** "Are the tests green and covering critical paths?"

### Context

Before this stage, Parallax had **86 unit tests across 6 suites** — all pure function tests covering room codes, temperature mapping, NVC parsing, context modes, arena evaluation, and conflict analysis parsing. Zero integration, component, hook, or E2E tests existed. The entire API layer, all React components, every Realtime subscription hook, and the Playwright browser layer were untested.

This stage filled every gap. We went from 86 tests to **426 Vitest tests across 41 suites + 49 Playwright E2E specs** — covering all 18 identified integration gaps from the Stage 9 audit.

### What We Built

**Phase 0: Infrastructure**

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Updated: happy-dom environment, setupFiles, coverage config, .test.tsx include |
| `playwright.config.ts` | New: 5 browser projects (chromium, firefox, webkit, mobile-chrome, mobile-safari) |
| `src/__tests__/helpers/setup.ts` | Global setup: Supabase mock, DOM cleanup, Web Audio/Speech/MediaStream polyfills, fetch stub |
| `src/__tests__/helpers/fixtures.ts` | Type-safe factories: `makeSession()`, `makeMessage()`, `makeIssue()`, `makeNvcAnalysis()`, etc. |
| `src/__tests__/helpers/mock-supabase.ts` | Chainable Supabase mock with configurable responses per table |
| `src/__tests__/helpers/mock-claude.ts` | Anthropic SDK mock with `setClaudeResponse()`/`setClaudeError()` helpers |

**Phase 1: Unit Tests (5 files, 68 tests)**

| File | Tests | What It Covers |
|------|-------|----------------|
| `src/lib/__tests__/rate-limit.test.ts` | 8 | Token bucket rate limiter: allow/block, window expiry, IP isolation |
| `src/lib/__tests__/interventions.test.ts` | 12 | Escalation detection, de-escalation patterns, intervention triggers |
| `src/lib/__tests__/prompts-conductor.test.ts` | 21 | Adaptive conductor prompt: greeting/context/synthesis/active phases, name extraction |
| `src/lib/__tests__/prompts-issue-analysis.test.ts` | 13 | Issue extraction prompt: system prompt structure, context injection, persona grounding |
| `src/lib/__tests__/opus.test.ts` | 14 | Claude API wrapper: mediateMessage, conductorMessage, analyzeIssues, summarizeSession |

**Phase 2: API Route Integration Tests (10 files, 91 tests)**

| File | Tests | What It Covers |
|------|-------|----------------|
| `src/app/api/__tests__/health.test.ts` | 3 | Health endpoint: 200 response, status field |
| `src/app/api/__tests__/sessions.test.ts` | 8 | Session CRUD: create, get, missing fields, DB errors |
| `src/app/api/__tests__/sessions-code.test.ts` | 3 | Session lookup by room code |
| `src/app/api/__tests__/sessions-join.test.ts` | 10 | Join flow: valid join, already full, not found, person_b slot |
| `src/app/api/__tests__/sessions-end.test.ts` | 5 | End session: status update, already ended, not found |
| `src/app/api/__tests__/messages.test.ts` | 6 | Message creation: valid send, missing fields, DB insert |
| `src/app/api/__tests__/mediate.test.ts` | 10 | NVC mediation: Claude call, temperature extraction, analysis patch |
| `src/app/api/__tests__/issues-analyze.test.ts` | 10 | Issue extraction: grading, multi-issue parsing, error handling |
| `src/app/api/__tests__/sessions-summary.test.ts` | 9 | Summary generation: V3 lens insights, resolution trajectory |
| `src/app/api/__tests__/conductor.test.ts` | 27 | Conductor system: all 4 phases, name extraction, context mode selection, interventions |

**Phase 3: Hook Tests (6 files, 56 tests)**

| File | Tests | What It Covers |
|------|-------|----------------|
| `src/hooks/__tests__/useSession.test.ts` | 12 | Session state: create, join, Realtime updates, cleanup |
| `src/hooks/__tests__/useMessages.test.ts` | 13 | Messages: fetch, Realtime INSERT/UPDATE, dedup, sendMessage, currentTurn |
| `src/hooks/__tests__/useIssues.test.ts` | 11 | Issues: fetch, Realtime subscription, analyzeIssue trigger |
| `src/hooks/__tests__/useAudioAnalyser.test.ts` | 8 | Web Audio: start/stop, waveform data, mic denied state |
| `src/hooks/__tests__/useSyntheticWaveform.test.ts` | 5 | Synthetic waveform: idle animation, energy mapping |
| `src/hooks/__tests__/useParallaxVoice.test.ts` | 7 | TTS: speak mediator messages, queue management, cancel |

**Phase 4: Component Tests (14 files, 125 tests)**

| File | Tests | What It Covers |
|------|-------|----------------|
| `src/components/__tests__/TheMelt.test.tsx` | 14 | Core animation: dissolve/crystallize states, temperature-driven glow |
| `src/components/__tests__/MessageCard.test.tsx` | 17 | Backlit glow, NVC reveal toggle, sender display, temperature badge |
| `src/components/__tests__/LensBar.test.tsx` | 8 | Multi-lens display: active lens highlight, lens count |
| `src/components/__tests__/VoiceInput.test.tsx` | 10 | Voice: hold-to-speak, SpeechRecognition lifecycle, Chrome-only message |
| `src/components/__tests__/ContextModePicker.test.tsx` | 10 | 6 context modes: selection, lens stack display, active state |
| `src/components/__tests__/SignalRail.test.tsx` | 6 | Temperature timeline: glow intensity, message count |
| `src/components/__tests__/OrbStrip.test.tsx` | 3 | Three orbs: person A, Parallax, person B |
| `src/components/__tests__/AudioWaveformOrb.test.tsx` | 7 | SVG waveform: idle animation, active state, role colors |
| `src/components/__tests__/SessionSummary.test.tsx` | 6 | End-of-session: lens insights, resolution trajectory, message count |
| `src/components/__tests__/SessionView.test.tsx` | 8 | Mode branch: remote vs in-person routing |
| `src/components/__tests__/PersonPanel.test.tsx` | 11 | Remote mode: name display, message area, input |
| `src/components/inperson/__tests__/XRayGlanceView.test.tsx` | 8 | Three-column layout: signal rails, message center, speaker bar |
| `src/components/inperson/__tests__/IssueCard.test.tsx` | 8 | Issue card: status color, grade badge, expand/collapse |
| `src/components/inperson/__tests__/ActiveSpeakerBar.test.tsx` | 9 | Turn indicator: voice/text input, send handler, disabled state |

**Phase 5: E2E Tests (6 files, 49 specs)**

| File | Specs | What It Covers |
|------|-------|----------------|
| `e2e/remote-session.spec.ts` | 19 | Full remote flow: create, join, message, NVC, summary, room codes |
| `e2e/in-person-session.spec.ts` | 10 | In-person: onboarding, X-Ray Glance, voice input, issue tracking |
| `e2e/context-modes.spec.ts` | 6 | All 6 context modes: lens stack activation, mode switching |
| `e2e/error-handling.spec.ts` | 6 | Error states: network failure, invalid codes, rate limiting |
| `e2e/state-persistence.spec.ts` | 6 | Session persistence: reload, Realtime reconnect, message ordering |
| `e2e/accessibility.spec.ts` | 8 | axe-core scans, keyboard navigation, ARIA labels, focus management |

### Architecture Decisions

1. **happy-dom over jsdom.** happy-dom is ~3x faster for Vitest and supports enough of the DOM API for RTL component tests. We don't need full browser fidelity — that's what Playwright handles.

2. **Class-based SpeechRecognition polyfill.** The standard `vi.fn()` mock gets wiped by `vi.restoreAllMocks()` between tests. By using a real ES6 class with `vi.fn()` only on individual methods, the constructor survives mock restoration while method-level spying still works. The class tracks instances via a static array for test assertions.

3. **`(supabase as any).from` pattern for query chain mocks.** Supabase's chainable query builder (`from().select().eq().order()`) has deeply nested generic types that fight with Vitest's mock types. Rather than wrestling with 4 levels of `vi.mocked<>` generics, we cast to `any` at the assignment point. Pragmatic for test code — the runtime behavior is what matters.

4. **E2E excluded from tsconfig.** Playwright specs use `page.route()` mock data with intentionally loose types (null fields, partial objects). Including them in the main Next.js type check creates false positives. Playwright has its own tsconfig via `@playwright/test`.

5. **Parallel agent execution.** Four specialized agents (unit+hooks, API routes, components, E2E) wrote tests simultaneously via TeamCreate. Each agent had access to the shared helpers and could work independently. This cut wall-clock time significantly — ~340 tests were written concurrently.

6. **All API mocked, zero real calls.** Every test mocks Supabase and Claude at the module boundary. E2E tests intercept at the network layer via `page.route()`. No test hits a real database or AI API — safe to run in CI without env vars.

### Test Summary

| Category | Files | Tests |
|----------|-------|-------|
| Existing (pre-Stage 7) | 6 | 86 |
| Unit (Phase 1) | 5 | 68 |
| API Routes (Phase 2) | 10 | 91 |
| Hooks (Phase 3) | 6 | 56 |
| Components (Phase 4) | 14 | 125 |
| **Vitest Total** | **41** | **426** |
| E2E — Playwright (Phase 5) | 6 | 49 |
| **Grand Total** | **47** | **475** |

### Verification

- **426 Vitest tests across 41 suites** — all passing (`npx vitest run`)
- **49 Playwright E2E specs across 6 files** — ready for `npx playwright test`
- `npx tsc --noEmit` — zero type errors
- All tests fully mocked — no Supabase or Claude API calls
- Test scripts added to package.json: `test:run`, `test:coverage`, `test:e2e`, `test:e2e:ui`, `test:all`

---

## Conversational Layer: Parallax Speaks

**Date:** 2026-02-11
**Branch:** `parallax/conversational-layer`

### The Idea

What if the product could explain itself? Not through a README that judges skim, but through a conversation where they can ask anything — about the architecture, the NVC dual-lens system, the hackathon journey, the decisions that were made and why.

The inspiration came from HYDRA (another id8Labs project), which has a "CTO Voice" system — a Claude instance injected with project documentation that can answer technical questions in first person. Parallax takes this further: the product speaks AS itself, not about itself.

### Two Tiers, One Infrastructure

The Conversational Layer has two personalities sharing the same API route, the same chat UI, and the same infrastructure:

**Parallax Explorer** (judge/developer-facing, hackathon-only)
- Speaks in first person: "I use Claude Opus for mediation" not "Parallax uses Claude Opus"
- Knowledge base: BUILDING.md, CLAUDE.md, docs/explorer/*.md, docs/research/*.md
- Personality: Technical but warm. Narrative-driven. Proud of the journey, honest about limitations.
- Capabilities: READ-ONLY — explains everything, modifies nothing
- Discovery: Prominent "Talk to Parallax" CTA on landing page + floating "?" button

**Parallax Guide** (user-facing, permanent)
- Speaks as a helpful product assistant
- Knowledge base: docs/guide/*.md (user manual, FAQ, settings schema)
- Personality: Concise, action-oriented. Like a knowledgeable friend, not a manual.
- Capabilities: AGENTIC — can read and change user settings via Claude tool_use
- Discovery: Floating "?" button auto-switches to Guide mode on session pages

### Architecture Decisions

1. **Single API route, mode-switched.** `POST /api/converse` accepts `{ mode: 'explorer' | 'guide', message, history }`. The mode determines which knowledge base, system prompt, and tools are injected. One route, two personalities.

2. **Knowledge-base injection via system prompt.** Same pattern as HYDRA CTO voice. Markdown documentation files are read from disk at request time, concatenated, and injected into Claude's system prompt. No vector database, no embeddings — just raw context. For the knowledge base sizes involved (~10-15K tokens), this is simpler and just as effective.

3. **React Context for panel state.** The ConversationalPanel can be opened from any page (landing page CTA, session page "?", floating button). A `ConversationalContext` provides `openPanel(mode)` / `closePanel()` to any component in the tree.

4. **Route-aware mode defaults.** `usePathname()` in the LayoutShell determines which mode the floating "?" opens. Landing page → Explorer. Session pages → Guide. Zero configuration per page.

5. **Tool_use loop for Guide settings.** The Guide can change user preferences (display name, voice input, analysis visibility, temperature display, auto-expand) via Claude's tool_use protocol. The API route handles a bounded loop (max 3 rounds): Claude calls a tool → server executes → sends tool_result → Claude responds. Settings persist in localStorage.

6. **Client-server tool split.** The server validates and acknowledges tool calls. The frontend applies them to localStorage via an `onToolResults` callback. This avoids needing a Supabase migration while still demonstrating the full agentic capability.

### What Was Built

| File | Purpose |
|------|---------|
| `src/types/conversation.ts` | Foundation types: ConversationalMode, ConversationMessage, ToolResult, ConverseRequest/Response |
| `src/lib/knowledge-base.ts` | Reads markdown docs, assembles mode-specific system prompts with persona injection |
| `src/lib/guide-tools.ts` | Claude tool definitions (update_setting, get_settings) + server-side execution |
| `src/app/api/converse/route.ts` | Unified API route with tool_use loop for Guide mode |
| `src/contexts/ConversationalContext.tsx` | React context for panel open/close/mode state |
| `src/components/ConversationalPanel.tsx` | Slide-in panel with Ember design, tool execution indicators |
| `src/hooks/useConversation.ts` | Conversation state management with onToolResults callback |
| `src/hooks/useSettings.ts` | localStorage-backed settings with tool result application |
| `docs/explorer/voice.md` | Explorer personality and voice rules |
| `docs/explorer/eddie-story.md` | Eddie Belaval narrative — id8Labs, philosophy, collaboration |
| `docs/explorer/hackathon-journey.md` | Day-by-day hackathon build log |
| `docs/guide/user-manual.md` | How Parallax works — sessions, voice, analysis, The Melt |
| `docs/guide/faq.md` | 11 common questions with clear answers |
| `docs/guide/settings-schema.md` | All user settings with types, defaults, descriptions |
| `src/app/layout.tsx` | Modified — ConversationalProvider, route-aware LayoutShell |
| `src/app/page.tsx` | Modified — "Talk to Parallax" CTA section |

### The Demo Moment

A judge lands on Parallax. Below the product explanation, they see: **"This product can explain itself."** They click "Talk to Parallax." A panel slides in from the right. They type: "How does the NVC analysis work?" Parallax answers — not from a script, but from its own documentation, in first person, citing specific files and PRs.

Then they start a session. The "?" button now opens the Guide. They type: "Turn off the temperature display." A teal pill appears: "Updated show_temperature." The setting changes. The product just responded to a natural language command.

That's the conversational layer. The product has a voice.

---

## ElevenLabs Voice Integration

**Date:** 2026-02-11
**Branch:** `parallax/self-narrating-landing`

### Why

Browser `SpeechSynthesis` was the right V1 choice — zero cost, zero latency, works offline. But the voices are robotic concatenative synthesis, they vary wildly across OS/browser, and they undermine the "warm mediator" personality Parallax needs. For the hackathon demo and the self-narrating landing page, voice quality is a core differentiator.

### What Changed

Replaced browser TTS with **ElevenLabs Turbo v2.5** using the **Ava** voice (`gJx1vCzNCD1EQHT212Ls`) — warm, grounding, and natural.

| File | Change |
|------|--------|
| `src/app/api/tts/route.ts` | New server-side proxy to ElevenLabs. Rate-limited. Keeps API key secure. Returns `audio/mpeg` binary. |
| `src/hooks/useParallaxVoice.ts` | Rewritten. Calls `/api/tts`, plays audio via `HTMLAudioElement`. Same interface: `speak()`, `speakChunked()`, `isSpeaking`, `cancel()`. |

### Architecture Decisions

1. **Server-side proxy, not client-direct.** The ElevenLabs API key stays on the server. The client sends text to `/api/tts`, receives audio bytes back. Zero credential exposure.

2. **Graceful fallback to browser TTS.** If ElevenLabs fails (network error, API quota, key misconfigured), the hook silently falls back to `SpeechSynthesis`. The narration and mediator voice never break — they just sound worse.

3. **Turbo v2.5 model for latency.** The in-person X-Ray Glance View speaks mediator insights live during conversation. Sub-300ms generation time keeps the flow natural. The higher-quality Multilingual v2 model adds 500ms+ — unacceptable for real-time.

4. **Blob URL lifecycle management.** Each TTS call creates a `URL.createObjectURL()` for the audio blob. The hook revokes these on every new play, cancel, and audio end to prevent memory leaks.

### Environment Variables

```
ELEVENLABS_API_KEY=     # Your ElevenLabs API key
ELEVENLABS_VOICE_ID=    # Voice ID (Ava: gJx1vCzNCD1EQHT212Ls)
```

---

## Self-Narrating Landing Page

**Date:** 2026-02-11
**Branch:** `parallax/self-narrating-landing`

### The Vision

What if the product could introduce itself? Not a video. Not a wall of text. Parallax — the AI that helps people in conflict — speaks her own landing page. A visitor clicks "Listen," and Parallax narrates each section as it reveals, ending with an invitation to start a session or ask her anything.

This is the culmination of everything built so far: the conflict intelligence engine, the conversational layer, the ElevenLabs voice, and the Ember design system — all fused into a single experience designed to make a judge say "I've never seen a product do this before."

### What Was Built

#### 1. The Listen Button (Liquid Glass Material)

The entry point is a single word: **"Listen."** The button uses a 5-layer glass material system inspired by iOS 26 liquid glass:

| Layer | Effect |
|-------|--------|
| `liquid-glass__bg` | Backdrop blur (40px) + saturate + brightness, multi-layer inset bevel shadows |
| `liquid-glass__fresnel` | Radial gradient — bright rim, transparent center (Fresnel effect) |
| `liquid-glass__specular` | Mouse-tracking highlight (radial gradient follows cursor, mix-blend-mode: overlay) |
| `liquid-glass__chromatic-r/b` | Red and blue offset borders — chromatic aberration at 0.6px shift |
| Brand accent | Teal glow pool with screen blend, tracks cursor position |

Plus: rotating halo glow, breathing ring border, and breathing text animation. Used at full size for the entry button and at `--sm` size for the header replay pill.

#### 2. Narration Engine (useNarrationController)

A state machine that orchestrates the entire narration flow:

```
idle → narrating → complete → chat
         ↓              ↓
    (replay loops    (enter chat
     back here)       with Parallax)
```

**State machine phases:**
- **idle** — Listen button visible, header hidden
- **narrating** — Parallax speaks, sections reveal one by one, aura active
- **complete** — All sections visible, header appears with mini Listen pill
- **chat** — GlowChatInterface streams conversation with Explorer

**Components in the narration pipeline:**
- `NarrationStage` — typewriter text display with fade transitions
- `NarrationControls` — skip-to-end + mute toggle
- `ParallaxAura` — full-viewport gradient backdrop during narration
- `useTypewriter` — character-level typewriter at 30ms/char

#### 3. Dynamic Narration (Opus-Powered)

Every narration is unique. This is where we pushed the boundaries of what Opus can do.

**Three layers of dynamism:**

| Layer | What Changes | How |
|-------|-------------|-----|
| Greeting | Time-of-day, day-of-week, replay count | `getIntroPrompt(replayCount)` generates a fresh Claude prompt |
| Body (5 sections) | Same talking points, completely fresh language | `buildFullNarrationPrompt()` — one API call returns JSON for all sections |
| Easter egg | 3rd replay | Claude opens with a joke about the visitor coming back |

**Architecture decision — parallel generation:** The greeting (step 0) and the full body text generation run as two parallel API calls. By the time the greeting finishes speaking (~8-12 seconds via ElevenLabs TTS), the body text is already waiting in a ref. Zero added latency.

**The `what-you-see` step stays static** — it's locked to the 18-second MeltDemo Remotion composition. Every other section can vary freely because they only need to hit mandatory talking points, not sync to animation frames.

**Graceful degradation:** If the generation call fails or times out (8s), the controller silently falls back to handcrafted static text. The narration never breaks.

**Time-aware prompts:**
```
Morning → "Be bright and energized"
Afternoon → "Be warm and focused"
Evening → "Be calm and reflective"
Night → "Acknowledge they're burning the midnight oil"
Friday → "It's Friday — almost there"
Sunday → "A good day for reflection"
```

#### 4. Visual Redesign

**New components from the plan:**

| Component | Purpose |
|-----------|---------|
| `HeroPreview` | CSS-animated Melt loop showing raw text dissolving into NVC translation |
| `LensGrid` | Interactive 14-lens visualization, auto-cycles 6 context modes every 3s, hover to lock |
| `ContextModeCards` | 6 relationship context cards grouped by personal/professional/formal |
| `ModePreview` | SVG wireframe previews of in-person (3-column) and remote (split-screen) UIs |
| `MeltDemoPlayer` | Remotion `<Player>` with 18-second Melt composition — typewriter, dissolve, analysis crystallize |
| `CursorSpotlight` | Viewport-wide teal glow that follows cursor with interactive element detection |

**Typography:** Cormorant Garamond (serif headings, 400 weight) + Raleway (sans body) + Bitcount (wordmark) + IBM Plex Mono (labels). The Cormorant Garamond + Raleway pairing was chosen from a 10-option font comparison tool — it balances editorial warmth with readability.

**Ambient gradient:** Three radial gradients on body background — warm amber halo at top (12% opacity), teal at bottom (7%), and an asymmetric off-center accent (4%). Uses viewport-relative sizing (`vw`/`vh`) so the halos scale with screen size.

**Day/night theme:** Full light mode with `.light` class on `<html>`. Blocking inline script prevents flash of wrong theme. CursorSpotlight adapts opacity per theme.

#### 5. GlowChatInterface

After narration completes, clicking "Talk to Parallax" enters chat mode. The aura slides up to reveal a streaming chat interface with:

- **AudioWaveformOrb** for Parallax (teal, synthetic energy when speaking/loading) and User (warm, real mic waveform via Web Audio API)
- **Mic toggle** with three visual states (active/inactive/denied)
- Streaming responses from the Explorer conversational layer
- Teal-accented input with glassmorphic styling

### Architecture Decisions

1. **CustomEvent bridge for layout ↔ page communication.** The narration phase lives in `page.tsx` but the header lives in `layout.tsx`. They communicate via `window.dispatchEvent(new CustomEvent('parallax-narration-phase'))`. The alternative — lifting state to layout via context — would require making the layout a client component AND adding a provider, which is heavier than needed for two event types (phase sync + replay trigger).

2. **Refs over state for narration internals.** `abortRef`, `mutedRef`, `replayCountRef`, `generatedTextRef` are all refs, not useState. These values are consumed inside async loops where stale closures would give wrong values. Refs provide stable `.current` access without triggering re-renders.

3. **Structured JSON generation with validation.** The `generateFullNarration()` function asks Opus to return JSON with specific keys. It validates every key exists and is a string before accepting. Robust JSON extraction handles code fences, leading text, and malformed responses — any issue falls back to static text.

4. **Replay counter in ref, increment in replayNarration only.** The first `startNarration()` call (from Listen) is count 0 — "fresh visit." Only `replayNarration()` increments. This ensures the counter accurately reflects replays, not total plays.

### Files Created

| File | Purpose |
|------|---------|
| `src/components/landing/HelloButton.tsx` | 5-layer liquid glass Listen button |
| `src/components/landing/HeroPreview.tsx` | CSS Melt loop in hero |
| `src/components/landing/LensGrid.tsx` | Interactive 14-lens visualization |
| `src/components/landing/ContextModeCards.tsx` | 6 context mode cards |
| `src/components/landing/ModePreview.tsx` | SVG wireframe mode previews |
| `src/components/landing/MeltDemoPlayer.tsx` | Remotion Player wrapper |
| `src/components/landing/ParallaxAura.tsx` | Full-viewport narration backdrop |
| `src/components/landing/NarrationStage.tsx` | Typewriter display |
| `src/components/landing/NarrationControls.tsx` | Skip + mute controls |
| `src/components/landing/GlowChatInterface.tsx` | Streaming chat with voice orbs |
| `src/components/landing/TheDoor.tsx` | Session creation CTA |
| `src/components/CursorSpotlight.tsx` | Cursor-following teal glow |
| `src/hooks/useNarrationController.ts` | Narration state machine |
| `src/hooks/useTypewriter.ts` | Character-level typewriter |
| `src/lib/narration-script.ts` | Script + dynamic generation prompts |
| `src/remotion/MeltDemo.tsx` | 18-second Melt composition |
| `src/remotion/Root.tsx` | Remotion entry point |
| `src/fonts/BitcountPropSingle.ttf` | Bitcount wordmark font |

### Files Modified

| File | Changes |
|------|---------|
| `src/app/page.tsx` | Complete rewrite — 7 narration-aware sections with `data-narration-id` |
| `src/app/layout.tsx` | 3-column header grid, theme toggle, mini Listen pill, narration phase bridge |
| `src/app/globals.css` | Liquid glass system, ambient gradient, dot-grid texture, section animations, cursor spotlight |
| `src/app/api/converse/route.ts` | Updated for narration generation support |
| `src/hooks/useParallaxVoice.ts` | Fixed `Float32Array<ArrayBuffer>` generic for TypeScript 5.x |
| `package.json` | Added remotion, @remotion/player, @remotion/cli |

### The Demo Moment

A judge opens Parallax. The screen is dark — warm chocolate, subtle dot-grid texture. A single glass button pulses in the center: **"Listen."** The button catches light like a lens.

They click. The button fades. Parallax says "Hello" — her voice warm (ElevenLabs Ava), the text typing itself character by character. She introduces herself, then walks the judge through the product. Each section reveals as she speaks — the problem (stat cards), how it works (the LensGrid lights up), the Melt demo (raw words dissolve into analysis), the context modes, the two session types.

When she finishes, the header slides in with a mini Listen pill. A "Talk to Parallax" button glows. They can replay the narration (it's different every time), start a session, or chat with Parallax directly.

If they replay three times, Parallax opens with a joke about them coming back. If it's midnight, she acknowledges they're burning the midnight oil. If it's Monday morning, she's bright and energized.

The product introduces itself. Differently. Every time.

---

## Remote Session Redesign: UX Refinements

**Date:** 2026-02-12
**Branch:** `parallax/remote-session-redesign`

### What Changed

The initial remote session redesign commit shipped the core architecture — single-pane layout, conversational onboarding, private coaching, conductor triggers. This round focused on UX polish: making Parallax feel alive, keeping the conversation flowing, and fixing the coaching interaction model.

### 1. TTS Voice + ParallaxPresence Orb

Remote sessions now hear Parallax speak — same ElevenLabs voice (Ava) used in the landing page narration. Every mediator message and coaching response auto-plays via `useParallaxVoice`.

**The waveform orb** sits between the header and message area, showing Parallax's presence visually. When speaking, it renders real audio waveform data from ElevenLabs; when thinking, it uses the synthetic waveform for a gentle breathing animation.

**Pattern (canonical, applies everywhere):**
- Speaking → pipe real `voiceWaveform` + `voiceEnergy` from `useParallaxVoice()` into `ParallaxPresence`
- Analyzing/thinking → synthetic waveform via `useSyntheticWaveform()` (internal to ParallaxPresence)
- NEVER use synthetic during speech — always real audio data

This fix also applied to `XRayGlanceView` (in-person mode), which had the same issue.

### 2. Continued Chat During `waiting_for_b`

Previously, when Person A finished sharing and was waiting for Person B, the input locked — `waiting_for_b` was treated as a mediator turn. Now Person A can keep talking to Parallax while waiting.

**Changes:**
- Turn logic: `waiting_for_b` moved from the "mediator" group to "person_a"
- New prompt: `buildWaitingChatPrompt()` — Parallax continues the conversation naturally without redirecting to "we're still waiting"
- Conductor route: `waiting_for_b` phase handler routes through conductor with full conversation history
- Private coaching also available during this phase

### 3. Tabbed Input UI: Conversation vs Private Coach

The coaching button was originally in the header — easy to miss and spatially disconnected from where you type. Moved to folder-style tabs directly above the `ActiveSpeakerBar`:

```
┌─────────────┬──────────────────┐
│ Conversation │ [lock] Private   │  ← folder tabs
├─────────────┴──────────────────┤
│  [Tap to talk or type...]      │  ← ActiveSpeakerBar (always present)
└────────────────────────────────┘
```

**Key decisions:**
- ActiveSpeakerBar always renders — switching tabs changes who receives the message (main conversation vs coaching API), not the input mechanism
- Lock icon on the private coach tab signals privacy
- Tabs only visible during `active` and `waiting_for_b` phases
- CoachingPanel renders with `hideInput` prop; the shared ActiveSpeakerBar handles all input

### 4. Coaching Voice Responses

Parallax speaks coaching responses aloud — same TTS pipeline as mediator messages. Separate `lastSpokenCoachRef` prevents double-speak. The experience: tap Coach tab → tap to talk → Parallax responds privately in your ear.

### Files Modified

| File | Changes |
|------|---------|
| `src/components/RemoteView.tsx` | TTS voice, ParallaxPresence orb, tabbed coaching, coaching voice, waiting_for_b chat |
| `src/components/CoachingPanel.tsx` | Added `hideInput` prop for external input delegation |
| `src/components/inperson/ParallaxPresence.tsx` | Added `voiceWaveform`/`voiceEnergy` props for real audio |
| `src/components/inperson/XRayGlanceView.tsx` | Pass real waveform data to ParallaxPresence |
| `src/lib/prompts/conductor.ts` | Added `buildWaitingChatPrompt` for continued A conversation |
| `src/app/api/conductor/route.ts` | Added `waiting_for_b` handler, imported new prompt builder |

---

## Branch Consolidation & Production Deployment (2026-02-12)

Three feature branches had accumulated without merging to main. This created a situation where production was deploying from a feature branch (`parallax/intelligence-network`) instead of main — a problem Eddie caught: "Shouldn't all of this be from main?"

### The Three Branches

| PR | Branch | What It Added |
|----|--------|---------------|
| #27 | `parallax/intelligence-network` | Intelligence Network UI, persona architecture, behavioral signals schema |
| #28 | `parallax/remote-session-redesign` | Single-pane RemoteView, conversational onboarding, private coaching, TTS voice |
| #16 | `parallax/v3-conflict-intelligence-engine` | 14 analytical lenses, 6 context modes, multi-lens prompt system |

### Merge Strategy: Cleanest First

Merged in dependency order to minimize conflicts:

**1. PR #27 — Intelligence Network (clean merge)**
No conflicts. Merged directly via `gh pr merge 27 --merge`.

**2. PR #28 — Remote Session Redesign (3 conflicts)**

After #27 merged to main, #28 had conflicts in 3 files:

- **`src/app/layout.tsx`** — HEAD needed `usePathname` (hide Listen button on session pages), main added `Link` (auth navigation). Resolution: keep both imports.

- **`src/components/SessionView.tsx`** — The critical conflict. Main (post-#27) had the old two-panel remote layout with useMessages, handleSendA/B, triggerMediation, etc. HEAD had the simplified pure router that delegates everything to RemoteView. Resolution: take HEAD's simplified router — RemoteView owns all remote session logic now.

- **`src/types/database.ts`** — HEAD added `coaching_messages` table type. Main (post-#27) added `user_profiles`, `behavioral_signals`, `signal_consent`, `signal_access_log`. Resolution: include ALL tables from both sides. No overlap, just additive.

**3. PR #16 — V3 Conflict Intelligence Engine (2 conflicts)**

- **`README.md`** — v3 branch had more detailed architecture descriptions. Resolution: keep v3's comprehensive version (`git checkout --ours`).

- **`src/components/SessionView.tsx`** — v3 had ContextModeBadge and lens expansion features built into the old two-panel layout. Main now has the simplified router. Resolution: take main's version (`git checkout main --`). The lens features from v3 still exist in the analysis pipeline — they just render through RemoteView/XRayGlanceView now, not SessionView.

### Lockfile Fix

The `parallax/intelligence-network` branch had 11 new dependencies in `package.json` without a regenerated `pnpm-lock.yaml`. Vercel's `--frozen-lockfile` flag (CI default) refused to build. Fixed with `pnpm install --no-frozen-lockfile` and committed the regenerated lockfile.

### Key Architectural Decision

**SessionView is now a pure router.** The remote redesign moved ALL remote session logic (messages, mediation, coaching, auth, TTS, issue tracking) into `RemoteView.tsx`. When merging v3's lens features that were built into the old two-panel SessionView layout, we chose to take main's simplified version rather than try to port v3's UI into the new architecture. The lens *analysis* code (14 lenses, 6 context modes) was already on main via PR #27 — only the old UI rendering was discarded.

### Production Deployment

After all 3 PRs merged to main with 0 open PRs remaining:
```
npx vercel --prod --yes
```
Production URL: https://parallax-ebon-three.vercel.app

### Files Affected

| Category | Count |
|----------|-------|
| PRs merged | 3 |
| Conflict files resolved | 5 (across 2 PRs) |
| Total files changed (cumulative) | 14+ |
| Net lines added | ~1,500+ |
| Open PRs remaining | 0 |

---

## Interview Page: Conversational Rebuild

**Date:** 2026-02-12
**Branch:** `parallax/interview-conversational-rebuild`

### The Problem

The interview page was the first surface built — before the Ember design language, before voice, before the Parallax orb existed. Every other surface (in-person X-Ray Glance, remote sessions, the self-narrating landing page) uses the full conversational toolkit: orbs, push-to-talk voice, backlit glow, typewriter reveals, and TTS. The interview page was a generic form-style chat: text input, speech bubbles, a progress bar. It was like walking from a candlelit room into a fluorescent office.

### What Changed

Complete UI rewrite of `src/app/interview/page.tsx`. Zero new files, zero new dependencies, zero API changes. Pure composition of existing infrastructure.

| Before | After |
|--------|-------|
| Progress bar (4-segment color bars) | Minimal monospace phase indicator |
| Speech bubbles (rounded, right/left aligned) | Backlit glow messages (cool for Parallax, warm for user) |
| Text input + Send button | ActiveSpeakerBar (tap-to-talk voice primary, text fallback) |
| No voice output | ElevenLabs TTS via useParallaxVoice |
| Static message display | Typewriter character reveal on latest assistant message |
| No visual AI presence | ParallaxPresence orb (thinking/speaking/idle states) |
| SVG checkmark on completion | Breathing orb + teal signal count |

### Hook Coordination

The core challenge was coordinating three async systems (typewriter, TTS, API loading) without race conditions:

1. **New message detection** — Composite key (`${messages.length}-${content}`) prevents missed triggers during phase resets where message array length changes
2. **Turn-taking gate** — `isBusy = isLoading || typewriter.isTyping || voice.isSpeaking` disables input during all three states, creating natural conversation rhythm
3. **Phase transitions** — Cancel voice + typewriter, null the tracking ref, fade opacity to 0 for 150ms, let the new phase opening re-trigger both systems
4. **Send handler** — Cancels in-progress typewriter/TTS before sending, so the user can interrupt Parallax mid-response

### Polish Pass

Code review caught a critical dependency array bug: `voice` and `typewriter` objects (from hooks) are recreated every render. Including them in the phase transition effect's dep array caused React to re-run the effect every render, and the cleanup function would cancel the 150ms opacity transition timer — leaving messages permanently invisible. Fixed by removing unstable objects from dep arrays (the individual functions like `voice.cancel` are useCallback-stable).

### Components Reused (Zero New Infrastructure)

| Component/Hook | Source | Role |
|----------------|--------|------|
| `ParallaxPresence` | `inperson/ParallaxPresence.tsx` | Teal orb with thinking/speaking/idle states |
| `ActiveSpeakerBar` | `inperson/ActiveSpeakerBar.tsx` | Voice + text input with mode toggle |
| `useParallaxVoice` | `hooks/useParallaxVoice.ts` | ElevenLabs TTS with browser fallback |
| `useTypewriter` | `hooks/useTypewriter.ts` | Character-by-character reveal at 30ms/char |
| Backlit CSS classes | `globals.css` | `.backlit .backlit-cool`, `.backlit .backlit-warm` |
| `cursor-blink` keyframe | `globals.css` | Blinking cursor during typewriter |

### Verification

- `npm run build` — production build succeeds (clean)
- 1 file modified: `src/app/interview/page.tsx` (141 insertions, 110 deletions)
- Net change: 232 lines → 262 lines (30 lines added, mostly hook coordination)

---

## Solo Mode & Solo Intelligence

**PR #34** | Branch: `parallax/solo-intelligence` | 2026-02-13

### The Idea

Two-person mediation is Parallax's core, but what if someone wants to work on their communication skills alone? Solo Mode gives users a 1:1 conversation with Parallax — no second person needed. Over time, Parallax builds a behavioral profile that becomes the user's advocate in future two-person sessions.

### What Was Built

**Solo Mode (`SoloView.tsx`)**
- Dedicated session type — starts from landing page alongside In-Person and Remote
- 1:1 conversation with Parallax using the same NVC analysis engine
- No context mode picker needed — solo sessions skip straight to conversation
- API route: `/api/solo/route.ts` — streams Claude responses with solo-specific system prompt
- Custom hook: `useSoloChat.ts` — manages conversation state, streaming, message history

**Solo Intelligence Sidebar (`SoloSidebar.tsx`)**
- Persistent sidebar that builds a user profile across sessions
- Extracts communication patterns, emotional triggers, conflict tendencies
- Dynamic intros — Parallax greets returning users with awareness of past conversations
- HTML export — users can download their profile as a standalone document
- Extractor: `sidebar-extractor.ts` — processes conversation for behavioral signals
- Export: `export-html.ts` — generates self-contained HTML profile documents

**Landing Page**
- TheDoor now shows 3-column grid: In-Person, Remote, Solo
- Solo card uses teal accent, bypasses context mode selection

### Architecture Decisions

1. **Solo gets its own API route** — Solo conversations have different system prompts and don't need mediation analysis, so a dedicated `/api/solo` route keeps concerns separated.
2. **Sidebar extraction runs client-side** — Profile data is extracted from conversation in the browser and stored locally. No server-side profile storage yet — privacy-first approach for hackathon.
3. **HTML export over PDF** — Self-contained HTML with inline styles is more portable and doesn't require a PDF library dependency.

### Files Created
- `src/components/SoloView.tsx` — Solo session UI
- `src/components/SoloSidebar.tsx` — Intelligence sidebar
- `src/app/api/solo/route.ts` — Solo conversation API
- `src/hooks/useSoloChat.ts` — Solo chat state management
- `src/lib/solo-extractor.ts` — Behavioral signal extraction
- `src/lib/sidebar-extractor.ts` — Sidebar data processing
- `src/lib/export-html.ts` — HTML profile export
- `supabase/migrations/20260213000000_add_solo_mode.sql` — Solo mode schema
- `supabase/migrations/20260213100000_add_solo_memory.sql` — Solo memory storage

---

## Turn-Based Timer

**PR #34** | Branch: `parallax/solo-intelligence` | 2026-02-13

### The Problem

In-person mediation works best with structured turns. Without time boundaries, one person can dominate the conversation. A visible timer creates psychological safety — both people know they'll get equal time.

### What Was Built

- **`TurnTimer.tsx`** — Visual countdown timer with circular progress indicator
- **`TimerSettings.tsx`** — Preset selector (30s, 60s, 90s, 120s) with custom duration option
- **`useTurnTimer.ts`** — Timer state management hook with pause, reset, and auto-advance
- **`timerAudio.ts`** — Audio cues at 10s warning and timer expiry (Web Audio API, no sound files)
- **Schema migration** — `timer_duration_ms` column on sessions table
- **Integration** — Timer appears in `XRayGlanceView` for in-person sessions, controlled by the active speaker bar

### Architecture Decisions

1. **Web Audio API for timer sounds** — Generated tones instead of audio files. Zero network requests, works offline, tiny bundle impact.
2. **Timer is optional** — Sessions work fine without it. Timer settings appear in the in-person flow but default to off.
3. **Duration stored server-side** — `timer_duration_ms` on the session row so both participants see the same timer if the page reloads.

---

## Remote Session Flow: Create or Join

**PR #34** | Branch: `parallax/solo-intelligence` | 2026-02-13

### The Problem

Clicking "Remote" on the landing page immediately started creating a session. But what if you're Person B wanting to join? The join code input was buried below the mode cards in a separate section — disconnected from the Remote mode selection. Users had to scroll past the mode cards to find it.

### What Changed

Added an intermediate step when clicking "Remote":

1. **Landing** — click Remote
2. **NEW: Create or Join?** — two clear choices:
   - **Create New Session** (Person A) — proceeds to context mode picker, then session
   - **Join Existing Session** (Person B) — shows room code input with auto-focus
3. Each step has a back button that navigates one level up

The standalone "join existing session" section was removed from the landing page — join is now a first-class part of the Remote flow.

### Architecture

Uses a cascade of early returns in `TheDoor.tsx` — a React pattern for wizard/stepper flows where each state combination gets its own clean return block:

```
pendingMode === 'remote' && remoteAction === null   → Create/Join chooser
pendingMode === 'remote' && remoteAction === 'join'  → Room code input
pendingMode (any)                                    → Context mode picker
default                                              → Landing page
```

### Files Modified
- `src/components/landing/TheDoor.tsx` — 109 insertions, 38 deletions

---

## PR #34: Merge to Main

**2026-02-13** | `parallax/solo-intelligence → main`

### What Was Merged

All Day 4 work consolidated into a single PR:
- Solo Mode + Solo Intelligence (sidebar, memory, export)
- Turn-Based Timer (configurable, audio cues)
- Remote Session Flow (create-or-join choice)

**Stats:** 28 files changed, 3,030 insertions, 66 deletions

### Branch Cleanup

After merge, deleted stale branches:
- `parallax/solo-intelligence` — merged
- `parallax/solo-mode` — ancestor of solo-intelligence
- `parallax/turn-based-timer` — ancestor of solo-intelligence
- `parallax/conversational-layer` — orphaned lockfile fix

All work now lives on `main`.

---

## Home-First Flow + Embedded Assistant

**Commit:** `69a3f42`, `3a2d571` | Direct to `main` | 2026-02-13

### The Problem

The landing page presented three mode cards (In-Person, Remote, Solo) immediately. Users had to understand the product before choosing. There was no ambient way to just _talk_ to Parallax without committing to a session mode. The auth wall also blocked exploration — you had to sign up before seeing anything.

### What Changed

1. **Home page (`/home`)** — New authenticated home with `HomeContent.tsx` showing a profile setup CTA, session history, and an embedded Parallax floating action button (`ParallaxFAB.tsx`)
2. **Settings page (`/settings`)** — Full settings page with profile management, theme toggle, and session preferences
3. **Auth walls removed** — Navigation no longer gates pages behind authentication. Value is accessible; auth is required only for persistent features (profile, interview)
4. **Global mode strip** — Mode indicators (In-Person / Remote / Solo) appear in the nav bar as context, not as a selection gate
5. **Turn progress bar** — `TurnProgressBar.tsx` added to in-person mode with circular countdown and auto-advance
6. **Dead code cleanup** — Removed `MessageInput.tsx`, `NameEntry.tsx`, `PersonOrbPanel.tsx`, `VoiceInput.tsx`, `WaitingState.tsx` (548 lines deleted)

### Architecture Decisions

1. **FAB pattern for ambient access** — The floating action button lets users talk to Parallax from any page without navigating to a session. Inspired by chat widgets but with full Parallax intelligence.
2. **Guide tools expansion** — `guide-tools.ts` grew from simple navigation to a full tool-use system (158 line expansion) that lets the Parallax assistant create sessions, check profiles, and navigate the app.
3. **Auth wall inversion** — Instead of blocking access, the app shows everything and gates _persistence_. Users can try a session anonymously; signing up saves their profile and history.

**Stats:** 18 files changed, 338 insertions, 548 deletions (net negative — cleanup)
Then: 15 files changed, 694 insertions, 94 deletions (home + settings)

---

## ParallaxOrb — Canvas Waveform

**Commits:** `0db025a`, `9984107` | Direct to `main` | 2026-02-13

### What It Is

A canvas-based generative orb that replaced the simpler SVG waveform. The ParallaxOrb renders:

- **Inner waveform ring** — Real-time mic audio data mapped to a radial bezier path inside the orb
- **Orbiting particles** — Small dots orbiting the perimeter at varying speeds and distances
- **Temperature-reactive color** — Glow color shifts based on emotional temperature (warm amber → hot rust → cool teal)
- **Idle animation** — Gentle breathing/pulse when mic is inactive

### Why Canvas Over SVG

The SVG `AudioWaveformOrb` worked but had two issues at 60fps: (1) DOM thrashing from frequent path attribute updates, and (2) no particle system without creating hundreds of SVG elements. Canvas gives direct pixel control with a single composite operation per frame.

### TheDoor Integration

The landing page mode cards (In-Person, Remote, Solo) each got a `ModeCardScene.tsx` (291 lines) that renders a unique canvas scene previewing what each mode looks like — the orb with mode-specific particle behavior and color.

---

## Anonymous Auth + Hands-Free Everywhere

**Commit:** `6634e41` | Direct to `main` | 2026-02-13

### The Problem

Two friction points were killing the hackathon demo:
1. **Auth requirement** — Users had to create an account before trying anything. For a 2-minute demo, that's fatal.
2. **Auto-listen was only in-person** — Solo and Remote modes required manual mic toggling, breaking the voice-first promise.

### What Changed

1. **Anonymous auth** — `useAuth.ts` expanded (68 lines) to support Supabase anonymous sessions. Users get a temporary identity that can be upgraded to a real account later. No email, no password, no friction.
2. **Hands-free in all modes** — `useAutoListen.ts` hook deployed across `SoloView.tsx`, `RemoteView.tsx`, and `XRayGlanceView.tsx`. After speaking, Parallax responds, then automatically re-enables the mic.
3. **Interview anonymous support** — The interview API route now handles anonymous users, storing partial profiles that merge on account upgrade.

### Architecture Decision

**Anonymous-first, upgrade-later** — This is the Spotify pattern. Let users experience the product with zero friction. When they hit a value moment (their first NVC translation, their first profile insight), _then_ ask them to create an account to save it. Conversion happens after value delivery, not before.

---

## Mic Sensitivity Tuning

**Commit:** `e085ada` | Direct to `main` | 2026-02-13

### The Problem

The auto-listen feature was too sensitive — background noise triggered recording, and the silence detection waited too long before stopping. In a demo environment (conference, noisy room), this made hands-free mode unreliable.

### What Changed

- **Reduced mic sensitivity threshold** across all 4 voice-enabled views (`interview/page.tsx`, `RemoteView.tsx`, `SoloView.tsx`, `XRayGlanceView.tsx`)
- **Faster silence timeout** in `useAutoListen.ts` — stops recording sooner when speech ends

5 files changed, 6 insertions, 6 deletions. Small diff, big UX impact.

---

## Opus at the Edge: Why This Matters

### The Thesis

Most AI products prove Claude can write code, summarize documents, or answer questions. Parallax tests something nobody else is testing: **can Opus 4.6 serve as a real-time emotional intelligence engine for humans in crisis?**

There are real people in this world going through real conflicts — couples on the edge of separation, employees being silenced by power dynamics, families fracturing over unspoken resentments. They need help. Professional mediation costs $300-500/hr and has weeks-long wait times.

Parallax puts Opus 4.6 in the room with them. Not as a chatbot. As a mediator who can read between the lines.

### Where We Push the Frontier

**Multi-Framework Integration:** Any model can run one psychological framework. Running 7 simultaneously and having them inform each other — Gottman detecting stonewalling while Attachment identifies avoidant pattern while CBT catches catastrophizing — requires the deep reasoning Opus is built for.

**NVC Translation Quality:** The hardest output field in the system. "I feel scared when deadlines change because I need predictability to do my best work" — not "The speaker appears to be experiencing anxiety related to schedule modifications." Warm, vulnerable, specific, human. This is where Opus's language fluency meets emotional intelligence.

**Profile-Informed Mediation:** Opus holds two invisible psychological profiles in working memory while analyzing live speech, without revealing either profile to the other person. That's a cognitive load most human mediators struggle with.

**Emotional Temperature Calibration:** Not binary positive/negative. A continuous 0.0-1.0 float that drives the entire visual system. Opus must distinguish between 0.3 (mild tension) and 0.7 (significant charge) with enough consistency to make the UI meaningful.

**Trajectory Prediction:** Every analysis includes a `resolutionDirection`: escalating, stable, or de-escalating. Opus reads the arc of the conversation, not just the current message.

### Token Usage per Session

| Route | Input Tokens | Output Tokens | Calls/Session | Difficulty |
|-------|-------------|---------------|---------------|------------|
| `/api/mediate` | 2,100-9,000 | 2,560-4,096 | 10-50 | FRONTIER |
| `/api/conductor` | 400-3,000 | 512-1,024 | 4-12 | HARD |
| `/api/sessions/[code]/summary` | 300-22,000 | 2,048 | 1 | FRONTIER |
| `/api/issues/analyze` | 100-4,500 | 1,024 | 10-50 | MODERATE |
| `/api/coach` | 750-12,500 | 512 | 0-20 | HARD |
| `/api/converse` | 1,100-11,500 | 512-1,024 | 1-5 | SIMPLE |
| **Total per session** | | | | **101K-1M tokens** |

### Self-Assessment

| Dimension | Grade | Why |
|-----------|-------|-----|
| Emotional Intelligence Depth | **A** | 14 validated frameworks, NVC translation quality, temperature calibration |
| Real-World Stakes | **A+** | Real people, real conflicts. Safety architecture exists because failure means real harm. |
| Model Utilization | **B+** | Strong on analysis depth. Room to grow: intervention timing still heuristic, profile-mediation integration underutilized |
| Future-Proofing (Opus 5 Ready) | **A-** | Modular lens architecture, extensible profile schema, intervention hooks ready for model-driven timing |

### Building for Opus 5

Every improvement in Opus's emotional reasoning, every gain in nuance detection, every step toward genuine empathy — Parallax converts that into better mediation outcomes. The architecture is designed to absorb whatever the next generation can offer:

1. **Model-driven intervention timing** — Replace heuristic rules with contextual judgment
2. **Cross-session pattern learning** — Recognize recurring dynamics across conversations
3. **Cultural context sensitivity** — Reduce Western-biased assumptions in conflict analysis
4. **Richer profile intelligence** — Extract humor style, trust repair patterns, apology language
5. **Longer context for deep sessions** — 100+ message conversations with full arc analysis
6. **Real-time cultural code-switching** — Adapt Parallax's voice to match the users' register

We're not building for today's capabilities. We're building for tomorrow's.

---

## Website-Wide Wandering Ant Easter Egg

**Commit:** `d3ef908` | **Date:** Feb 13, 2026

### The Problem

The hackathon submission needed a memorable easter egg that:
1. Rewards curiosity and attention to detail
2. Works across the entire website (not just one page)
3. Feels magical and unexpected
4. Expresses gratitude for the hackathon experience

### The Solution: A Cross-Page Hunt

A single 14px ant that wanders the entire Parallax website. It enters from a random screen edge, wanders for 10-20 seconds, then walks off-screen **and appears on a different page**. Users must navigate around to find it.

**Behavior Flow:**
```
1. Ant spawns on landing page (/)
2. Enters from random edge (top/right/bottom/left)
3. Walks toward center viewport area
4. Wanders randomly (smooth organic movement)
5. Walks off-screen to random edge
6. Saves new location to localStorage
7. User navigates to /profile (or /settings, /auth, /session/*)
8. Ant appears on new page, cycle repeats
```

**Click Interaction:**
- **First click:** Random joke (10 options - bug puns, coding humor)
  - "🐜 You found me! I'm a loose bug. Guess the QA team missed one..."
  - "🐜 I was just looking for the cookie crumbs in localStorage..."
  - "🐜 Shh! I'm not a bug, I'm a *feature*. The PM said so."
- **Second click:** Heartfelt thank you (5 variations)
  - "🐜 Thank you for letting us be part of this hackathon! We had an incredible time building Parallax..."
  - "🐜 We're deeply grateful for your curiosity. This hackathon was an amazing experience..."

### Technical Implementation

**State Machine:**
```typescript
type AntState = "entering" | "wandering" | "exiting";

// Entering: Walk from off-screen to center
// Wandering: Random direction changes every 2-4 seconds
// Exiting: Walk to random edge, save new page location
```

**Cross-Page Tracking:**
```typescript
// When ant exits screen:
const nextPage = allowedPaths.filter(p => p !== currentPath);
localStorage.setItem("parallax-ant-location", randomPage);

// On page load:
const antLocation = localStorage.getItem("parallax-ant-location");
setIsVisible(currentPath === antLocation);
```

**Smooth Movement (No Jitter):**
- Velocity transitions over 3-5 second intervals (not constant random)
- Gradual direction changes with easing
- Moderate speed (1.5-2px per frame)
- State-based behavior (purposeful walking, not chaotic)

### Files Changed

- `src/components/FooterAnt.tsx` (new) — 395 lines, full component
- `src/app/layout.tsx` — Integrated with allowedPaths
- `src/app/globals.css` — Added `@keyframes ant-march` animation

### Why This Works

**Easter Egg Depth:**
1. **Level 1:** Notice the tiny ant walking (requires attention)
2. **Level 2:** Click it (requires curiosity)
3. **Level 3:** Find it again on another page (requires exploration)
4. **Level 4:** Click it twice (rewards persistence with gratitude)

Most users complete 0-1 levels. Power users complete all 4 and feel deeply rewarded.

**Hackathon Gratitude:**
The thank you messages are genuine, heartfelt, and varied. They acknowledge that this was built for the Claude Code Hackathon and express real appreciation for the experience.

**Technical Showcase:**
- Cross-page state persistence (localStorage)
- Smooth canvas-free animation (CSS + requestAnimationFrame)
- State machine architecture (entering/wandering/exiting)
- Dynamic route matching (/session/* works for any session code)

### Self-Assessment

| Dimension | Grade | Why |
|-----------|-------|-----|
| Discoverability | **A** | Small enough to miss, visible enough to find if you look |
| Delight Factor | **A+** | Cross-page hunt is unexpected and magical |
| Gratitude Expression | **A+** | 5 heartfelt thank you messages, high probability on 2nd click |
| Technical Execution | **A** | Smooth movement, clean state machine, works across all pages |

The ant is now Parallax's signature easter egg — a tiny detail that rewards the kind of attention we hope users bring to their conversations.
