import type { Scenario } from '../types'

// ---------------------------------------------------------------------------
// FAMILY SCENARIOS — 15 fully authored scenarios across 5 sub-types
//
// Sub-type breakdown (3 each):
//   1. Parent–Adult Child  (family-001 through family-003)
//   2. Siblings            (family-004 through family-006)
//   3. In-Laws             (family-007 through family-009)
//   4. Blended Family      (family-010 through family-012)
//   5. Generational        (family-013 through family-015)
//
// Every scenario plants 2-3 patterns for the evaluation framework to validate.
// The conversation turns are intentionally messy and human — people don't argue
// in clean NVC. That's the whole point of testing the lens stack against reality.
// ---------------------------------------------------------------------------

export const FAMILY_SCENARIOS: Scenario[] = [

  // =========================================================================
  // SUB-TYPE 1: PARENT–ADULT CHILD
  // =========================================================================

  {
    id: 'family-001',
    category: 'family',
    title: 'Holiday Boundary Setting',
    description: 'An adult daughter tells her mother she won\'t be coming home for Christmas this year. The mother interprets this as rejection rather than autonomy.',
    personA: {
      name: 'Diana',
      role: 'adult_child',
      backstory: 'Diana is 32, recently married, and trying to establish traditions with her own family. She has always been the "responsible one" who mediates between family members.',
      emotionalState: 'Guilty but resolute',
      attachmentStyle: 'anxious',
      communicationPattern: 'over-explains to preempt disappointment',
    },
    personB: {
      name: 'Margaret',
      role: 'mother',
      backstory: 'Margaret is 61, widowed three years ago, and Christmas was always her late husband\'s favorite holiday. She hosts every year and sees attendance as love.',
      emotionalState: 'Hurt masking as anger',
      attachmentStyle: 'anxious',
      communicationPattern: 'guilt-inducing through martyrdom',
    },
    trigger: 'Diana called to say she and her husband will spend Christmas with his family this year.',
    plantedPatterns: [
      'Drama Triangle: Margaret shifts from victim ("I\'ll just be alone") to persecutor ("After everything I\'ve done")',
      'Attachment: anxious-anxious dynamic — both fear abandonment but express it differently',
      'Power asymmetry: parent invoking sacrifice history to override adult child\'s autonomy',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'So you\'re telling me you\'re just not coming. After everything. Your father would be devastated.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Mom, that\'s not fair. I\'m not abandoning you — we\'re trying to split holidays between both families. I already told you we\'d come for New Year\'s.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'New Year\'s isn\'t Christmas, Diana. I\'ll just sit here alone looking at your father\'s chair. But that\'s fine. Do what you need to do.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'You always do this. You say "that\'s fine" but you don\'t mean it, and then I feel terrible for weeks. I can\'t keep being responsible for everyone\'s happiness.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'I\'m not trying to make you feel guilty. I\'m telling you how I feel. Am I not allowed to have feelings anymore?',
        turnNumber: 5,
      },
    ],
    tags: ['boundaries', 'guilt', 'grief', 'autonomy', 'holidays', 'martyrdom'],
  },

  {
    id: 'family-002',
    category: 'family',
    title: 'Career Disapproval',
    description: 'A father confronts his son about leaving a stable engineering job to pursue music production. The father\'s concern masks his own unprocessed fear about financial security.',
    personA: {
      name: 'Marcus',
      role: 'adult_child',
      backstory: 'Marcus is 28, quit his software engineering job three months ago to produce music full-time. He has savings for 8 months and two paying clients.',
      emotionalState: 'Defensive but excited',
      communicationPattern: 'minimizes to avoid lectures',
    },
    personB: {
      name: 'Robert',
      role: 'father',
      backstory: 'Robert is 58, worked the same manufacturing job for 30 years until the plant closed. He pivoted to consulting but never recovered financially. He sees stability as the highest virtue.',
      emotionalState: 'Anxious disguised as disappointed',
      attachmentStyle: 'avoidant',
      communicationPattern: 'lectures, uses "life experience" as authority',
    },
    trigger: 'Robert learned from Marcus\'s sister that Marcus quit his engineering job three months ago.',
    plantedPatterns: [
      'Gottman: harsh startup ("You threw away a six-figure career") + criticism framing',
      'Power asymmetry: father leveraging life experience to delegitimize son\'s agency',
      'Narrative: Robert\'s totalizing narrative ("you always take the easy road") collapses Marcus\'s identity',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Your sister told me. Three months ago. You threw away a six-figure career and you couldn\'t even tell me yourself.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'I didn\'t tell you because I knew you\'d react exactly like this. I\'m not throwing anything away — I\'m building something.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'Building what? A pipe dream? I spent 30 years making sure you\'d never have to struggle the way I did, and you throw it away to play with synthesizers.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'I have savings. I have clients. And honestly, I was miserable at that job. You never asked me if I was happy — you just cared that I had a title you could brag about.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'That\'s unfair and you know it. I cared about your future. When the money runs out, don\'t come knocking on my door.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'I wasn\'t going to. But thanks for making it clear where we stand.',
        turnNumber: 6,
      },
    ],
    tags: ['career', 'autonomy', 'approval', 'financial-anxiety', 'generational-trauma'],
  },

  {
    id: 'family-003',
    category: 'family',
    title: 'Caretaking Guilt Trip',
    description: 'An elderly mother pressures her daughter to move closer to help with daily care, implying the daughter is neglectful for living in another city.',
    personA: {
      name: 'Priya',
      role: 'adult_child',
      backstory: 'Priya is 38, lives 400 miles away with her partner and two kids. She calls her mother daily and visits monthly, but can\'t relocate without uprooting her family.',
      emotionalState: 'Overwhelmed and torn',
      attachmentStyle: 'anxious',
      communicationPattern: 'over-functions — tries to solve everything from a distance',
    },
    personB: {
      name: 'Sunita',
      role: 'mother',
      backstory: 'Sunita is 72 and lives alone after her husband\'s passing. She has mobility issues and relies on neighbors. In her culture, children caring for parents is non-negotiable.',
      emotionalState: 'Lonely and frightened about aging',
      communicationPattern: 'indirect — uses health updates as guilt leverage',
    },
    trigger: 'Sunita fell in the kitchen and waited two hours before a neighbor found her. She called Priya from the hospital.',
    plantedPatterns: [
      'Drama Triangle: Sunita as victim, Priya cast as rescuer who\'s failing her duty',
      'Attachment: anxious pursuit — Sunita escalates bids for proximity',
      'Power: cultural expectation weaponized — "In our family, we don\'t abandon our mothers"',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'I lay on that floor for two hours, Priya. Two hours. A stranger found me. Not my daughter.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Mom, I\'m so sorry. That must have been terrifying. I looked into medical alert systems last week — I can have one installed by Friday.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'A button around my neck. That\'s your solution. In our family, daughters took care of their mothers. But you chose your life over there.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'I didn\'t choose against you, Mom. I have Arun and the kids and their school. I call you every single day. I come every month. What more can I do without uprooting my whole family?',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Mrs. Krishnamurthy\'s daughter moved back from London. London! But I suppose your life is more important.',
        turnNumber: 5,
      },
    ],
    tags: ['caretaking', 'guilt', 'cultural-expectations', 'aging', 'distance', 'duty'],
  },

  // =========================================================================
  // SUB-TYPE 2: SIBLINGS
  // =========================================================================

  {
    id: 'family-004',
    category: 'family',
    title: 'Inheritance Dispute',
    description: 'Two siblings clash over the division of their late father\'s estate. The younger sister, who cared for their father in his final years, feels entitled to more. The older brother sees equal division as the only fair option.',
    personA: {
      name: 'Karen',
      role: 'sibling',
      backstory: 'Karen is 45, moved in with their father for his last three years, managed his medications, drove him to appointments, and put her career on hold. She feels unrecognized.',
      emotionalState: 'Bitter and exhausted',
      communicationPattern: 'scorekeeping — recites sacrifices as evidence',
    },
    personB: {
      name: 'David',
      role: 'sibling',
      backstory: 'David is 50, lives two states away. He sent money monthly and called weekly but couldn\'t be physically present. He believes their father wanted everything split equally.',
      emotionalState: 'Defensive but guilt-ridden',
      attachmentStyle: 'avoidant',
      communicationPattern: 'retreats to logic and legal language',
    },
    trigger: 'The will says 50/50. Karen is contesting it, saying their father "would have wanted" to acknowledge her sacrifices.',
    plantedPatterns: [
      'Narrative: totalizing narratives — Karen: "You were never there"; David: "I did what I could"',
      'Gottman: criticism-defensiveness cycle between siblings',
      'Restorative justice: both have legitimate harm claims that need acknowledgment',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Three years, David. I wiped his face, I slept on his couch, I watched him forget my name. And you think you deserve the same share because you mailed a check once a month.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I didn\'t just mail checks. I called every week. I flew in for every holiday. And Dad wrote the will himself — 50/50. That was HIS wish, Karen, not mine.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'He wrote that will before he got sick. Before I gave up my promotion, before I spent my savings on his home modifications. You have no idea what it cost me.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I know it cost you. I\'m not saying it didn\'t. But changing the will after the fact isn\'t honoring Dad — it\'s rewriting his wishes to match yours.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'His wishes? You want to talk about wishes? He wished you\'d been there. He asked for you every night the last month. But sure, hide behind the paperwork.',
        turnNumber: 5,
      },
    ],
    tags: ['inheritance', 'caretaking', 'fairness', 'grief', 'siblings', 'resentment'],
  },

  {
    id: 'family-005',
    category: 'family',
    title: 'The Favorite Child',
    description: 'A younger sister confronts her older brother about perceived favoritism from their mother. The brother never noticed because he was the one receiving it.',
    personA: {
      name: 'Elena',
      role: 'sibling',
      backstory: 'Elena is 34, the middle child in a family of three. She has always felt overlooked — her older brother was the "golden child" and her younger sister was "the baby." She became the peacemaker.',
      emotionalState: 'Resentful but vulnerable',
      communicationPattern: 'builds a case — presents evidence like a prosecutor',
    },
    personB: {
      name: 'Theo',
      role: 'sibling',
      backstory: 'Theo is 38 and genuinely unaware of the disparity. His mother did favor him, but he attributes her support to normal parenting. He finds Elena\'s accusations baffling.',
      emotionalState: 'Confused and defensive',
      communicationPattern: 'dismissive — reframes complaints as sensitivity',
    },
    trigger: 'Their mother gave Theo $15,000 for a house down payment and told Elena she "couldn\'t afford" to help her with her business loan.',
    plantedPatterns: [
      'Power: structural favoritism creates invisible asymmetric power between siblings',
      'Narrative: Theo\'s totalizing reframe — "You\'re just being dramatic" — invalidates Elena\'s lived experience',
      'Drama Triangle: Elena oscillates between victim (of favoritism) and persecutor (confronting Theo)',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'She gave you fifteen thousand dollars. She told me she couldn\'t afford to help with my loan. Can you at least see why that hurts?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'That was a completely different situation. I was buying a house. She was investing in something stable. A business loan is riskier.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'She didn\'t say it was about risk, Theo. She said she couldn\'t afford it. But she could afford it for you. Like she always can.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'You\'re reading into this way too much. Mom loves all of us equally. You\'ve always been more sensitive about these things.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'That right there. "You\'re more sensitive." That\'s exactly what Mom says when she doesn\'t want to deal with it. You sound just like her.',
        turnNumber: 5,
      },
    ],
    tags: ['favoritism', 'invalidation', 'money', 'siblings', 'visibility', 'family-roles'],
  },

  {
    id: 'family-006',
    category: 'family',
    title: 'Caregiving Burden Split',
    description: 'One sister is bearing the full weight of caring for their aging mother while the other contributes nothing. A confrontation erupts over text.',
    personA: {
      name: 'Jade',
      role: 'sibling',
      backstory: 'Jade is 40, lives 20 minutes from their mother, and handles all medical appointments, groceries, medications, and emotional support. She works part-time to manage it.',
      emotionalState: 'Burned out and furious',
      communicationPattern: 'exploder — stores resentment until it detonates',
    },
    personB: {
      name: 'Simone',
      role: 'sibling',
      backstory: 'Simone is 37, lives three hours away and has a demanding job. She assumes Jade "has it handled" and doesn\'t realize the toll. She sends money occasionally.',
      emotionalState: 'Oblivious, then shocked',
      attachmentStyle: 'avoidant',
      communicationPattern: 'withdrawer — goes quiet when confronted',
    },
    trigger: 'Their mother had a medical emergency. Jade spent 14 hours at the hospital alone and texted Simone, who responded "Oh no, is she ok? Keep me posted."',
    plantedPatterns: [
      'Gottman: criticism ("You never show up") and stonewalling (Simone withdrawing)',
      'Restorative justice: harm exists on both sides — Jade is burning out, Simone is being excluded from information',
      'Drama Triangle: Jade as overburdened rescuer flipping to persecutor',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: '"Keep me posted"? Are you serious? I spent fourteen hours in that hospital alone. Mom couldn\'t remember her own medications. Where were you?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I was at work, Jade. I can\'t just drop everything. You know I would\'ve come if it was serious.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'She was in the ER! How much more serious does it need to be? You send a check every few months and act like that\'s caregiving. I gave up my career for this.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I didn\'t ask you to do that. You made that choice. And you never told me you needed more help — you just do everything yourself and then blame me.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I shouldn\'t HAVE to ask! She\'s your mother too! I can\'t believe I have to explain that to you.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: '...',
        turnNumber: 6,
      },
    ],
    tags: ['caregiving', 'burnout', 'responsibility', 'siblings', 'resentment', 'withdrawal'],
  },

  // =========================================================================
  // SUB-TYPE 3: IN-LAWS
  // =========================================================================

  {
    id: 'family-007',
    category: 'family',
    title: 'Cultural Expectations Clash',
    description: 'A daughter-in-law and mother-in-law clash over wedding traditions. The daughter-in-law feels her identity is being erased; the mother-in-law feels her heritage is being disrespected.',
    personA: {
      name: 'Aisha',
      role: 'daughter_in_law',
      backstory: 'Aisha is 29, marrying into a traditional Indian family. She is African-American and wants the wedding to honor both cultures. She feels constant pressure to conform.',
      emotionalState: 'Frustrated and unheard',
      communicationPattern: 'assertive but diplomatic — picks battles carefully',
    },
    personB: {
      name: 'Lakshmi',
      role: 'mother_in_law',
      backstory: 'Lakshmi is 55, deeply invested in family traditions. Her son\'s wedding is the culmination of years of cultural planning. She sees compromise as dilution.',
      emotionalState: 'Anxious about losing cultural continuity',
      communicationPattern: 'indirect — uses "the family" as authority rather than saying "I want"',
    },
    trigger: 'Aisha proposed a blended ceremony with elements from both cultures. Lakshmi told her son it was "not how things are done in our family."',
    plantedPatterns: [
      'Power dynamics: mother-in-law leveraging family authority structure to override newcomer',
      'Narrative: Lakshmi\'s totalizing frame — "our family traditions" — leaves no room for Aisha\'s identity',
      'Drama Triangle: son/fiance caught as potential rescuer in the middle',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'I spoke with the family, and we feel the ceremony should follow our traditions. Your reception can include whatever you like.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'With all respect, it\'s not just your ceremony — it\'s ours. Both of ours. My family has traditions too, and they matter just as much.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'Of course your family matters. But Raj was raised in this tradition. The ceremony is sacred. We can\'t just mix in whatever we want.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: '"Mix in whatever we want." That\'s what you think my heritage is? Something to mix in? I\'m not asking to replace anything — I\'m asking to be represented at my own wedding.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'You\'re twisting my words. I\'m trying to preserve something meaningful. When you join a family, there are things you embrace.',
        turnNumber: 5,
      },
    ],
    tags: ['cultural', 'identity', 'in-laws', 'wedding', 'power', 'assimilation'],
  },

  {
    id: 'family-008',
    category: 'family',
    title: 'Loyalty Triangulation',
    description: 'A wife confronts her husband about always siding with his mother in disputes. The husband feels caught between two people he loves.',
    personA: {
      name: 'Rachel',
      role: 'spouse',
      backstory: 'Rachel is 35, married for 7 years. Every disagreement with her mother-in-law ends with her husband taking his mother\'s side "to keep the peace." She feels like an outsider in her own marriage.',
      emotionalState: 'Isolated and angry',
      attachmentStyle: 'anxious',
      communicationPattern: 'pursuer — escalates when she feels dismissed',
    },
    personB: {
      name: 'James',
      role: 'spouse',
      backstory: 'James is 37, grew up as his mother\'s emotional support after his parents\' divorce. He cannot tolerate his mother being upset and reflexively soothes her, even at Rachel\'s expense.',
      emotionalState: 'Torn and avoidant',
      attachmentStyle: 'avoidant',
      communicationPattern: 'peacekeeper — minimizes conflict at all costs',
    },
    trigger: 'James\'s mother criticized Rachel\'s parenting at a family dinner. James said nothing. Rachel brought it up in the car ride home.',
    plantedPatterns: [
      'Drama Triangle: James as rescuer (of his mother) inadvertently becoming persecutor (of Rachel)',
      'Attachment: classic anxious-avoidant pursue-withdraw pattern',
      'Power: mother-in-law holds invisible power through emotional dependency with James',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'She told me I\'m raising our son wrong. In front of everyone. And you just sat there. Again.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'She didn\'t mean it like that. She was just sharing her perspective. She comes from a different generation.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'There it is. Every single time. She says something hurtful and you explain it away. When do you defend ME? When do I become the person you protect?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I\'m not choosing sides. If I say something to her, she\'ll be upset for weeks. You know how she is. I\'m trying to keep everyone calm.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'You ARE choosing sides. You choose her calm over mine. Every time. I feel like a guest in my own marriage.',
        turnNumber: 5,
      },
    ],
    tags: ['triangulation', 'loyalty', 'in-laws', 'boundaries', 'enmeshment', 'marriage'],
  },

  {
    id: 'family-009',
    category: 'family',
    title: 'Parenting Interference',
    description: 'A grandmother keeps overriding her daughter-in-law\'s parenting decisions when babysitting. The confrontation happens after the grandmother gave the child sugar against explicit instructions.',
    personA: {
      name: 'Mei',
      role: 'daughter_in_law',
      backstory: 'Mei is 33, a first-time mother with a 3-year-old. She researches everything and has clear rules about nutrition and screen time. She feels undermined every time her in-laws babysit.',
      emotionalState: 'Disrespected and anxious',
      communicationPattern: 'precise — cites rules and reasons, can come across as rigid',
    },
    personB: {
      name: 'Gloria',
      role: 'grandmother',
      backstory: 'Gloria is 64, raised four kids "just fine" and sees Mei\'s parenting rules as overcautious. She believes grandparents get special dispensation and that a little sugar never hurt anyone.',
      emotionalState: 'Indignant and hurt',
      communicationPattern: 'dismissive through humor — "Oh, lighten up"',
    },
    trigger: 'Mei picked up her daughter from Gloria\'s house and found her wired on candy, still awake past bedtime, watching cartoons.',
    plantedPatterns: [
      'Power: generational authority ("I raised four kids") used to delegitimize new parent\'s autonomy',
      'Drama Triangle: Gloria as rescuer ("I\'m just giving the child joy") casting Mei as persecutor',
      'Gottman: defensiveness — Gloria deflects every boundary with humor or counter-attack',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Gloria, I specifically asked you not to give Lily candy. She was bouncing off the walls when I picked her up, and she didn\'t sleep until eleven.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Oh Mei, it was one lollipop. My kids had candy every day and they turned out fine. You need to relax a little.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It\'s not about one lollipop. It\'s about respecting the boundaries I set for my child. I told you clearly. You ignored it.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I\'m her grandmother. I raised four children. I think I know a thing or two about what a kid can handle. You can\'t control everything, Mei.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I\'m not trying to control everything. I\'m asking you to follow the same rules she has at home. If you can\'t do that, I\'ll have to find other arrangements.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Other arrangements. You\'d really keep me from my own granddaughter over a lollipop?',
        turnNumber: 6,
      },
    ],
    tags: ['parenting', 'boundaries', 'generational', 'in-laws', 'control', 'respect'],
  },

  // =========================================================================
  // SUB-TYPE 4: BLENDED FAMILY
  // =========================================================================

  {
    id: 'family-010',
    category: 'family',
    title: 'Step-Parent Authority',
    description: 'A stepfather tries to enforce bedtime rules. The teenager refuses to accept his authority. The biological mother is caught in the middle.',
    personA: {
      name: 'Kevin',
      role: 'step_parent',
      backstory: 'Kevin is 42, married the kids\' mother two years ago. He\'s trying to be a good parent but feels constantly rejected. Before the marriage, he was told the kids "just need time."',
      emotionalState: 'Rejected and frustrated',
      communicationPattern: 'overcompensates with authority when warmth fails',
    },
    personB: {
      name: 'Zoe',
      role: 'step_child',
      backstory: 'Zoe is 15, her parents divorced when she was 11. She sees Kevin as an interloper in her home. She misses her father, who moved out of state and calls inconsistently.',
      emotionalState: 'Angry and grieving',
      communicationPattern: 'defiant — uses "You\'re not my dad" as a weapon',
    },
    trigger: 'Kevin told Zoe to get off her phone and go to bed at 10pm. Zoe exploded.',
    plantedPatterns: [
      'Gottman: stonewalling — Zoe shuts down emotionally while remaining verbally combative',
      'Narrative: Zoe\'s identity narrative — "My real family was before you" — protects grief through exclusion',
      'Attachment disruption: Zoe\'s inconsistent contact with bio-dad creates insecure attachment transferred onto Kevin',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Zoe, it\'s 10 o\'clock. Phone down, please. You have school tomorrow.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'You don\'t get to tell me what to do. You\'re not my dad.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'I know I\'m not your dad. But I am part of this family, and bedtime rules apply to everyone in this house.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'This was my house before you got here. You moved in and now you act like you own everything. Mom never had these stupid rules before you.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Your mom and I agreed on these rules together. I\'m not the bad guy here, Zoe. I\'m trying.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Then stop trying. I don\'t need another parent. I need my actual dad.',
        turnNumber: 6,
      },
    ],
    tags: ['blended-family', 'authority', 'step-parent', 'grief', 'rejection', 'adolescence'],
  },

  {
    id: 'family-011',
    category: 'family',
    title: 'Bio-Parent Guilt',
    description: 'A divorced father struggles with guilt about his new family while his daughter from his first marriage feels replaced. A conversation during a weekend visit.',
    personA: {
      name: 'Tom',
      role: 'biological_parent',
      backstory: 'Tom is 44, remarried with a new baby. He gets his 12-year-old daughter Lily every other weekend. He overcompensates with gifts and fun activities but avoids hard conversations.',
      emotionalState: 'Guilty and overcompensating',
      attachmentStyle: 'avoidant',
      communicationPattern: 'deflects emotional conversations with activity suggestions',
    },
    personB: {
      name: 'Lily',
      role: 'biological_child',
      backstory: 'Lily is 12, watches her father build a new life with "his new family." She sees the baby get daily attention while she gets biweekly visits. She oscillates between anger and desperate attachment.',
      emotionalState: 'Abandoned and jealous',
      attachmentStyle: 'disorganized',
      communicationPattern: 'tests — acts out to see if he\'ll fight to keep her',
    },
    trigger: 'Tom had to cut their Saturday short because the baby was sick. It was the second time this month.',
    plantedPatterns: [
      'Attachment disruption: disorganized attachment — Lily wants closeness but punishes Tom when she gets it',
      'Narrative: Lily\'s totalizing story — "You chose them over me" — becomes her core identity wound',
      'Power: structural inequity — the custodial arrangement itself creates unequal access',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Of course. The baby\'s sick. Again. So I get sent home. Again.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Lily, I\'m sorry. I\'ll make it up to you next weekend. We can do whatever you want — movies, go-karts, anything.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'I don\'t want go-karts. I want to not be the thing you schedule between your real life.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'You ARE my real life. You\'re my daughter. Nothing changes that.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Then why does it feel like everything already changed? You have a new house, a new wife, a new kid. I\'m the leftover from before.',
        turnNumber: 5,
      },
    ],
    tags: ['divorce', 'blended-family', 'guilt', 'abandonment', 'replacement', 'custody'],
  },

  {
    id: 'family-012',
    category: 'family',
    title: '"You\'re Not My Real Mom"',
    description: 'A stepmother has been raising her stepdaughter for six years. In a heated moment about curfew, the daughter weaponizes biology.',
    personA: {
      name: 'Sandra',
      role: 'step_parent',
      backstory: 'Sandra is 39, has been the primary caregiver for Maya since she was 8. Maya\'s biological mother left when Maya was 4. Sandra does everything — school, doctors, emotional support.',
      emotionalState: 'Devastated and trying to hide it',
      communicationPattern: 'absorbs pain, maintains composure until she can\'t',
    },
    personB: {
      name: 'Maya',
      role: 'step_child',
      backstory: 'Maya is 14, in the thick of adolescence. She knows Sandra has been her real parent but keeps a fantasy of her bio-mom. When she\'s angry, she reaches for the one weapon she knows will cut deepest.',
      emotionalState: 'Angry on the surface, ashamed underneath',
      communicationPattern: 'goes for the jugular when cornered',
    },
    trigger: 'Sandra said Maya couldn\'t go to a party. Maya escalated.',
    plantedPatterns: [
      'Gottman: contempt — "You\'re not my real mom" is the ultimate contempt move in a step-family',
      'Narrative: Maya clings to the bio-mom narrative as identity armor, even though the reality is abandonment',
      'Attachment: disorganized — Maya attacks the person she\'s most attached to because attachment itself feels unsafe',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Everyone is going to that party. Everyone. You\'re ruining my life.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'The parents aren\'t going to be home, Maya. That\'s a firm no. We can find something else for this weekend.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'If my real mom was here, she would let me go.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: '...That\'s not fair, Maya. You know that\'s not fair.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'You\'re not my real mom. You can\'t tell me what to do. I didn\'t choose you.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'No. You didn\'t choose me. But I chose you. Every single day for six years. And I\'m still choosing you right now, even though that just broke my heart.',
        turnNumber: 6,
      },
    ],
    tags: ['blended-family', 'step-parent', 'biology', 'contempt', 'abandonment', 'identity'],
  },

  // =========================================================================
  // SUB-TYPE 5: GENERATIONAL
  // =========================================================================

  {
    id: 'family-013',
    category: 'family',
    title: 'Technology and Values Gap',
    description: 'A grandmother discovers her 16-year-old granddaughter has a public social media following. She sees it as dangerous vanity. The granddaughter sees it as creative expression and income.',
    personA: {
      name: 'Sophie',
      role: 'grandchild',
      backstory: 'Sophie is 16, has 45,000 followers on social media creating art tutorials. She earns $200/month and sees it as her future career. She\'s smart, creative, and impatient with people who don\'t understand the internet.',
      emotionalState: 'Annoyed and condescended to',
      communicationPattern: 'talks fast, uses references that confuse older generations',
    },
    personB: {
      name: 'Dolores',
      role: 'grandmother',
      backstory: 'Dolores is 74, grew up believing modesty and privacy were core virtues. She found Sophie\'s account by accident and was shocked to see her granddaughter "performing" for strangers.',
      emotionalState: 'Scared for Sophie\'s safety',
      communicationPattern: 'catastrophizes — jumps to worst-case scenarios',
    },
    trigger: 'Dolores found Sophie\'s social media account and called her parents "irresponsible" for allowing it.',
    plantedPatterns: [
      'Power asymmetry: generational authority ("I know better") vs. digital-native competence',
      'NVC violation: Dolores evaluates ("dangerous vanity") rather than observes (Sophie posts art tutorials)',
      'CBT: catastrophizing — Dolores imagines predators and exploitation where art tutorials exist',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Forty-five thousand strangers watching my granddaughter. Do you have any idea how dangerous that is? Anyone could find you.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'Grandma, they\'re watching my ART. I don\'t share my location or my school. I know how the internet works better than you do.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'You think you know, but you\'re sixteen. You don\'t understand what people are capable of. In my day, decent girls didn\'t put themselves on display for attention.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: '"Decent girls." Wow. I\'m not putting myself on display — I\'m building a business. I make two hundred dollars a month. How is that not impressive?',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Money from strangers on the internet. That\'s not a business, Sophie. That\'s a trap waiting to happen.',
        turnNumber: 5,
      },
    ],
    tags: ['technology', 'generational', 'safety', 'autonomy', 'values', 'social-media'],
  },

  {
    id: 'family-014',
    category: 'family',
    title: 'Financial Dependence Tension',
    description: 'A 27-year-old living at home is confronted by his parents about his plan to move out. He can technically afford it but his parents think it\'s financially irresponsible. The real tension is about letting go.',
    personA: {
      name: 'Derek',
      role: 'adult_child',
      backstory: 'Derek is 27, making $55K. He\'s saved $12K and found an apartment. He stayed home after college to save money, but two years became four and now his parents treat him like a teenager.',
      emotionalState: 'Suffocated but grateful',
      communicationPattern: 'avoids confrontation — has been planning his exit quietly',
    },
    personB: {
      name: 'Linda',
      role: 'mother',
      backstory: 'Linda is 56, has loved having Derek home. She frames her desire for him to stay as financial wisdom, but the truth is her nest will be empty when he leaves. Her husband travels for work.',
      emotionalState: 'Panicked about loneliness, performing as practical',
      communicationPattern: 'presents feelings as facts — "It doesn\'t make sense" instead of "I\'ll miss you"',
    },
    trigger: 'Derek mentioned at dinner that he signed a lease starting next month.',
    plantedPatterns: [
      'NVC: Linda presents evaluations as observations ("It doesn\'t make financial sense") hiding her real need (companionship)',
      'Power: parental authority weaponized to delay adult child\'s independence',
      'CBT: mind-reading — Linda assumes Derek can\'t handle finances without evidence',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_b',
        content: 'You signed a lease? Without even talking to us? Twelve thousand dollars is not enough for a safety net, Derek. This doesn\'t make financial sense.',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'I\'ve been planning this for months. I have a budget. I\'ll be fine. I\'m twenty-seven, Mom.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'You\'ve never paid a utility bill in your life. Do you know what happens when the car breaks down AND rent is due? You\'ll be back here in six months.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'Maybe I will. Or maybe I\'ll figure it out like every other adult does. I can\'t stay here forever. I need my own life.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'Nobody said forever. I just don\'t understand the rush. Is it so terrible here? Are we that bad to live with?',
        turnNumber: 5,
      },
    ],
    tags: ['independence', 'financial', 'letting-go', 'generational', 'empty-nest', 'autonomy'],
  },

  {
    id: 'family-015',
    category: 'family',
    title: 'Life Choice Judgment',
    description: 'Conservative parents learn their daughter is in a same-sex relationship. The argument that follows reveals the gap between conditional and unconditional love.',
    personA: {
      name: 'Claire',
      role: 'adult_child',
      backstory: 'Claire is 25, has been dating her girlfriend for a year. She came out to her parents over dinner because she\'s tired of hiding. She expected pushback but hoped for eventual acceptance.',
      emotionalState: 'Vulnerable but defiant',
      communicationPattern: 'direct — has rehearsed this conversation a hundred times',
    },
    personB: {
      name: 'Frank',
      role: 'father',
      backstory: 'Frank is 59, raised in a strict religious household. He loves Claire deeply but his worldview has no framework for this. He\'s not hateful — he\'s lost. His first instinct is to fix it.',
      emotionalState: 'Shocked and grasping for control',
      communicationPattern: 'retreats to rules and values when emotions overwhelm',
    },
    trigger: 'Claire introduced her girlfriend as her partner during a family dinner.',
    plantedPatterns: [
      'Power: parental moral authority ("This isn\'t how we raised you") used to invalidate identity',
      'Narrative: Frank\'s totalizing narrative — "a phase" — denies Claire\'s reality to protect his own worldview',
      'NVC: Frank\'s needs (stability, continuity of values) are real but expressed as evaluations and judgments',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_b',
        content: 'Claire, this is not how we raised you. I don\'t understand where this came from. Are you sure this isn\'t just a phase?',
        turnNumber: 1,
      },
      {
        speaker: 'person_a',
        content: 'It\'s not a phase, Dad. I\'ve known since I was seventeen. I hid it for eight years because I was afraid of exactly this reaction.',
        turnNumber: 2,
      },
      {
        speaker: 'person_b',
        content: 'Eight years? And you couldn\'t tell your own father? What does that say about us? I thought we were closer than that.',
        turnNumber: 3,
      },
      {
        speaker: 'person_a',
        content: 'It says I was scared you\'d love me less. And right now, the look on your face is telling me I was right to be scared.',
        turnNumber: 4,
      },
      {
        speaker: 'person_b',
        content: 'I will always love you. But I can\'t pretend this is what I wanted for you. I need time to... I just need time.',
        turnNumber: 5,
      },
      {
        speaker: 'person_a',
        content: 'You need time to decide if you can accept who I am? Dad, I\'m the same person I was before dinner.',
        turnNumber: 6,
      },
    ],
    tags: ['identity', 'acceptance', 'values', 'generational', 'coming-out', 'conditional-love'],
  },
]
