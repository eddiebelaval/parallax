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
