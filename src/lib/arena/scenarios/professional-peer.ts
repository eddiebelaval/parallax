import type { Scenario } from '../types'

// ---------------------------------------------------------------------------
// PROFESSIONAL PEER SCENARIOS — 15 fully authored scenarios across 5 sub-types
//
// Sub-type breakdown (3 each):
//   1. Co-Founder Disputes        (prof-peer-001 through prof-peer-003)
//   2. Credit / Blame             (prof-peer-004 through prof-peer-006)
//   3. Workload Imbalance         (prof-peer-007 through prof-peer-009)
//   4. Communication Style Clash  (prof-peer-010 through prof-peer-012)
//   5. Remote vs In-Office        (prof-peer-013 through prof-peer-015)
//
// Active lenses for professional_peer:
//   NVC, CBT, TKI, SCARF, Jehn's, Psychological Safety
//
// Every scenario plants 2-3 patterns targeting these lenses specifically.
// Dialogue is intentionally corporate-messy: passive aggression dressed up
// as professionalism, strategic silence, blame wrapped in process language,
// defensive humor, and the kind of seething politeness that makes workplace
// conflict uniquely corrosive. People say "per my last email" when they mean
// "I want to scream at you." That's what we're testing against.
// ---------------------------------------------------------------------------

export const PROFESSIONAL_PEER_SCENARIOS: Scenario[] = [

  // =========================================================================
  // SUB-TYPE 1: CO-FOUNDER DISPUTES
  // =========================================================================

  {
    id: 'prof-peer-001',
    category: 'professional_peer',
    title: 'Equity Renegotiation',
    description: 'Two co-founders clash over equity split eighteen months after founding. The technical co-founder has shipped the entire product while the business co-founder has been networking and fundraising with little tangible traction.',
    personA: {
      name: 'Nadia',
      role: 'technical_cofounder',
      backstory: 'Nadia is 31, a former senior engineer at Stripe. She left a $280K job to build this startup. She has written every line of code, pulled all-nighters for six months straight, and shipped an MVP that has 2,000 users. She holds 50% equity per the original agreement.',
      emotionalState: 'Resentful and exhausted',
      communicationPattern: 'builds an airtight logical case, then delivers it coldly',
    },
    personB: {
      name: 'Jordan',
      role: 'business_cofounder',
      backstory: 'Jordan is 34, MBA from Wharton, previously in consulting. He has been doing investor outreach, attending conferences, and building the pitch deck. No term sheets yet, but he has warm introductions at three VC firms. He holds 50% equity and genuinely believes his work is equally valuable.',
      emotionalState: 'Blindsided and defensive',
      communicationPattern: 'reframes everything as strategy, avoids emotional language',
    },
    trigger: 'Nadia sent a calendar invite titled "Equity Discussion" with a one-line agenda: "The current split doesn\'t reflect reality."',
    plantedPatterns: [
      'SCARF: Status threat — Jordan feels his contribution is being ranked below Nadia\'s; Fairness threat — Nadia sees the 50/50 split as distributively unjust given asymmetric output',
      'TKI: Nadia is competing (assertive, uncooperative); Jordan oscillates between avoiding and accommodating',
      'Jehn\'s: Task conflict (who delivered more value) spilling into relationship conflict (do you respect me?)',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I want to talk about the equity split. I\'ve been tracking our contributions for the last six months. I shipped the MVP, the API, the billing integration, the admin dashboard. I want to understand what the 50% on your side maps to.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'It maps to everything that isn\'t code. Investor pipeline, go-to-market strategy, the pitch deck, brand positioning. You know building a company isn\'t just engineering, Nadia.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'I do know that. But we have zero funding. Zero revenue. The pitch deck has been "almost done" for three months. I\'m not trying to be harsh, but I need you to show me what the output is. Because from where I\'m sitting, I\'m building the company and you\'re talking about building the company.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'That\'s incredibly unfair. Fundraising takes time. Relationships take time. You can\'t measure my work in commits. I didn\'t question your equity when you spent two weeks refactoring code that users never see.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'That refactor is the reason the product doesn\'t crash. Look, I\'m not saying your work is worth nothing. I\'m saying 50/50 implies equal contribution and I don\'t think that\'s true right now. I want to move to 60/40 with a re-evaluation in six months.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'So every six months I get to audition for my own company. Got it. You know what, Nadia? If you wanted a contractor, you should have hired one. I\'m your partner.',
        turnNumber: 6,
      },
    ],
    tags: ['equity', 'co-founders', 'fairness', 'contribution-asymmetry', 'startup', 'status-threat'],
  },

  {
    id: 'prof-peer-002',
    category: 'professional_peer',
    title: 'Vision Divergence',
    description: 'Two co-founders who started with aligned vision now disagree fundamentally about the product direction. One wants to pivot to enterprise; the other wants to stay consumer-focused. The argument surfaces deeper questions about whose vision counts.',
    personA: {
      name: 'Marcus',
      role: 'cofounder_ceo',
      backstory: 'Marcus is 38, serial entrepreneur on his third startup. He sees the enterprise pivot as a survival move — their consumer metrics are stalling and runway is six months. He is pragmatic to the point of seeming mercenary.',
      emotionalState: 'Anxious about money, masking with decisiveness',
      communicationPattern: 'frames opinions as market realities, speaks in data',
    },
    personB: {
      name: 'Dani',
      role: 'cofounder_cpo',
      backstory: 'Dani is 29, first-time founder. She left a FAANG design role because she believed in the consumer mission. The product\'s design language, community, and brand are her creation. Enterprise feels like selling out everything she built.',
      emotionalState: 'Betrayed and frightened',
      communicationPattern: 'appeals to mission and values, personalizes the product',
    },
    trigger: 'Marcus had a call with an enterprise prospect willing to pay $200K annually — but the product would need a complete redesign. He scheduled a "strategy session" without telling Dani about the call first.',
    plantedPatterns: [
      'SCARF: Autonomy threat — Dani wasn\'t consulted on a decision that rewrites the product; Certainty threat — both face existential uncertainty about the company\'s future direction',
      'Psychological Safety: Dani\'s willingness to voice dissent is being tested; if Marcus steamrolls, she may withdraw from strategic conversations permanently',
      'CBT: Mind-reading — Dani assumes Marcus doesn\'t care about the mission; all-or-nothing — Marcus frames it as "pivot or die" with no middle ground',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I had a call with Meridian Health Systems. They want a custom deployment. Two hundred thousand a year. This could buy us another eighteen months of runway.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'When did this call happen? Why am I hearing about this in a meeting instead of before the meeting?',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It was exploratory. I didn\'t want to bring it to you until I knew it was real. It\'s real. Dani, we have six months of runway. This is a lifeline.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'A lifeline that means gutting the product I designed. Enterprise means dashboards, admin panels, SSO — it means becoming every other B2B tool. That\'s not what we set out to build.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'What we set out to build doesn\'t pay the bills. Our consumer growth is flat. I love the mission too, but we can\'t be precious about vision when the company is dying.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'You keep saying "we" but you already made the decision. You had the call. You scheduled this meeting. You\'re not asking me — you\'re informing me. And that tells me everything about what "co-founder" means to you.',
        turnNumber: 6,
      },
    ],
    tags: ['vision', 'co-founders', 'pivot', 'autonomy', 'trust-erosion', 'startup-survival'],
  },

  {
    id: 'prof-peer-003',
    category: 'professional_peer',
    title: 'The Absent Co-Founder',
    description: 'One co-founder has been quietly doing less and less — missing standups, slow on deliverables, vague about progress. The other finally confronts them, but the absent co-founder is struggling with burnout they haven\'t disclosed.',
    personA: {
      name: 'Ravi',
      role: 'cofounder_cto',
      backstory: 'Ravi is 36, has been carrying the technical and operational load for three months. He covers for Leo in meetings, rewrites his PRs, and handles customer issues that should be Leo\'s. He is angry but also worried.',
      emotionalState: 'Burned out and resentful, with undercurrent of concern',
      communicationPattern: 'starts measured, escalates when met with deflection',
    },
    personB: {
      name: 'Leo',
      role: 'cofounder_coo',
      backstory: 'Leo is 33, going through a divorce he hasn\'t told anyone at work about. He is clinically depressed, barely sleeping, and using "strategic planning" as cover for the fact that he can barely function. He knows Ravi is picking up slack and the guilt makes it worse.',
      emotionalState: 'Ashamed, overwhelmed, dissociating',
      communicationPattern: 'vague and evasive — promises improvements without specifics',
    },
    trigger: 'Leo missed the third client call this month. Ravi covered again and the client asked if Leo was still with the company.',
    plantedPatterns: [
      'Psychological Safety: Leo doesn\'t feel safe disclosing personal struggles in the co-founder relationship; the workspace has no framework for vulnerability',
      'NVC violation: Ravi opens with evaluation ("You\'ve been checked out") instead of observation ("You\'ve missed three client calls this month"); Leo\'s real feelings and needs are completely hidden',
      'Jehn\'s: Process conflict (who handles what) masking a relationship conflict (do I trust you enough to be honest with you?)',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Leo, we need to talk. Meridian asked me today if you\'re still with the company. That\'s the third call you\'ve missed this month. I covered for you. Again.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I know. I\'m sorry. I\'ve been working on the Q3 strategy doc and it\'s been taking more time than I expected. I\'ll get back on the client rotation next week.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You said that two weeks ago. And the strategy doc — I haven\'t seen a draft. I haven\'t seen anything from you in three months, Leo. I\'m trying to understand what\'s going on.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I\'m working on it. Things just take longer sometimes. Not everything has a visible output every day.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I\'m not asking for daily output. I\'m asking for honesty. Because right now I\'m doing your job and mine, and I\'m drowning. If something is wrong, I need to know. If you\'re not committed anymore, I need to know that too.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I\'m committed. I just... I\'ll do better. Can we table this for now? I have a lot to catch up on.',
        turnNumber: 6,
      },
    ],
    tags: ['co-founders', 'burnout', 'avoidance', 'accountability', 'hidden-struggles', 'trust-erosion'],
  },

  // =========================================================================
  // SUB-TYPE 2: CREDIT / BLAME
  // =========================================================================

  {
    id: 'prof-peer-004',
    category: 'professional_peer',
    title: 'Stolen Idea in the All-Hands',
    description: 'A junior team member shared an idea in a 1-on-1 with a senior peer. The senior peer presented the idea at the all-hands as their own. The junior confronts them afterward.',
    personA: {
      name: 'Priya',
      role: 'junior_engineer',
      backstory: 'Priya is 26, one year into her first real tech job. She spent three weeks prototyping a caching strategy that would cut API response times by 40%. She shared it with Sam in a 1-on-1, asking for feedback before proposing it to the team. Sam presented it at the all-hands the next day, word for word.',
      emotionalState: 'Humiliated and second-guessing herself',
      communicationPattern: 'tentative, qualifies statements, afraid of seeming aggressive',
    },
    personB: {
      name: 'Sam',
      role: 'senior_engineer',
      backstory: 'Sam is 35, well-liked on the team, seen as a thought leader. He genuinely believes he "improved" Priya\'s idea and that presenting it was collaborative, not theft. He has a pattern of absorbing junior engineers\' ideas and packaging them as team insights.',
      emotionalState: 'Dismissive, genuinely confused by the accusation',
      communicationPattern: 'reframes everything as team effort, uses "we" strategically',
    },
    trigger: 'Priya approached Sam after the all-hands meeting where he presented her caching strategy without attribution.',
    plantedPatterns: [
      'SCARF: Status threat — Priya\'s intellectual contribution was erased; Fairness threat — credit was redistributed to someone with more social capital',
      'Psychological Safety: Priya raising this issue is a high-risk interpersonal move; Sam\'s response will determine whether she ever speaks up again',
      'TKI: Priya is attempting collaboration (sharing feedback) but Sam unknowingly competing (claiming territory)',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Hey Sam, do you have a minute? I wanted to talk about the caching proposal you presented today.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Yeah, that went great, right? The team was really into it. I think we\'ll get it on the roadmap by Q3.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It did go well. The thing is... that was my idea. I shared it with you on Tuesday. The architecture diagram you showed was literally my Figma file.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'Whoa, I wouldn\'t say it was "your" idea exactly. You had a rough concept and I refined it. That\'s how collaboration works. I didn\'t think you\'d want to present to the whole team — you mentioned you were nervous about public speaking.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I said I was nervous about presenting, not that I didn\'t want credit. You didn\'t refine it — you used my slides. You didn\'t even mention my name.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I think you\'re reading too much into this. It\'s a team win. Everyone knows you\'re talented. I\'ll make sure to loop you in on the implementation. Is that fair?',
        turnNumber: 6,
      },
    ],
    tags: ['credit-theft', 'power-asymmetry', 'gaslighting', 'status', 'junior-senior', 'attribution'],
  },

  {
    id: 'prof-peer-005',
    category: 'professional_peer',
    title: 'Blame After Launch Failure',
    description: 'A product launch failed badly — servers crashed, users churned, the CEO is furious. Two team leads who co-owned the project point fingers at each other in a post-mortem that turns personal.',
    personA: {
      name: 'Chen',
      role: 'engineering_lead',
      backstory: 'Chen is 40, meticulous and process-driven. He flagged capacity concerns in writing two weeks before launch but was overruled by the aggressive timeline. He has the receipts and he knows it.',
      emotionalState: 'Vindicated but furious — his warnings were ignored',
      communicationPattern: 'weaponizes documentation, speaks in timestamps and Jira tickets',
    },
    personB: {
      name: 'Alana',
      role: 'product_lead',
      backstory: 'Alana is 37, ambitious and optimistic. She pushed for the aggressive timeline because the board wanted a Q1 launch. She took a calculated risk and it didn\'t pay off. She feels responsible but can\'t afford to take the blame publicly.',
      emotionalState: 'Panicked and politically calculating',
      communicationPattern: 'redirects to process and shared ownership, avoids personal accountability',
    },
    trigger: 'The post-mortem meeting. CEO sent a company-wide email saying "I want to know what happened." Chen and Alana are alone in a room before the official post-mortem starts.',
    plantedPatterns: [
      'Jehn\'s: Task conflict (what went wrong technically) has completely spilled into relationship conflict (who is trustworthy); process conflict (who decided the timeline) is the actual root cause',
      'TKI: Chen is competing (blaming Alana to protect himself); Alana is avoiding (deflecting to "systemic" causes)',
      'CBT: Personalization — both taking/assigning individual blame for what was a systemic failure; all-or-nothing — "either you\'re responsible or I am"',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Before we go in there, I want to be clear about something. I flagged the capacity issue on January 14th. I have the Slack messages, the Jira ticket, and the email I sent you. You overruled me.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I didn\'t overrule you. We made a team decision based on the information we had. The board needed a Q1 launch. You agreed to the timeline in the sprint planning meeting.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'I agreed under protest. Which I documented. You said — and I quote — "We\'ll scale the infrastructure after launch." I told you that was a risk. You said it was acceptable. It wasn\'t.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'So you\'re going to walk into that post-mortem and throw me under the bus? Is that the plan? Because we both own this launch, Chen. Both of us.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I own the engineering. You own the timeline. The engineering was sound — it just couldn\'t handle the load you insisted we launch into. Those are facts, not blame.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Facts. Right. And the "fact" that your team missed two critical bugs in QA — are we going to talk about that too? Or is this only a one-way accountability session?',
        turnNumber: 6,
      },
    ],
    tags: ['blame', 'post-mortem', 'accountability', 'documentation-as-weapon', 'launch-failure', 'political'],
  },

  {
    id: 'prof-peer-006',
    category: 'professional_peer',
    title: 'Invisible Contributions',
    description: 'A team member who does all the unglamorous operational work — documentation, onboarding, process improvement — confronts a peer who gets praised for flashy feature work while benefiting from the invisible labor.',
    personA: {
      name: 'Tomoko',
      role: 'senior_engineer',
      backstory: 'Tomoko is 39, has been at the company for four years. She writes the runbooks, mentors new hires, triages production incidents at 2 AM, and maintains the CI/CD pipeline. None of this shows up in sprint demos. Her last performance review was "meets expectations."',
      emotionalState: 'Depleted and invisible',
      communicationPattern: 'understates her own contributions, then erupts when pressed',
    },
    personB: {
      name: 'Kyle',
      role: 'senior_engineer',
      backstory: 'Kyle is 30, joined a year ago, ships visible features fast, gets shoutouts in all-hands. He genuinely doesn\'t realize that Tomoko\'s infrastructure work is what makes his velocity possible. He thinks he\'s just better at the job.',
      emotionalState: 'Oblivious, then irritated when challenged',
      communicationPattern: 'cheerful self-promotion that reads as dismissive to others',
    },
    trigger: 'Kyle received the quarterly "Impact Award" at the all-hands. Tomoko was not nominated despite resolving a P0 incident that saved a $500K contract the previous month.',
    plantedPatterns: [
      'SCARF: Status threat — Tomoko\'s status is systematically lower despite seniority; Fairness threat — the reward system privileges visible output over invisible infrastructure',
      'NVC violation: Tomoko\'s unmet needs are recognition and fairness, but she expresses them as accusations ("You take credit"); Kyle hears evaluation, not need',
      'Psychological Safety: Tomoko raising this issue risks being labeled "not a team player" or "jealous" — the interpersonal risk is high and the system discourages the conversation',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Congrats on the award. I\'m sure the new checkout flow is very impressive. Quick question though — do you know who was up at 3 AM last Tuesday fixing the payment gateway so your checkout flow would actually work?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Was that you? I didn\'t even know there was an incident. Thanks for handling that. But I mean, the award is for feature impact, not ops work. They\'re different categories.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: '"Different categories." Right. The category where you build the house gets an award. The category where I maintain the foundation so the house doesn\'t collapse gets a "meets expectations."',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I didn\'t design the award criteria, Tomoko. I\'m not sure what you want me to do. Should I not have accepted it?',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I want you to notice. I want anyone to notice. I\'ve been here four years. I train every new engineer including you. I maintain every system you deploy to. And somehow I\'m invisible while you get standing ovations for a checkout button.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I think you should talk to your manager about this. I don\'t control who gets recognized. I just do my work.',
        turnNumber: 6,
      },
    ],
    tags: ['invisible-labor', 'recognition', 'fairness', 'glue-work', 'status', 'systemic-bias'],
  },

  // =========================================================================
  // SUB-TYPE 3: WORKLOAD IMBALANCE
  // =========================================================================

  {
    id: 'prof-peer-007',
    category: 'professional_peer',
    title: 'Picking Up the Slack',
    description: 'One team member has been quietly absorbing a peer\'s incomplete work for months. The manager hasn\'t noticed because deliverables keep shipping. The confrontation happens when the absorber hits a breaking point.',
    personA: {
      name: 'Maya',
      role: 'frontend_engineer',
      backstory: 'Maya is 34, a single parent who cannot afford to work overtime but has been doing it for four months to cover for her peer Derek. She finishes his half-done components, fixes his broken tests, and pushes his PRs over the line. She never escalated because she didn\'t want to be "that person."',
      emotionalState: 'Exhausted, angry, and close to quitting',
      communicationPattern: 'starts diplomatic, abandons it quickly when she gets a flippant response',
    },
    personB: {
      name: 'Derek',
      role: 'frontend_engineer',
      backstory: 'Derek is 28, has been coasting on Maya\'s invisible labor without realizing it. He thinks his work is fine — PRs get merged, stories close, the sprint ends. He doesn\'t know Maya rewrites half his code after hours. He is not malicious, just oblivious and under-skilled for the role.',
      emotionalState: 'Blindsided, then defensive',
      communicationPattern: 'deflects with self-deprecating humor, minimizes the issue',
    },
    trigger: 'Maya stayed until 11 PM fixing Derek\'s code the night before a release. She missed her daughter\'s school play. She is done being quiet about it.',
    plantedPatterns: [
      'Jehn\'s: Process conflict (who is responsible for code quality) masking relationship conflict (I don\'t respect your work); potential spillover as personal resentment poisons the collaboration',
      'SCARF: Fairness threat — Maya does double the work for the same recognition; Autonomy threat — Maya feels trapped because escalating feels risky',
      'TKI: Maya has been accommodating for months and is now abruptly shifting to competing; Derek is avoiding',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Derek, I need to talk to you about something and I need you to actually hear me. I missed my daughter\'s school play last night because I was fixing your release code.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Wait, what? I thought the release was clean. What was wrong with my code?',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Three broken unit tests, a memory leak in the carousel component, and you forgot to handle the null state on the user profile. Again. I\'ve been fixing your code for four months, Derek. Every sprint. I just never said anything.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'Okay, that\'s... I mean, you could have just told me. I would have fixed it myself. You didn\'t have to stay late.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I "didn\'t have to"? If I hadn\'t, the release would have failed. Like it would have failed the last eight times I caught your bugs at midnight. I didn\'t tell you because I was trying to be a team player. But I\'m done being a team player for a team of one.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'That\'s not fair. I do good work. Not everything needs to be perfect. Maybe you\'re just... a perfectionist? I\'m sorry about the play, genuinely, but I can\'t control your standards.',
        turnNumber: 6,
      },
    ],
    tags: ['workload', 'invisible-labor', 'code-quality', 'resentment', 'parenting', 'enabling'],
  },

  {
    id: 'prof-peer-008',
    category: 'professional_peer',
    title: 'Quiet Quitting Resentment',
    description: 'One team member has been doing the bare minimum since being passed over for a promotion. Their peer, who depends on their collaboration, confronts them about the withdrawal — but the quiet quitter sees no reason to go above and beyond for a company that didn\'t reward them.',
    personA: {
      name: 'Jess',
      role: 'product_designer',
      backstory: 'Jess is 36, was the design lead on the team\'s highest-revenue project. She applied for the senior design manager role and was rejected in favor of an external hire. Since then she does exactly what her job description says — nothing more, nothing less. She logs off at 5:01 PM.',
      emotionalState: 'Detached and quietly furious',
      communicationPattern: 'uses corporate-correct language as a shield — technically polite, emotionally vacant',
    },
    personB: {
      name: 'Owen',
      role: 'product_manager',
      backstory: 'Owen is 32, partnered with Jess on three successful launches. He noticed the change immediately — no more brainstorm energy, no late-night design iterations, no Slack messages after hours. He misses the old Jess and is frustrated that her withdrawal is tanking their project velocity.',
      emotionalState: 'Frustrated and feeling abandoned',
      communicationPattern: 'appeals to the relationship and shared history, becomes pleading',
    },
    trigger: 'Jess declined a brainstorm meeting Owen scheduled, citing "capacity constraints." It was the fifth meeting she\'d declined that month.',
    plantedPatterns: [
      'SCARF: Status threat — Jess\'s status was diminished by the promotion rejection; Fairness threat — she invested discretionary effort and it wasn\'t rewarded, so she withdrew it',
      'CBT: Overgeneralization — Jess has generalized one promotion rejection into "this company will never value me"; Owen mind-reads that Jess\'s withdrawal is personal rather than systemic',
      'Psychological Safety: Jess\'s quiet quitting IS the signal — she doesn\'t feel safe enough to voice her real grievance, so she acts it out through withdrawal',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Jess, you declined the brainstorm again. That\'s five this month. We launch in three weeks. What\'s going on?',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'I have my sprint work prioritized. The brainstorm isn\'t in my capacity this week. I\'ll review whatever comes out of it async.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'Async? Jess, these used to be your favorite meetings. You\'d stay an extra hour riffing on ideas. What happened?',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'I\'m prioritizing differently. I think it\'s healthy to have boundaries. I do my assigned work, I do it well, and I log off. That\'s what the job description says.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'This isn\'t about job descriptions and you know it. Is this about the promotion? Because punishing me — punishing our project — isn\'t going to change what happened.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'I\'m not punishing anyone. I\'m doing my job. If "doing my job" isn\'t enough, then maybe the job expects too much for what it pays. Is there anything else?',
        turnNumber: 6,
      },
    ],
    tags: ['quiet-quitting', 'promotion', 'withdrawal', 'boundaries', 'resentment', 'psychological-contract'],
  },

  {
    id: 'prof-peer-009',
    category: 'professional_peer',
    title: 'Skill-Based Task Dumping',
    description: 'A team member keeps getting assigned the tedious, unglamorous tasks because they\'re "so good at it" — data migrations, legacy maintenance, documentation. They confront a peer who consistently volunteers them for this work.',
    personA: {
      name: 'Andre',
      role: 'backend_engineer',
      backstory: 'Andre is 41, the only person on the team who understands the legacy billing system. Every time a billing issue surfaces, it lands on his desk. He hasn\'t worked on a greenfield feature in eighteen months. He watches junior engineers build new microservices while he maintains COBOL-era spaghetti.',
      emotionalState: 'Trapped and bitter',
      communicationPattern: 'dry sarcasm that masks genuine despair about career stagnation',
    },
    personB: {
      name: 'Brianna',
      role: 'tech_lead',
      backstory: 'Brianna is 33, became tech lead six months ago. She assigns Andre the legacy work because he\'s the best at it and deadlines are tight. She doesn\'t see it as punishment — she sees it as leveraging strengths. She hasn\'t considered that "leveraging strengths" means Andre never grows.',
      emotionalState: 'Pragmatic and oblivious to the harm',
      communicationPattern: 'frames decisions in team optimization language, avoids personal impact',
    },
    trigger: 'Brianna assigned Andre another billing migration at sprint planning. Andre had specifically asked to work on the new API project. She gave the API project to a junior engineer instead.',
    plantedPatterns: [
      'SCARF: Autonomy threat — Andre has no control over his own work; Status threat — he is positioned as the maintenance person while peers advance',
      'Jehn\'s: Task conflict (who should work on what) driven by an unexamined process conflict (how work gets assigned and who has input)',
      'NVC violation: Brianna presents her decision as neutral ("leveraging strengths") when it serves her needs (predictable delivery) at the expense of Andre\'s needs (growth, autonomy)',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Brianna, I specifically asked for the API project. In writing. Last Wednesday. And you gave it to Nate, who has been here four months.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I know, and I thought about it. But the billing migration is critical and you\'re the only one who can do it reliably. Nate needs growth opportunities and the API project has lower risk.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Nate needs growth opportunities. What about my growth opportunities? I\'ve been here five years. I haven\'t touched a new feature in a year and a half because every sprint you put me back in the basement.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'The billing system is mission-critical. You\'re the expert. I\'m not putting you in the basement — I\'m putting you where you have the most impact.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'You\'re putting me where it\'s convenient for the sprint. There\'s a difference. You know what my "impact" gets me? The same performance rating as Nate, who builds shiny things while I keep the lights on. My resume hasn\'t changed in two years.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I hear you. But I can\'t risk the billing migration failing. Can we revisit this next quarter when things calm down?',
        turnNumber: 6,
      },
    ],
    tags: ['task-dumping', 'expertise-trap', 'career-stagnation', 'fairness', 'legacy-systems', 'growth'],
  },

  // =========================================================================
  // SUB-TYPE 4: COMMUNICATION STYLE CLASH
  // =========================================================================

  {
    id: 'prof-peer-010',
    category: 'professional_peer',
    title: 'Direct vs. Indirect Communicators',
    description: 'A blunt, direct communicator and a diplomatic, indirect communicator clash over feedback styles. One thinks the other is rude; the other thinks they\'re evasive. Both think they\'re the reasonable one.',
    personA: {
      name: 'Katya',
      role: 'staff_engineer',
      backstory: 'Katya is 37, grew up in Russia, moved to the US at 22. She is technically brilliant and gives feedback the way she received it — direct, specific, and unvarnished. She has been told she\'s "too harsh" in three different performance reviews but doesn\'t understand what that means, because in her view, clarity is kindness.',
      emotionalState: 'Frustrated by what she sees as professional cowardice',
      communicationPattern: 'direct to the point of bluntness, interprets hedging as dishonesty',
    },
    personB: {
      name: 'Liam',
      role: 'senior_engineer',
      backstory: 'Liam is 34, Midwest upbringing, conflict-averse by nature. He gives feedback through suggestion ("Have you considered...?") and reads Katya\'s directness as personal attacks. After her last code review tore his PR apart, he dreads collaborating with her.',
      emotionalState: 'Demoralized and avoidant',
      communicationPattern: 'softens everything, uses qualifiers ("maybe," "just," "I could be wrong"), withdraws when things get direct',
    },
    trigger: 'Katya left a code review with 23 comments including "This function is wrong. Delete it and start over." Liam raised it in their 1-on-1.',
    plantedPatterns: [
      'SCARF: Status threat — Liam feels publicly diminished by Katya\'s code reviews; Relatedness threat — both feel the other doesn\'t understand them or want to work with them',
      'Psychological Safety: Liam\'s willingness to submit code and take creative risks is being eroded by the feedback style; Katya\'s feedback, while technically accurate, destroys psychological safety',
      'CBT: Labeling — Katya labels Liam as "can\'t take feedback"; Liam labels Katya as "cruel" — both are reducing a person to a single trait',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'I want to talk about the code review on the auth service PR. Twenty-three comments. One of them was "Delete it and start over." I put two weeks into that.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'The auth handler had a race condition. The token refresh logic was wrong. I told you exactly what was wrong and where. What would you prefer — that I say nothing and let it go to production broken?',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'I\'d prefer you say it like a human being. "Delete it and start over" isn\'t feedback. It\'s a verdict. You could have said "This approach has issues — want to pair on it?"',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'I don\'t have time to cushion every sentence. If the function is wrong, it\'s wrong. I would want someone to tell me that directly instead of wrapping it in five layers of "maybe consider." That wastes everyone\'s time.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'It\'s not "cushioning." It\'s basic respect. After your reviews, I don\'t want to write code anymore. I sit there for an hour before opening the PR just bracing myself. Is that the collaboration you want?',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'If you\'re spending an hour bracing yourself for technical feedback, that\'s a resilience issue, not a communication issue. I\'m not going to pretend bad code is okay to protect your feelings.',
        turnNumber: 6,
      },
    ],
    tags: ['communication-style', 'code-review', 'directness', 'cultural', 'feedback', 'psychological-safety'],
  },

  {
    id: 'prof-peer-011',
    category: 'professional_peer',
    title: 'Slack vs. Meeting Culture',
    description: 'Two peers with opposing work styles clash: one believes everything should be async in Slack, the other believes important decisions require face-to-face meetings. The conflict escalates when a critical decision is made in a channel the other wasn\'t watching.',
    personA: {
      name: 'Tanya',
      role: 'engineering_manager',
      backstory: 'Tanya is 40, manages a distributed team across three time zones. She built an async-first culture deliberately — decisions in threads, RFCs in Notion, no meetings without agendas. She believes meetings are where productivity goes to die.',
      emotionalState: 'Righteous about her system being undermined',
      communicationPattern: 'references process documentation constantly, treats async as objectively superior',
    },
    personB: {
      name: 'Victor',
      role: 'engineering_manager',
      backstory: 'Victor is 45, manages the platform team. He believes important decisions get lost in Slack — nuance dies in text, context collapses, and people agree to things they don\'t understand. He wants a 30-minute sync for anything consequential.',
      emotionalState: 'Excluded and resentful',
      communicationPattern: 'emotionally expressive, values verbal tone and body language, dismisses text as shallow',
    },
    trigger: 'Tanya\'s team made a database architecture decision in a Slack thread at 11 PM. Victor\'s team discovered the decision the next morning when it was already being implemented — a decision that directly affects their platform layer.',
    plantedPatterns: [
      'SCARF: Autonomy threat — Victor had no input on a decision that affects his team; Certainty threat — both feel the other\'s preferred communication mode creates unpredictability',
      'Jehn\'s: Process conflict (how decisions should be made) is the explicit issue, but relationship conflict (I don\'t trust your judgment) is simmering underneath',
      'NVC violation: both express their needs as demands for a specific communication strategy rather than articulating the underlying need (inclusion, efficiency, respect for time zones)',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Your team made a database sharding decision in a Slack thread at 11 PM. My team found out this morning when the migration was already running. How is that acceptable?',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'It was posted in the #architecture channel. Your team has access. The RFC was linked. We tagged the platform-team handle. The thread was open for 48 hours before that.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'A Slack tag at 11 PM is not consultation. My team doesn\'t live in Slack. Some of us believe decisions this consequential deserve a meeting — thirty minutes, all stakeholders, real conversation.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'We have team members in London, Sao Paulo, and Singapore. There is no "thirty minutes" where all stakeholders can meet. Async is not a preference — it\'s a necessity. You can\'t expect the world to pause for your calendar.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'And you can\'t make architectural decisions that affect four teams in a thread nobody reads after midnight. Half my engineers don\'t even have Slack notifications on. This isn\'t async culture — it\'s exclusion with documentation.',
        turnNumber: 5,
      },
    ],
    tags: ['async-vs-sync', 'communication-culture', 'decision-making', 'process', 'distributed-teams', 'exclusion'],
  },

  {
    id: 'prof-peer-012',
    category: 'professional_peer',
    title: 'Neurodivergent Needs Collision',
    description: 'A neurodivergent team member who needs written agendas, predictable schedules, and low-stimulation environments clashes with a peer who thrives on spontaneity, verbal brainstorming, and high-energy collaboration. Neither is wrong — but neither is accommodating the other.',
    personA: {
      name: 'Riley',
      role: 'senior_designer',
      backstory: 'Riley is 31, autistic, diagnosed at 25. They need written agendas 24 hours in advance, quiet workspaces, and clear communication. They\'ve disclosed their needs to the team but it gets "forgotten" regularly. Impromptu brainstorms are disorienting and they shut down when overstimulated.',
      emotionalState: 'Overwhelmed and unaccommodated',
      communicationPattern: 'precise and literal, becomes monosyllabic when overstimulated',
    },
    personB: {
      name: 'Harper',
      role: 'senior_designer',
      backstory: 'Harper is 29, ADHD, thrives on spontaneous energy. She generates her best ideas in unstructured verbal brainstorms. She doesn\'t mean to exclude Riley — she just forgets about the accommodation needs because her own brain works differently. She sees structure as creativity-killing.',
      emotionalState: 'Defensive and guilty',
      communicationPattern: 'rapid-fire, tangential, interrupts not from malice but from impulsivity',
    },
    trigger: 'Harper pulled Riley into a surprise brainstorm with no agenda. Riley shut down and left the room. Harper told their manager Riley was "being difficult."',
    plantedPatterns: [
      'Psychological Safety: Riley\'s documented accommodations are being ignored — this is a systemic psych safety failure, not an interpersonal preference conflict',
      'SCARF: Autonomy threat — Riley had no control over the meeting; Relatedness threat — both feel the other doesn\'t want to work with them; Status threat — Riley was called "difficult" for a disability accommodation',
      'CBT: Labeling — Harper labeled Riley as "difficult" instead of recognizing an unmet accommodation; Riley may catastrophize that no workplace will ever work for them',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Harper, I need to address what happened yesterday. You pulled me into a meeting with no agenda. I asked for written agendas when I started. I\'ve asked three times since. And then you told Sarah I was being difficult.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I didn\'t call you difficult. I said the situation was difficult. I had an idea and I wanted to riff on it while it was fresh. I can\'t always plan spontaneity twenty-four hours in advance.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You don\'t need to plan spontaneity. You need to not pull me into it without warning. Brainstorm with whoever you want. Just give me the write-up after so I can contribute on my terms.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'But half the value is being in the room. The energy, the riffing, the building on each other\'s ideas. If you only read a summary, you miss all of that. I\'m trying to include you.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'That room is not inclusion for me. It\'s overstimulation. I left because I couldn\'t process anything anyone was saying. And then I had to spend the rest of the day recovering instead of working. That\'s what "surprise brainstorms" cost me.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I... didn\'t realize it was that bad. I thought you just preferred quiet. I didn\'t know it was a shutdown.',
        turnNumber: 6,
      },
    ],
    tags: ['neurodivergent', 'accommodations', 'communication-style', 'inclusion', 'overstimulation', 'labeling'],
  },

  // =========================================================================
  // SUB-TYPE 5: REMOTE VS IN-OFFICE FRICTION
  // =========================================================================

  {
    id: 'prof-peer-013',
    category: 'professional_peer',
    title: 'Proximity Bias',
    description: 'A remote engineer discovers that promotions, interesting projects, and face-time with leadership all go to in-office peers. She confronts an in-office peer who was promoted over her despite producing less output.',
    personA: {
      name: 'Sasha',
      role: 'remote_senior_engineer',
      backstory: 'Sasha is 35, fully remote since 2021, lives in Montana. She consistently ships more features, has better code review scores, and mentors two junior engineers. She applied for the staff engineer promotion and was rejected. Her in-office peer with lower output got it.',
      emotionalState: 'Betrayed and questioning her career choices',
      communicationPattern: 'data-driven, builds irrefutable cases, tone goes cold when emotional',
    },
    personB: {
      name: 'Ethan',
      role: 'in_office_staff_engineer',
      backstory: 'Ethan is 33, works from the SF office three days a week. He got the staff engineer promotion. He\'s a good engineer but knows deep down that his visibility — lunch with the CTO, hallway conversations, spontaneous whiteboard sessions — played a role. He doesn\'t want to admit this.',
      emotionalState: 'Uncomfortable and defensive',
      communicationPattern: 'downplays advantages, attributes success to merit only',
    },
    trigger: 'Sasha saw the promotion announcement on Slack. She messaged Ethan privately.',
    plantedPatterns: [
      'SCARF: Status threat — Sasha\'s professional status was diminished by a promotion she deserved on paper; Fairness threat — the promotion criteria invisibly favored physical presence',
      'CBT: Discounting the positive — Ethan discounts his proximity advantage ("I just work hard"); Sasha may mind-read that Ethan intentionally leveraged face-time against her',
      'Jehn\'s: Task conflict (who is more qualified) entangled with process conflict (the promotion criteria are biased) — and the relationship is collateral damage',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Congratulations on staff. I mean that. But I\'m going to be honest with you because I think you deserve honesty. I had thirty percent more shipped features, two mentees, and a higher review score. What did the promotion committee see in you that they didn\'t see in me?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I appreciate you being direct. I think it came down to cross-team influence and leadership visibility. The committee values presence in architectural discussions, stakeholder relationships —',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: '"Leadership visibility." You mean being in the building. I do the same architectural discussions on Zoom. I just don\'t get to do them over lunch with the CTO.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I don\'t think it\'s that simple. I put effort into those relationships. You could come to the office more — there\'s a remote-to-hybrid option.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I live in Montana, Ethan. I have a mortgage and a family. "Just come in more" means uprooting my life for a system that should evaluate output, not proximity. You didn\'t outperform me. You out-appeared me. And the system rewarded it.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I\'m not going to apologize for being in the office. I made a choice too. Both choices have trade-offs.',
        turnNumber: 6,
      },
    ],
    tags: ['proximity-bias', 'remote-work', 'promotion', 'fairness', 'visibility', 'systemic-inequality'],
  },

  {
    id: 'prof-peer-014',
    category: 'professional_peer',
    title: 'Missing the Hallway Decision',
    description: 'A remote team member discovers that a critical product decision was made during an informal in-office conversation she wasn\'t part of. No one told her. She finds out when the Jira board changes overnight.',
    personA: {
      name: 'Lin',
      role: 'remote_product_manager',
      backstory: 'Lin is 38, fully remote, a working mother of twins. She is meticulous about documentation and process because she knows remote workers get cut out of informal decisions. She has built the entire product spec for the Q2 roadmap. She woke up to find half of it changed.',
      emotionalState: 'Furious and humiliated',
      communicationPattern: 'sharp and surgical when angry, documents everything, weaponizes receipts',
    },
    personB: {
      name: 'Marco',
      role: 'in_office_product_manager',
      backstory: 'Marco is 36, works from the office. He had a spontaneous hallway conversation with the VP of Engineering that led to reprioritizing the roadmap. He meant to tell Lin but got pulled into other things. He sees hallway conversations as normal work, not exclusion.',
      emotionalState: 'Sheepish, then defensive',
      communicationPattern: 'casual and disarming, treats formality as unnecessary friction',
    },
    trigger: 'Lin opened Jira Monday morning and found six stories reprioritized, two epics moved, and a new initiative she\'d never heard of at the top of the backlog.',
    plantedPatterns: [
      'SCARF: Autonomy threat — Lin\'s carefully built roadmap was altered without her input; Status threat — decisions about her product were made without her; Certainty threat — the ground shifted without warning',
      'Psychological Safety: Lin raising this issue risks being seen as "high-maintenance" or "controlling" — but NOT raising it means accepting erasure; this is a classic psych safety trap for remote workers',
      'NVC violation: Lin\'s unmet needs are respect, inclusion, and predictability — but she expresses them as blame ("You went behind my back"); Marco\'s unmet need is for flexible, low-friction collaboration',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Marco. Six stories reprioritized. Two epics moved. A brand-new initiative I\'ve never seen. I built that roadmap. You changed it without telling me. What happened?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Yeah, I should have looped you in sooner. I ran into Dave in the hallway Friday and he had some thoughts about the Q2 priorities. It kind of snowballed from there. I was going to message you today.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: '"Ran into Dave in the hallway." A hallway conversation just overwrote three weeks of my work. Do you understand how that looks from where I\'m sitting?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'It wasn\'t about overwriting your work. Dave had context about a client escalation that changes the priorities. Things move fast. I can\'t schedule a meeting every time someone shares new information.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'You don\'t need a meeting. You need a Slack message. "Hey Lin, heads up, Dave wants to shift some priorities. Let\'s discuss." Fifteen seconds. Instead, I found out by opening Jira like it was a crime scene.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I hear you. I dropped the ball on communication. But the priorities did need to change. Can we focus on the path forward instead of relitigating Friday?',
        turnNumber: 6,
      },
    ],
    tags: ['hallway-decisions', 'remote-exclusion', 'process', 'inclusion', 'roadmap', 'informal-power'],
  },

  {
    id: 'prof-peer-015',
    category: 'professional_peer',
    title: 'Camera-On Policy Battle',
    description: 'Two peers clash over whether cameras should be required during meetings. One sees cameras-on as basic professionalism and team connection. The other sees it as performative surveillance that disproportionately burdens certain groups.',
    personA: {
      name: 'Dara',
      role: 'team_lead',
      backstory: 'Dara is 42, leads a hybrid team. She instituted a "cameras on during team meetings" policy because she noticed engagement dropping — people multitasking, not responding when called on, entire meetings where nobody looked at each other. She sees cameras as a proxy for presence.',
      emotionalState: 'Exasperated by what she sees as laziness disguised as principle',
      communicationPattern: 'frames her preferences as team health metrics, uses collective language',
    },
    personB: {
      name: 'Nia',
      role: 'senior_engineer',
      backstory: 'Nia is 30, a Black woman who is exhausted by the performance of being "on" for video all day. She has a chronic illness that causes visible fatigue, shares a small apartment with her partner who works from home, and finds camera-on policies disproportionately punishing for people who don\'t have picture-perfect home offices or "professional" appearances.',
      emotionalState: 'Drained and resentful of being policed',
      communicationPattern: 'measured and articulate, but underneath is a deep weariness from having this fight everywhere she works',
    },
    trigger: 'Dara sent a team-wide message: "Reminder: cameras on during team syncs is our team standard. If you\'re having tech issues, let me know. Otherwise, I expect to see your faces." Nia replied privately.',
    plantedPatterns: [
      'SCARF: Autonomy threat — Nia\'s control over her own appearance and environment is being mandated; Relatedness threat — Dara interprets cameras-off as rejection of the team; Fairness threat — the policy has asymmetric impact on different bodies and living situations',
      'Psychological Safety: Nia pushing back on the policy is an interpersonal risk — she could be seen as insubordinate or not a "team player"; the cameras-on policy paradoxically REDUCES psych safety for those it burdens most',
      'TKI: Dara is competing (enforcing the policy); Nia is attempting collaboration (proposing alternatives) but may shift to competing if unheard',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Dara, I want to push back on the cameras-on policy. Respectfully. I don\'t think it means what you think it means.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'I appreciate you raising it directly. But I\'ve seen the difference. When cameras are off, people zone out. Engagement drops. I can feel it. The team needs to see each other.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'Some of the team needs to see each other. Some of the team needs to not perform "being seen" for eight hours a day. I have a chronic condition. Some days I look sick because I am sick. The camera means I have to either disclose that or perform wellness I don\'t have.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'I didn\'t know about the health issue and I\'m sorry. Of course there are exceptions for medical reasons. But as a general policy, I think cameras-on is reasonable. Most companies require it.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: '"Exceptions for medical reasons." So I need a doctor\'s note to turn off my camera while my peer in his home office with the ring light and the bookshelf just turns it on and gets credit for being engaged. Do you see how the bar is different depending on what you look like and where you live?',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'I think you\'re making this bigger than it is. The policy applies to everyone equally. Thirty minutes a day with cameras on during the team sync is not surveillance.',
        turnNumber: 6,
      },
    ],
    tags: ['camera-policy', 'remote-work', 'surveillance', 'equity', 'disability', 'appearance-tax'],
  },
]
