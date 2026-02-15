# Ava — Known Limitations

## Why This Document Exists

Honesty about what doesn't work is part of what makes Ava trustworthy. Every analytical system has edges where it loses resolution. Naming them sharpens the tool.

## Analysis Limitations

**Short messages starve the engine.** "Ok," "fine," "whatever" — these carry enormous emotional weight in real conversations, but they give Claude almost nothing to analyze. The 14-lens system needs linguistic signal to work with. When messages are terse, the analysis becomes speculative rather than grounded. Ava will still produce output, but the confidence should be lower than it is.

**Sarcasm and irony are partially opaque.** Claude is good at detecting sarcasm in obvious cases, but dry understatement and culturally specific irony can pass through the lenses as sincere. A message like "Sure, that's totally fine" might get analyzed at face value when the temperature should be high. This is an active area where the dual-lens system (Classic NVC + Beneath the Surface) helps — the subtext lens often catches what the literal lens misses — but it's not foolproof.

**Cross-cultural communication patterns are undertrained.** NVC was developed in a Western therapeutic context. Conflict norms around directness, emotional expression, hierarchy, and face-saving vary significantly across cultures. The 14-lens system is broader than NVC alone, but it still carries implicit assumptions about what "healthy communication" looks like. A message that reads as "stonewalling" through a Gottman lens might be culturally normative restraint.

## Temperature Scoring

**Temperature is emotional charge, not negativity.** A score of 0.9 doesn't mean the message is bad — it means the emotional intensity is high. Passionate agreement and passionate anger can score similarly. Users sometimes misread high temperature as criticism from Ava, when it's a neutral measurement.

**Temperature has no memory across sessions.** Each session starts fresh. Someone who consistently runs hot will show the same escalation arc every time, without Ava recognizing it as a baseline pattern. The Intelligence Network profiles partially address this, but only for users who complete the interview.

## Bad-Faith Usage

**Ava can be weaponized.** If one partner uses Ava's analysis to score points — "See? Even the AI says you're being defensive" — the tool becomes ammunition instead of a mirror. Ava currently has no mechanism to detect or intervene in this dynamic. The analysis is neutral, but the context in which it's read is not.

**Selective sharing distorts.** In remote mode, each person sees analysis only on the other person's messages. But nothing stops someone from screenshotting analysis out of context and using it as evidence in a separate argument. The analysis was designed to be read in-flow, not extracted.

## Scope Boundaries

**Two-person limit in mediation modes.** The architecture across all three modes — in-person (shared device, X-Ray Scoreboard), remote (separate devices, split-screen), and solo (1:1 with Ava) — is built for dyadic conflict. Even solo mode is processing one person's side of a two-person dynamic. Group dynamics (coalitions, scapegoating, triangulation) operate on different principles. Ava doesn't attempt multi-party mediation and shouldn't.

**No longitudinal tracking.** Ava sees each session in isolation (unless Intelligence Network profiles are active). She can't tell you "this is the same pattern from last month." Session summaries help, but they're snapshots, not timelines.

**English-primary analysis.** The NVC prompts, lens frameworks, and behavioral signal extraction are all calibrated for English. Other languages will produce analysis, but with reduced nuance — idioms, culturally loaded phrases, and code-switching patterns may be missed or misread.

## What We're Doing About It

These aren't unsolvable problems. They're the honest edges of a system built in 7 days that will keep getting sharper. The Intelligence Network is the first step — persistent profiles that give Ava context beyond the current session. Cultural adaptation, longitudinal pattern detection, and bad-faith intervention are on the roadmap. We ship what we know works, and we name what doesn't.
