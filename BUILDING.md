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
