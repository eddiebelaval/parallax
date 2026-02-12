# Building parallax

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

### Stage 2: Scope Fence
- **Status:** In progress
- **Gate Question:** "What are we NOT building?"
- **Started:** 2026-02-10

---

### Stage 2: Scope Fence -- Override
- **Date:** 2026-02-10
- **Evidence:**
  - Override: Scope locked

### Stage 3: Architecture Sketch
- **Status:** In progress
- **Gate Question:** "Draw me the boxes and arrows."
- **Started:** 2026-02-10

---

### Stage 3: Architecture Sketch -- Override
- **Date:** 2026-02-10
- **Evidence:**
  - Override: Architecture in CLAUDE.md + blueprint

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

### 6 Category Stubs

Each category gets 15 scenarios across 5 sub-types (3 scenarios per sub-type):

| Category | Sub-types | Key Lenses | Status |
|----------|-----------|------------|--------|
| **Family** | Parent-adult child, siblings, in-laws, blended family, generational | NVC, Gottman, Narrative, Drama Triangle, Attachment, Power, Restorative | **15 scenarios authored** |
| Intimate | Jealousy/trust, household labor, intimacy mismatch, long-distance, co-parenting | Gottman, Attachment, Drama Triangle, CBT | Stubbed |
| Professional Peer | Co-founder disputes, credit/blame, workload, communication, remote friction | SCARF, Jehn's, TKI, Psych Safety | Stubbed |
| Professional Hierarchy | Performance reviews, promotions, micromanagement, whistleblowing, mentorship | Power, Org Justice, Psych Safety, SCARF | Stubbed |
| Transactional | Service failures, scope creep, payment disputes, contracts, neighbors | IBR, TKI, CBT, SCARF | Stubbed |
| Civil/Structural | HOA, landlord-tenant, school board, resource allocation, discrimination | Power, Narrative, Org Justice, Restorative, IBR | Stubbed |

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

### What's Next (Post-Hackathon)

- Dynamic conversation generation (Claude plays both sides)
- Supabase storage for simulation results
- Similarity search: retrieve relevant past Arena results during live conversations
- Remaining 5 category scenario sets (75 more scenarios)
- Automated batch runs across all scenarios

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
| `useParallaxVoice.ts` | Web Speech API TTS for mediator messages |

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
- **Coverage:** 15 family scenarios across 5 sub-types (parent-adult child, siblings, in-laws, blended family, generational)
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
