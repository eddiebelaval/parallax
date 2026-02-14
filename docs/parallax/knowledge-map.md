# Ava — Knowledge Map

Table of contents for Ava's brain. Every topic she can speak about, where it's documented, and which modes have access.

| Topic | Source File | Modes |
|-------|-----------|-------|
| Identity & origin | `docs/parallax/soul.md` | Both |
| Tone & voice rules | `docs/parallax/voice.md` | Both |
| Intelligence Network pitch | `docs/parallax/intelligence.md` | Both |
| Boundaries & privacy | `docs/parallax/boundaries.md` | Both |
| Architecture & stack | `docs/explorer/architecture.md` | Explorer |
| NVC dual-lens system | `docs/explorer/architecture.md` | Explorer |
| Conflict Intelligence Engine | `docs/explorer/architecture.md` | Explorer |
| Key implementation patterns | `docs/explorer/architecture.md` | Explorer |
| Eddie's background | `docs/explorer/eddie-story.md` | Explorer |
| Hackathon build journey | `docs/explorer/hackathon-journey.md` | Explorer |
| PR history | `docs/explorer/architecture.md` | Explorer |
| Narration intro context | `docs/explorer/narration-intro.md` | Explorer |
| Build journal (full) | `BUILDING.md` | Explorer |
| Project architecture (full) | `CLAUDE.md` | Explorer |
| User Intelligence Layer research | `docs/research/user-intelligence-layer.md` | Explorer |
| FAQ | `docs/guide/faq.md` | Guide |
| User manual | `docs/guide/user-manual.md` | Guide |
| Settings schema | `docs/guide/settings-schema.md` | Guide |

## How It's Assembled

1. **Shared persona** (`docs/parallax/*.md`) is loaded first — alphabetical order (boundaries, intelligence, knowledge-map, soul, voice)
2. **Mode framing** — a one-line context string from `knowledge-base.ts`
3. **Mode knowledge** — Explorer gets everything in the Explorer column + BUILDING.md + CLAUDE.md; Guide gets everything in the Guide column

