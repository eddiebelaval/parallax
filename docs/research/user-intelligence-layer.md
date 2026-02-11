# User Intelligence Layer — Research Foundation

> Research conducted February 11, 2026 for the Parallax Conflict Resolution Platform.
> Four parallel research threads: Psychological Frameworks, Competitive Landscape, Privacy & Ethics, Technical Architecture.

---

## Executive Summary

The User Intelligence Layer adds persistent, interview-built knowledge bases to Parallax's conflict resolution engine. Instead of analyzing each message in isolation, Claude enters every mediation session already understanding each person's communication style, emotional triggers, attachment patterns, and conflict tendencies.

**Research validates the approach from every angle:**

- **Psychology:** Validated instruments exist for each of Parallax's 14 analytical lenses. AI-administered conversational interviews produce higher diagnostic agreement with clinical experts than paper questionnaires (kappa 0.72 vs 0.55). The three-session intake model from couples therapy maps precisely to Parallax's architecture.
- **Market:** The "high personalization + conflict-focused" quadrant is unoccupied. Every competitor uses either static quiz profiles or passive learning. No product combines persistent interview-built profiles + NVC methodology + dual-perspective mediation.
- **Privacy:** Positioning as "conflict resolution" (not therapy) avoids the heaviest regulatory burden while still requiring FTC compliance, consent-gated data handling, and abuse detection. The Replika, Woebot, and BetterHelp enforcement actions define clear guardrails.
- **Technical:** Hybrid structured JSON + vector embeddings in Supabase, with Claude Structured Outputs for extraction and progressive context injection during mediation. Row-Level Security provides strict data isolation.

---

## 1. Psychological Assessment Frameworks

### 1.1 Validated Instruments by Lens

Each of Parallax's 14 analytical lenses has validated psychological instruments that can inform the intake interview.

#### ECR-R / ECR-RS (Attachment Theory Lens)

**What it measures:** Two dimensions of adult attachment — Anxiety (fear of rejection/abandonment) and Avoidance (discomfort with intimacy/dependence).

- **Structure:** 36 items on 7-point Likert scale. The ECR-RS variant assesses attachment across different relationship types (partner, parent, friend) — directly useful for Parallax's multi-context modes.
- **Conflict relevance:** Anxious individuals escalate and pursue; avoidant individuals withdraw and stonewall. Knowing this before mediation begins transforms Claude's intervention strategy.

**Sample items adapted for conversational interview:**
- "When you're upset with someone close to you, what's your first instinct — move closer or pull away?"
- "How comfortable are you depending on others in difficult times?"
- "Do you worry about being too much for people?"

**Source:** Fraley et al., University of Illinois. Full scale at [labs.psychology.illinois.edu](https://labs.psychology.illinois.edu/~rcfraley/measures/ecrritems.htm)

#### Thomas-Kilmann Conflict Mode Instrument (TKI)

**What it measures:** Default behavioral tendencies across five conflict modes plotted on two axes — Assertiveness and Cooperativeness.

| Mode | Assertiveness | Cooperativeness | Conflict Behavior |
|------|:---:|:---:|---|
| Competing | High | Low | Uses authority/leverage to win |
| Collaborating | High | High | Seeks win-win solutions |
| Compromising | Mid | Mid | Seeks expedient partial solutions |
| Avoiding | Low | Low | Sidesteps, postpones, withdraws |
| Accommodating | Low | High | Neglects own concerns, self-sacrifices |

- **Structure:** 30 forced-choice pairs (proprietary — Parallax creates original behavioral questions mapping to the same five modes).

**Adapted interview questions:**
- "When you disagree, what's your instinct — fight for your position, try to find middle ground, give in, avoid the topic, or work together on a solution?"
- "Is winning the argument important to you, or is keeping the peace more important?"
- "How often do you give in just to end the conflict?"

**Source:** Kilmann Diagnostics. [kilmanndiagnostics.com](https://kilmanndiagnostics.com/overview-thomas-kilmann-conflict-mode-instrument-tki/)

#### Gottman Four Horsemen

**What it measures:** Presence of four destructive communication patterns — Criticism (global character attacks), Contempt (moral superiority, sarcasm), Defensiveness (counter-attacking), Stonewalling (withdrawing, shutting down).

- **Structure:** 33-item true/false instrument.
- **Antidotes (critical for mediation):** Criticism -> Gentle startup. Contempt -> Culture of appreciation. Defensiveness -> Take responsibility. Stonewalling -> Physiological self-soothing.

**Adapted interview questions:**
- "When you're upset, do you describe specific behaviors or make broader statements about their character?"
- "Does either of you use sarcasm or eye-rolling during arguments?"
- "When your partner brings up a complaint, what's your first reaction — listen, defend, or shut down?"

**Source:** Gottman Institute. [gottman.com](https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/)

#### SCARF Model (David Rock)

**What it measures:** Individual sensitivity to five social threat/reward domains grounded in neuroscience — Status, Certainty, Autonomy, Relatedness, Fairness.

| Domain | Threat Trigger | Reward Trigger |
|--------|---------------|----------------|
| Status | Feedback that feels like attack on competence | Recognition |
| Certainty | Ambiguity, undefined expectations | Clear expectations |
| Autonomy | Micromanagement, no input | Trust, choice |
| Relatedness | Isolation, out-group feeling | Belonging |
| Fairness | Perceived favoritism, opaque decisions | Transparency |

**Source:** David Rock, 2008. [davidrock.net](https://davidrock.net/portfolio-items/scarf-a-brain-based-model-for-collaborating-with-and-influencing-others-vol-1/)

#### DERS-16 (Emotional Regulation)

**What it measures:** Difficulties in emotion regulation across five dimensions — nonacceptance of emotions, difficulty with goal-directed behavior during distress, impulse control difficulties, limited regulation strategies, and lack of emotional clarity.

- **Structure:** 16 items, 5-point scale. Internal consistency alpha of .90-.94.
- **Conflict relevance:** Emotion regulation difficulties predict conflict escalation, stonewalling, and impulsive responses.

**Source:** Bjureberg et al., 2016. [PMC validation study](https://pmc.ncbi.nlm.nih.gov/articles/PMC4882111/)

#### Drama Triangle (Karpman)

**What it measures:** Three dysfunctional roles in conflict — Victim ("Poor me"), Persecutor ("It's all your fault"), Rescuer ("Let me help you"). People shift between roles dynamically.

- **Validated instrument:** Drama Triangle Scale (Lac & Donaldson, 2020), validated across three samples (N=326, N=342, N=301).
- **The Rescuer Trap:** NVC itself can become a Rescuer behavior — "I'm just trying to help you communicate better" becomes a power move. The Drama Triangle lens detects when the mediation tool is being weaponized.

**Source:** [pubmed.ncbi.nlm.nih.gov/32917106](https://pubmed.ncbi.nlm.nih.gov/32917106/)

#### Additional Lenses

| Lens | Key Instrument / Framework | Primary Use Case |
|------|---------------------------|-----------------|
| CBT Cognitive Distortions | CD-Quest (15 items) | Detecting all-or-nothing thinking, catastrophizing, mind-reading |
| Narrative Mediation | Winslade & Monk techniques | Re-authoring conflict stories |
| Restorative Justice | Core restorative questions (IIRP) | Trust repair after specific incidents |
| Organizational Justice | Colquitt Scale (2001) — 4 dimensions | Workplace fairness perception |
| Psychological Safety | Edmondson 7-item scale | Professional context safety assessment |
| Jehn's Conflict Typology | ICS (6 items) — Task vs. Relationship vs. Process | Diagnosing conflict type |
| Power Analysis | 8-factor framework (Harvard NLR) | Detecting and addressing power imbalances |
| Interest-Based Relational | Fisher & Ury ("Getting to Yes") | Separating positions from interests |

### 1.2 Recommended Intake Architecture

Based on synthesis across all instruments, a four-phase conversational interview:

**Phase 1: Context Setting (3-4 questions)**
- Relationship type (triggers context mode selection)
- Brief description of the conflict
- What they hope to achieve
- Safety screening

**Phase 2: Communication Profiling (8-10 questions)**
- Conflict style tendency (TKI-mapped, 2-3 questions)
- Emotional regulation baseline (DERS-inspired, 2-3 questions)
- Attachment orientation (ECR-RS-inspired, 2-3 questions)
- Fairness/power sensitivity (SCARF/justice-mapped, 2 questions)

**Phase 3: Context-Specific Deep Dive (3-5 questions based on mode)**
- Intimate: Gottman Four Horsemen + attachment dynamic
- Family: Attachment + Drama Triangle role identification
- Professional Peer: Jehn's conflict type + psychological safety
- Professional Hierarchical: Power analysis + organizational justice
- Transactional: IBR interest mapping + fairness perception
- Civil: Power analysis + procedural justice + IBR

**Phase 4: Narrative Capture (2-3 open-ended)**
- "Tell me what happened from your perspective."
- "What has been the hardest part?"
- "What would making this right look like?"

**Total: 16-22 questions, 10-15 minutes, delivered conversationally.**

### 1.3 AI Interview Validation

A 2026 study (BDI-FS-GPT, N=115) embedded the Beck Depression Inventory into a ChatGPT-powered dialogue:
- **AUC: 0.953** | Sensitivity: 89.3% | Specificity: 88.5%
- Agreement with clinical diagnosis: kappa=0.72 (vs. kappa=0.55 for paper PHQ-9)
- Participants reported significantly greater satisfaction with the conversational format
- Audio-based responses averaged 3x longer than text responses

**Key design principles from the research:**
1. Never frame as psychological assessment — it's "understanding your perspective"
2. Score with rules, not LLMs — deterministic scoring for structured items
3. Individual interviews always come first — validated clinical approach
4. People disclose more to AI — social desirability bias decreases
5. Use progressive disclosure — easy questions first, sensitive topics later
6. Be transparent — "I'm asking these to understand your communication style so I can mediate more effectively"

**Sources:** [PMC/JMIR 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12848484/), [World Psychiatry 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12434366/), [JMIR 2025](https://mental.jmir.org/2025/1/e79838)

---

## 2. Competitive Landscape

### 2.1 The Market Map

```
                    LOW PERSONALIZATION -----> HIGH PERSONALIZATION
                    |                                             |
CONFLICT-FOCUSED    | TheMediator.AI        |  [ PARALLAX ]
                    | Dyspute.ai (legal)    |
                    | NVC.ai (utility)      |
                    |                       |
RELATIONSHIP-       | Lasting (content)     |  Maia (learns over time)
FOCUSED             | Paired (quizzes)      |  Relish (ML-customized)
                    |                       |  CoupleWork (adaptive AI)
                    |                       |
GENERAL THERAPY     | Wysa (anonymous)      |  Replika (deep profiles)
                    | Woebot (shut down)    |  Character.ai (persistent)
                    |                                             |
```

**The upper-right quadrant — high personalization + conflict-focused — is empty.** Every relationship app focuses on bonding/maintenance. Every conflict tool handles legal disputes. Nobody is building a deeply personalized AI mediator for interpersonal conflict using a therapeutic framework.

### 2.2 Direct Competitors

| Product | Profiling Approach | Gap vs. Parallax |
|---------|-------------------|-----------------|
| **Relish** | 10-min quiz generates Relationship Health Score | Quiz-based, not conversational. No real-time mediation. No persistent deepening. |
| **Lasting** | Initial assessment generates personalized Series | Content-first (pre-built). Not adaptive conversation. |
| **Paired** | Quizzes, daily check-ins. "Couplish Translator" AI | Engagement activities, not conflict resolution. No structured profiling. |
| **Maia** (YC W24) | Learns from tone/conversation over time | Bonding focus, not conflict. No interview-based profiling. No NVC. |
| **CoupleWork** | AI coach "Maxine" adapts to emotional cues | Small/early. No structured intake. No dual-perspective mediation. |
| **Dyspute.ai** | Adaptive intake chat for legal disputes | Legal/transactional only. No emotional/relational conflict. No NVC. |
| **TheMediator.AI** | Compiles both sides into neutral summaries | Consumer disputes. No profiling. No therapeutic framework. |

### 2.3 Adjacent Competitors (AI Mental Health)

| Product | Memory/Profiling | Key Lesson |
|---------|-----------------|------------|
| **Woebot** (shut down June 2025) | NLP mood tracking, referenced past conversations | Pre-scripted couldn't compete with generative AI. Clinical validation alone doesn't win. B2C mental health is brutal. |
| **Wysa** | Anonymous by design. No persistent profiles. | Anonymity is valued, but means no longitudinal depth. |
| **Replika** | "Memory bank" of personal details. Users can view/edit. | Deep profiling creates massive privacy liability. EUR 5M fine, FTC complaint. |
| **Pi** | ~100 turn memory within sessions. Cross-session amnesia. | Persistent memory is essential for therapeutic contexts, not optional. |
| **Character.ai** | Cross-session memory via multi-step pipeline | Persistent memory drives strong engagement. But entertainment focus, not therapeutic. |
| **BetterHelp** | 15-min intake questionnaire for therapist matching | One-time profile for matching, not continuously deepening. $7.8M FTC fine for sharing data with ad platforms. |

### 2.4 What Works vs. What Failed

**What works:**
- Hyper-personalization based on real data (Relish, Maia)
- Low-friction entry / anonymity option (Wysa)
- Conversational AI over pre-scripted (Woebot's fatal lesson)
- User-controlled memory with transparency (Replika concept, poor execution)
- Emotional detection in voice (Hume EVI, CoupleWork)

**What failed:**
- **Woebot shutdown (June 2025):** 1.5M users, $90M+ raised. Pre-scripted approach, regulatory friction, B2C scaling. Lesson: clinical rigor + generative quality is the winning formula.
- **Replika privacy disaster:** EUR 5M fine, FTC complaint, user rage when features removed. Lesson: privacy-by-design from day one or catastrophic consequences.
- **ChatGPT as couples counselor (NPR, Aug 2025):** Embedded cultural biases, triggered "triangulation" dynamic. Lesson: NVC as a framework prevents bias from dominating.
- **Pi memory limitations:** ~100-turn cross-session amnesia. Lesson: persistent memory is essential for therapeutic contexts.

### 2.5 Market Sizing

- Online couples therapy and counseling: **$17.9B (2024), expected $26.6B by 2028**
- AI in mental health: projected **24.15% CAGR through 2034**
- 85% of people with mental health needs still go untreated
- 35% of couples seeking help now use some form of AI-assisted therapy
- 48.7% of users with mental health challenges already use general LLMs for therapeutic support

### 2.6 Parallax Differentiation

1. **"Your mediator already knows you."** Unlike every competitor where you explain yourself from scratch, Parallax's interview-based knowledge base means the AI enters every conflict already understanding each person.
2. **NVC prevents the ChatGPT bias problem.** Structured framework channels AI away from cultural bias and toward empathy.
3. **Privacy as a feature, not afterthought.** Given Replika's disasters and the regulatory environment, transparent user-controlled profiles are a competitive moat.
4. **The Woebot lesson applied correctly.** Therapeutic rigor (NVC + validated instruments) combined with generative AI's conversational quality — the formula Woebot couldn't achieve.

**Sources:** [Maia/YCombinator](https://www.ycombinator.com/companies/maia), [Woebot/STAT News](https://www.statnews.com/2025/07/02/woebot-therapy-chatbot-shuts-down-founder-says-ai-moving-faster-than-regulators/), [Replika/EDPB](https://www.edpb.europa.eu/news/national-news/2025/ai-italian-supervisory-authority-fines-company-behind-chatbot-replika_en), [NPR/ChatGPT Couples](https://www.npr.org/2025/08/05/nx-s1-5490447/ai-chatgpt-couples-therapy-advice), [Market Sizing/GlobeNewsWire](https://www.globenewswire.com/news-release/2025/01/06/3004729/28124/en/Online-Couples-Therapy-and-Counseling-Services-Market-Report-2024-A-26-Billion-Industry-by-2028-Driven-by-Mobile-Apps-Long-term-Forecast-to-2033.html)

---

## 3. Privacy, Ethics & Regulatory Framework

### 3.1 Regulatory Landscape

#### Positioning Decision (Critical)

**Parallax must position as "conflict resolution / communication improvement," NOT therapy or mental health.**

If any mental health language is used ("therapy," "emotional wellbeing," "psychological support"), California's CMIA, New York's HIPA, and Washington's MHMDA all apply with full force. Positioned as conflict resolution, the regulatory burden is lighter (FTC Section 5 + state consumer privacy laws) while still requiring robust privacy practices.

#### Applicable Regulations

| Regulation | Applies? | Key Requirement |
|------------|----------|----------------|
| **HIPAA** | No (not a covered entity) | N/A — but do NOT claim HIPAA compliance |
| **FTC Health Breach Notification Rule** | Yes | Breach notification within 60 days |
| **FTC Section 5** | Yes | No deceptive privacy practices |
| **California CMIA** | If mental health language used | Explicit consent, data segregation |
| **New York HIPA (2025)** | Likely (broad "health information" definition) | Consent for health-related inferences |
| **Washington MHMDA** | Yes (covers "derived health data") | Right to deletion, private right of action |
| **Florida FDBR** | Yes | Consent for sensitive data processing |
| **GDPR Article 9** | If serving EU users | Explicit consent, DPIA, right to erasure |
| **FDA SaMD** | No (unless clinical claims made) | Never use clinical language |

#### FTC Enforcement Precedents (The Floor)

| Case | Fine | Core Violation |
|------|------|---------------|
| BetterHelp (2023) | $7.8M | Shared health questionnaire data with Facebook/Snapchat for ad targeting |
| Cerebral (2024) | $7.1M | Shared 3.2M consumers' data with LinkedIn/TikTok via tracking pixels |
| Monument (2024) | Settlement | Shared addiction treatment data with Meta/Google without consent |

**Common thread:** All three used tracking pixels that transmitted health data to ad platforms. The FTC's position: if a user tells your app about their mental state, that data is sacrosanct.

### 3.2 Ethical Framework

#### Core Principles (APA + WHO + ACM)

1. **Informed consent is mandatory** — users must know AI is analyzing their communication, what data is stored, how it is used
2. **Beneficence and nonmaleficence** — the tool must demonstrably help and not harm
3. **Competence boundaries** — AI should not operate outside validated domains
4. **Human oversight** — AI analysis is "one perspective," not authoritative judgment
5. **Bias awareness** — audit for racial, cultural, gender, and socioeconomic bias
6. **Maximal privacy as default** — data remains private unless the individual takes affirmative action

**Sources:** [APA Ethical Guidance (June 2025)](https://www.apa.org/topics/artificial-intelligence-machine-learning/ethical-guidance-ai-professional-practice), [WHO 2024 Guidance](https://www.who.int/publications/i/item/9789240084759)

### 3.3 Specific Risks for Two-Person Conflict Tool

#### Cross-Contamination

The most dangerous privacy risk. If Person A's private interview data leaks into Person B's mediation experience, consequences range from embarrassment to physical danger.

**Controls:**
- Strict data partitioning — separate access-controlled paths for each profile
- Prompt injection protection — system prompts cannot be manipulated to reveal other party's data
- Output filtering — validate Claude's output doesn't inadvertently reference other party's private data
- Audit logging — every data access pattern logged

#### Power Imbalance & Weaponization

The most serious ethical concern. An abuser could:
- Pressure their partner to use the tool to create a false "both-sides" record
- Game their profile to bias Claude's mediation
- Use Claude's analysis to legitimize abusive behavior

**Mandatory safety features:**
- Abuse detection signals in Claude's system prompt (coercive control, threats, gaslighting -> route to safety resources, NOT mediation)
- Asymmetric exit — either party can leave without the other knowing why
- No "shared record" usable as evidence
- Private "Are you safe?" check before each session (invisible to partner)
- Always-visible crisis resources: 988 Lifeline, National DV Hotline (1-800-799-7233), Crisis Text Line

#### Profile Manipulation

Users could game their intake to appear favorable. Mitigations:
- Behavioral vs. self-report triangulation (compare stated profile with actual session behavior)
- Cross-session consistency tracking
- Never disclose specific profile labels to users (removes optimization target)
- Single sessions cannot drastically change well-established profiles

#### Duty to Warn

Tarasoff duties apply to licensed mental health professionals, not AI platforms. However:
- California now requires AI chatbot platforms to refer users expressing suicidal ideation to crisis services
- FTC 2025 inquiry into generative AI developers' duty of care signals regulatory momentum
- Implement safety protocol regardless: detect harm signals -> present crisis resources -> pause mediation

### 3.4 Privacy Architecture Requirements

1. **Zero third-party tracking** — no Meta Pixel, no Google Analytics on any user data page. Plausible or self-hosted PostHog only.
2. **Anthropic API zero-data-retention** — conversations not stored by Anthropic for training
3. **Private by default** — all profile data private to individual, nothing shared unless explicitly opted in
4. **Granular consent** — separate controls for data storage, analysis, profile building, sharing with other party
5. **Right to deletion** — full cascading delete of profile + all derived insights
6. **Data export** — JSON export of everything Parallax knows about the user
7. **Application-level encryption** — AES-256-GCM for sensitive fields (triggers, raw interview transcripts)
8. **Row-Level Security** — users can only access their own rows in Supabase
9. **Audit logging** — every profile access logged with timestamp, context, and accessor
10. **18+ age gate** — mandatory given Character.AI litigation landscape

### 3.5 Terms of Service Requirements

**Must include:**
- Explicit "NOT therapy, NOT medical advice, NOT professional mediation"
- Clear description of data collection and usage
- No-sharing-with-third-parties pledge
- Limitation of liability for outcomes
- Right to deletion and data portability
- 18+ age restriction
- Safety disclaimers and crisis resource links

**Sources:** [FTC v. BetterHelp](https://www.ftc.gov/legal-library/browse/cases-proceedings/2023169-betterhelp-inc-matter), [Character.AI Settlement (CNN, Jan 2026)](https://www.cnn.com/2026/01/07/business/character-ai-google-settle-teen-suicide-lawsuit), [Stanford HAI](https://hai.stanford.edu/news/exploring-the-dangers-of-ai-in-mental-health-care), [Washington MHMDA](https://iapp.org/resources/article/washington-my-health-my-data-act-overview)

---

## 4. Technical Architecture Patterns

### 4.1 Persistent Memory Patterns in AI Systems

#### ChatGPT Memory (Four-Layer Injection)

1. **Persistent User Memories:** Explicitly saved facts as key-value pairs, injected into system prompt
2. **Learned User Profile:** Communication preferences, notable topics, inferred details with confidence scores
3. **Recent Conversation Index:** ~40 recent chats with summaries (model responses excluded to save tokens)
4. **Interaction Metadata:** Technical/behavioral signals

**Limitation:** Cannot search historical conversations — uses pre-computed summaries, not full retrieval.

**Parallax takeaway:** Hybrid approach — structured profile data always injected (like Layer 2), with detailed session history retrievable via RAG.

#### Claude Memory (File-Based, Transparent)

Anthropic uses simple Markdown files organized hierarchically. Context engineering principles:
- **Compaction:** Summarize history when approaching context limits
- **Just-in-time retrieval:** Maintain lightweight identifiers, dynamically load at runtime
- **Hybrid retrieval:** Fast key-value store for embeddings + file search for structured notes

**Performance result:** Memory tool + context editing improved performance 39% over baseline.

#### MemGPT/Letta (OS-Inspired Memory Tiers)

- **Core Memory (RAM):** Always-accessible compressed essential facts. Agent self-edits these blocks.
- **Recall Memory (Disk):** Complete searchable interaction history.
- **Archival Memory (Indexed):** Long-term vector-indexed storage.
- **Sleep-time agents:** Async memory reorganization during idle periods.

**Parallax takeaway:** The "core memory block" pattern is directly applicable — compact, always-in-context profile that gets updated after each session.

**Sources:** [Embrace The Red - ChatGPT Memory](https://embracethered.com/blog/posts/2025/chatgpt-how-does-chat-history-memory-preferences-work/), [Anthropic Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [Letta/MemGPT Docs](https://docs.letta.com/concepts/memgpt/)

### 4.2 Knowledge Base Architecture

#### Hybrid Structured JSON + Vector Embeddings (Recommended)

| Data Type | Storage | Retrieval |
|-----------|---------|-----------|
| Core profile traits (attachment, communication patterns) | Structured JSON in Supabase | Direct lookup |
| Confidence scores, validated assessments | Structured JSON | Exact value queries |
| Session conversation history | pgvector embeddings (natural language summaries) | Semantic search |
| Extracted insights over time | pgvector + structured metadata | Similarity matching |
| Trigger/pattern descriptions | pgvector embeddings | Match against current conversation |

**Critical finding:** Embedding raw JSON into vector databases performs poorly. Converting to flattened natural language text first yields 19.1% boost in Recall@10 and 27.2% boost in MRR.

#### Temporal Knowledge Graphs (V3+)

Zep's temporal knowledge graph (January 2025) outperforms MemGPT on complex temporal reasoning with 18.5% accuracy improvement and 90% latency reduction. Bi-temporal data model tracks both when the system learned a fact and when the fact was actually true.

**For Parallax V2:** Structured JSON + pgvector in Supabase (simpler).
**For V3+:** Consider Graphiti/Neo4j when cross-session pattern tracking becomes critical.

**Sources:** [Zep Paper (arXiv)](https://arxiv.org/html/2501.13956v1), [Supabase pgvector Docs](https://supabase.com/docs/guides/database/extensions/pgvector)

### 4.3 Profile Schema (Supabase)

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,

  -- Attachment & Communication
  attachment_style JSONB DEFAULT '{}',
  -- { "primary": "anxious", "confidence": 0.72, "assessed_at": "...", "evidence_count": 14 }

  communication_patterns JSONB DEFAULT '{}',
  -- { "style": "indirect", "emotional_expression": "high",
  --   "conflict_approach": "avoidant", "reassurance_seeking": 0.8 }

  triggers JSONB DEFAULT '[]',
  -- [{ "trigger": "feeling dismissed", "intensity": 0.9,
  --    "confidence": 0.85, "occurrence_count": 3 }]

  strengths JSONB DEFAULT '[]',
  growth_areas JSONB DEFAULT '[]',

  -- NVC-specific
  nvc_fluency FLOAT DEFAULT 0.0,
  default_conflict_mode TEXT, -- competing/collaborating/compromising/avoiding/accommodating

  -- Meta
  intake_completed BOOLEAN DEFAULT FALSE,
  intake_completed_at TIMESTAMPTZ,
  profile_version INT DEFAULT 1,
  session_count INT DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Strict RLS isolation
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Audit logging
CREATE TABLE profile_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  accessed_by UUID NOT NULL,
  action TEXT NOT NULL, -- 'read', 'update', 'extract', 'inject_context'
  context JSONB,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.4 Context Injection Strategy

**Token budget allocation (200k context window):**

| Component | % | Tokens | Content |
|-----------|---|--------|---------|
| System prompt (NVC protocol) | 5-8% | 10-16k | Static per session type |
| User Profile (compact) | 2-3% | 4-6k | Structured JSON summary |
| Retrieved insights (RAG) | 5-10% | 10-20k | Relevant past patterns |
| Conversation history | 30-40% | 60-80k | Current session messages |
| Response buffer | 25% | 50k | Claude's analysis output |
| Safety buffer | 10-20% | 20-40k | Prevent hard cap |

**Progressive disclosure pattern:**
- **Messages 1-5:** Core traits only (attachment, conflict mode)
- **Messages 6-15:** Communication patterns, conflict approach
- **Emotional intensity > 0.7:** Relevant triggers retrieved via semantic search
- **Messages 15+, high intensity:** Historical patterns, past session insights

**One-way data flow (critical):** During mediation, Claude receives current speaker's profile + shared conversation. Never the other person's private profile data.

**Confirmation bias mitigation:** "Blind analysis first" — analyze message without profile context, then with profile context. Present both perspectives to prevent profile-driven tunnel vision.

### 4.5 Interview-to-Knowledge-Base Pipeline

**Step 1: Conversational Interview (Claude as interviewer)**
- Audio-first design (3x more data than text)
- 16-22 questions across four phases
- Conversational wrapping of validated instrument items

**Step 2: Structured Extraction (Claude Structured Outputs)**
- Zod schema defines exact output format
- Deterministic extraction with confidence scores
- Calibration bands: 0-0.3 speculative, 0.3-0.6 moderate evidence, 0.6-0.8 strong, 0.8-1.0 very clear pattern

**Step 3: Profile Storage (Supabase)**
- Core traits in structured JSON (user_profiles table)
- Session insights as vector embeddings (profile_insights table)
- Application-level AES-256-GCM encryption for sensitive fields

**Step 4: Profile Evolution (Post-Session Updates)**
- After each mediation session, extract new observations
- Compare with existing profile — reinforce or flag contradictions
- Confidence boosted by +10% per reinforcing observation
- First observations discounted by 0.6x multiplier (anti first-impression bias)
- Staleness decay: 5% confidence loss per month without reinforcing observations

### 4.6 Anti-Patterns

| Anti-Pattern | Risk | Mitigation |
|-------------|------|-----------|
| First impression bias | Intake data dominates profile forever | 0.6x discount on initial scores, recency weighting, periodic re-assessment |
| Confirmation bias | Claude interprets everything through profile lens | Blind analysis first, devil's advocate prompting, symmetry checks |
| Stale profiles | People change, profiles don't | 5%/month confidence decay, active probing, contradiction detection |
| Profile manipulation | Users game intake for favorable mediation | Behavioral vs. self-report triangulation, cross-session consistency, never show labels |
| Over-collection | Collecting more data than needed | Data minimization tiers, only Tier 1 at launch |

**Sources:** [Anthropic Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [Supabase RLS Performance](https://supabase.com/docs/guides/database/postgres/row-level-security), [ArXiv AI Conversational Interviewing](https://arxiv.org/html/2410.01824v1)

---

## 5. Architecture Recommendation

### Versioning Roadmap

| Version | What Ships | Profile Depth |
|---------|-----------|---------------|
| **V1** (current) | Stateless NVC analysis per message | None |
| **V2** | Interview + structured JSON profiles + system prompt injection | Core traits, single-session |
| **V3** | pgvector + progressive disclosure + temporal tracking + 14 lenses | Deepening over time |
| **V4** | Temporal knowledge graph + relationship profiles + cross-session mining | Full longitudinal |

### V2 Architecture (Next Implementation Target)

```
[User] -> [Intake Interview UI]
              |
              v
[Claude as Interviewer] -> [Structured Extraction (Zod)]
              |
              v
[user_profiles table] <- RLS isolation <- [Supabase]
              |
              v
[Mediation Session] -> [Context Injection (profile + conversation)]
              |
              v
[Claude NVC Analysis] -> [Response with profile-informed insights]
              |
              v
[Post-Session Update] -> [Profile evolution with confidence tracking]
```

### Non-Negotiable Safety Layer

Regardless of version:
- Crisis resources always visible
- Abuse detection in system prompt
- Private safety check before sessions
- One-way data flow during mediation
- Right to deletion
- Zero third-party tracking
- "Not therapy" disclaimers throughout

---

## Sources

### Psychology & Assessment
- [ECR-R Scale — Fraley Lab](https://labs.psychology.illinois.edu/~rcfraley/measures/ecrritems.htm)
- [TKI Overview — Kilmann Diagnostics](https://kilmanndiagnostics.com/overview-thomas-kilmann-conflict-mode-instrument-tki/)
- [Gottman Four Horsemen](https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/)
- [SCARF Model — David Rock](https://davidrock.net/portfolio-items/scarf-a-brain-based-model-for-collaborating-with-and-influencing-others-vol-1/)
- [DERS-16 Validation — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4882111/)
- [Drama Triangle Scale — PubMed](https://pubmed.ncbi.nlm.nih.gov/32917106/)
- [BDI-FS-GPT Study — PMC/JMIR 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12848484/)
- [AI Mental Health Systematic Review — World Psychiatry 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12434366/)

### Competitive Landscape
- [Maia — YCombinator](https://www.ycombinator.com/companies/maia)
- [Woebot Shutdown — STAT News](https://www.statnews.com/2025/07/02/woebot-therapy-chatbot-shuts-down-founder-says-ai-moving-faster-than-regulators/)
- [Replika Fine — EDPB](https://www.edpb.europa.eu/news/national-news/2025/ai-italian-supervisory-authority-fines-company-behind-chatbot-replika_en)
- [ChatGPT Couples Bias — NPR](https://www.npr.org/2025/08/05/nx-s1-5490447/ai-chatgpt-couples-therapy-advice)
- [Hume AI](https://www.hume.ai/)
- [Dyspute.ai — LawNext](https://www.lawnext.com/2026/01/dyspute-ai-launches-adri-v2-a-24-7-asynchronous-ai-mediation-platform.html)
- [Market Sizing — GlobeNewsWire](https://www.globenewswire.com/news-release/2025/01/06/3004729/28124/en/Online-Couples-Therapy-and-Counseling-Services-Market-Report-2024-A-26-Billion-Industry-by-2028-Driven-by-Mobile-Apps-Long-term-Forecast-to-2033.html)

### Privacy & Regulation
- [FTC v. BetterHelp](https://www.ftc.gov/legal-library/browse/cases-proceedings/2023169-betterhelp-inc-matter)
- [FTC v. Cerebral](https://www.ftc.gov/news-events/news/press-releases/2024/04/proposed-ftc-order-will-prohibit-telehealth-firm-cerebral-using-or-disclosing-sensitive-data)
- [FTC Health Breach Notification Rule](https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0)
- [APA AI Ethics Guidance (2025)](https://www.apa.org/topics/artificial-intelligence-machine-learning/ethical-guidance-ai-professional-practice)
- [WHO AI Governance (2024)](https://www.who.int/publications/i/item/9789240084759)
- [Washington MHMDA — IAPP](https://iapp.org/resources/article/washington-my-health-my-data-act-overview)
- [California CMIA Expansion — Covington](https://www.covingtondigitalhealth.com/2022/11/california-expands-the-scope-of-the-cmia-to-cover-certain-digital-mental-health-services-and-information/)
- [New York HIPA — McDermott](https://www.mwe.com/insights/new-york-passes-restrictive-health-information-privacy-act/)
- [Character.AI Settlement — CNN](https://www.cnn.com/2026/01/07/business/character-ai-google-settle-teen-suicide-lawsuit)
- [Stanford HAI — AI Mental Health Dangers](https://hai.stanford.edu/news/exploring-the-dangers-of-ai-in-mental-health-care)
- [AI Mental Health Legislation — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12578431/)

### Technical Architecture
- [ChatGPT Memory — Embrace The Red](https://embracethered.com/blog/posts/2025/chatgpt-how-does-chat-history-memory-preferences-work/)
- [Claude Context Engineering — Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [MemGPT/Letta — Docs](https://docs.letta.com/concepts/memgpt/)
- [Zep Temporal Knowledge Graph — arXiv](https://arxiv.org/html/2501.13956v1)
- [Supabase pgvector — Docs](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Supabase RLS — Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Anthropic Structured Outputs — Docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [AI Conversational Interviewing — arXiv](https://arxiv.org/html/2410.01824v1)
- [Optimizing Vector Search for Structured Data — TDS](https://towardsdatascience.com/optimizing-vector-search-why-you-should-flatten-structured-data/)
