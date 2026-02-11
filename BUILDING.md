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
