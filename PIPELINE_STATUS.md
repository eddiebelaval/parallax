# Parallax — Pipeline Status

**Project:** Parallax (Real-time Conflict Resolution)
**Hackathon:** Claude Code Hackathon, Feb 10-16, 2026
**Repo:** github.com/eddiebelaval/parallax
**PR #1:** Stage 4 merged to main (squash)

---

## Current Stage: 5a — Opus Mediation Engine (NEXT)

| Stage | Name | Status | Branch | Gate |
|-------|------|--------|--------|------|
| 1 | Concept Lock | PASSED | - | Idea validated |
| 2 | Scope Fence | PASSED | - | Feature list locked |
| 3 | Architecture Sketch | PASSED | - | Blueprint generated |
| 4 | Foundation Pour | PASSED | `parallax/stage-4-foundation` (merged) | Two-tab realtime messaging |
| **5a** | **Opus Mediation Engine** | **NEXT** | `parallax/stage-5a-opus-engine` | NVC analysis works |
| 5b | The Melt | PENDING | - | Visual transformation |
| 5c | Voice + Flow | PENDING | - | Voice-enabled E2E |
| 6+8 | Integration + Polish | PENDING | - | Error handling, mobile |
| 9+10 | Ship | PENDING | - | Submitted before 3 PM Sun |

## Stage 4 Results (Day 1 — Tue Feb 10)

All 6 tasks completed. Gate PASSED.

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Next.js scaffold + design tokens | Luna | DONE |
| 2 | Supabase schema + Realtime | River | DONE |
| 3 | Session lobby + split-screen | Luna | DONE |
| 4 | Realtime messaging wiring | River | DONE |
| 5 | Vercel deploy | Casey | DONE |
| 6 | Stage 4 gate verification | Casey | PASSED |

**Bonus:** Luna built MessageCard component (Day 2/3 forward work)

## Stage 4 Gate Criteria
- [x] Two browser tabs can create/join session with room code
- [x] Messages appear in real-time on both tabs
- [x] Turn-based logic works (alternating turns)
- [x] Build passes (`npm run build && npx tsc --noEmit`)
- [x] Deployed to Vercel production URL

## Stage 5a Plan (Day 2 — Wed Feb 11)

**Critical path:** Director writes NVC system prompt (core IP, blocking)

| Task | Owner | Depends On |
|------|-------|-----------|
| NVC system prompt (`src/lib/prompts.ts`) | Director | - |
| `/api/mediate` streaming endpoint + `opus.ts` wrapper | River | Prompt done |
| Wire Opus response into message flow UI | Luna | Endpoint done |
| Unify NvcAnalysis type (database.ts vs MessageCard) | Director | - |
| Stage 5a gate verification | Casey | All above |

**Type alignment needed:** `database.ts` NvcAnalysis has `observation/feeling/need/request/subtext/translated_message`. MessageCard expects `subtext/blindSpots/unmetNeeds/nvcTranslation/emotionalTemperature`. Will unify during prompt engineering.

---

*Last updated: 2026-02-10 12:40 EST*
