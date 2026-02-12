import type { Scenario } from '../types'

// ---------------------------------------------------------------------------
// TRANSACTIONAL SCENARIOS — 15 fully authored scenarios across 5 sub-types
//
// Sub-type breakdown (3 each):
//   1. Service Failures        (txn-001 through txn-003)
//   2. Scope Creep             (txn-004 through txn-006)
//   3. Payment Disputes        (txn-007 through txn-009)
//   4. Contract Misunderstandings (txn-010 through txn-012)
//   5. Neighbor Boundary Issues (txn-013 through txn-015)
//
// Active lenses for transactional context: NVC, CBT, TKI, IBR, SCARF
//
// Transactional conflicts live at the intersection of money, expectations,
// and power imbalance. The defining feature is competing INTERESTS hidden
// beneath stated POSITIONS — IBR analysis should be prominent in every
// scenario. These are not long-term relationships, which makes the stakes
// feel binary: someone wins, someone loses. The engine's job is to find
// the third option nobody sees yet.
//
// Dialogue is messy — people threaten lawyers, invoke "the principle of
// the thing," weaponize Yelp reviews, and confuse their feelings with
// facts. CBT distortions run rampant. SCARF threats alight constantly
// because transactional disputes hit Status and Fairness hardest.
// ---------------------------------------------------------------------------

export const TRANSACTIONAL_SCENARIOS: Scenario[] = [

  // =========================================================================
  // SUB-TYPE 1: SERVICE FAILURES
  // =========================================================================

  {
    id: 'txn-001',
    category: 'transactional',
    title: 'The Bathroom That Leaks',
    description: 'A homeowner hired a contractor to renovate their bathroom. Six weeks after completion, the tile is cracking, the grout is separating, and water is leaking into the floor below. The contractor insists the work was done correctly and blames the homeowner\'s "unrealistic expectations."',
    personA: {
      name: 'Denise',
      role: 'homeowner',
      backstory: 'Denise is 47, a nurse who saved for two years to afford this renovation. She paid $14,000 — her entire savings buffer. She researched contractors carefully, got references, and chose Vince because he seemed honest. Now she feels stupid for trusting him.',
      emotionalState: 'Furious and financially panicked',
      communicationPattern: 'builds an evidence case — photographs, receipts, timeline of defects',
    },
    personB: {
      name: 'Vince',
      role: 'contractor',
      backstory: 'Vince is 53, runs a three-person crew and has been in the trade for 25 years. He cut corners on the waterproofing membrane because his supplier was backordered and he was already behind schedule. He knows the work is substandard but admitting it means eating a $6,000 redo.',
      emotionalState: 'Defensive and cornered',
      communicationPattern: 'deflects blame to materials, conditions, and client decisions',
    },
    trigger: 'Denise sent Vince photos of water damage in the ceiling below the bathroom and demanded he come fix it. He responded that she should have called sooner.',
    plantedPatterns: [
      'IBR positions vs interests: Denise\'s position is "redo everything free"; her interest is a safe, functional bathroom. Vince\'s position is "not my fault"; his interest is protecting his livelihood and reputation.',
      'CBT: Vince uses externalization ("the humidity in this house") — a cognitive distortion that shifts responsibility away from his workmanship',
      'SCARF: Vince\'s Status threat (admitting incompetence) blocks his ability to problem-solve. Denise\'s Fairness alarm is blaring — she paid in full and got defective work.',
      'TKI: Denise opens with competing mode (demands), Vince responds with avoiding (deflection). Neither has tried collaborating.',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Vince, I sent you twelve photos. The tile is cracking. There\'s water in my dining room ceiling. You finished six weeks ago and my house is falling apart.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Look, Denise, I\'ve been doing this for twenty-five years. That tile was set right. You\'ve got a humidity problem in that house — I told you at the start the ventilation was weak.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You never said anything about ventilation. Not once. I have every email. What I do have is a receipt for fourteen thousand dollars and a bathroom that doesn\'t work.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I discussed it with your husband. And I can\'t be responsible for what happens after I hand the job over. If you didn\'t run the exhaust fan after every shower, that\'s on you.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Don\'t you dare put this on me. I run that fan every single time. The grout was separating within two weeks. My inspector friend said the waterproofing membrane wasn\'t installed correctly. Want me to get a formal report?',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'An inspector friend. That\'s not an official inspection and you know it. You want to go down that road, go ahead. But don\'t expect me to foot the bill for a demo based on your buddy\'s opinion.',
        turnNumber: 6,
      },
    ],
    tags: ['contractor', 'renovation', 'defective-work', 'blame-shifting', 'financial-loss', 'evidence'],
  },

  {
    id: 'txn-002',
    category: 'transactional',
    title: 'The Cold Soup and the Manager',
    description: 'A customer at a mid-range restaurant sends back a dish twice and asks for a refund. The manager refuses and offers a replacement instead. What starts as a food complaint escalates into a confrontation about respect, policy, and the threat of public reviews.',
    personA: {
      name: 'Terrence',
      role: 'customer',
      backstory: 'Terrence is 36, a software engineer who rarely complains at restaurants. He brought a date here because the reviews were excellent. His soup arrived cold, the replacement was lukewarm, and now the manager is treating him like a scammer. He\'s embarrassed in front of his date and that\'s making this ten times worse.',
      emotionalState: 'Humiliated and increasingly aggressive',
      communicationPattern: 'escalates to principled stands — "It\'s not about the money, it\'s the principle"',
    },
    personB: {
      name: 'Natalie',
      role: 'restaurant_manager',
      backstory: 'Natalie is 41, managing this restaurant for three years. She deals with fraudulent refund requests weekly and has been burned by people who eat everything and then complain. Her owner tracks comps as a performance metric. She genuinely thinks she\'s being reasonable by offering a free replacement.',
      emotionalState: 'Suspicious and stretched thin',
      communicationPattern: 'hides behind policy — "Our policy is..." as a shield against individual judgment',
    },
    trigger: 'Terrence asked for a refund on his $18 soup after the second attempt came out wrong. Natalie said she could only offer a different dish.',
    plantedPatterns: [
      'IBR: Terrence\'s position is a refund; his interest is feeling respected and not embarrassed on a date. Natalie\'s position is no refund; her interest is protecting her comp numbers and not being taken advantage of.',
      'SCARF: massive Status threat for Terrence (humiliated in front of his date). Natalie feels Autonomy threat — she can\'t override corporate policy even if she wanted to.',
      'CBT: Natalie exhibits mind-reading ("He probably just wants free food") and Terrence catastrophizes ("This ruins the entire evening")',
      'NVC violation: both are evaluating rather than observing — Terrence says "This place doesn\'t care about customers" instead of describing the specific problem',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'This is the second time. Twice. The soup was cold both times. I don\'t want another bowl — I want my eighteen dollars back.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Sir, I completely understand your frustration. Our policy is that we can replace the item or offer you a different dish of equal value. I can\'t process a refund on food that was served.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It wasn\'t "served." It was served cold. Twice. You\'re telling me I have to pay eighteen dollars for soup nobody can make correctly?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I apologize for the temperature issue. I\'ve spoken with the kitchen. I\'d love to offer you a complimentary appetizer for the inconvenience. But the refund isn\'t something I\'m authorized to do.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'An appetizer. I\'m on a date. I\'ve been sitting here for forty minutes dealing with cold soup and now I\'m arguing with management. This isn\'t about the money — it\'s that you don\'t seem to care that your kitchen failed twice.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I absolutely care, which is why I\'m offering alternatives. But I have to work within our guidelines. I understand if you\'d like to leave a review about your experience.',
        turnNumber: 6,
      },
    ],
    tags: ['restaurant', 'refund', 'policy', 'humiliation', 'customer-service', 'date-night'],
  },

  {
    id: 'txn-003',
    category: 'transactional',
    title: 'The Subscription Maze',
    description: 'A customer tries to cancel a subscription and gets transferred between departments for 45 minutes. By the time she reaches someone who can actually help, she\'s past frustrated — she\'s questioning whether the company is deliberately making cancellation impossible.',
    personA: {
      name: 'Rosa',
      role: 'customer',
      backstory: 'Rosa is 52, a high school teacher on a fixed income. She signed up for a fitness streaming service during a free trial and forgot to cancel. She\'s been charged $29.99 for three months and wants a refund for at least two of those months. She\'s been on the phone for 45 minutes and this is the third person she\'s spoken to.',
      emotionalState: 'Exhausted and distrustful',
      communicationPattern: 'repeats her story louder each time, as if volume equals urgency',
    },
    personB: {
      name: 'Callum',
      role: 'retention_specialist',
      backstory: 'Callum is 24, works in a call center and is measured on retention rate. If Rosa cancels, it hurts his metrics. He genuinely wants to help but his scripts and tools limit what he can offer. He\'s had 47 calls today and it\'s 3pm.',
      emotionalState: 'Fatigued and constrained',
      communicationPattern: 'reads from scripts, uses first names excessively, deflects with "what I CAN do for you"',
    },
    trigger: 'Rosa was transferred from billing to retention after requesting a cancellation and refund. Callum is her third representative.',
    plantedPatterns: [
      'IBR: Rosa\'s position is "cancel and refund three months"; her interest is feeling respected and not trapped. Callum\'s position is "retain or minimize loss"; his interest is keeping his job performance metrics.',
      'SCARF: Rosa\'s Autonomy is under siege — she can\'t even leave a service she wants to leave. Callum\'s Certainty is threatened — he doesn\'t know if his manager will approve a three-month refund.',
      'TKI: Callum is accommodating on surface (empathy scripts) but actually competing (retention tactics). Rosa starts compromising but shifts to competing after the runaround.',
      'CBT: Rosa generalizes ("These companies are all scams") — overgeneralization distortion. Callum\'s labeling ("difficult customer") affects his ability to genuinely help.',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'This is my third person. I have been on this phone for forty-five minutes. I want to cancel my account and I want a refund for the three months I was charged after my trial ended. That is all. Can you do that?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Rosa, I completely hear you and I\'m sorry for the wait. Let me pull up your account. I can see the charges. Before we process anything, I wanted to let you know we have a discounted plan at twelve ninety-nine that a lot of our members love—',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'No. Stop. I don\'t want a discounted plan. I haven\'t used the service once. Not once. I want it cancelled and I want my ninety dollars back.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I understand, Rosa. What I can do right now is cancel your account immediately and refund the most recent charge. For the other two months, I\'d need to submit a request to our billing department and that takes five to seven business days.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Five to seven days. After I already waited forty-five minutes. So you\'re telling me I\'ll spend another week waiting for money you took from me without my knowledge. Do you understand how that sounds?',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I know that\'s not ideal, and I wish I had more authority here. But that is the process for multi-month refunds. I promise the request will be submitted before this call ends.',
        turnNumber: 6,
      },
    ],
    tags: ['subscription', 'dark-pattern', 'retention', 'refund', 'autonomy', 'phone-runaround'],
  },

  // =========================================================================
  // SUB-TYPE 2: SCOPE CREEP
  // =========================================================================

  {
    id: 'txn-004',
    category: 'transactional',
    title: 'The Logo That Became a Brand',
    description: 'A freelance graphic designer was hired to create a logo for $800. The client has since asked for business cards, a letterhead, social media templates, and "a few website mockups" — all under the original agreement. The designer finally pushes back.',
    personA: {
      name: 'Yuki',
      role: 'freelancer',
      backstory: 'Yuki is 31, a freelance graphic designer two years into running her own studio. She\'s good at design and terrible at boundaries. She\'s been doing extra work for this client for three weeks without charging because she was afraid of losing the relationship. She\'s now 40 hours past the original scope.',
      emotionalState: 'Resentful but afraid of confrontation',
      communicationPattern: 'softens everything — "I was just wondering if maybe..." when she means "This is unacceptable"',
    },
    personB: {
      name: 'Derek',
      role: 'client',
      backstory: 'Derek is 44, launching his first business — a craft brewery. He genuinely doesn\'t understand the difference between "a logo" and "a brand identity." To him, it\'s all one thing. He\'s not malicious — he\'s ignorant of creative industry norms and thinks $800 is a lot of money.',
      emotionalState: 'Confused and a little offended',
      communicationPattern: 'uses flattery as currency — "You\'re so talented, this will be quick for you"',
    },
    trigger: 'Derek asked Yuki to "throw together" three website homepage concepts. She sent him a revised scope and quote for the additional work. He called her, surprised.',
    plantedPatterns: [
      'IBR: Derek\'s position is "this is all part of the logo project"; his interest is getting his business launched affordably. Yuki\'s position is "this is out of scope"; her interest is being fairly compensated and respected as a professional.',
      'SCARF: Yuki\'s Status is threatened — being asked to work for free devalues her expertise. Derek feels a Fairness threat when he sees an unexpected invoice because he thought they had an agreement.',
      'TKI: Yuki has been accommodating for weeks and is now abruptly shifting to competing. Derek is genuinely trying to collaborate but doesn\'t realize the power imbalance.',
      'NVC: Yuki\'s need for recognition and fair exchange goes unspoken behind soft language. Derek\'s need for certainty about costs goes unmet because he never asked.',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Hey Yuki, I got your email about the additional charges. I\'m a little confused — I thought the website mockups were part of what we discussed? You said you\'d help me launch my brand.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'I said I\'d design your logo, Derek. The business cards and social templates I did as a courtesy because I wanted to help. But website mockups are a completely different project. That\'s forty to sixty hours of work.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'Forty to sixty hours? For three page concepts? I\'m not asking for a finished website. Just some ideas for how it would look. You\'re so talented — I figured it would be quick for you.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'That\'s... Derek, that\'s not how design works. Quick for me still means hours of layout, typography, image sourcing. My rate is sixty-five dollars an hour. The business cards and letterhead alone were probably another twelve hundred dollars in unbilled work.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Twelve hundred? I paid you eight hundred for the logo and now you\'re saying I owe another twelve hundred? That was never communicated. I feel like I\'m being nickeled and dimed here.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'You\'re not being nickeled and dimed. I\'m the one who did fifteen hundred dollars in free work and didn\'t say anything because I didn\'t want to make things awkward. That\'s on me. But I can\'t keep going like this.',
        turnNumber: 6,
      },
    ],
    tags: ['freelance', 'scope-creep', 'boundaries', 'pricing', 'flattery', 'creative-work'],
  },

  {
    id: 'txn-005',
    category: 'transactional',
    title: 'The Moving Target',
    description: 'A web developer is building an e-commerce site for a client who keeps changing the requirements mid-sprint. The project is three weeks overdue, the developer is losing money, and the client blames the delays on the developer\'s "lack of planning."',
    personA: {
      name: 'Sam',
      role: 'developer',
      backstory: 'Sam is 38, a solo web developer who took on this $12,000 fixed-price project four months ago. The original spec was clear, but the client has submitted 23 change requests — some contradicting earlier ones. Sam is now underwater by at least 80 hours and has turned down two other projects to finish this one.',
      emotionalState: 'Burned out and bitter',
      communicationPattern: 'passive-aggressive precision — cc\'s everything, timestamps requests, quotes contracts',
    },
    personB: {
      name: 'Patricia',
      role: 'client',
      backstory: 'Patricia is 50, owns a boutique skincare line and this is her first custom website. She doesn\'t understand development timelines and assumes changes are easy because "it\'s just a website." She\'s been getting input from her business partner, her daughter, and a marketing consultant — all with different opinions.',
      emotionalState: 'Frustrated by delays, feels unheard',
      communicationPattern: 'appeals to outcome — "I just need it to look right" without understanding the cost of "right"',
    },
    trigger: 'Patricia emailed Sam asking him to change the checkout flow for the fourth time. Sam replied with a formal change order and additional billing notice. Patricia called him, upset.',
    plantedPatterns: [
      'IBR: Patricia\'s position is "just make it right"; her interest is a website she feels proud to share. Sam\'s position is "stop changing things"; his interest is being compensated for his time and finishing the project.',
      'CBT: Patricia exhibits "should" statements ("A good developer should be able to handle changes"). Sam exhibits all-or-nothing thinking ("This project is a complete disaster").',
      'SCARF: Sam\'s Fairness domain is screaming — he agreed to a scope and the scope has tripled. Patricia\'s Certainty is threatened — she doesn\'t know when her site will launch.',
      'TKI: Sam has moved from collaborating to competing (formal change orders). Patricia alternates between competing ("just do it") and avoiding (ignoring the cost implications).',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Sam, I don\'t understand why changing the checkout flow is a big deal. It\'s four buttons and a form. My daughter said Shopify stores do this in an afternoon.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Patricia, this is the fourth time the checkout flow has been revised. Each change requires rebuilding the payment integration, updating the database schema, and re-testing. That\'s not an afternoon — it\'s a week.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'But that\'s because you built it wrong the first three times. If the foundation was solid, changes would be easy. I\'m starting to wonder if this project was scoped correctly.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'I built it to the exact spec you signed off on. I have your approval emails for all three previous versions. You changed your mind — that\'s fine — but changes have costs. That\'s what the change order is for.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'I\'m paying you twelve thousand dollars. For twelve thousand dollars, I expect a working website that I\'m happy with. Not a stack of invoices every time I have feedback.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'At the current scope, this is a twenty-two thousand dollar project. I\'ve absorbed ten thousand in overages because I wanted to maintain the relationship. But I can\'t keep absorbing your indecision as my loss.',
        turnNumber: 6,
      },
    ],
    tags: ['development', 'scope-creep', 'fixed-price', 'change-orders', 'overwork', 'specification'],
  },

  {
    id: 'txn-006',
    category: 'transactional',
    title: 'One More Thing',
    description: 'An interior painter finishes a three-room job and the homeowner keeps finding "just one more thing" — touch-ups, an accent wall that wasn\'t in the quote, the hallway "while you\'re here." The painter is trying to leave for his next job.',
    personA: {
      name: 'Marco',
      role: 'painter',
      backstory: 'Marco is 35, runs a two-person painting crew. He quoted this job at $2,400 for three bedrooms and completed it in two days. The homeowner has been adding tasks all day and Marco has already missed his window to start the next client\'s job. He loses $800 for every day he\'s delayed.',
      emotionalState: 'Anxious about his schedule and income, trying to stay polite',
      communicationPattern: 'hints rather than states — "I really should be heading out" instead of "No"',
    },
    personB: {
      name: 'Helen',
      role: 'homeowner',
      backstory: 'Helen is 62, recently widowed, and having the house painted was her late husband\'s project that never happened. She doesn\'t quite realize she\'s adding scope — to her, these are small things that a "good" tradesman would just take care of. She\'s also lonely and Marco is the only person who\'s been in her house all week.',
      emotionalState: 'Hopeful and slightly desperate for help',
      communicationPattern: 'couches demands as small favors — "Would you mind terribly..." and "Since you\'re already here..."',
    },
    trigger: 'Marco finished the third bedroom and started packing his equipment. Helen appeared with a can of accent paint and asked about "just the one wall in the living room."',
    plantedPatterns: [
      'IBR: Helen\'s position is "just one more wall"; her interest is getting her house in order and having someone capable to help. Marco\'s position is "the job is done"; his interest is financial stability and honoring his next commitment.',
      'SCARF: Marco\'s Autonomy is being eroded with each additional request. Helen\'s Relatedness need (loneliness, wanting connection with someone in the house) is the hidden driver.',
      'NVC: Helen never directly expresses her needs — everything is framed as small, easy, no-big-deal. Marco\'s need to leave is expressed as hints, not requests.',
      'CBT: Helen minimizes ("It\'ll only take twenty minutes") — the minimization distortion. Marco catastrophizes about the next client\'s reaction.',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Oh Marco, before you pack up — would you mind terribly doing just the accent wall in the living room? I bought this beautiful sage green. It\'s just the one wall. Twenty minutes, tops.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Helen, that accent wall wasn\'t in the quote. And honestly, I\'m already running behind for my next job. I was supposed to be there at noon.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'Oh, I understand. It\'s just — my husband always said he\'d paint that wall. He picked the color and everything. Since you\'re already here with all your supplies...',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: '...Helen, I\'m sorry about your husband. I really am. But an accent wall with proper taping and two coats — that\'s not twenty minutes. That\'s two to three hours. And I\'d need to charge for it.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Charge? Oh. I thought... well, I suppose I thought since I\'m already paying twenty-four hundred, a little extra wouldn\'t be — I don\'t want to be difficult. It\'s just, I don\'t know who else to call.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'You\'re not being difficult. But I have another family waiting for me. I can come back on Saturday and do the accent wall for three-fifty. Would that work?',
        turnNumber: 6,
      },
    ],
    tags: ['scope-creep', 'painting', 'loneliness', 'favors', 'scheduling', 'boundary-setting'],
  },

  // =========================================================================
  // SUB-TYPE 3: PAYMENT DISPUTES
  // =========================================================================

  {
    id: 'txn-007',
    category: 'transactional',
    title: 'Net-30 Turns Into Net-Never',
    description: 'A small catering company completed a corporate event six weeks ago. The invoice was due Net-30. The client\'s accounts payable keeps sending the same email: "processing." The caterer needs the money to pay her own suppliers.',
    personA: {
      name: 'Janine',
      role: 'vendor',
      backstory: 'Janine is 39, runs a five-person catering company. She fronted $3,800 in food costs for this event and the $8,500 invoice is now two weeks overdue. Her fish supplier is threatening to cut off her account. She can\'t float another week.',
      emotionalState: 'Desperate and angry, masking as professional',
      communicationPattern: 'oscillates between overly polite follow-ups and threats she can\'t afford to execute',
    },
    personB: {
      name: 'Warren',
      role: 'client_contact',
      backstory: 'Warren is 46, the office manager at a mid-size tech company. He loved the catering and wants to use Janine again. But his company\'s new CFO implemented a 60-day payment cycle and Warren has zero authority to override it. He\'s embarrassed but also not the one writing the checks.',
      emotionalState: 'Embarrassed and powerless',
      communicationPattern: 'vague reassurances — "I\'m working on it" while doing very little because he can\'t',
    },
    trigger: 'Janine called Warren directly after three emails to accounts payable went unanswered. Warren picked up and sighed.',
    plantedPatterns: [
      'IBR: Janine\'s position is "pay me now"; her interest is business survival and supplier relationships. Warren\'s position is "I can\'t override the system"; his interest is maintaining the vendor relationship without getting in trouble with his CFO.',
      'SCARF: Janine\'s Certainty is destroyed — she can\'t plan her business without knowing when payment arrives. Warren\'s Status is threatened — he looks incompetent to a vendor he respects.',
      'TKI: Warren is avoiding (vague updates, unreturned emails). Janine is competing (escalating pressure). Neither is collaborating to find a workaround.',
      'NVC: Janine\'s observations ("The invoice is overdue") are accurate but her evaluations ("You people don\'t respect small businesses") poison the well.',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Warren, this is Janine from Bloom Catering. The invoice was due two weeks ago. I\'ve sent three emails. Nobody has responded. I need to know when I\'m getting paid.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Janine, hi. I know, and I\'m sorry. We had a change in our finance team and everything got backed up. I\'ve flagged your invoice as priority. It\'s in the queue.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You said that last week. "In the queue." Warren, I fronted four thousand dollars for your event. My fish supplier is about to cut me off. I don\'t have the luxury of being in a queue.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I understand the urgency. Honestly, our new CFO moved everyone to sixty-day payment cycles and I don\'t have the authority to expedite it. I\'ve been trying to get an exception.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Sixty days? That wasn\'t the agreement. Our contract says Net-30. If your CFO wants to change terms, that\'s a conversation you have BEFORE the event, not after you\'ve eaten the food.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'You\'re right. I know you\'re right. Let me try going directly to the CFO tomorrow. I can\'t promise anything, but I\'ll try.',
        turnNumber: 6,
      },
    ],
    tags: ['late-payment', 'small-business', 'corporate', 'cash-flow', 'net-30', 'powerless-contact'],
  },

  {
    id: 'txn-008',
    category: 'transactional',
    title: 'The Check Is In The Mail',
    description: 'A freelance photographer delivered wedding photos three months ago. The couple keeps promising payment but the excuses keep changing — mail problems, bank issues, family emergency, "next Friday for sure." The photographer suspects they simply don\'t intend to pay.',
    personA: {
      name: 'Lena',
      role: 'photographer',
      backstory: 'Lena is 29, a freelance wedding photographer. She delivered 450 edited photos and a highlight album to this couple ten weeks ago. The agreed price was $3,200, half paid upfront. The remaining $1,600 has been promised six times. She\'s a one-person business and this amount is her rent.',
      emotionalState: 'Betrayed and questioning her own judgment',
      communicationPattern: 'starts gentle, gets more direct with each broken promise, now passive-aggressive',
    },
    personB: {
      name: 'Chad',
      role: 'client',
      backstory: 'Chad is 33, recently married. The wedding went over budget by $8,000 and he and his wife are drowning in credit card debt. He genuinely intends to pay Lena but keeps prioritizing other debts. He feels ashamed every time she contacts him and deals with it by avoiding.',
      emotionalState: 'Ashamed and avoidant',
      communicationPattern: 'makes promises he can\'t keep to end the uncomfortable conversation',
    },
    trigger: 'Lena texted Chad after the sixth missed payment deadline. He responded with "Next Friday for sure. Really sorry."',
    plantedPatterns: [
      'IBR: Lena\'s position is "pay me the $1,600"; her interest is financial survival and professional dignity. Chad\'s position is "I\'ll pay next week"; his interest is managing overwhelming debt without losing face.',
      'CBT: Lena exhibits fortune-telling ("They\'re never going to pay") and labeling ("They\'re scammers"). Chad exhibits emotional reasoning ("I feel terrible about this therefore I must avoid it").',
      'SCARF: Lena\'s Fairness alarm is constant — she delivered, they haven\'t. Chad\'s Status is threatened every time Lena contacts him because it reminds him of his financial failure.',
      'TKI: Chad is pure avoiding mode — every promise is a delay tactic. Lena has been accommodating but is shifting to competing.',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Chad, this is the sixth time. You said "next Friday" three Fridays ago. I delivered your wedding photos ten weeks ago. When am I getting the sixteen hundred dollars you owe me?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Lena, I\'m really sorry. Things have been insane with work and the move. I\'m getting a bonus at the end of the month and I\'ll have it for you then. I promise.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'You promised last month too. And the month before. I have texts from you saying "this Friday" on three different Fridays. This is my rent, Chad. I\'m not a credit card you can make minimum payments on.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I know. You\'re right and I feel terrible about it. The wedding just went way over budget and we\'re trying to dig out. Can I do half now and half in two weeks?',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'You said "half now" in your last text and then didn\'t send anything. At this point I need the full amount or I\'m going to have to send this to collections. I don\'t want to do that, but I can\'t keep accepting promises.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: '...Collections? Come on, Lena. We loved your work. We recommended you to three friends. Let me just figure this out. Give me until Friday.',
        turnNumber: 6,
      },
    ],
    tags: ['non-payment', 'wedding', 'freelance', 'broken-promises', 'avoidance', 'collections'],
  },

  {
    id: 'txn-009',
    category: 'transactional',
    title: 'The Invoice They Already Approved',
    description: 'A marketing consultant delivered a strategy document and the client signed off on it. Now the client is disputing the invoice, claiming the deliverable "wasn\'t what they expected" despite written approval at every checkpoint.',
    personA: {
      name: 'Diane',
      role: 'consultant',
      backstory: 'Diane is 43, an independent marketing consultant with 15 years of experience. She delivered a 40-page go-to-market strategy after three months of work including market research, competitor analysis, and stakeholder interviews. The client approved each phase in writing. Now they want to pay half.',
      emotionalState: 'Outraged and questioning the client\'s integrity',
      communicationPattern: 'clinical and documented — responds with timestamps, signed-off milestones, and contract language',
    },
    personB: {
      name: 'Greg',
      role: 'client',
      backstory: 'Greg is 48, VP of Sales at a mid-size SaaS company. He hired Diane on his own authority. His CEO reviewed the final strategy and called it "generic." Now Greg is under pressure to reduce the cost. He knows the work was solid but he\'s in self-preservation mode.',
      emotionalState: 'Cornered between his CEO and his vendor',
      communicationPattern: 'vague dissatisfaction — can\'t articulate specific complaints because there aren\'t real ones',
    },
    trigger: 'Greg emailed Diane saying his team "had concerns" about the deliverable quality and proposed paying 50% of the agreed $18,000 fee.',
    plantedPatterns: [
      'IBR: Greg\'s position is "the work wasn\'t up to standard"; his real interest is appeasing his CEO and keeping his job. Diane\'s position is "pay the full invoice"; her interest is professional respect and financial fairness.',
      'SCARF: Diane\'s Status is under attack — her professional competence is being questioned. Greg\'s Certainty is threatened — he doesn\'t know if his CEO will back him.',
      'CBT: Greg uses vague labeling ("concerns" and "not what we expected") because he can\'t substantiate specific deficiencies. Diane exhibits mind-reading ("He\'s trying to get free work").',
      'NVC: Greg never expresses his actual need (cover from CEO). Diane\'s need for acknowledgment of quality work is trampled.',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Diane, I wanted to talk about the final deliverable. My team has reviewed it and we have some concerns. We feel like it didn\'t quite hit the mark for what we were expecting at this price point.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Greg, you signed off on the research phase, the competitive analysis, and the draft strategy. I have emails at each checkpoint where you wrote "looks great, proceed." What specifically isn\'t meeting expectations?',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'I know I approved the phases. But the final product, when we looked at it holistically... it feels a bit generic. Not as tailored as we were hoping. Some of the recommendations could apply to any SaaS company.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'Every recommendation references your specific market segment, your customer data, and the stakeholder interviews I conducted with your team. I can walk you through page by page if you\'d like. But "feels generic" isn\'t actionable feedback, Greg.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Look, I\'m not trying to devalue your work. I\'m just saying that at eighteen thousand dollars, we expected something more... impactful. What if we settled at nine and parted ways amicably?',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'You want to pay half for completed, approved work because someone on your team used the word "generic"? I delivered every milestone on time, with your written approval. This isn\'t a negotiation — this is a contract.',
        turnNumber: 6,
      },
    ],
    tags: ['invoice-dispute', 'consulting', 'post-delivery', 'buyer-remorse', 'documentation', 'bad-faith'],
  },

  // =========================================================================
  // SUB-TYPE 4: CONTRACT MISUNDERSTANDINGS
  // =========================================================================

  {
    id: 'txn-010',
    category: 'transactional',
    title: 'The Handshake Deal',
    description: 'Two acquaintances agreed to a car sale over beers. The buyer paid $4,500 cash. Two weeks later the transmission failed. The seller says "as-is." The buyer says the seller knew about the problem. Nothing was written down.',
    personA: {
      name: 'Tyler',
      role: 'buyer',
      backstory: 'Tyler is 26, a warehouse worker who needed a reliable car to get to his night shift. He bought a 2017 Honda Civic from his friend\'s coworker for $4,500 cash. He asked if there were any problems and was told "runs great." Fourteen days later, the transmission started slipping. A mechanic quoted $2,800 to replace it.',
      emotionalState: 'Panicked and furious — this was his emergency fund',
      communicationPattern: 'appeals to morality — "You knew and you lied to me"',
    },
    personB: {
      name: 'Ray',
      role: 'seller',
      backstory: 'Ray is 34, sold the car because he noticed the transmission hesitating and wanted to get rid of it before it got worse. He didn\'t technically lie — the car did run — but he omitted what he suspected. He tells himself "buyer beware" but guilt is creeping in.',
      emotionalState: 'Guilty underneath, defiant on the surface',
      communicationPattern: 'retreats to legal technicalities — "as-is" and "you should have gotten it inspected"',
    },
    trigger: 'Tyler called Ray after the mechanic\'s diagnosis and demanded he pay for the repair or take the car back. Ray said the sale was final.',
    plantedPatterns: [
      'IBR: Tyler\'s position is "pay for the repair"; his interest is having reliable transportation to keep his job. Ray\'s position is "as-is sale"; his interest is not losing $2,800 from a car he already sold, but also not being seen as a cheat.',
      'CBT: Ray uses rationalization ("Every used car has issues") and minimization ("The transmission was fine when I had it"). Tyler uses emotional reasoning ("I feel cheated, therefore I was cheated").',
      'SCARF: Ray\'s Status is threatened — being called a liar/cheat. Tyler\'s Fairness alarm is screaming — he paid fair price for what he was told was a good car.',
      'NVC: both are evaluating ("You scammed me" / "You should have been more careful") instead of observing facts and expressing needs',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'The transmission is shot. The mechanic said it\'s been going for months. You knew about this, Ray. You dumped a broken car on me.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Whoa, hold on. That car ran fine when I drove it. I sold it as-is. You could\'ve taken it to a mechanic before you bought it. That\'s on you.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'I asked you — I literally asked you — "anything wrong with it?" and you said "runs great." Those were your exact words. You didn\'t mention the transmission at all.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'It did run great. I drove it every day. Transmissions can go at any time on a car that age. I didn\'t know it was going to fail two weeks later. I\'m not a mechanic.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Forty-five hundred dollars. That\'s my emergency fund. I need this car to get to work. If I lose my job because I can\'t get there, that\'s on your conscience. You owe me either the repair or the money back.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I don\'t owe you anything legally. But look — I\'m not a bad guy. I just can\'t eat twenty-eight hundred dollars because your car broke after the sale.',
        turnNumber: 6,
      },
    ],
    tags: ['verbal-agreement', 'car-sale', 'as-is', 'omission', 'cash-deal', 'moral-obligation'],
  },

  {
    id: 'txn-011',
    category: 'transactional',
    title: 'What The Warranty Covers',
    description: 'A customer\'s dishwasher broke after eight months. The manufacturer says the specific part isn\'t covered under warranty. The customer says the warranty document is deliberately vague to avoid covering anything useful.',
    personA: {
      name: 'Meredith',
      role: 'customer',
      backstory: 'Meredith is 55, bought a $900 dishwasher eight months ago. The control board failed. The manufacturer says the control board is classified as an "electronic component" which is only covered for 6 months, while the "mechanical warranty" runs 2 years. She didn\'t read the fine print and is furious that these are separate categories.',
      emotionalState: 'Incredulous and feeling conned',
      communicationPattern: 'demands escalation — "Let me speak to your supervisor" as default mode',
    },
    personB: {
      name: 'Luis',
      role: 'warranty_representative',
      backstory: 'Luis is 30, works in the warranty claims department. He\'s handled this exact complaint hundreds of times and agrees the warranty structure is confusing, but he can\'t say that. His options are limited to what the system allows: deny claim, offer discounted repair, or escalate to a manager who will also deny the claim.',
      emotionalState: 'Empathetic but handcuffed by policy',
      communicationPattern: 'robotic empathy — trained phrases that sound caring but commit to nothing',
    },
    trigger: 'Meredith called the warranty line after a repair technician told her the control board wasn\'t covered. Luis is the second person she\'s spoken to.',
    plantedPatterns: [
      'IBR: Meredith\'s position is "fix it for free"; her interest is a working dishwasher and feeling she got what she paid for. Luis\'s position is "it\'s not covered"; his interest is doing his job without getting flagged for unauthorized exceptions.',
      'SCARF: Meredith\'s Fairness is outraged — she paid $900 eight months ago and the warranty won\'t cover the repair. Luis\'s Autonomy is zero — he literally cannot override the system.',
      'CBT: Meredith exhibits all-or-nothing thinking ("This warranty covers nothing"). Luis has learned helplessness ("There\'s nothing I can do").',
      'TKI: Meredith competing (demands, escalation). Luis accommodating on the surface (empathy language) while actually avoiding (won\'t commit to any action).',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Let me get this straight. I paid nine hundred dollars for this dishwasher eight months ago. The control board died. And your warranty doesn\'t cover it because electronics have a different timeline than mechanical parts. How is that not a scam?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I completely understand your frustration, Meredith. The warranty does differentiate between mechanical components, which are covered for twenty-four months, and electronic components, which have a six-month coverage window. I know that distinction can be confusing.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Confusing? It\'s buried in page fourteen of a forty-page booklet in six-point font. Nobody reads that. You designed it so nobody reads it. What CAN you do for me?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'What I can offer is a discounted repair through our certified network. The control board replacement would be three hundred and twenty dollars instead of four-eighty, which includes parts and labor.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Three hundred and twenty dollars on top of the nine hundred I already paid for a dishwasher that lasted eight months. I want to speak to a supervisor. Someone with actual authority to make this right.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I can transfer you to my team lead. But I want to be transparent — the coverage terms are the same regardless of who you speak with. I don\'t want you to wait on hold again and hear the same thing.',
        turnNumber: 6,
      },
    ],
    tags: ['warranty', 'fine-print', 'appliance', 'escalation', 'policy', 'consumer-rights'],
  },

  {
    id: 'txn-012',
    category: 'transactional',
    title: 'The Event Space Cancellation',
    description: 'A couple booked a venue for their engagement party and needs to cancel due to a family medical emergency. The venue\'s terms say no refunds within 30 days. The couple argues the terms are unconscionable given the circumstances. The venue owner argues she turned away other bookings.',
    personA: {
      name: 'Amara',
      role: 'customer',
      backstory: 'Amara is 30, put down a $2,000 deposit on an event space for her engagement party. A week before the event, her fiance\'s mother had a stroke and is in the ICU. They need to cancel. The deposit is money they saved from their wedding fund. She understands the policy but is asking for compassion.',
      emotionalState: 'Grieving, stressed, pleading',
      communicationPattern: 'emotional appeals — shares personal details hoping empathy will override policy',
    },
    personB: {
      name: 'Joan',
      role: 'venue_owner',
      backstory: 'Joan is 58, owns and operates the event space solo. She turned down two other bookings for that date when Amara reserved it. If she refunds the deposit, she eats the lost revenue because it\'s too late to rebook. She\'s been burned before by sob stories that turned out to be lies. She\'s not heartless — she\'s a small business owner who can\'t afford to absorb this.',
      emotionalState: 'Sympathetic but firm, protecting her livelihood',
      communicationPattern: 'businesslike with measured sympathy — keeps redirecting to the signed agreement',
    },
    trigger: 'Amara called Joan five days before the event to cancel and request a full deposit refund. Joan said she\'d review the contract.',
    plantedPatterns: [
      'IBR: Amara\'s position is "full refund"; her interest is financial relief during a family crisis. Joan\'s position is "no refund per terms"; her interest is not losing income she counted on, and not setting a precedent that every cancellation gets a refund.',
      'SCARF: Amara\'s Fairness sense says the policy is cruel given the circumstances. Joan\'s Certainty depends on contracts meaning what they say.',
      'NVC: Amara observes the medical emergency but evaluates Joan as "putting money over people." Joan observes the contract terms but evaluates Amara as potentially dishonest ("I\'ve heard every excuse").',
      'TKI: Amara is competing with emotional leverage. Joan is competing with contractual leverage. The compromise zone (partial refund, future credit) hasn\'t been explored.',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Joan, I know the contract says no refunds within thirty days. But my fiance\'s mother had a stroke. She\'s in the ICU. We can\'t have an engagement party right now. Please — is there anything you can do?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Amara, I\'m very sorry about your fiance\'s mother. That\'s terrible. But the thirty-day policy exists because when you booked, I turned away other clients for that date. I can\'t fill a Saturday with five days\' notice.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'I understand that. I do. But two thousand dollars — that\'s from our wedding fund. We\'re not cancelling because we changed our minds. Someone is in the hospital. There has to be an exception for something like this.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I hear you, and I wish I could help. But I\'m a one-woman operation. If I refund every cancellation with a hardship story, I close in six months. I\'ve been in this situation before and I can\'t afford the precedent.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'A precedent? This isn\'t a precedent — this is a human being in the ICU. I can send you the hospital records. I\'m not making this up. How can you keep two thousand dollars from a couple dealing with this?',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I believe you, Amara. I do. But believing you and being able to absorb the financial loss are two different things. That deposit covers costs I\'ve already incurred.',
        turnNumber: 6,
      },
    ],
    tags: ['cancellation', 'deposit', 'medical-emergency', 'contract', 'compassion-vs-policy', 'small-business'],
  },

  // =========================================================================
  // SUB-TYPE 5: NEIGHBOR BOUNDARY ISSUES
  // =========================================================================

  {
    id: 'txn-013',
    category: 'transactional',
    title: 'The Band Practices Until Midnight',
    description: 'A neighbor\'s teenage son has a band that practices in the garage three nights a week until midnight. The affected neighbor works early mornings and has asked politely twice. Now she\'s past polite.',
    personA: {
      name: 'Andrea',
      role: 'neighbor',
      backstory: 'Andrea is 43, a surgical nurse who starts shifts at 5:30 AM. She moved to this quiet cul-de-sac specifically because it was quiet. For the past two months, the neighbor\'s garage band has been practicing Tuesday, Thursday, and Saturday from 8 PM to midnight. She\'s asked twice through text. Both times she got "sorry, we\'ll keep it down" — and nothing changed.',
      emotionalState: 'Sleep-deprived and simmering',
      communicationPattern: 'escalation ladder — started polite, now invoking ordinances and HOA',
    },
    personB: {
      name: 'Doug',
      role: 'neighbor',
      backstory: 'Doug is 49, a divorced dad whose 17-year-old son\'s band is the one thing keeping the kid off his phone and out of trouble. The garage is insulated and he thinks Andrea is exaggerating. He spent $1,200 on soundproofing last year and feels like he\'s already accommodated enough.',
      emotionalState: 'Defensive about his son and resentful of being policed',
      communicationPattern: 'minimizes the problem and reframes complaints as unreasonable',
    },
    trigger: 'Andrea rang Doug\'s doorbell at 11:15 PM on a Tuesday after the third unanswered text. Doug opened the door annoyed.',
    plantedPatterns: [
      'IBR: Andrea\'s position is "stop the noise after 10"; her interest is consistent sleep so she can perform surgery safely. Doug\'s position is "I already soundproofed"; his interest is his son\'s wellbeing and not being told how to parent in his own home.',
      'SCARF: Andrea\'s Autonomy over her own sleep is being violated. Doug feels a Status threat — being told what his kid can and can\'t do by a neighbor.',
      'CBT: Doug minimizes ("It\'s not that loud") and Andrea catastrophizes ("I\'m going to make a mistake in the OR because of this"). Both contain kernels of truth distorted by emotion.',
      'NVC: Andrea leads with evaluation ("You clearly don\'t care about anyone else on this street") instead of observation and need. Doug responds with defensiveness instead of empathy.',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Doug, it\'s eleven-fifteen. I texted you three times tonight. I have surgery at six AM. This cannot keep happening.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Andrea, I spent twelve hundred dollars soundproofing that garage. It\'s not even that loud anymore. The noise ordinance says ten o\'clock and we\'re barely over that.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Barely over? It\'s eleven-fifteen. That\'s an hour and fifteen minutes past the ordinance. And your soundproofing didn\'t work — I can hear the bass through my bedroom wall. I work with scalpels, Doug. I need to sleep.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'My kid has been through a rough year. This band is the best thing in his life right now. I\'m not going to shut that down because you think the bass is too loud. Buy some earplugs.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Buy earplugs? I shouldn\'t have to wear earplugs in my own bedroom because you can\'t enforce a reasonable cutoff for your son. If this happens again, I\'m filing a noise complaint with the city.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'File whatever you want. I\'m not going to be the neighbor who crushes a seventeen-year-old\'s passion because the lady next door is being unreasonable.',
        turnNumber: 6,
      },
    ],
    tags: ['noise', 'neighbors', 'sleep', 'teenagers', 'ordinance', 'escalation'],
  },

  {
    id: 'txn-014',
    category: 'transactional',
    title: 'The Fence That Moved',
    description: 'A neighbor installed a new fence and the adjacent property owner claims it\'s six inches onto her land. A survey was done years ago but neither party can find the pins. What starts as a property line dispute becomes a proxy war for years of accumulated resentment.',
    personA: {
      name: 'Carol',
      role: 'neighbor',
      backstory: 'Carol is 67, a retired teacher who has lived in her house for 31 years. She knows exactly where the property line is because she watched the original survey in 1994. She\'s watched her neighbor\'s new fence encroach six inches into her yard, cutting off a strip of her garden bed that she\'s maintained for decades.',
      emotionalState: 'Territorial and indignant',
      communicationPattern: 'historical authority — "I\'ve been here thirty-one years" as proof of rightness',
    },
    personB: {
      name: 'Keith',
      role: 'neighbor',
      backstory: 'Keith is 42, bought his house three years ago. He hired a licensed fencing company that used the existing post holes from the old fence as markers. He paid $6,800 for the fence and genuinely believes it\'s on his property. He thinks Carol is a difficult neighbor looking for a fight.',
      emotionalState: 'Irritated and dismissive',
      communicationPattern: 'appeals to credentials — "I hired professionals, not some guy off Craigslist"',
    },
    trigger: 'Carol knocked on Keith\'s door with a hand-drawn diagram showing where she believes the property line is, demanding the fence be moved.',
    plantedPatterns: [
      'IBR: Carol\'s position is "move the fence"; her interest is maintaining the garden she\'s tended for three decades and her sense of territorial integrity. Keith\'s position is "the fence is correct"; his interest is not wasting $6,800 and not being told what to do by a neighbor he finds overbearing.',
      'SCARF: Carol\'s Status is tied to tenure — she was here first. Keith\'s Fairness is triggered — he paid professionals and did due diligence.',
      'CBT: Carol exhibits emotional reasoning ("I feel violated, so the fence must be wrong"). Keith uses appeal to authority ("Professionals did it, so it must be right") — neither proves the actual property line.',
      'TKI: both are in pure competing mode. Neither has suggested the obvious collaborative solution: split the cost of a new survey.',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Keith, your fence is on my property. I\'ve drawn a diagram from memory — the original survey pins were right there, by the oak tree. Your fence is six inches past them into my garden bed.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Carol, I hired a licensed fencing company. They used the existing post holes from the old fence. If the old fence was in the right place, so is this one.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'The old fence was wrong too. Howard — the previous owner — put that fence up himself and he never checked the line. I told him it was off and he didn\'t care. Now you\'re compounding his mistake.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'So you knew the old fence was wrong for however many years and never got a survey? And now that I\'ve spent seven thousand dollars, you want me to move it based on your memory from 1994?',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I\'ve lived here for thirty-one years. I watched them drive those pins into the ground. My memory is not the issue. Your fence company\'s laziness is the issue.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Then get a survey. If it shows the fence is on your property, we\'ll talk. But I\'m not moving a seven-thousand-dollar fence because you drew a picture on a napkin.',
        turnNumber: 6,
      },
    ],
    tags: ['property-line', 'fence', 'survey', 'tenure', 'neighbors', 'territorial'],
  },

  {
    id: 'txn-015',
    category: 'transactional',
    title: 'The Shared Driveway Standoff',
    description: 'Two neighbors share a driveway easement. One keeps parking their work truck in a way that blocks the other from pulling in. What sounds like a parking dispute is actually about respect, class tension, and whose lifestyle gets to take up space.',
    personA: {
      name: 'Nina',
      role: 'neighbor',
      backstory: 'Nina is 38, a graphic designer who works from home. She drives a compact car and uses the shared driveway twice a day. For the past four months, her neighbor has been parking his landscaping truck and trailer in the driveway, forcing her to back out onto a blind curve. She nearly hit a jogger last week.',
      emotionalState: 'Anxious and increasingly resentful',
      communicationPattern: 'builds a safety case — "Someone is going to get hurt" as her rhetorical anchor',
    },
    personB: {
      name: 'Leo',
      role: 'neighbor',
      backstory: 'Leo is 45, owns a landscaping business. The work truck and trailer are his livelihood — he loads them at 5 AM and returns at 7 PM. He can\'t afford off-site storage and the street has a 72-hour parking restriction. He sees Nina\'s complaints as privileged — she works from home and barely uses the driveway.',
      emotionalState: 'Disrespected and class-conscious',
      communicationPattern: 'frames everything as blue-collar vs white-collar — "Some of us work with our hands"',
    },
    trigger: 'Nina nearly backed into a cyclist because the trailer blocked her sightline. She walked over to Leo\'s house that evening.',
    plantedPatterns: [
      'IBR: Nina\'s position is "move your truck"; her interest is safe ingress/egress. Leo\'s position is "I have a right to park here"; his interest is keeping his business operational without additional expense.',
      'SCARF: Nina\'s Autonomy (free use of shared driveway) and Certainty (safe passage) are threatened. Leo\'s Status is triggered — he hears Nina\'s complaints as judgment of his work and social class.',
      'CBT: Leo personalizes Nina\'s safety concern as a class attack ("You just don\'t like looking at a work truck"). Nina mind-reads Leo\'s intent ("He doesn\'t care if someone gets hurt").',
      'NVC: neither person has stated the need underneath the position. Leo needs affordable equipment storage. Nina needs safe driveway access. These are not mutually exclusive but they\'re arguing as if they are.',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Leo, I almost hit a cyclist today backing out because your trailer completely blocks the sightline. This is a safety issue. Something has to change.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I park on my side. The easement gives us both equal access. If you can\'t see around a trailer, maybe back out slower.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Back out slower? I can\'t see. At all. The trailer is eight feet tall. It\'s parked there from seven PM to five AM every single night. The driveway is supposed to be shared, not monopolized.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'Monopolized. Right. I use this truck to feed my family. I can\'t exactly park a thirty-foot trailer on the street — there\'s a seventy-two-hour limit. You want me to pay for storage so your Prius has a better view? Must be nice to work from home.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'This isn\'t about your job or my job. It\'s about someone getting hit by my car because I can\'t see the sidewalk. If that happens, we\'re both liable. The easement agreement doesn\'t cover commercial vehicles — I checked.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Oh, you checked. So now you\'re a lawyer too. You moved in two years ago and now you want to tell me where I can park my work truck. I\'ve been running this business out of here for a decade.',
        turnNumber: 6,
      },
    ],
    tags: ['shared-driveway', 'easement', 'safety', 'class-tension', 'commercial-vehicle', 'neighbors'],
  },
]
