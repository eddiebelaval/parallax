import type { Scenario } from '../types'

// ---------------------------------------------------------------------------
// PROFESSIONAL HIERARCHICAL SCENARIOS — 15 fully authored scenarios across 5 sub-types
//
// Sub-type breakdown (3 each):
//   1. Performance Review Disagreements   (prof-hier-001 through prof-hier-003)
//   2. Promotion Bypasses                 (prof-hier-004 through prof-hier-006)
//   3. Micromanagement                    (prof-hier-007 through prof-hier-009)
//   4. Whistleblowing / Ethics            (prof-hier-010 through prof-hier-012)
//   5. Mentorship Boundary Violations     (prof-hier-013 through prof-hier-015)
//
// Active lenses for this mode:
//   NVC, CBT, TKI, SCARF, Organizational Justice, Psychological Safety, Power
//
// Power asymmetry is the defining characteristic. Every scenario features a
// clear power differential — boss over employee, mentor over mentee, institution
// over individual. The dialogue is full of corporate-speak, veiled threats, tone
// policing, strategic ambiguity, and plausible deniability. People in hierarchical
// conflicts don't say what they mean — they encode it in performance language,
// "development opportunities," and "alignment conversations."
// ---------------------------------------------------------------------------

export const PROFESSIONAL_HIERARCHICAL_SCENARIOS: Scenario[] = [

  // =========================================================================
  // SUB-TYPE 1: PERFORMANCE REVIEW DISAGREEMENTS
  // =========================================================================

  {
    id: 'prof-hier-001',
    category: 'professional_hierarchical',
    title: 'The Unfair Rating',
    description: 'A senior software engineer receives a "meets expectations" rating despite leading the team\'s highest-impact project. Her manager can\'t articulate why she didn\'t get "exceeds" and retreats into vague language about "executive presence."',
    personA: {
      name: 'Nadia',
      role: 'senior_software_engineer',
      backstory: 'Nadia is 34, 6 years at the company. She led the migration to a new platform that saved $2.1M annually. She was told informally she\'d get top marks. Her manager changed the rating after calibration and never explained why.',
      emotionalState: 'Blindsided and quietly furious',
      communicationPattern: 'builds an evidence-based case — receipts ready, data-driven',
    },
    personB: {
      name: 'Greg',
      role: 'engineering_manager',
      backstory: 'Greg is 41, has managed Nadia\'s team for 18 months. He privately agrees she deserved "exceeds" but got overruled in calibration by a VP who doesn\'t know Nadia. He can\'t say this, so he hides behind vague feedback.',
      emotionalState: 'Uncomfortable and evasive',
      communicationPattern: 'retreats to corporate abstractions — "growth areas," "perception," "visibility"',
    },
    trigger: 'Nadia opened her review document and saw "Meets Expectations" with a comment about needing to "develop executive presence."',
    plantedPatterns: [
      'SCARF: Status threat — Nadia\'s competence is being denied; Fairness threat — the process feels rigged',
      'Org Justice: Procedural injustice — calibration happened without transparency; Interactional injustice — Greg can\'t give her a real explanation',
      'Power: institutional power laundering — Greg uses "the calibration process" to diffuse accountability for his own inaction',
      'CBT: mind-reading — Greg assumes Nadia needs "presence" based on a VP\'s vague impression, not evidence',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Greg, I need to understand this rating. I led the platform migration. Two point one million in annual savings. You told me in October I was tracking for exceeds. What changed?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'And that work was excellent, Nadia. Really excellent. But the rating reflects the full picture — technical delivery is one dimension. There are areas around executive presence and cross-functional influence where there\'s room to grow.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'What does "executive presence" mean? Specifically. Because I presented to the CTO twice, I ran the architecture review, and I mentored two junior engineers. If that\'s not cross-functional influence, I need you to tell me what is.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'It\'s less about the what and more about the how. The feedback from calibration was that your impact isn\'t always visible to the right people. It\'s a perception thing.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Whose perception? Who in that room decided my work wasn\'t visible enough? Because I\'d like to know who I need to perform for, since apparently doing the work isn\'t enough.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I can\'t get into the specifics of calibration — that\'s a confidential process. But I want to partner with you on a development plan to close this gap. I think with the right visibility strategy, you\'re well-positioned for next cycle.',
        turnNumber: 6,
      },
    ],
    tags: ['performance-review', 'executive-presence', 'calibration', 'gender-coded-feedback', 'visibility', 'institutional-opacity'],
  },

  {
    id: 'prof-hier-002',
    category: 'professional_hierarchical',
    title: 'Feedback Without Examples',
    description: 'A marketing coordinator receives negative feedback about his "attitude" during a review but his manager cannot provide a single concrete example. The conversation spirals as the employee pushes for specifics.',
    personA: {
      name: 'Dante',
      role: 'marketing_coordinator',
      backstory: 'Dante is 26, 2 years at the company. He\'s direct and opinionated in meetings — a trait his previous manager praised as "proactive." His new manager reads the same behavior as "challenging authority."',
      emotionalState: 'Defensive and confused',
      communicationPattern: 'asks pointed questions — won\'t accept vague answers',
    },
    personB: {
      name: 'Patricia',
      role: 'marketing_director',
      backstory: 'Patricia is 48, took over the team 6 months ago. She prefers consensus-driven, deferential team dynamics. Dante\'s directness makes her uncomfortable, but she frames it as his problem, not a style mismatch.',
      emotionalState: 'Irritated that her authority is being questioned',
      communicationPattern: 'tone polices — focuses on how things were said, never what was said',
    },
    trigger: 'In Dante\'s mid-year review, Patricia wrote that he needs to "work on his attitude and approach to authority."',
    plantedPatterns: [
      'NVC violation: Patricia evaluates character ("attitude problem") instead of observing behavior — classic moralistic judgment',
      'Psych Safety: Dante is being punished for speaking up, signaling the team that dissent is unsafe',
      'Power: tone policing — Patricia leverages her positional authority to redefine directness as insubordination',
      'TKI: Patricia is competing (assertive, uncooperative) while framing it as collaborative feedback',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Patricia, I want to understand the feedback about my attitude. Can you give me a specific example of when my approach was a problem?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'It\'s not one specific instance, Dante. It\'s a pattern. There\'s a general sense that you push back in meetings in ways that can feel combative. It\'s about the energy you bring.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'The energy I bring? I need something I can actually work on. When did I push back in a way that was combative? Which meeting? What did I say?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'See, this is exactly what I\'m talking about. I\'m giving you feedback and your first instinct is to challenge it. A growth-oriented response would be to sit with it and reflect.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I\'m not challenging it — I\'m asking you to help me understand it. If I don\'t know what I did wrong, how can I change? My last manager said my directness was one of my strengths.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Different teams have different norms. What worked there may not work here. I need you to be coachable, Dante. That\'s the bottom line.',
        turnNumber: 6,
      },
    ],
    tags: ['vague-feedback', 'tone-policing', 'attitude', 'style-mismatch', 'coachability', 'authority'],
  },

  {
    id: 'prof-hier-003',
    category: 'professional_hierarchical',
    title: 'The Self-Assessment Gap',
    description: 'An account manager rated herself "exceeds expectations" in every category. Her manager rated her "meets" across the board. The gap reveals fundamentally different definitions of success.',
    personA: {
      name: 'Janelle',
      role: 'account_manager',
      backstory: 'Janelle is 31, 4 years at the company. She has 100% client retention, the highest in her pod. She works 55-hour weeks. She rated herself "exceeds" because by every metric she can see, she\'s outperforming. She doesn\'t know the goalposts moved.',
      emotionalState: 'Humiliated and exhausted',
      communicationPattern: 'cites data compulsively — believes numbers should speak for themselves',
    },
    personB: {
      name: 'Victor',
      role: 'vp_of_client_services',
      backstory: 'Victor is 45, runs the client services division. He values "strategic thinking" and "executive storytelling" — skills he never communicated as promotion criteria. He sees Janelle as excellent at execution but not leadership material.',
      emotionalState: 'Mildly annoyed at having to justify himself',
      communicationPattern: 'speaks in frameworks — "at the next level," "strategic lens," "big picture thinking"',
    },
    trigger: 'Victor and Janelle\'s self-assessment scores diverge by two full levels. They sit down to "align."',
    plantedPatterns: [
      'Org Justice: Distributive injustice — the criteria for success were never transparently shared; Procedural injustice — goalposts moved without notice',
      'SCARF: Status threat (her self-image as a top performer is being dismantled), Certainty threat (she doesn\'t know the rules anymore), Fairness threat (she followed the rules she was given)',
      'CBT: labeling — Victor has labeled Janelle as "not strategic" based on a fixed mental model, filtering out contradictory evidence',
      'Power: definitional power — Victor controls what "exceeds" means and can change it retroactively',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_b',
        content: 'So Janelle, I want to talk through the self-assessment gap. You rated yourself exceeds across the board, and I want to help you calibrate expectations for your level.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'I have a hundred percent client retention, Victor. Highest in the pod. My NPS is 92. I brought in three upsells this quarter alone. By every metric I was given, I exceeded.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'Those are strong execution numbers, and I don\'t want to diminish that. But "exceeds" at your level isn\'t just about the what — it\'s about showing strategic thinking. Are you driving the account strategy, or are you responding to client requests?',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'Nobody told me "account strategy" was the criteria. My job description says client retention, satisfaction, and revenue growth. I hit all three. When did the bar change?',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'It\'s not that the bar changed. It\'s that exceeds expectations means exceeding what\'s expected at your level — and at your level, we expect you to start thinking like a leader, not just an executor.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: '... So I hit every number, worked fifty-five hours a week, and it\'s still "meets" because I didn\'t read your mind about criteria that were never written down.',
        turnNumber: 6,
      },
    ],
    tags: ['self-assessment', 'moving-goalposts', 'strategic-thinking', 'criteria-opacity', 'execution-vs-leadership', 'exhaustion'],
  },

  // =========================================================================
  // SUB-TYPE 2: PROMOTION BYPASSES
  // =========================================================================

  {
    id: 'prof-hier-004',
    category: 'professional_hierarchical',
    title: 'Passed Over for the New Hire',
    description: 'A team lead with 5 years of tenure watches an external hire with 2 years of experience get promoted to the role he was promised. His manager frames it as "a different kind of experience."',
    personA: {
      name: 'Ray',
      role: 'team_lead',
      backstory: 'Ray is 36, been a team lead for 3 years after joining as an individual contributor. He was explicitly told by his previous director, now gone, that the senior manager role was "his when it opened." He trained the person who got it.',
      emotionalState: 'Betrayed and humiliated in front of his team',
      communicationPattern: 'controlled anger — speaks quietly when furious, which reads as calm but is actually dangerous',
    },
    personB: {
      name: 'Christine',
      role: 'senior_director',
      backstory: 'Christine is 43, hired 8 months ago. She brought in Marcus, the external hire, from her previous company. She genuinely believes Marcus is the better fit but can\'t articulate why without revealing she simply trusts people she already knows.',
      emotionalState: 'Defensive behind a shield of corporate logic',
      communicationPattern: 'redirects to process — "the hiring committee decided," "it was a competitive process"',
    },
    trigger: 'The promotion announcement went out company-wide. Ray found out from a Slack notification, not his manager.',
    plantedPatterns: [
      'Org Justice: Distributive injustice (outcome feels undeserved), Procedural injustice (Ray wasn\'t informed before the announcement), Interactional injustice (he found out from Slack)',
      'SCARF: Status devastation (publicly passed over), Relatedness threat (his relationship with leadership is broken), Fairness violation (the promise was broken)',
      'Power: cronyism masked as meritocracy — Christine hired from her network and framed it as "the best candidate"',
      'TKI: Ray is moving from accommodating (years of patience) to competing (demanding accountability)',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I found out from a Slack announcement, Christine. A company-wide Slack announcement. You didn\'t think I deserved a conversation first?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'You\'re right, the communication should have happened differently. I take responsibility for that. The timeline got compressed and I should have looped you in before it went out.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Looped me in? I was told that role was mine. By your predecessor. I\'ve been building toward it for three years. And you gave it to someone who\'s been here eight months — someone you brought from your last company.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I understand the frustration. But the hiring committee looked at all the candidates, and Marcus brought a different kind of experience — specifically around scaling operations, which is what we need right now. It wasn\'t about loyalty or tenure.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'A different kind of experience. I built the operations you\'re trying to scale, Christine. I trained Marcus on our systems his first month. Now he\'s my boss? And you want me to call that a fair process?',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I want us to have a constructive conversation about your path forward. There will be other opportunities, and I want to make sure you\'re positioned for the next one.',
        turnNumber: 6,
      },
    ],
    tags: ['promotion', 'bypassed', 'cronyism', 'broken-promise', 'tenure', 'external-hire'],
  },

  {
    id: 'prof-hier-005',
    category: 'professional_hierarchical',
    title: 'The Diversity Hire Perception',
    description: 'A Black woman gets promoted to director. A peer who was also up for the role implies to their shared manager that it was a diversity decision, not a merit one. The manager brings it to her "to address the team dynamic."',
    personA: {
      name: 'Keisha',
      role: 'newly_promoted_director',
      backstory: 'Keisha is 38, has 12 years in the industry, an MBA, and led three product launches. She was promoted on merit and the implication that she wasn\'t is a wound she\'s carried her entire career. She\'s exhausted by having to prove she belongs.',
      emotionalState: 'Enraged but forced to perform composure',
      communicationPattern: 'strategic precision — every word is measured because she knows anger will be used against her',
    },
    personB: {
      name: 'Howard',
      role: 'vp_of_product',
      backstory: 'Howard is 52, considers himself an ally. He brought the peer\'s comment to Keisha thinking transparency was the right move. He doesn\'t realize he\'s making her responsible for managing someone else\'s racism.',
      emotionalState: 'Uncomfortable and trying to seem supportive',
      communicationPattern: 'hedging — uses phrases like "I don\'t agree with it, but..." and "I thought you should know"',
    },
    trigger: 'Howard called Keisha into his office to tell her that Derek, the other candidate, told three people the promotion was "a DEI thing."',
    plantedPatterns: [
      'Power: racial power dynamics compound hierarchical ones — Keisha must manage both her new authority and the undermining of her legitimacy',
      'Psych Safety: Howard is outsourcing emotional labor to Keisha — she\'s being asked to solve a problem she didn\'t create while maintaining her own safety',
      'SCARF: Status threat (her competence is being questioned), Relatedness threat (her team may see her as illegitimate), Fairness violation (she has to defend a promotion she earned)',
      'NVC violation: Howard presents the situation as neutral information sharing, masking that he\'s actually dumping a burden on her without a plan',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Keisha, I wanted to bring something to you directly because I believe in transparency. Derek has been making comments to some team members suggesting your promotion was... influenced by diversity considerations. I don\'t agree with it, but I thought you should know.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'So you\'re telling me that a peer is openly undermining my credibility with my team, and your response is to tell me about it. What are you doing about it, Howard?',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'That\'s what I wanted to discuss. I think it might be helpful if you and Derek had a direct conversation to clear the air. Sometimes these things resolve themselves when people talk it out.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'You want me — the person whose competence is being questioned — to go explain to the person questioning it why I deserve my own promotion? Do you hear what you\'re asking me to do?',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'I hear you, and I want to support you in whatever approach makes sense. I just thought transparency was better than letting it fester. What would you like me to do?',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'What would I like you to do? Your job. Derek is making discriminatory comments in a professional setting. That\'s not a "team dynamic" issue — that\'s an HR issue. And the fact that I have to tell you that is part of the problem.',
        turnNumber: 6,
      },
    ],
    tags: ['diversity', 'racism', 'promotion', 'ally-failure', 'emotional-labor', 'legitimacy', 'DEI'],
  },

  {
    id: 'prof-hier-006',
    category: 'professional_hierarchical',
    title: 'Loyalty Not Rewarded',
    description: 'An operations manager who stayed through two rounds of layoffs, covered for departing colleagues, and postponed parental leave is told she\'s "not ready" for the director role. She\'s been ready for two years.',
    personA: {
      name: 'Angela',
      role: 'operations_manager',
      backstory: 'Angela is 39, 8 years at the company. She survived two restructurings, absorbed two other managers\' responsibilities without a title change, and delayed having her second child to "see the team through." She has been told "next cycle" three times.',
      emotionalState: 'Depleted and done pretending',
      communicationPattern: 'has shifted from hopeful to transactional — no longer dresses up requests in enthusiasm',
    },
    personB: {
      name: 'Martin',
      role: 'chief_operating_officer',
      backstory: 'Martin is 50, genuinely appreciates Angela but has grown comfortable with her overperforming at below-market compensation. Promoting her would mean finding someone else to do the invisible work she does. He doesn\'t consciously think this, but his incentives are misaligned.',
      emotionalState: 'Confident he can manage her expectations again',
      communicationPattern: 'paternalistic warmth — "I see you," "Your time is coming," "Trust the process"',
    },
    trigger: 'The director role opened for the fourth time. Martin promoted someone from outside the company. Angela requested a meeting.',
    plantedPatterns: [
      'Org Justice: All three types violated — distributive (reward doesn\'t match contribution), procedural (the process keeps bypassing her), interactional (Martin\'s warmth is a manipulation tool)',
      'SCARF: Every domain threatened — Status (still a manager), Certainty (no clear timeline), Autonomy (her career path is controlled by someone else), Relatedness (she feels used, not valued), Fairness (loyalty punished)',
      'Power: exploitation through appreciation — Martin uses emotional validation as a substitute for structural advancement',
      'CBT: sunk cost fallacy — Angela has stayed too long based on promises, and Martin knows it',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'This is the fourth time, Martin. The fourth time that role opened, and the fourth time I didn\'t get it. I need to understand what\'s actually happening.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Angela, I know this is frustrating, and I want you to know how much I value what you do. You are the backbone of this operation. The new hire brings a specific skillset around digital transformation that we need right now.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You said that last time. Different words, same result. I stayed through two rounds of layoffs. I did three people\'s jobs for nine months. I pushed back my maternity leave by a quarter. At what point does loyalty actually count for something?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'It does count. It absolutely counts. And I hear what you\'re saying. I think we should put together a formal development plan — map out exactly what the path to director looks like for you so there\'s no ambiguity next time.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'We did that two years ago. I have the document. I completed every item on it. You signed off on it. And then you promoted someone else anyway. So what am I supposed to trust this time?',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: '... I hear you. Let me take some time to think about how we can make this right.',
        turnNumber: 6,
      },
    ],
    tags: ['loyalty', 'broken-promises', 'overwork', 'exploitation', 'development-plan', 'glass-ceiling'],
  },

  // =========================================================================
  // SUB-TYPE 3: MICROMANAGEMENT
  // =========================================================================

  {
    id: 'prof-hier-007',
    category: 'professional_hierarchical',
    title: 'Checking Every Task',
    description: 'A product designer discovers her manager has been reviewing and re-editing her work before it reaches stakeholders. She confronts him after finding tracked changes on a deck she already finalized.',
    personA: {
      name: 'Suki',
      role: 'senior_product_designer',
      backstory: 'Suki is 30, 4 years of experience, hired specifically for her expertise in design systems. She\'s been at this company for 14 months and has never missed a deadline or received negative stakeholder feedback. She discovered her manager has been silently editing her deliverables.',
      emotionalState: 'Insulted and questioning her own competence',
      communicationPattern: 'precise and direct — trained in design critique, uncomfortable with ambiguity',
    },
    personB: {
      name: 'Lawrence',
      role: 'design_manager',
      backstory: 'Lawrence is 44, promoted from IC to manager 2 years ago and never fully transitioned. He edits Suki\'s work not because it\'s wrong but because he can\'t let go. His previous direct report quit, citing micromanagement. He doesn\'t see the pattern.',
      emotionalState: 'Surprised and immediately defensive',
      communicationPattern: 'reframes control as support — "I\'m just helping," "I want to set you up for success"',
    },
    trigger: 'Suki opened the presentation she sent to Lawrence and found 23 tracked changes — mostly stylistic rewrites of her original language — made after she marked it as final.',
    plantedPatterns: [
      'SCARF: Autonomy crushed (her work is being altered without consent), Status diminished (she\'s being treated as junior), Certainty gone (she doesn\'t know which of her outputs actually reach stakeholders)',
      'Psych Safety: Lawrence\'s behavior signals that no deliverable is trusted until he touches it — the team will learn to stop trying',
      'Power: invisible gatekeeping — Lawrence controls the final version without ever telling Suki her version wasn\'t used',
      'TKI: Lawrence is avoiding direct conflict about quality by silently competing — editing rather than conversing',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Lawrence, I opened the stakeholder deck this morning and found twenty-three tracked changes. Changes you made after I finalized it. Can we talk about that?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Oh — yeah, I just did a quick pass. Nothing major. I wanted to make sure the messaging landed right with the executive audience. I should have mentioned it.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It wasn\'t a quick pass. You rewrote my section headers, changed the flow of two slides, and removed a data point I included deliberately. If there was a problem with my work, why didn\'t you tell me?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'It wasn\'t a problem. I just wanted to elevate it. I\'ve been presenting to this audience for years, so I know what lands. I\'m trying to set you up for success here.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Setting me up for success would be telling me what you need before I build it, not rewriting it behind my back. Is this happening with all of my deliverables? Because now I\'m wondering how much of my work has actually been seen as mine.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'That\'s... I think you\'re reading too much into this. I\'m your manager. Reviewing work is part of my job.',
        turnNumber: 6,
      },
    ],
    tags: ['micromanagement', 'trust', 'gatekeeping', 'autonomy', 'silent-editing', 'design'],
  },

  {
    id: 'prof-hier-008',
    category: 'professional_hierarchical',
    title: 'CC\'d on Everything',
    description: 'A project manager notices his director has started asking to be CC\'d on all client emails. When he asks why, she frames it as "staying aligned." He hears surveillance.',
    personA: {
      name: 'Tomás',
      role: 'project_manager',
      backstory: 'Tomás is 33, manages 4 client accounts autonomously. He\'s been doing this for 3 years with excellent client satisfaction scores. Three weeks ago, his director asked to be CC\'d on "all external communications." No explanation was given. No incident preceded it.',
      emotionalState: 'Paranoid and demoralized',
      communicationPattern: 'measured but wounded — asks careful questions while bracing for bad news',
    },
    personB: {
      name: 'Diane',
      role: 'director_of_client_operations',
      backstory: 'Diane is 47, a new director who inherited Tomás\'s team. She CC-monitors everyone — it\'s her management style, not specific to Tomás. She doesn\'t realize it signals distrust because she\'s never been on the receiving end.',
      emotionalState: 'Baffled that this is an issue',
      communicationPattern: 'normalizes her behavior — "Everyone does this," "It\'s standard practice"',
    },
    trigger: 'Tomás received a client compliment that Diane responded to before he could — because she was CC\'d. He realized she\'s reading his emails in real time.',
    plantedPatterns: [
      'SCARF: Autonomy under siege (every communication is monitored), Status erosion (clients now see his boss weighing in on routine matters), Certainty threat (he doesn\'t know if he\'s being managed out)',
      'Psych Safety: surveillance-level monitoring destroys psychological safety — Tomás will start self-censoring every email',
      'CBT: personalization — Tomás assumes the CC policy is about him specifically, while Diane applies it universally (but the impact is the same)',
      'Power: panoptic management — the knowledge that someone is always watching changes behavior even if they never intervene',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Diane, I wanted to ask about the CC policy. I noticed you responded to the Morrison account compliment before I saw it. Is there a concern about my client management I should know about?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'No concern at all, Tomás. I responded because I happened to see it and wanted to reinforce the relationship at the leadership level. The CC is just about staying aligned — it\'s how I manage across all my teams.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'I appreciate the alignment, but the clients are starting to see two of us responding. And honestly, it feels like you\'re checking my work. I\'ve managed these accounts for three years without any issues.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'This isn\'t about checking your work. It\'s about visibility. I need to be able to speak to any client relationship at any time. That\'s just the expectation at my level.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I can give you a weekly summary for that. What I\'m struggling with is the real-time monitoring. It changes the dynamic — with the clients and with me. I second-guess every email now.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I don\'t want you second-guessing anything. Let\'s keep the CC for now and revisit in a month. Think of it as a transition period while I get up to speed.',
        turnNumber: 6,
      },
    ],
    tags: ['micromanagement', 'surveillance', 'CC-culture', 'trust', 'autonomy', 'new-manager'],
  },

  {
    id: 'prof-hier-009',
    category: 'professional_hierarchical',
    title: 'One Mistake, Permanent Leash',
    description: 'A data analyst made an error in a quarterly report six months ago. She caught and corrected it within an hour. Her manager still reviews every calculation she produces, and she\'s reached her breaking point.',
    personA: {
      name: 'Riya',
      role: 'senior_data_analyst',
      backstory: 'Riya is 29, 3 years at the company. Six months ago, a formula error overstated revenue by 4%. She caught it herself, corrected it, and sent a retraction within 45 minutes. Her manager, Carl, now personally reviews every spreadsheet before it goes out. She feels permanently branded.',
      emotionalState: 'Humiliated and claustrophobic',
      communicationPattern: 'accommodating turned assertive — has finally decided to name what\'s happening',
    },
    personB: {
      name: 'Carl',
      role: 'finance_manager',
      backstory: 'Carl is 51, risk-averse to his core. The error, though corrected quickly, went to the CFO for 45 minutes. Carl got called into a meeting about it. His trust was damaged and he\'s never rebuilt it, even though Riya\'s work has been flawless since.',
      emotionalState: 'Anxious and unwilling to admit it',
      communicationPattern: 'frames anxiety as rigor — "We just need to be thorough," "This is how quality works"',
    },
    trigger: 'Carl asked Riya to walk him through a standard weekly report — a task she\'s done 150 times — before sending it. She said no.',
    plantedPatterns: [
      'SCARF: Autonomy stripped (she can\'t send her own work), Status reduced (treated as junior for one mistake), Fairness violated (the punishment is disproportionate to the offense)',
      'CBT: overgeneralization — Carl treats one error as evidence of permanent unreliability; mental filter — he ignores six months of flawless work',
      'Power: punitive withholding of trust — Carl uses his positional authority to impose indefinite probation without calling it that',
      'Org Justice: Interactional injustice — the ongoing review regime is humiliating and never had an end date',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Riya, can you walk me through the weekly rollup before you send it? I want to double-check the YoY comparisons.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Carl, I\'ve done this report a hundred and fifty times. I need to ask you something directly. How long is this going to last?',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'How long is what going to last? I\'m just being thorough. There\'s nothing wrong with a second set of eyes.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'Every report. Every spreadsheet. For six months. Because of one error that I caught and fixed myself in under an hour. You review my work like I\'m an intern. Is this going to be my life here now?',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'That error went to the CFO, Riya. For forty-five minutes, we had wrong numbers in front of the C-suite. I can\'t have that happen again. This is about protecting both of us.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'Protecting both of us? You\'re protecting yourself. I haven\'t made a single error since. Not one. But I\'m still being punished. At some point you either trust me or you don\'t. Which is it?',
        turnNumber: 6,
      },
    ],
    tags: ['micromanagement', 'trust', 'one-mistake', 'disproportionate-response', 'autonomy', 'risk-aversion'],
  },

  // =========================================================================
  // SUB-TYPE 4: WHISTLEBLOWING / ETHICS
  // =========================================================================

  {
    id: 'prof-hier-010',
    category: 'professional_hierarchical',
    title: 'Reporting Unethical Practices',
    description: 'A quality assurance engineer discovers that test results are being falsified to meet a shipping deadline. She raises it with her manager, who tells her to "be a team player" and let it go.',
    personA: {
      name: 'Dana',
      role: 'qa_engineer',
      backstory: 'Dana is 32, 5 years at the company, meticulous by nature. She found that three critical test failures were manually overridden and marked as passed to meet a product launch deadline. The product goes to hospitals. She cannot let this go.',
      emotionalState: 'Frightened but morally certain',
      communicationPattern: 'documentation-oriented — dates, screenshots, specifics',
    },
    personB: {
      name: 'Phil',
      role: 'engineering_director',
      backstory: 'Phil is 46, under enormous pressure from the CEO to ship on time. He knows about the overrides. He approved them informally, telling himself the failures were "edge cases" and the risk was acceptable. He needs Dana to be quiet.',
      emotionalState: 'Cornered and performing calm authority',
      communicationPattern: 'strategic ambiguity — never confirms or denies, uses phrases like "I understand your concern" while steering toward compliance',
    },
    trigger: 'Dana brought printed test logs showing the overrides to a one-on-one with Phil and asked him to halt the release.',
    plantedPatterns: [
      'Psych Safety: Phil is making it clear that raising safety concerns is career-threatening — the definition of psychologically unsafe',
      'Power: positional authority weaponized — "be a team player" is a veiled threat disguised as cultural feedback',
      'SCARF: Relatedness threat (Dana is being pushed out of the in-group for being ethical), Certainty threat (she doesn\'t know if speaking up will cost her career)',
      'TKI: Phil is competing (assertive, uncooperative) while performing accommodation — the most dangerous combination',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Phil, I need to show you something. These are the test logs from Sprint 14. Three critical failures were manually overridden and marked as passed. Someone changed the results. This product goes into hospitals.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I appreciate you raising this, Dana. Quality is something we all care about deeply. Let me take a look at the context — sometimes edge cases get dispositioned during the review process. It\'s not unusual.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'These aren\'t edge cases. Test 7B is a power failure scenario. Test 12A is a data integrity check. These are critical path. Someone bypassed them and signed off. I have the audit trail.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I hear your concern, and I\'ll review the details. But I also need you to understand the bigger picture. We have contractual obligations, and the team has worked incredibly hard to hit this date. I need everyone pulling in the same direction right now.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Are you asking me to ignore falsified test results? Because I need to hear you say that clearly.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I\'m not asking you to ignore anything. I\'m asking you to trust the process and let me handle it at the appropriate level. This doesn\'t need to go any further right now. Let\'s be a team player here, Dana.',
        turnNumber: 6,
      },
    ],
    tags: ['ethics', 'whistleblowing', 'safety', 'falsified-results', 'team-player', 'medical-device'],
  },

  {
    id: 'prof-hier-011',
    category: 'professional_hierarchical',
    title: 'Retaliation After Speaking Up',
    description: 'An analyst who reported billing irregularities to compliance three months ago has been systematically excluded from meetings, removed from projects, and given a "performance improvement plan." She confronts the VP who she believes is retaliating.',
    personA: {
      name: 'Lin',
      role: 'financial_analyst',
      backstory: 'Lin is 35, 6 years at the company. She discovered $340K in overbilling to a government client, reported it through proper channels, and cooperated with the internal investigation. Since then, she\'s been removed from two projects, uninvited from the leadership meeting she used to attend, and placed on a PIP for "communication issues."',
      emotionalState: 'Afraid but unwilling to be silenced',
      communicationPattern: 'careful documentation — she knows every action against her will need to be defensible',
    },
    personB: {
      name: 'Robert',
      role: 'vp_of_finance',
      backstory: 'Robert is 53, the person whose team created the billing error. He insists the PIP is unrelated to the report. Legally, he might be right — the PIP cites real (if minor) performance items. But the timing is damning, and he knows it.',
      emotionalState: 'Controlled and legalistic',
      communicationPattern: 'plausible deniability — every action has a documented non-retaliatory justification',
    },
    trigger: 'Lin received the PIP document and immediately recognized it as retaliation. She requested a meeting with Robert.',
    plantedPatterns: [
      'Power: institutional retaliation through legitimate-seeming mechanisms — the PIP, the project removals, the meeting exclusions all have plausible cover stories',
      'Psych Safety: destroyed for the entire organization — everyone who knows Lin\'s story now knows the cost of speaking up',
      'Org Justice: all three types weaponized — distributive (she\'s being punished), procedural (the PIP process is pretextual), interactional (she\'s being frozen out socially)',
      'SCARF: every domain under attack — Status (PIP), Certainty (job security), Autonomy (projects taken away), Relatedness (excluded from meetings), Fairness (punished for doing the right thing)',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Robert, I need to address this PIP directly. Three months ago I reported a billing irregularity. Since then I\'ve been removed from two projects, taken off the leadership meeting invite, and now I\'m on a performance improvement plan. I want to understand what\'s happening.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Lin, I want to be clear — the PIP is based on documented performance concerns that predated your report. The project reassignments were about resourcing. These are separate matters entirely.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'The PIP cites "communication issues." My last three performance reviews say communication is a strength. Nothing changed about my communication — what changed is that I reported three hundred and forty thousand dollars in overbilling.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I understand why you might see a connection, but correlation isn\'t causation. The company has a strict non-retaliation policy, and I take that seriously. The PIP was initiated by your direct manager based on recent observations.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'My direct manager reports to you. He didn\'t have any concerns about me until after the investigation started. I have the emails, Robert. The timeline is not ambiguous.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I\'d encourage you to raise any concerns about the PIP through the formal HR process. That\'s the appropriate channel. I want to be fair to you, but I also can\'t discuss personnel decisions informally.',
        turnNumber: 6,
      },
    ],
    tags: ['retaliation', 'whistleblower', 'PIP', 'overbilling', 'plausible-deniability', 'institutional-silencing'],
  },

  {
    id: 'prof-hier-012',
    category: 'professional_hierarchical',
    title: 'Pressure to Cut Corners',
    description: 'A junior civil engineer is told by his project lead to approve a structural inspection he hasn\'t completed because the client is threatening to pull the contract. He refuses, and the conversation gets uncomfortable fast.',
    personA: {
      name: 'Mateo',
      role: 'junior_civil_engineer',
      backstory: 'Mateo is 27, 2 years out of school, still working toward his PE license. He takes his professional obligations seriously — his mentor drilled into him that your stamp is your reputation. He hasn\'t finished the inspection because he found cracks that need further analysis.',
      emotionalState: 'Scared of career consequences but ethically immovable',
      communicationPattern: 'deferential but firm — uses "I understand, but" repeatedly',
    },
    personB: {
      name: 'Gwen',
      role: 'project_lead',
      backstory: 'Gwen is 42, a licensed PE who has been cutting corners for years without consequence. She sees the cracks Mateo found as routine and not worth delaying a $4M contract. She\'s done this before. She doesn\'t see herself as unethical — she sees Mateo as green.',
      emotionalState: 'Impatient and patronizing',
      communicationPattern: 'appeals to experience — "When you\'ve been doing this as long as I have," "This is how the real world works"',
    },
    trigger: 'Gwen told Mateo to sign off on the inspection report by end of day. Mateo told her he found cracks that need analysis first.',
    plantedPatterns: [
      'Power: experience hierarchy weaponized — Gwen uses her seniority and licensure to delegitimize Mateo\'s valid concerns',
      'Psych Safety: Mateo is learning that raising concerns means being called inexperienced — he\'ll either internalize silence or leave the profession',
      'NVC: Gwen\'s moralistic judgment ("you\'re being overly cautious") replaces observable fact (there are cracks that haven\'t been analyzed)',
      'TKI: Gwen is competing (pushing Mateo to comply), Mateo is holding a collaborative position (let me do the analysis, then we decide together)',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Mateo, I need the Parker Bridge inspection signed off by five o\'clock. The client is on my back and we cannot afford to lose this contract.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'I understand the timeline, Gwen, but I found cracking in two of the support beams during my walkthrough. I need to run analysis before I can sign off. It could be surface-level, but I need to confirm.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'I\'ve seen those cracks. They\'re cosmetic. I\'ve been doing this for twenty years — hairline cracks in concrete are standard. Sign off and we\'ll note them for the next inspection cycle.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'I hear you, and I respect your experience. But I haven\'t done my own analysis yet, and I\'m the one putting my name on this report. I can\'t sign something I haven\'t verified.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Mateo, in the real world, we make judgment calls. You\'re being overly cautious, and it\'s going to cost us a four-million-dollar contract. Is that the reputation you want to build here?',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'The reputation I want to build is one where my inspection reports mean something. If those cracks are cosmetic, the analysis will confirm it by tomorrow. But I\'m not signing today.',
        turnNumber: 6,
      },
    ],
    tags: ['ethics', 'safety', 'pressure', 'cut-corners', 'professional-license', 'integrity', 'engineering'],
  },

  // =========================================================================
  // SUB-TYPE 5: MENTORSHIP BOUNDARY VIOLATIONS
  // =========================================================================

  {
    id: 'prof-hier-013',
    category: 'professional_hierarchical',
    title: 'Mentor Taking Credit',
    description: 'A junior researcher discovers her mentor presented her framework at a conference — with his name as sole author. She confronts him and he frames it as "amplifying her ideas to a bigger audience."',
    personA: {
      name: 'Priya',
      role: 'junior_researcher',
      backstory: 'Priya is 28, a second-year PhD candidate. She developed a novel analytical framework during a project her mentor supervised. She shared her draft paper with him for feedback. He presented it at an industry conference as his own work, citing her only in an acknowledgments footnote.',
      emotionalState: 'Devastated and questioning everything about the mentorship',
      communicationPattern: 'conflict-averse by nature — has been rehearsing this conversation for two weeks',
    },
    personB: {
      name: 'Dr. Kenneth Aldrich',
      role: 'senior_research_mentor',
      backstory: 'Kenneth is 56, a tenured professor with 200+ publications. He genuinely believes his mentees\' work falls under his lab\'s umbrella. He\'s done this before. Previous students accepted it as "how academia works." He doesn\'t see theft — he sees curation.',
      emotionalState: 'Annoyed at being questioned by a junior',
      communicationPattern: 'appeals to hierarchy and tradition — "This is how it works," "When you\'re at my stage, you\'ll understand"',
    },
    trigger: 'A colleague forwarded Priya the conference program. Her framework was listed under Kenneth\'s name with the description she wrote.',
    plantedPatterns: [
      'Power: academic hierarchy used to normalize intellectual theft — the mentor controls the mentee\'s career trajectory, making confrontation dangerous',
      'SCARF: Status violation (her intellectual contribution was erased), Autonomy (she has no control over how her work is attributed), Fairness (he used her work without permission and without credit)',
      'NVC: Kenneth evaluates Priya\'s reaction ("you\'re being territorial") instead of acknowledging the observable harm (he presented her work under his name)',
      'Org Justice: Distributive injustice — the intellectual credit went to the wrong person; Interactional injustice — Kenneth dismisses her concern as immaturity',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Dr. Aldrich, I need to talk about the Keystone Conference presentation. Someone sent me the program. My framework — the one I developed for the Chen project — is listed under your name. With my description.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Yes, I presented on the methodology. It was well received, by the way. I mentioned you developed the initial concept during the Q&A. This is how it works, Priya — senior researchers present lab work at conferences. It gives the work visibility it wouldn\'t otherwise have.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You mentioned me during Q&A. My name isn\'t on the paper. It isn\'t in the abstract. I wrote that framework. I ran the validation. You used my words in the description. How is that not my work?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'The work was done in my lab, under my grant funding, with my supervision. That\'s how attribution works in research. You\'re a second-year PhD student. You\'ll have plenty of opportunities to present your own work when you\'re further along.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I shared that paper with you for feedback, not for you to present it as yours. Did you even read the IRB guidelines on authorship? The person who does the intellectual work gets the credit. That\'s not ambiguous.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Priya, I\'d encourage you not to be territorial about ideas this early in your career. It doesn\'t serve you well. I\'m trying to help you — a mention from me carries more weight than a solo paper from a second-year student. You should be thanking me.',
        turnNumber: 6,
      },
    ],
    tags: ['credit-theft', 'mentorship', 'academia', 'authorship', 'intellectual-property', 'hierarchy'],
  },

  {
    id: 'prof-hier-014',
    category: 'professional_hierarchical',
    title: 'Emotional Labor Exploitation',
    description: 'A senior manager has been treating her mentee as her personal therapist — venting about her divorce, her boss, her insomnia. The mentee finally pushes back after a "mentorship meeting" that was 55 minutes of the manager\'s personal problems.',
    personA: {
      name: 'Jordan',
      role: 'associate_product_manager',
      backstory: 'Jordan is 26, non-binary, paired with their mentor Sandra through the company\'s formal mentorship program. For the first two months, Sandra gave excellent career advice. Over the past three months, every session has devolved into Sandra processing her divorce, her conflict with her boss, and her anxiety. Jordan feels trapped — Sandra writes their performance review.',
      emotionalState: 'Drained and resentful but afraid to rock the boat',
      communicationPattern: 'people-pleasing under pressure — laughs when uncomfortable, says "totally" too much',
    },
    personB: {
      name: 'Sandra',
      role: 'senior_product_manager',
      backstory: 'Sandra is 41, going through a difficult divorce and has isolated herself from friends. She doesn\'t realize she\'s turned Jordan into an emotional support system. She thinks they have a "close mentoring relationship" and sees Jordan\'s listening as mutual trust.',
      emotionalState: 'Lonely and blind to the power dynamic',
      communicationPattern: 'oversharing disguised as vulnerability — "I\'m being real with you because I trust you"',
    },
    trigger: 'Jordan prepared three career questions for their mentorship meeting. Sandra spent 55 minutes talking about her divorce. Jordan got to ask zero questions.',
    plantedPatterns: [
      'Power: the mentor controls the mentee\'s career trajectory (writes reviews, influences promotions), making it unsafe for Jordan to set boundaries',
      'SCARF: Autonomy violated (Jordan can\'t steer their own mentorship), Relatedness distorted (the relationship is one-directional), Fairness (Jordan gives emotional labor and receives nothing professional in return)',
      'Psych Safety: Jordan cannot be honest about their experience because Sandra holds evaluative authority — the definition of low psychological safety',
      'NVC: Sandra\'s unmet needs (connection, processing, support) are real but being met at Jordan\'s expense without their consent',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Sorry, I know I just talked the whole time again. I\'m such a mess right now. You\'re honestly the only person I can be real with about all this. It means so much that you listen.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'I appreciate that you trust me, Sandra. But I had some things I was hoping to discuss today — career-related things. I\'ve had questions saved up for a few weeks now.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'Oh god, of course. I\'m sorry. Hit me — what\'s on your mind? We still have... five minutes. Actually, can we do a quick coffee next week? I promise I\'ll be more focused.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'Sandra, this has happened the last three sessions. I don\'t want to sound ungrateful, but I was paired with you to develop my career skills. And the last few months have felt more like... I\'m supporting you through a hard time. Which I\'m happy to do as a friend. But I also need a mentor.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Wow. Okay. I didn\'t realize I was... I thought we were just being open with each other. Is it really that bad? I feel like I\'ve also given you a lot of guidance. The stakeholder mapping exercise — that was me.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'That was two months ago. Since then, every session has been about the divorce or your situation with your boss. I\'ve been afraid to say something because you write my review. Do you understand the position that puts me in?',
        turnNumber: 6,
      },
    ],
    tags: ['mentorship', 'emotional-labor', 'boundaries', 'power-dynamic', 'venting', 'one-sided'],
  },

  {
    id: 'prof-hier-015',
    category: 'professional_hierarchical',
    title: 'Inappropriate Personal Questions',
    description: 'A senior partner at a consulting firm repeatedly asks his junior associate about her personal life — her relationship status, her plans for children, her weekends. She finally draws a line after he asks if her boyfriend "is okay with how much she travels."',
    personA: {
      name: 'Anika',
      role: 'junior_associate',
      backstory: 'Anika is 29, one of three women in a 40-person consulting practice. Her sponsor, Richard, has opened doors for her career. But his "mentorship" has increasingly included personal questions she doesn\'t want to answer. She knows other women have left the firm because of this dynamic. She\'s been tolerating it to protect her career.',
      emotionalState: 'Revolted but calculating — knows the cost of speaking up',
      communicationPattern: 'redirects gracefully until she can\'t — trained in client diplomacy',
    },
    personB: {
      name: 'Richard',
      role: 'senior_partner',
      backstory: 'Richard is 57, has been at the firm for 25 years. He sees himself as a "people person" who takes a holistic interest in his team. He asks male associates about their families too, but the questions are different — he asks men about their kids\' sports teams, not whether their wives are "okay with" their travel. He doesn\'t see the pattern.',
      emotionalState: 'Genuinely surprised and immediately dismissive',
      communicationPattern: 'deflects with charm and reframes boundary-setting as oversensitivity',
    },
    trigger: 'During a team dinner, Richard asked Anika — in front of colleagues — if her boyfriend "is okay with how much she travels." She didn\'t respond. The next morning, she asked for a meeting.',
    plantedPatterns: [
      'Power: sponsorship dependency creates a trap — Richard controls Anika\'s access to career-making projects, making confrontation a calculated risk',
      'SCARF: Status threat (she was singled out in a gendered way in front of peers), Autonomy violation (her personal life is being surveilled), Relatedness threat (she\'s being positioned as "girlfriend" rather than "colleague")',
      'Psych Safety: the question itself and the public setting signal to every woman in the room that gender roles are part of their evaluation',
      'CBT: Richard\'s implicit assumption — women who travel need partner permission — is a gendered cognitive distortion he doesn\'t recognize',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Richard, I wanted to talk about last night at dinner. You asked me, in front of the team, whether my boyfriend is okay with how much I travel. I need you to understand why that\'s a problem.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Anika, I was just making conversation. I ask everyone about their families. I care about my people as whole humans, not just billable hours. If that came across wrong, I apologize.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You asked Jake about the Celtics. You asked Darren about his golf trip. You asked me if my boyfriend is okay with my job. Do you see the difference?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I think you\'re reading something into this that isn\'t there. I\'ve mentored dozens of associates — men and women. Nobody has ever had an issue with me taking a personal interest.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Three women have left this practice in two years, Richard. Nobody has had an issue, or nobody has felt safe raising one? Because those are very different things.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: '... I think that\'s unfair. And frankly, I\'m a little hurt. I\'ve gone out of my way to champion your career. I got you on the Meridian account. I don\'t think I deserve this.',
        turnNumber: 6,
      },
    ],
    tags: ['boundaries', 'gender', 'personal-questions', 'mentorship', 'sponsorship', 'power-dynamic', 'consulting'],
  },
]
