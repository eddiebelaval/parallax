import type { Scenario } from '../types'

// ---------------------------------------------------------------------------
// CIVIL / STRUCTURAL SCENARIOS — 15 fully authored scenarios across 5 sub-types
//
// Sub-type breakdown (3 each):
//   1. HOA Disputes              (civil-001 through civil-003)
//   2. Landlord-Tenant Conflicts (civil-004 through civil-006)
//   3. School Board Disagreements(civil-007 through civil-009)
//   4. Community Resource Alloc. (civil-010 through civil-012)
//   5. Institutional Discrim.    (civil-013 through civil-015)
//
// Active lenses: NVC, Narrative, Power, Organizational Justice,
//                Restorative Justice, IBR
//
// Civil/structural conflicts are defined by SYSTEMIC power — institutions,
// rules, policies, boards, and collective decision-making. The individual
// people are proxies for larger structural forces. That's what makes these
// different from personal or family disputes: the conflict is embedded in
// the system, not just the relationship.
//
// Every scenario plants 2-3 patterns mapped to the active lens stack.
// Dialogue is messy and human — procedural appeals, righteous anger at
// systemic injustice, institutional defensiveness, "the rules say" rhetoric,
// and community identity claims. People don't argue in clean frameworks.
// ---------------------------------------------------------------------------

export const CIVIL_STRUCTURAL_SCENARIOS: Scenario[] = [

  // =========================================================================
  // SUB-TYPE 1: HOA DISPUTES
  // =========================================================================

  {
    id: 'civil-001',
    category: 'civil_structural',
    title: 'Architectural Review Overreach',
    description: 'A homeowner installed a wheelchair ramp for her elderly father without getting prior approval. The HOA board president insists it must be removed and rebuilt to spec, citing the covenants. The homeowner sees selective enforcement — a neighbor\'s unpermitted pergola was never challenged.',
    personA: {
      name: 'Denise',
      role: 'homeowner',
      backstory: 'Denise is 51, a nurse who moved her 78-year-old father in after his stroke. She built the ramp in two days because he was being discharged and couldn\'t navigate the front steps. She\'s lived in the community for nine years and never had a violation.',
      emotionalState: 'Outraged and exhausted',
      communicationPattern: 'builds her case with evidence — compares treatment to neighbors, names specific double standards',
    },
    personB: {
      name: 'Gary',
      role: 'HOA board president',
      backstory: 'Gary is 63, retired corporate attorney, HOA president for four years. He genuinely believes consistent rule enforcement protects property values. He personally likes Denise but sees making exceptions as a slippery slope.',
      emotionalState: 'Procedurally righteous, privately uncomfortable',
      communicationPattern: 'retreats to bylaws and procedure when challenged emotionally',
    },
    trigger: 'Denise received a formal violation letter demanding the ramp be removed within 30 days or face daily fines of $50.',
    plantedPatterns: [
      'Org Justice: procedural fairness violation — rules applied inconsistently (ramp flagged, pergola ignored)',
      'Power: institutional authority wielded against a caregiver with no structural recourse',
      'IBR: Gary\'s position is "follow the process"; his interest is property value stability. Denise\'s position is "leave my ramp"; her interest is her father\'s safety and dignity',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'You sent me a violation letter for a wheelchair ramp. A wheelchair ramp, Gary. My father had a stroke. He can\'t walk up stairs.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Denise, I understand the situation, and I\'m sorry about your father. But the architectural review process exists for a reason. All exterior modifications require prior approval — that\'s in the covenants you signed.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'The covenants I signed. Funny — those same covenants cover the Hendersons\' pergola, which has been sitting there unpermitted for two years. Nobody sent THEM a letter.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'The Henderson situation is being addressed separately. I can\'t discuss other homeowners\' cases with you. The issue here is the approval process.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'The issue here is that my father needs to get in and out of his own home. I didn\'t have thirty days to wait for a committee to review paint swatches. Are you really going to fine a disabled man fifty dollars a day?',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'The fine is against the property, not the individual. I\'d encourage you to submit a retroactive application. If it meets the design standards, we can resolve this quickly.',
        turnNumber: 6,
      },
    ],
    tags: ['HOA', 'accessibility', 'selective-enforcement', 'caregiving', 'property-rights', 'institutional-power'],
  },

  {
    id: 'civil-002',
    category: 'civil_structural',
    title: 'Selective Rule Enforcement',
    description: 'A Black homeowner receives repeated landscaping violations while white neighbors with identical or worse yards go uncited. He confronts the compliance officer at a board meeting, forcing the community to face a pattern it prefers to ignore.',
    personA: {
      name: 'Jerome',
      role: 'homeowner',
      backstory: 'Jerome is 44, a software architect, one of three Black families in a 200-unit subdivision. He\'s received four landscaping citations in eight months. He started documenting every yard on his block with timestamped photos after the second one.',
      emotionalState: 'Coldly furious — past the point of benefit-of-the-doubt',
      communicationPattern: 'methodical — presents documented evidence, forces the other party to reconcile contradictions',
    },
    personB: {
      name: 'Patricia',
      role: 'HOA compliance officer',
      backstory: 'Patricia is 57, a part-time compliance officer who does drive-by inspections twice a month. She doesn\'t consider herself prejudiced. She believes she\'s enforcing standards neutrally, but her attention pattern tells a different story.',
      emotionalState: 'Defensive and blindsided',
      communicationPattern: 'deflects systemic claims with individual justifications — "each case is different"',
    },
    trigger: 'Jerome presented a spreadsheet at the HOA meeting showing his four violations alongside 12 comparable or worse yards that received zero citations — all belonging to white homeowners.',
    plantedPatterns: [
      'Power: institutional racism operating through neutral-seeming enforcement mechanisms',
      'Narrative: Patricia\'s totalizing narrative — "I treat everyone the same" — collapses under documented evidence',
      'Org Justice: distributive injustice (unequal outcomes) AND procedural injustice (no appeal mechanism, no transparency in inspection routes)',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I have a spreadsheet. Four violations against my property in eight months. Twelve comparable yards on the same block — zero citations. All twelve are white homeowners. I have photos with timestamps.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Mr. Caldwell, each property is evaluated on its own merits. Violation standards vary based on the specific condition observed. I can assure you there\'s no pattern here.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You cited me for grass height on March 12th. My grass was three and a half inches. The lot directly across the street — here\'s the photo, same day — was five inches. No citation. You want to explain the "specific condition" difference?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I may not have observed that particular property on that particular inspection route. I can\'t cite what I don\'t see. That doesn\'t mean —',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'You drive right past it to get to mine. It\'s on the same street. So either you\'re not looking, or you\'re choosing what to look at. Both of those are problems the board needs to address.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I understand you feel targeted, but accusing the HOA of discrimination is a very serious allegation. I do my best to enforce the standards fairly.',
        turnNumber: 6,
      },
    ],
    tags: ['HOA', 'racial-bias', 'selective-enforcement', 'documentation', 'systemic-racism', 'institutional-accountability'],
  },

  {
    id: 'civil-003',
    category: 'civil_structural',
    title: 'Special Assessment Controversy',
    description: 'The HOA board approved a $4,200 special assessment for a luxury pool renovation. A single mother on a fixed income argues the assessment process was rigged — the vote happened at a meeting she wasn\'t notified about, and the amenity primarily benefits affluent residents.',
    personA: {
      name: 'Rosa',
      role: 'homeowner',
      backstory: 'Rosa is 38, a home health aide and single mother of two. She bought her townhome four years ago with help from a first-time buyer program. She\'s never used the pool — her kids are in after-school care during pool hours. The $4,200 assessment is two months of take-home pay.',
      emotionalState: 'Panicked and angry — this could mean losing her home',
      communicationPattern: 'emotional and concrete — talks in terms of real-life impact, not abstract principle',
    },
    personB: {
      name: 'Warren',
      role: 'HOA treasurer',
      backstory: 'Warren is 62, retired finance executive. He orchestrated the pool renovation because the facility was deteriorating and depressing property values. The assessment was voted on at a properly noticed meeting — technically compliant, though notices went out 11 days before with no Spanish translation.',
      emotionalState: 'Impatient with objections he considers short-sighted',
      communicationPattern: 'frames everything as fiduciary responsibility — speaks in property values and long-term returns',
    },
    trigger: 'Rosa received the assessment bill and showed up at the next board meeting demanding answers.',
    plantedPatterns: [
      'Org Justice: procedural injustice (notice technically compliant but practically exclusionary — no translation, short timeline, weekday meeting), distributive injustice (cost identical regardless of income or usage)',
      'Power: class-based structural power — affluent retirees dominate board and meeting attendance, shaping decisions that burden working-class owners',
      'Restorative Justice: real harm exists — Rosa faces potential financial crisis from a decision she had no meaningful voice in',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Forty-two hundred dollars. I got a bill for forty-two hundred dollars for a pool my kids have never been in. I never even heard about this vote.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'The notice was mailed to all owners eleven days before the meeting, per Section 8.4 of the bylaws. The vote passed 67 to 14. The assessment is binding on all units.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'I work twelve-hour shifts. The meeting was at 2 PM on a Tuesday. Half the people in this community work during the day. You know who shows up at 2 PM on a Tuesday? Retirees who want a nicer pool.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'We can\'t schedule around every individual\'s work schedule. The facility serves all homeowners and its condition directly impacts your property value. This is an investment in your asset.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'My asset doesn\'t matter if I can\'t pay my mortgage. Forty-two hundred dollars is two months of my income. Did anyone on the board think about what this does to people who aren\'t retired with a pension?',
        turnNumber: 5,
      },
    ],
    tags: ['HOA', 'special-assessment', 'class-disparity', 'procedural-exclusion', 'financial-hardship', 'representation'],
  },

  // =========================================================================
  // SUB-TYPE 2: LANDLORD-TENANT CONFLICTS
  // =========================================================================

  {
    id: 'civil-004',
    category: 'civil_structural',
    title: 'Withheld Security Deposit',
    description: 'A tenant who left an apartment in good condition is fighting for her $1,800 security deposit. The landlord deducted for "cleaning" and "paint touch-ups" that the tenant documented were pre-existing. The power asymmetry makes disputing feel futile.',
    personA: {
      name: 'Keisha',
      role: 'former tenant',
      backstory: 'Keisha is 29, a graduate student who lived in the unit for two years. She took move-in and move-out photos. She cleaned for six hours on her last day. The $1,800 is her first month\'s rent at her new place, which she\'s borrowing from a friend until this is resolved.',
      emotionalState: 'Frustrated and powerless',
      communicationPattern: 'precise and documented — presents evidence calmly but gets emotional when dismissed',
    },
    personB: {
      name: 'Martin',
      role: 'landlord',
      backstory: 'Martin is 55, owns four rental properties. He routinely deducts from deposits to cover turnover costs he should be absorbing himself. He frames it as standard practice. He\'s never been successfully challenged because tenants usually give up.',
      emotionalState: 'Annoyed at being questioned',
      communicationPattern: 'vague authority — cites "standard wear and tear policy" without specifics, stalls with "I\'ll look into it"',
    },
    trigger: 'Keisha received an itemized deduction list totaling $1,400 of her $1,800 deposit — including $600 for "deep cleaning" and $400 for paint in rooms she photographed as already scuffed at move-in.',
    plantedPatterns: [
      'Power: structural asymmetry — landlord controls the money and the timeline; tenant has no leverage except small claims court',
      'Org Justice: interactional injustice — Martin\'s dismissive treatment ("this is standard") denies Keisha dignity in the dispute process',
      'IBR: Martin\'s position is "deductions are justified"; his interest is covering turnover costs cheaply. Keisha\'s position is "return my deposit"; her interest is financial survival and being treated fairly',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Martin, I got the deduction list. Six hundred dollars for deep cleaning? I cleaned that apartment for six hours. I have the photos. And the paint charges — those scuffs were there when I moved in. I have those photos too.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Keisha, our cleaning crew assessed the unit after you left and determined professional cleaning was required. The paint deductions are based on our standard wear-and-tear policy.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'What standard policy? You never gave me a wear-and-tear policy in my lease. And your "cleaning crew" is your nephew with a Shop-Vac — I know because the previous tenant told me.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I\'m not going to get into the specifics of our contractors. If you disagree with the deductions, you\'re welcome to send a written dispute and I\'ll review it.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I already sent a written dispute. Two weeks ago. You didn\'t respond. That\'s why I\'m calling. I need that money, Martin. I\'m borrowing from friends to cover rent because you\'re holding my deposit for damage that was already there.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I\'ll take another look at it. These things take time. I\'ll get back to you when I can.',
        turnNumber: 6,
      },
    ],
    tags: ['security-deposit', 'landlord-tenant', 'documentation', 'power-asymmetry', 'stonewalling', 'financial-survival'],
  },

  {
    id: 'civil-005',
    category: 'civil_structural',
    title: 'Habitability Complaints Ignored',
    description: 'A family of four has been living with black mold, a broken heater, and roaches for five months. The landlord keeps promising repairs that never materialize. The tenant finally threatens to withhold rent, and the landlord threatens eviction.',
    personA: {
      name: 'Alejandro',
      role: 'tenant',
      backstory: 'Alejandro is 35, a warehouse worker with a wife and two children, ages 4 and 7. He\'s called the landlord twelve times. He has a text log. His 4-year-old has developed respiratory issues that the pediatrician linked to mold exposure. He can\'t afford to move — first/last/deposit would be $4,500 he doesn\'t have.',
      emotionalState: 'Desperate and protective — his children are getting sick',
      communicationPattern: 'pleading that turns to anger — exhausted every polite channel',
    },
    personB: {
      name: 'Diane',
      role: 'property manager',
      backstory: 'Diane is 48, manages 60 units for an absentee investor. Her maintenance budget was cut last year. She knows the conditions are bad but has no authority to approve the $8,000 mold remediation. She deflects tenant anger because she can\'t solve the underlying problem.',
      emotionalState: 'Overwhelmed and trapped between tenant and owner',
      communicationPattern: 'promises and delays — "I\'ll put in a work order" is her reflexive shield',
    },
    trigger: 'Alejandro\'s daughter was taken to the ER for breathing difficulty. The doctor\'s note specifically mentions mold exposure in the home.',
    plantedPatterns: [
      'Restorative Justice: clear harm to a child\'s health; repair requires not just fixing conditions but acknowledging the five months of neglect',
      'Power: structural trap — Alejandro can\'t afford to leave, can\'t force repairs, and withholding rent risks eviction. Diane has no budget authority. The absentee owner holds all structural power and is absent from the conversation',
      'NVC violation: both parties express evaluations instead of needs — Alejandro: "You don\'t care about my kids"; Diane: "I\'m doing everything I can." Neither statement lands because neither is the real feeling or need',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'My daughter was in the emergency room last night. The doctor says it\'s the mold. Five months I\'ve been calling you. Five months. She\'s four years old, Diane.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Oh my God, Alejandro, I\'m so sorry. Is she okay? I did put in the work order for the mold — I\'ve been pushing the owner on it.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You said that in October. And November. And December. There is no work order. Nobody has come. My kids are sleeping in a room with black mold growing on the wall and you keep telling me "soon."',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I understand your frustration. The remediation requires owner approval and it\'s a significant expense. I\'m doing everything I can from my end. Please don\'t withhold rent — that will only make things worse for your family.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Worse? What\'s worse than my daughter in the hospital? You want me to keep paying twelve hundred dollars a month to poison my own family? I\'ll stop paying when you start fixing.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'If you withhold rent, the owner will file for eviction. I don\'t want that. Let me try one more time. Give me until Friday.',
        turnNumber: 6,
      },
    ],
    tags: ['habitability', 'landlord-tenant', 'mold', 'child-safety', 'empty-promises', 'structural-trap'],
  },

  {
    id: 'civil-006',
    category: 'civil_structural',
    title: 'Rent Increase Justification',
    description: 'A longtime tenant in a non-rent-controlled city receives a 28% rent increase after eight years. She suspects the increase is retaliation for organizing other tenants about maintenance issues. The landlord frames it as a market correction.',
    personA: {
      name: 'Bev',
      role: 'tenant',
      backstory: 'Bev is 66, retired teacher on a fixed income. She\'s lived in her apartment for eight years and pays $950/month in an area where comparable units list for $1,200. Two months ago, she circulated a petition about hallway lighting and broken laundry machines. Now her rent is going to $1,215.',
      emotionalState: 'Suspicious, scared, and defiant',
      communicationPattern: 'sharp and direct — doesn\'t waste words, names what she sees',
    },
    personB: {
      name: 'Phil',
      role: 'landlord',
      backstory: 'Phil is 52, inherited the building from his father. He genuinely needs to raise rents to cover a new roof and property tax increase. The timing after the petition is coincidental — he\'d been planning the increase for months. But he also doesn\'t appreciate tenants organizing.',
      emotionalState: 'Irritated and self-righteous about his costs',
      communicationPattern: 'frames everything as business necessity — avoids acknowledging the human impact',
    },
    trigger: 'Bev received a 60-day notice of a $265/month rent increase, exactly two months after she circulated the maintenance petition.',
    plantedPatterns: [
      'Power: retaliatory timing creates a chilling effect on tenant organizing — whether intentional or not, the structural message is "complain and pay more"',
      'Narrative: Phil\'s totalizing narrative — "This is just business" — erases the human story of a retiree facing displacement. Bev\'s counter-narrative — "This is retaliation" — may erase Phil\'s legitimate cost pressures',
      'Org Justice: distributive question (is the increase proportionate?) intersects with procedural question (is the timing retaliatory?) and interactional question (was Bev treated with dignity in the process?)',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Two months after I circulate a petition about the broken laundry machines, I get a twenty-eight percent rent increase. That\'s not a coincidence, Phil.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'It is a coincidence. I\'ve been planning this adjustment since last summer. We have a new roof to pay for, property taxes went up, and your rent is well below market. Nine-fifty for a two-bedroom? That was a gift.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'A gift. Eight years of on-time payments and putting up with broken appliances, and you call below-market rent a gift. I\'m on a fixed income, Phil. Social Security doesn\'t go up twenty-eight percent.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I sympathize, but I can\'t run a building at a loss. I have to bring rents in line with the area. This isn\'t personal.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'It feels personal. It feels like a message to every tenant who signed that petition — complain about conditions and see what happens. You know the laundry machines still aren\'t fixed, right?',
        turnNumber: 5,
      },
    ],
    tags: ['rent-increase', 'landlord-tenant', 'retaliation', 'tenant-organizing', 'fixed-income', 'displacement'],
  },

  // =========================================================================
  // SUB-TYPE 3: SCHOOL BOARD DISAGREEMENTS
  // =========================================================================

  {
    id: 'civil-007',
    category: 'civil_structural',
    title: 'Curriculum Controversy',
    description: 'A parent demands the removal of a novel from the 10th-grade English curriculum because it contains racial violence and profanity. The English department chair argues the book is essential for teaching critical thinking about American history. The school board is caught between vocal parent groups.',
    personA: {
      name: 'Cheryl',
      role: 'parent and PTA officer',
      backstory: 'Cheryl is 42, mother of a 15-year-old. She\'s an active PTA member and church volunteer. She found the book\'s content genuinely upsetting and believes exposing children to graphic racial violence without parental consent is harmful. She\'s organized 40 parents to demand its removal.',
      emotionalState: 'Morally certain and protective',
      communicationPattern: 'appeals to parental authority and community values — frames removal as protection, not censorship',
    },
    personB: {
      name: 'Dr. Kaplan',
      role: 'English department chair',
      backstory: 'Dr. Kaplan is 54, 22 years teaching experience, won a state teaching award. She selected the novel specifically because it forces students to confront uncomfortable truths. She\'s watched book challenges accelerate across the district and sees this as part of a larger pattern.',
      emotionalState: 'Alarmed and protective of academic freedom',
      communicationPattern: 'appeals to pedagogical expertise and critical thinking — can come across as dismissive of parent concerns',
    },
    trigger: 'Cheryl spoke at the school board meeting demanding the book be pulled. Dr. Kaplan was asked to respond.',
    plantedPatterns: [
      'IBR: Cheryl\'s position is "remove the book"; her interest is protecting her child from unmediated exposure to traumatic content. Dr. Kaplan\'s position is "keep the book"; her interest is developing students\' capacity to engage with difficult history',
      'Power: competing institutional authorities — parental rights vs. professional expertise vs. board governance — each claiming legitimacy',
      'Narrative: both parties have totalizing frames — Cheryl: "They\'re exposing our children to harm." Dr. Kaplan: "They\'re trying to sanitize history." Neither frame holds the full complexity',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I read this book. Page 47 has the n-word used fourteen times. There\'s a lynching described in graphic detail. My daughter came home in tears. No parent was consulted. No opt-out was offered.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Mrs. Denton, that scene is devastating precisely because the history it depicts was devastating. We don\'t teach this book to traumatize students — we teach it to develop their capacity to understand and confront what happened in this country.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'My daughter doesn\'t need to read fourteen slurs on a page to understand history. There are age-appropriate ways to teach these topics. Forty families in this district agree with me.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'With respect, a petition doesn\'t establish pedagogical best practice. This novel has been taught in American schools for decades. It was selected through the district\'s curriculum review process by qualified educators.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'And parents weren\'t part of that review. You decided what our children should read behind closed doors and then act surprised when families push back. We have a right to be at that table.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I hear that concern about transparency. But allowing any parent group to veto curriculum based on discomfort sets a precedent that will hollow out every English class in this district.',
        turnNumber: 6,
      },
    ],
    tags: ['curriculum', 'book-challenge', 'academic-freedom', 'parental-rights', 'censorship', 'institutional-governance'],
  },

  {
    id: 'civil-008',
    category: 'civil_structural',
    title: 'Budget Allocation Fight',
    description: 'A school board member advocates cutting the arts program to fund STEM upgrades. The drama teacher, who also coaches the only state-qualifying speech team, fights for survival of a program that disproportionately serves low-income and neurodivergent students.',
    personA: {
      name: 'Dana',
      role: 'drama teacher and speech coach',
      backstory: 'Dana is 39, teaches drama and coaches forensics at Lincoln High. Her program costs $32,000/year and serves 85 students, many of whom are on free lunch or have IEPs. Three of her students got college scholarships through speech last year. She\'s been told her program is "on the chopping block" every budget cycle for five years.',
      emotionalState: 'Exhausted from perpetual justification, but fiercely protective',
      communicationPattern: 'passionate and specific — names individual students and outcomes, can become emotional when dismissed',
    },
    personB: {
      name: 'Craig',
      role: 'school board member',
      backstory: 'Craig is 47, runs a tech consultancy and was elected on a STEM-forward platform. He sees the arts as valuable but not essential. He\'s focused on graduation rates and job placement metrics. He genuinely doesn\'t understand why the arts budget can\'t be absorbed elsewhere.',
      emotionalState: 'Pragmatic and slightly impatient',
      communicationPattern: 'metric-driven — speaks in numbers, outcomes, and ROI. Uncomfortable with emotional appeals.',
    },
    trigger: 'The proposed budget eliminates the drama program and redirects its $32,000 to a new coding lab. Dana requested time at the board meeting.',
    plantedPatterns: [
      'Org Justice: distributive injustice — the cut disproportionately affects low-income and neurodivergent students who lack alternatives. Procedural question: were affected communities consulted?',
      'Narrative: Craig\'s totalizing metric frame — "outcomes = job placement" — renders invisible the developmental, social, and therapeutic value of arts for vulnerable populations',
      'Restorative Justice: harm to specific students and a community that has no other access to these opportunities. What does repair look like when a program is cut?',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_b',
        content: 'The reality is we have a fixed budget. The coding lab serves projected workforce needs for 200 students. The drama program serves 85. This is a straightforward resource allocation decision.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Eighty-five students, 60 percent of whom are on free lunch. Where do you think they go when this program disappears? The coding lab isn\'t going to have spots for kids who can barely afford a laptop.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'We\'re planning to provide devices through the technology equity fund. And I want to be clear — I value the arts. But when we\'re forced to choose between programs, we have to look at outcomes.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'Outcomes. Three speech scholarships last year. A student with selective mutism who performed her first public piece in front of 300 people. A kid who told me this program is the reason he comes to school. What metric captures that, Craig?',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Those are powerful stories, and I don\'t minimize them. But I can\'t fund a program based on anecdotes when I have graduation rate data and workforce projections telling me where the need is.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'They\'re not anecdotes. They\'re children. You just don\'t have a column for them in your spreadsheet.',
        turnNumber: 6,
      },
    ],
    tags: ['school-budget', 'arts-vs-STEM', 'equity', 'neurodivergent', 'metrics-vs-humanity', 'institutional-priorities'],
  },

  {
    id: 'civil-009',
    category: 'civil_structural',
    title: 'Parent vs. Administrator',
    description: 'A parent of a bullied child confronts the assistant principal after three reports of physical bullying produced no consequences for the aggressor. The parent discovers the bully\'s father is the school\'s biggest booster donor.',
    personA: {
      name: 'Tamika',
      role: 'parent',
      backstory: 'Tamika is 36, a home daycare provider and single mother. Her son Jaylen is 11, in 5th grade, and has been shoved, tripped, and had food thrown at him by the same student for two months. She\'s filed three incident reports. Each time she was told it would be "handled." Nothing has changed.',
      emotionalState: 'Mama-bear fury barely contained',
      communicationPattern: 'escalates from measured to confrontational — done being patient',
    },
    personB: {
      name: 'Dr. Simmons',
      role: 'assistant principal',
      backstory: 'Dr. Simmons is 49, in his seventh year as AP. He\'s a good administrator in most respects but avoids conflict with powerful families. The bully\'s father donated the new gymnasium floor. Simmons genuinely wants to help Jaylen but is paralyzed by institutional pressure.',
      emotionalState: 'Caught and ashamed, hiding behind procedure',
      communicationPattern: 'bureaucratic cushioning — uses passive voice and institutional language to avoid personal accountability',
    },
    trigger: 'Jaylen came home with a bruise on his arm. Tamika called the school and was told, again, that the matter was "being addressed through appropriate channels."',
    plantedPatterns: [
      'Power: donor influence creates an invisible shield around the aggressor — institutional power protecting the powerful at the expense of the vulnerable',
      'Org Justice: procedural injustice — the same process is applied on paper but produces wildly different outcomes based on who the families are',
      'Restorative Justice: Jaylen has experienced repeated harm with no acknowledgment, no consequence, no repair. The institution is complicit in the ongoing harm',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Three reports. Two months. My son came home with a bruise. Tell me exactly what "being addressed through appropriate channels" means, because from where I\'m sitting, it means nothing.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Ms. Robinson, I share your concern for Jaylen\'s well-being. The situation has been reviewed and disciplinary conversations have taken place with the other student\'s family. There are privacy constraints that limit what I can share about specific actions taken.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Privacy constraints. My son has bruises. What "specific actions" leave a child still getting hit two months later? I\'ll tell you what changed — nothing. Because that boy\'s father put a new floor in your gym.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I can assure you that donor relationships have absolutely no bearing on disciplinary decisions. That\'s not how this school operates.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Then why is my son the only one suffering consequences? He\'s afraid to go to school. He\'s eating lunch in the bathroom. And the kid who hits him is still walking around like nothing happened. If this were reversed — if Jaylen hit that boy — would it take two months to "address"?',
        turnNumber: 5,
      },
    ],
    tags: ['bullying', 'school-administration', 'donor-influence', 'accountability', 'parental-advocacy', 'institutional-complicity'],
  },

  // =========================================================================
  // SUB-TYPE 4: COMMUNITY RESOURCE ALLOCATION
  // =========================================================================

  {
    id: 'civil-010',
    category: 'civil_structural',
    title: 'Park Usage Dispute',
    description: 'Long-time residents want to keep the community park as green space. New families want playground equipment installed. The argument at the town council meeting reveals deeper tensions about who the neighborhood is for.',
    personA: {
      name: 'Martha',
      role: 'long-time resident',
      backstory: 'Martha is 71, has lived adjacent to Willow Park for 34 years. She walks there every morning, tends an informal garden bed, and watches birds. The park\'s open meadow is the last quiet space in a neighborhood that has densified rapidly. She sees the playground push as young families steamrolling seniors.',
      emotionalState: 'Grieving a neighborhood that\'s changing around her',
      communicationPattern: 'nostalgic authority — "This park has always been..." invokes history as a claim to ownership',
    },
    personB: {
      name: 'Liam',
      role: 'newer resident and parent',
      backstory: 'Liam is 34, moved in three years ago with his wife and two kids. The nearest playground is a 20-minute drive. He organized a petition of 80 families requesting playground equipment. He sees the opposition as a handful of retirees blocking infrastructure that would serve the majority.',
      emotionalState: 'Frustrated that families are being told to go elsewhere',
      communicationPattern: 'democratic framing — cites numbers, majority support, and family need',
    },
    trigger: 'The town council scheduled a public comment period on the playground proposal. Both sides showed up in force.',
    plantedPatterns: [
      'IBR: Martha\'s position is "no playground"; her interest is preserving quiet, continuity, and a space where she belongs. Liam\'s position is "install playground"; his interest is accessible outdoor play for his children and community building among families',
      'Narrative: both sides have totalizing stories — Martha: "They\'re destroying our neighborhood"; Liam: "A few people are holding the whole community hostage." Neither story contains the other\'s legitimate needs',
      'Power: democratic majority (young families) vs. historical claim (long-time residents) — two legitimate but incompatible frameworks for who gets to decide',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'That park has been open green space for thirty-four years. I\'ve walked those paths every morning since before most of you lived here. Now you want to pave it over for a jungle gym.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Nobody\'s paving anything. The proposal puts equipment on the northeast corner — less than a quarter of the park. There are eighty families who signed the petition. Our kids have nowhere to play.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'There\'s a park on Elm Street with a full playground. Drive ten minutes. Why does every new family think they can redesign a space that\'s served this community for decades?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'Elm Street is a twenty-minute drive and it\'s in another district. This is our neighborhood park too, Martha. We pay the same taxes. Our children deserve access to the same public space.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Access to destroy it. The noise, the traffic, the litter. You\'ll turn it into a parking lot within five years. Some of us moved here because it was quiet. That mattered to us.',
        turnNumber: 5,
      },
    ],
    tags: ['park-usage', 'generational-tension', 'public-space', 'community-change', 'belonging', 'democratic-process'],
  },

  {
    id: 'civil-011',
    category: 'civil_structural',
    title: 'Community Center Programming',
    description: 'The community center director replaced a longstanding seniors\' exercise class with a youth coding bootcamp, citing grant requirements. The displaced seniors feel the institution chose trendy funding over their well-being.',
    personA: {
      name: 'Hank',
      role: 'displaced program participant',
      backstory: 'Hank is 76, a retired electrician and Korean War-era veteran. He\'s attended the Thursday seniors\' fitness class for six years. It\'s his primary social outlet since his wife passed. Three of his closest friends are in the group. The class was moved to 8 AM — an hour when most participants can\'t drive safely.',
      emotionalState: 'Betrayed and invisible',
      communicationPattern: 'blunt and plainspoken — no patience for jargon or PR language',
    },
    personB: {
      name: 'Vanessa',
      role: 'community center director',
      backstory: 'Vanessa is 41, hired two years ago to modernize the center. She secured a $45,000 grant for youth STEM programming that requires the main activity room during the seniors\' time slot. She offered an early-morning alternative but didn\'t consult the seniors before accepting the grant terms.',
      emotionalState: 'Pressured and guilt-avoidant',
      communicationPattern: 'institutional optimism — frames every loss as an opportunity, uses words like "evolving" and "expanding our impact"',
    },
    trigger: 'Hank and four other seniors showed up to their regular Thursday slot and found a coding bootcamp in their room. No one had told them the time change was permanent.',
    plantedPatterns: [
      'Org Justice: procedural injustice — the affected population was not consulted before the decision was made. Interactional injustice — the communication was inadequate and the alternative is impractical',
      'Power: institutional decision-making prioritized external funding over existing community members — grant requirements structured the choice in a way that erased seniors\' needs',
      'Restorative Justice: harm is not just logistical (lost time slot) but relational (lost social connection, feeling of being discarded by an institution that was supposed to serve them)',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'We showed up Thursday and there were teenagers in our room. Nobody told us. Six years we\'ve been coming here every Thursday at ten, and you moved us without even asking.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Hank, I\'m sorry about the communication gap. We sent an email last month about the schedule change. The Thursday 8 AM slot is reserved for your group — same program, just a new time.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'An email. Half our group doesn\'t use email. And 8 AM? Ruth can\'t drive in the dark. Bill\'s aide doesn\'t start until nine. You didn\'t ask us — you decided FOR us.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I understand the frustration, and I take responsibility for the communication. The reality is we received a significant grant for youth programming that requires that room during the 10 AM window. It\'s allowing us to serve a whole new population.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'A new population. So the old population gets pushed to a time nobody can make. The grant matters more than the people who\'ve been keeping this place alive for years. That\'s what you\'re telling me.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'That\'s not what I\'m saying. We value our senior programs enormously. I\'m committed to finding a solution that works for everyone.',
        turnNumber: 6,
      },
    ],
    tags: ['community-center', 'seniors-displaced', 'grant-dependency', 'institutional-priorities', 'consultation-failure', 'belonging'],
  },

  {
    id: 'civil-012',
    category: 'civil_structural',
    title: 'Neighborhood Gentrification Tensions',
    description: 'A longtime neighborhood resident confronts a newcomer who organized a petition to change the zoning to allow a craft brewery on the block. The brewery would replace a laundromat that serves the working-class community. The argument surfaces deeper fears about displacement and erasure.',
    personA: {
      name: 'Gloria',
      role: 'longtime resident',
      backstory: 'Gloria is 58, born and raised in Eastlake. She\'s watched the neighborhood transform over 10 years — the bodega became a wine bar, the barbershop became a dog groomer, the affordable housing became condos. The laundromat is where she sees her neighbors. It\'s the last communal space that isn\'t curated for newcomers.',
      emotionalState: 'Grieving and furious — watching her community be erased in slow motion',
      communicationPattern: 'names the pattern — connects individual changes to systemic displacement',
    },
    personB: {
      name: 'Miles',
      role: 'newer resident',
      backstory: 'Miles is 31, moved to Eastlake two years ago. He\'s a graphic designer who genuinely loves the neighborhood and wants to contribute. He sees the brewery as economic development and community gathering. He doesn\'t understand why Gloria sees him as a threat rather than a neighbor.',
      emotionalState: 'Confused and slightly offended — trying to be a good neighbor',
      communicationPattern: 'optimistic framing — talks about "investment" and "vibrancy" without hearing how those words land',
    },
    trigger: 'Miles presented the brewery zoning petition at a neighborhood association meeting. Gloria was in the audience.',
    plantedPatterns: [
      'Narrative: Miles\'s narrative — "This is community investment" — and Gloria\'s counter-narrative — "This is displacement" — describe the same physical change through fundamentally different identity frames. Both are partially true',
      'Power: economic displacement operates through individual "improvements" that collectively restructure who can afford to live in a place — Miles has structural privilege (income, education, mobility) even though he holds no institutional authority',
      'Restorative Justice: ongoing community harm (displacement, cultural erasure) that no single actor caused but that requires collective acknowledgment and structural response',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'The brewery would bring jobs, foot traffic, and a gathering space to a block that\'s been underutilized. The laundromat is half-empty most days. This is about investing in where we live.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Underutilized. That laundromat is where Mrs. Chen washes her family\'s clothes because she doesn\'t have a machine. It\'s where I see my neighbors. You\'ve been here two years — who told you what this block needs?',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'I\'m not trying to erase anything. I\'m trying to make the neighborhood better. A gathering space benefits everyone — longtime residents included.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'Better for who? Every time someone like you "makes it better," someone like Mrs. Chen can\'t afford to stay. The bodega is gone. The barbershop is gone. Now you want the laundromat. You see investment. I see my community disappearing.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'I hear what you\'re saying, but I didn\'t cause gentrification by moving here. I\'m one person trying to be part of this community. What am I supposed to do — not participate?',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'Participate by listening to the people who were here first. Ask Mrs. Chen what she needs before you petition to replace her laundromat with a place she\'ll never walk into.',
        turnNumber: 6,
      },
    ],
    tags: ['gentrification', 'displacement', 'community-identity', 'zoning', 'cultural-erasure', 'economic-power'],
  },

  // =========================================================================
  // SUB-TYPE 5: INSTITUTIONAL DISCRIMINATION CLAIMS
  // =========================================================================

  {
    id: 'civil-013',
    category: 'civil_structural',
    title: 'Racial Profiling by Security',
    description: 'A Black college student was followed by campus security through the library for twenty minutes before being asked to show his student ID. White students around him were not approached. He files a formal complaint and meets with the director of campus safety.',
    personA: {
      name: 'Andre',
      role: 'student',
      backstory: 'Andre is 20, a junior computer science major on an academic scholarship. He\'s been stopped or questioned by campus security four times this semester. His white roommate, who uses the same spaces at the same times, has never been approached. Andre documented each incident with timestamps.',
      emotionalState: 'Exhausted rage — the kind that comes from knowing exactly what\'s happening and being told it isn\'t',
      communicationPattern: 'controlled and precise — has learned that emotional Black men are perceived as threats, so he modulates his voice even when furious',
    },
    personB: {
      name: 'Lt. Berger',
      role: 'director of campus safety',
      backstory: 'Lt. Berger is 52, former police officer, 11 years in campus security. He hired the officer in question and has defended his team against similar complaints before. He believes his officers are race-neutral and that "fitting a description" is a legitimate operational practice.',
      emotionalState: 'Reflexively defensive of his team',
      communicationPattern: 'institutional shield language — "officer discretion," "standard protocol," "unrelated to race"',
    },
    trigger: 'Andre filed a formal racial profiling complaint after the fourth incident. This is the meeting to discuss it.',
    plantedPatterns: [
      'Power: institutional racism embedded in "neutral" security practices — officer discretion operates as a mechanism for racial targeting while the institution denies the pattern',
      'Narrative: Lt. Berger\'s totalizing narrative — "Our officers don\'t see race" — directly contradicts Andre\'s documented, repeated, patterned experience. This narrative protects the institution at the cost of the student\'s reality',
      'Restorative Justice: the harm is cumulative — not just four stops but the message that Andre doesn\'t belong in his own university. Repair requires acknowledging the pattern, not just reviewing individual incidents',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Four times this semester. September 12th, library. October 3rd, engineering building. October 28th, student center. Last night, library again. I have the dates, times, and the officers\' badge numbers. My white roommate uses the same buildings at the same hours. He\'s never been stopped.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Andre, I take every complaint seriously. I\'ve reviewed the incident reports. In each case, the officer was conducting routine patrols and exercised standard discretion. There\'s no indication that race was a factor.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Standard discretion. Four times. All me. Zero times my roommate. At what number does the pattern become visible to you? Five? Ten? What\'s the threshold?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I understand your frustration. But comparing your experience to one other individual isn\'t how we evaluate these situations. Officers make judgment calls based on multiple factors — behavior, timing, context.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'What behavior? I was sitting at a desk studying. What context? Being Black in a library? I pay tuition here. I live here. And every few weeks your officers remind me that I look like I don\'t belong.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Nobody is saying you don\'t belong. I\'ll assign additional training on community engagement and I\'ll personally review patrol patterns. But I won\'t characterize my officers as racially biased without more evidence.',
        turnNumber: 6,
      },
    ],
    tags: ['racial-profiling', 'campus-security', 'institutional-racism', 'documentation', 'belonging', 'pattern-denial'],
  },

  {
    id: 'civil-014',
    category: 'civil_structural',
    title: 'Accessibility Failures',
    description: 'A wheelchair user is unable to access the second floor of a public library that recently renovated — the elevator was deprioritized in the renovation budget. She confronts the library director at a public board meeting after months of being told "it\'s coming."',
    personA: {
      name: 'Sonia',
      role: 'library patron and disability advocate',
      backstory: 'Sonia is 43, a freelance writer and wheelchair user since a car accident at 22. She uses the library daily for work. The entire reference section, meeting rooms, and quiet study spaces were moved to the second floor during renovation. The elevator has been "out of service — renovation in progress" for seven months. She was promised it would be the first thing completed.',
      emotionalState: 'Publicly composed, privately humiliated every time she has to ask for help or leave',
      communicationPattern: 'rights-based and specific — cites ADA, names dates and broken promises, refuses to accept "we\'re working on it"',
    },
    personB: {
      name: 'Director Walsh',
      role: 'library director',
      backstory: 'Director Walsh is 56, genuinely cares about the library and its patrons. The renovation budget was cut by the city council mid-project, and the elevator was deferred because it was the most expensive single line item. She\'s been fighting for the funding internally but hasn\'t communicated the real reason to patrons.',
      emotionalState: 'Embarrassed and defensive — knows she\'s in the wrong but can\'t say why publicly',
      communicationPattern: 'sympathetic deflection — acknowledges the problem while redirecting to forces beyond her control',
    },
    trigger: 'Sonia arrived at the library to find the reference section she needed was now on the second floor. The elevator has been non-functional for seven months. She requested to speak at the library board meeting.',
    plantedPatterns: [
      'Org Justice: distributive injustice — the renovation budget allocated resources to aesthetics (new lobby, new furniture) while deferring the one item that determines whether disabled patrons can use the building at all. Who decides what counts as essential?',
      'Power: structural ableism — disability access is treated as optional when budgets tighten, revealing whose needs are considered core vs. peripheral',
      'NVC violation: Director Walsh\'s repeated "we\'re working on it" masks the real situation (budget was cut, elevator was deprioritized) — the lack of honest communication denies Sonia the ability to advocate effectively',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Seven months. The reference section, the meeting rooms, and the quiet study area are all on the second floor. The elevator doesn\'t work. I am a daily patron of this library and I have been locked out of half the building for seven months.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Ms. Reyes, you\'re absolutely right that the elevator timeline has been unacceptable. The renovation encountered unexpected budget constraints, and we\'re actively working with the city to secure the remaining funds.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Budget constraints. You found the budget for new lobby furniture. You found it for the digital media lab. You found it for the cafe. The elevator — the one thing that determines whether disabled people can use this building — that\'s what got cut?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'Those decisions were made before I could intervene. The cafe was a revenue-generating addition that the council prioritized. I\'ve been advocating internally for the elevator since the budget was revised.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Advocating internally. While I advocate externally — to your staff, every day, to bring me a book from a floor I can\'t reach. Do you know what that feels like? To have to ask permission to access a public building that my taxes fund?',
        turnNumber: 5,
      },
    ],
    tags: ['accessibility', 'ADA', 'disability-rights', 'budget-priorities', 'institutional-ableism', 'public-services'],
  },

  {
    id: 'civil-015',
    category: 'civil_structural',
    title: 'Language Access Barriers',
    description: 'A Spanish-speaking mother tried to enroll her children in school and was turned away because the registration forms were only in English and no interpreter was available. She returns with a community advocate to confront the registrar, who insists she followed procedure.',
    personA: {
      name: 'Yesenia',
      role: 'parent (via community advocate translator)',
      backstory: 'Yesenia is 32, immigrated from Guatemala three years ago. She works two cleaning jobs. Her children, ages 8 and 10, have been out of school for three weeks because she couldn\'t complete registration. She came twice before — the first time she was handed English-only forms, the second time she was told to "bring someone who speaks English." She is literate in Spanish and has all required documents.',
      emotionalState: 'Humiliated and afraid for her children\'s education',
      communicationPattern: 'speaks through the advocate — measured and factual in her own language, but the institutional barrier has silenced her for weeks',
    },
    personB: {
      name: 'Mrs. Egan',
      role: 'school registrar',
      backstory: 'Mrs. Egan is 59, has been the registrar for 18 years. She\'s efficient and rule-following. There is no Spanish-language registration packet and no funded interpreter position. She doesn\'t speak Spanish. She told Yesenia to bring a translator because that\'s what she\'s always told non-English-speaking parents. She doesn\'t see this as discrimination — she sees it as practical reality.',
      emotionalState: 'Defensive and exasperated — feels accused of something she considers a resource problem, not a values problem',
      communicationPattern: 'procedure-first — "I followed the process as it exists." Transfers responsibility upward: "That\'s a district decision."',
    },
    trigger: 'Yesenia returned with Maria Torres, a community advocate from the local immigrant services organization, who serves as translator and witness.',
    plantedPatterns: [
      'Power: language barriers function as institutional gatekeeping — the school\'s monolingual infrastructure excludes families who have every legal right to enroll. Mrs. Egan is the face of a system failure she didn\'t create but actively perpetuates',
      'Org Justice: interactional injustice — being told to "bring someone who speaks English" treats the parent as the problem rather than the institution. Procedural injustice — no process exists for non-English registration, which is itself a policy choice',
      'Restorative Justice: three weeks of lost education for two children, plus the humiliation of being turned away from a public school. Repair requires not just enrolling these children but changing the system that excluded them',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Mrs. Reyes has been here twice before. She has every document required for enrollment — birth certificates, immunization records, proof of address. Her children have been out of school for three weeks because no one here could help her in Spanish.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I remember Mrs. Reyes. I explained to her that our registration forms are in English and I don\'t have the ability to translate them. I suggested she bring someone to help. I\'m glad she has you here now — we can get started.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Three weeks, Mrs. Egan. An eight-year-old and a ten-year-old have missed three weeks of school because this district doesn\'t have a Spanish registration form. Twenty-two percent of families in this zip code are Spanish-speaking. This isn\'t an edge case.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I understand the concern, and I agree translated forms would be helpful. But that\'s a district-level decision. I work with the tools I\'m given. I can\'t create resources that don\'t exist.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Federal law requires meaningful access to public education regardless of language. "The tools I\'m given" is not a defense — it\'s an explanation of how the system fails. Has anyone at this school ever requested translated enrollment materials from the district?',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I\'d have to check on that. Can we just get Mrs. Reyes\'s children enrolled today? I have the forms right here.',
        turnNumber: 6,
      },
    ],
    tags: ['language-access', 'immigration', 'enrollment-barriers', 'institutional-exclusion', 'education-rights', 'systemic-failure'],
  },
]
