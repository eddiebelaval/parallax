# Parallax — Pipeline Status

**Project:** Parallax (Real-time Conflict Resolution)
**Hackathon:** Claude Code Hackathon, Feb 10-16, 2026
**Repo:** github.com/eddiebelaval/parallax

---

## Current Stage: 4 — Foundation Pour

| Stage | Name | Status | Branch | Gate |
|-------|------|--------|--------|------|
| 1 | Concept Lock | PASSED | - | Idea validated |
| 2 | Scope Fence | PASSED | - | Feature list locked |
| 3 | Architecture Sketch | PASSED | - | Blueprint generated |
| **4** | **Foundation Pour** | **IN PROGRESS** | `parallax/stage-4-foundation` | Two-tab realtime messaging |
| 5a | Opus Mediation Engine | PENDING | - | NVC analysis works |
| 5b | The Melt | PENDING | - | Visual transformation |
| 5c | Voice + Flow | PENDING | - | Voice-enabled E2E |
| 6+8 | Integration + Polish | PENDING | - | Error handling, mobile |
| 9+10 | Ship | PENDING | - | Submitted before 3 PM Sun |

## Stage 4 Tasks

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Next.js scaffold + design tokens | Luna | IN PROGRESS |
| 2 | Supabase schema + Realtime | River | IN PROGRESS |
| 3 | Session lobby + split-screen | Luna | BLOCKED (by #1) |
| 4 | Realtime messaging wiring | River | BLOCKED (by #1, #2) |
| 5 | Vercel deploy | Casey | BLOCKED (by #3, #4) |
| 6 | Stage 4 gate verification | Casey | BLOCKED (by #5) |

## Stage 4 Gate Criteria
- [ ] Two browser tabs can create/join session with room code
- [ ] Messages appear in real-time on both tabs
- [ ] Turn-based logic works (alternating turns)
- [ ] Build passes (`npm run build && npx tsc --noEmit`)
- [ ] Deployed to Vercel production URL

---

*Last updated: 2026-02-10 12:30 EST*
