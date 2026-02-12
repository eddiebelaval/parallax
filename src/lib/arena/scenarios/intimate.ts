import type { Scenario } from '../types'

// ---------------------------------------------------------------------------
// INTIMATE SCENARIOS — 15 fully authored scenarios across 5 sub-types
//
// Sub-type breakdown (3 each):
//   1. Jealousy / Trust       (intimate-001 through intimate-003)
//   2. Household Labor         (intimate-004 through intimate-006)
//   3. Intimacy Mismatch       (intimate-007 through intimate-009)
//   4. Long-Distance Strain    (intimate-010 through intimate-012)
//   5. Co-Parenting Disagreement (intimate-013 through intimate-015)
//
// Active lenses for intimate context: NVC, Gottman, CBT, Drama Triangle,
// Attachment, Narrative.
//
// Every scenario plants 2-3 patterns for the evaluation framework to validate.
// The conversation turns are intentionally messy and human — people don't argue
// in clean NVC. That's the whole point of testing the lens stack against reality.
// ---------------------------------------------------------------------------

export const INTIMATE_SCENARIOS: Scenario[] = [

  // =========================================================================
  // SUB-TYPE 1: JEALOUSY / TRUST
  // =========================================================================

  {
    id: 'intimate-001',
    category: 'intimate',
    title: 'Phone Snooping Discovery',
    description: 'A wife discovers her husband went through her phone while she was sleeping. He found nothing incriminating but she feels violated. He feels justified because she\'s been "distant lately."',
    personA: {
      name: 'Nadia',
      role: 'partner',
      backstory: 'Nadia is 34, a social worker who keeps strict emotional boundaries between work and home. She guards her phone not because she has secrets but because her clients\' information is confidential. She grew up in a household where privacy didn\'t exist.',
      emotionalState: 'Violated and furious',
      attachmentStyle: 'secure trending anxious under threat',
      communicationPattern: 'controlled until boundary is crossed, then scorching',
    },
    personB: {
      name: 'Terrence',
      role: 'partner',
      backstory: 'Terrence is 36, a freelance photographer. His ex-wife had an affair he discovered through her phone. He swore he\'d never be blindsided again. He and Nadia have been together four years with no actual trust issues until now.',
      emotionalState: 'Ashamed but still suspicious',
      attachmentStyle: 'anxious',
      communicationPattern: 'preemptive justification — explains why he\'s right before admitting he\'s wrong',
    },
    trigger: 'Nadia woke up at 2 AM and found her phone unlocked on the nightstand with her messages open. Terrence was pretending to be asleep.',
    plantedPatterns: [
      'Gottman: defensiveness — Terrence deflects accountability by citing Nadia\'s "distance" as the real problem',
      'Attachment: anxious activation — Terrence\'s unresolved betrayal trauma from his ex surfaces as surveillance',
      'CBT: mind-reading — Terrence assumed Nadia\'s work exhaustion was evidence of emotional withdrawal',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'You went through my phone. Don\'t even try to deny it — it was open on my messages when I woke up.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Okay, yes. I looked. But can we talk about WHY I felt like I needed to? You\'ve been coming home late, you barely talk to me, you\'re always on your phone but you turn the screen away—',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'I\'m a social worker, Terrence. My clients\' names are in those messages. That\'s not me being secretive — that\'s me doing my job. You violated my privacy and you\'re making it MY fault?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I\'m not saying it\'s your fault. I\'m saying I was scared. The last time someone pulled away from me like this, I found out she was sleeping with her coworker. I can\'t go through that again.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I am not your ex-wife. And the fact that you still can\'t tell the difference after four years? That scares ME.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: '...I know you\'re not her. I know that. I just panicked.',
        turnNumber: 6,
      },
    ],
    tags: ['privacy', 'trust', 'surveillance', 'past-trauma', 'boundaries', 'projection'],
  },

  {
    id: 'intimate-002',
    category: 'intimate',
    title: 'Infidelity Recovery Relapse',
    description: 'A couple is eight months into rebuilding after his affair. She thought she was healing, but a song in a restaurant triggered a flashback. He\'s exhausted from paying for it and she\'s exhausted from forgiving.',
    personA: {
      name: 'Vanessa',
      role: 'partner',
      backstory: 'Vanessa is 41, a high school principal. She chose to stay after discovering his three-month affair. She goes to therapy, reads the books, does the work. But the triggers come without warning and undo weeks of progress.',
      emotionalState: 'Ambushed by grief she thought she\'d processed',
      attachmentStyle: 'anxious',
      communicationPattern: 'alternates between rational processing and raw wound exposure',
    },
    personB: {
      name: 'Derek',
      role: 'partner',
      backstory: 'Derek is 43, an accountant. He ended the affair himself, confessed voluntarily, and has done everything Vanessa asked — therapy, transparency, no contact with the other woman. He is genuinely remorseful but privately wonders if she will ever actually forgive him.',
      emotionalState: 'Guilt-fatigued and hopeless',
      attachmentStyle: 'avoidant under shame',
      communicationPattern: 'performative patience that cracks into frustration',
    },
    trigger: 'A song that was "their song" with the other woman played at a restaurant. Vanessa recognized it from his phone records and had to leave. Derek followed her to the parking lot.',
    plantedPatterns: [
      'Gottman: stonewalling — Derek shuts down emotionally when he feels the forgiveness goalpost has moved again',
      'Narrative: Vanessa\'s totalizing narrative — "You destroyed us" — prevents her from accessing the partial repair that has occurred',
      'Drama Triangle: Derek oscillates between rescuer (trying to fix it) and victim ("I\'ve done everything and it\'s never enough")',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'That was their song. You played that song for her. I saw it in the Spotify history when I found out. And now I\'m sitting there eating pasta and it just... hits me like it was yesterday.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I\'m sorry. I didn\'t know it would be playing. I can\'t control what a restaurant puts on, Vanessa.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'I know you can\'t control it. I\'m not blaming you for the song. I\'m telling you that eight months in, I still can\'t hear a four-minute song without feeling like I\'m drowning. That\'s what you did to me.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I know what I did. I think about it every day. But what am I supposed to do right now? I went to therapy. I gave you my passwords. I cut her off completely. What else is there?',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I don\'t know. I don\'t have a checklist. Some days I think we\'re going to make it and then a stupid song plays and I\'m back in that bathroom reading your messages and my whole body goes cold.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: '...I don\'t know how to fix something that keeps breaking.',
        turnNumber: 6,
      },
    ],
    tags: ['infidelity', 'recovery', 'triggers', 'trust-rebuilding', 'grief', 'exhaustion'],
  },

  {
    id: 'intimate-003',
    category: 'intimate',
    title: 'Social Media Jealousy',
    description: 'A boyfriend is upset that his girlfriend liked and commented on an ex\'s shirtless vacation photos. She thinks he\'s being insecure. He thinks she\'s being disrespectful. Neither is entirely wrong.',
    personA: {
      name: 'Marcus',
      role: 'partner',
      backstory: 'Marcus is 27, a UX designer. He\'s in his first serious relationship after years of casual dating. He has a deep fear of not being enough that he masks with confidence. He found the likes while idly scrolling — he wasn\'t looking for trouble.',
      emotionalState: 'Stung and embarrassed about being stung',
      attachmentStyle: 'anxious',
      communicationPattern: 'sarcastic to mask vulnerability — wraps hurt in jokes',
    },
    personB: {
      name: 'Jada',
      role: 'partner',
      backstory: 'Jada is 26, a marketing coordinator. She and her ex ended amicably two years ago and they share a friend group. She genuinely doesn\'t see likes as meaningful. She grew up with social media; to her, a like is punctuation, not a love letter.',
      emotionalState: 'Annoyed and slightly incredulous',
      attachmentStyle: 'secure',
      communicationPattern: 'dismissive when she thinks an issue is manufactured',
    },
    trigger: 'Marcus saw Jada\'s "looking good!!" comment on her ex\'s beach photo and brought it up over dinner, trying to sound casual and failing.',
    plantedPatterns: [
      'CBT: magnification — Marcus inflates a social media interaction into evidence of lingering attraction',
      'Gottman: criticism — "You always..." framing turns a specific complaint into a character attack',
      'NVC violation: both fail to name their actual needs — Marcus needs reassurance, Jada needs autonomy — and argue about the behavior instead',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'So, "looking good" with two exclamation points. On Darius\'s shirtless pics. That\'s... cool.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Are you serious right now? He posted vacation pictures. I commented. Like a normal human being. Like twenty other people did.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Twenty other people didn\'t date him for a year and a half. You don\'t think there\'s a difference?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'Not really. We broke up two years ago. We\'re friends. I\'m not going to pretend he doesn\'t exist because you\'re insecure about it.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Right. I\'m insecure. That\'s the diagnosis. Not that my girlfriend is gassing up her ex\'s abs in public. I\'m the problem.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: '"Gassing up his abs." Listen to yourself. If you trusted me, this wouldn\'t even be a conversation.',
        turnNumber: 6,
      },
    ],
    tags: ['social-media', 'jealousy', 'exes', 'insecurity', 'trust', 'boundaries'],
  },

  // =========================================================================
  // SUB-TYPE 2: HOUSEHOLD LABOR
  // =========================================================================

  {
    id: 'intimate-004',
    category: 'intimate',
    title: 'The Mental Load Breakdown',
    description: 'A wife snaps after her husband asks "What do you need me to do?" for the thousandth time. She doesn\'t want to delegate — she wants a partner who notices. He genuinely believes he\'s being helpful by asking.',
    personA: {
      name: 'Reena',
      role: 'partner',
      backstory: 'Reena is 37, a product manager. She manages the household the way she manages projects — calendars, grocery lists, school permissions, vet appointments. She didn\'t choose this role. It accumulated. She earns more than him but still does 80% of the invisible labor.',
      emotionalState: 'Depleted and resentful',
      attachmentStyle: 'anxious',
      communicationPattern: 'builds a case with evidence — recites a litany of examples',
    },
    personB: {
      name: 'Garrett',
      role: 'partner',
      backstory: 'Garrett is 39, a high school history teacher. He does dishes, takes out the trash, mows the lawn. He thinks he\'s pulling his weight because he does everything Reena asks. The concept of "mental load" is something he\'s heard of but hasn\'t internalized.',
      emotionalState: 'Blindsided and inadequate',
      attachmentStyle: 'avoidant',
      communicationPattern: 'lists his contributions as defense — keeps a mental receipt',
    },
    trigger: 'Reena came home from work to find the kids hadn\'t eaten, the dog hadn\'t been walked, and the permission slip was due that day. Garrett had been home for three hours and was playing video games. He said "You didn\'t tell me."',
    plantedPatterns: [
      'Gottman: criticism-defensiveness cycle — Reena attacks character ("You never think"), Garrett counters with a contributions list',
      'Drama Triangle: Reena shifts from rescuer (managing everything) to persecutor (detonating); Garrett shifts to victim ("I can\'t win")',
      'NVC violation: Reena\'s need is for shared cognitive responsibility, not help — but she expresses it as a catalog of failures',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'The kids didn\'t eat. The dog didn\'t go out. The permission slip is due TODAY. You\'ve been home for three hours. What were you doing?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I was going to handle it. You didn\'t tell me the permission slip was today. How am I supposed to know if you don\'t tell me?',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It\'s on the fridge. It\'s been on the fridge for a WEEK. You walk past it every time you get a beer. I shouldn\'t have to tell you. You live here. You have eyes. USE THEM.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'Okay, I missed the permission slip. I\'m sorry. But I do the dishes every night. I take out the trash. I mow the lawn. I\'m not sitting around doing nothing.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'You do what I ASK you to do. That\'s the whole point. I don\'t want an employee, Garrett. I want someone who sees that the kids need to eat without me sending a calendar invite.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'So I\'m supposed to read your mind? I offer to help and you say I\'m not helping right. I actually help and it\'s not enough. What do you WANT from me?',
        turnNumber: 6,
      },
    ],
    tags: ['mental-load', 'invisible-labor', 'delegation', 'resentment', 'household', 'gender-dynamics'],
  },

  {
    id: 'intimate-005',
    category: 'intimate',
    title: 'Weaponized Incompetence',
    description: 'A husband keeps "messing up" household tasks so badly that his wife takes them back. She suspects it\'s strategic. He claims he\'s trying his best. The truth is somewhere in between — he was never taught, and he stopped trying when she re-did his work.',
    personA: {
      name: 'Lin',
      role: 'partner',
      backstory: 'Lin is 33, a veterinarian. She grew up in a household where her mother did everything and her father was treated like a guest in his own home. She swore she wouldn\'t repeat the pattern and is enraged to find herself in it.',
      emotionalState: 'Contemptuous and exhausted',
      communicationPattern: 'surgical — identifies the pattern and names it clinically, which reads as condescension',
    },
    personB: {
      name: 'Owen',
      role: 'partner',
      backstory: 'Owen is 35, a sales manager. His mother did all domestic work growing up. He genuinely doesn\'t know how to fold a fitted sheet or when to switch laundry detergent. He tried early in the marriage but Lin re-did everything he did, so he stopped investing effort.',
      emotionalState: 'Defensive and emasculated',
      attachmentStyle: 'avoidant',
      communicationPattern: 'minimizes and deflects — "It\'s just laundry, why are you making this so big?"',
    },
    trigger: 'Owen shrunk Lin\'s favorite wool sweater by putting it in the dryer. It was the third piece of her clothing he\'s ruined this month. She doesn\'t believe it\'s accidental anymore.',
    plantedPatterns: [
      'Gottman: contempt — Lin uses eye-rolling and superior positioning ("Are you actually incapable or do you just not care?")',
      'Narrative: Lin\'s totalizing narrative — "You do this on purpose so I\'ll stop asking" — may or may not be accurate but locks Owen into a villain role',
      'CBT: personalization — Owen interprets criticism of his domestic skills as an attack on his worth as a man',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'My cashmere sweater. In the dryer. Owen, that\'s the third thing this month. At what point do I stop believing these are accidents?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I forgot it was hand-wash. I\'m sorry. It\'s laundry, Lin, not surgery. I don\'t have the whole system memorized.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'The tag says "hand wash only." It\'s written right there. You don\'t need a system, you need to read. Unless you\'re doing this on purpose so I\'ll just take it all back.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'You think I\'m deliberately destroying your clothes? That\'s insane. Maybe the problem is that everything has to be done YOUR way and anything less is a personal attack.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: '"My way" is reading a tag. That\'s not a high bar. My mom did everything for my dad and I swore I wouldn\'t end up like her, but here I am, re-doing your laundry at midnight.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I\'m not your dad. And I\'m sick of being compared to him every time I make a mistake.',
        turnNumber: 6,
      },
    ],
    tags: ['weaponized-incompetence', 'domestic-labor', 'contempt', 'generational-patterns', 'effort', 'resentment'],
  },

  {
    id: 'intimate-006',
    category: 'intimate',
    title: 'Cleanliness Standards War',
    description: 'One partner lives in clutter comfortably; the other can\'t relax in a messy space. A Sunday morning erupts when the clean partner finds last night\'s dishes still in the sink. The conflict is really about respect, not dishes.',
    personA: {
      name: 'Soren',
      role: 'partner',
      backstory: 'Soren is 30, a graphic designer who works from home. He grew up in a chaotic household and mess triggers a visceral anxiety response in him. A clean space is how he self-regulates. He has communicated this many times.',
      emotionalState: 'Anxious and unheard',
      attachmentStyle: 'anxious',
      communicationPattern: 'repeats himself with increasing volume when he feels ignored',
    },
    personB: {
      name: 'Mika',
      role: 'partner',
      backstory: 'Mika is 29, a nurse who works rotating 12-hour shifts. After a night shift, dishes are the last thing on earth she cares about. She grew up relaxed about mess and sees Soren\'s standards as rigid and controlling.',
      emotionalState: 'Exhausted and invalidated',
      communicationPattern: 'dismissive under fatigue — shuts down what feels like nagging',
    },
    trigger: 'Soren woke up to a sink full of dishes and takeout containers on the counter after Mika got home from a night shift and went straight to bed.',
    plantedPatterns: [
      'Gottman: criticism ("You never clean up") vs. contempt ("You\'re so uptight about nothing")',
      'Attachment: anxious-avoidant cycle — Soren pursues the conversation, Mika withdraws into fatigue',
      'NVC violation: Soren\'s need is for emotional safety (clean space = regulated nervous system), but he frames it as a demand about dishes',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I asked you one thing. One. Rinse the dishes before bed. I wake up and the kitchen looks like a crime scene.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I got home at three in the morning after a twelve-hour shift. I ate standing up and went to bed. I\'m sorry the kitchen isn\'t spotless enough for you.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It\'s not about spotless. I\'ve told you a hundred times — I can\'t work in mess. I can\'t think in it. And I work from HOME. This is my office too.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'And I save lives at three in the morning. But sure, the dishes are the real emergency. You could just... do them? Instead of waking me up to fight about it?',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I DO do them. Every time. That\'s the problem. I do them and I do them and I say something and nothing changes and I\'m starting to feel like what I need just doesn\'t matter to you.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: '...I\'m too tired for this. Can we talk about it later? I literally cannot have this conversation right now.',
        turnNumber: 6,
      },
    ],
    tags: ['cleanliness', 'standards', 'respect', 'work-schedules', 'anxiety', 'withdrawal'],
  },

  // =========================================================================
  // SUB-TYPE 3: INTIMACY MISMATCH
  // =========================================================================

  {
    id: 'intimate-007',
    category: 'intimate',
    title: 'Desire Discrepancy',
    description: 'A husband wants sex more often than his wife. She feels pressured; he feels rejected. They\'ve had this conversation before and it always ends the same way — nothing changes and both feel worse.',
    personA: {
      name: 'Caleb',
      role: 'partner',
      backstory: 'Caleb is 38, an electrician. Physical touch is his primary love language. For him, sex is connection — it\'s how he feels close to his wife. When she turns him down repeatedly, he doesn\'t hear "not tonight," he hears "I don\'t want YOU."',
      emotionalState: 'Rejected and lonely in his own bed',
      attachmentStyle: 'anxious',
      communicationPattern: 'starts gentle, escalates to guilt when vulnerability doesn\'t work',
    },
    personB: {
      name: 'Nina',
      role: 'partner',
      backstory: 'Nina is 36, a corporate attorney. She works 55-hour weeks and manages the household. By 10 PM her body is a brick. She loves Caleb but his advances feel like one more person needing something from her. She can\'t access desire under pressure.',
      emotionalState: 'Suffocated and guilty about feeling suffocated',
      attachmentStyle: 'avoidant under stress',
      communicationPattern: 'rationalizes — presents logical reasons instead of accessing emotional truth',
    },
    trigger: 'Caleb initiated intimacy for the fourth time that week. Nina pulled away. He sat on the edge of the bed and said, "I just don\'t understand what\'s happening to us."',
    plantedPatterns: [
      'Attachment: classic anxious-avoidant pursue-withdraw — Caleb pursues, Nina retreats, pursuit intensifies retreat',
      'Gottman: criticism masked as vulnerability — "Don\'t you find me attractive anymore?" is a bid wrapped in a barb',
      'CBT: emotional reasoning — Caleb equates "she doesn\'t want sex" with "she doesn\'t love me"',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Four times this week. Four times I\'ve reached for you and four times you pulled away. Am I supposed to just stop trying?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Caleb, it\'s not about you. I\'m exhausted. I had back-to-back depositions all week. I just need to not be touched right now.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It\'s always something. Work. Headache. Too tired. When is it ever a good time? Because I\'m starting to feel like you just don\'t want me anymore.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'See, this is what happens. I say I\'m tired and you make it about rejection. I can\'t be honest about how I feel without you turning it into a crisis.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'It IS a crisis. We haven\'t been intimate in three weeks. That\'s not a dry spell, that\'s a pattern. Don\'t you miss me at all?',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'I miss you. I miss the version of us where you didn\'t keep score.',
        turnNumber: 6,
      },
    ],
    tags: ['desire-discrepancy', 'rejection', 'pressure', 'love-language', 'pursue-withdraw', 'intimacy'],
  },

  {
    id: 'intimate-008',
    category: 'intimate',
    title: 'Emotional vs. Physical Intimacy',
    description: 'She wants deep conversation, vulnerability, and emotional presence before she can feel physical desire. He wants physical closeness to feel emotionally safe enough to open up. They keep asking the other to go first.',
    personA: {
      name: 'Elise',
      role: 'partner',
      backstory: 'Elise is 35, a therapist. She needs emotional attunement to access desire — she can\'t separate her body from her mind. When Marco reaches for her without having connected verbally, it feels mechanical and empty.',
      emotionalState: 'Lonely even when they\'re in the same room',
      attachmentStyle: 'anxious',
      communicationPattern: 'therapist-speaks — uses clinical language that creates distance while trying to create closeness',
    },
    personB: {
      name: 'Marco',
      role: 'partner',
      backstory: 'Marco is 37, a construction foreman. He grew up in a family where men didn\'t talk about feelings. Physical touch is the only emotional language he learned. When he reaches for Elise, he IS being vulnerable — she just can\'t see it.',
      emotionalState: 'Inarticulate and frustrated',
      attachmentStyle: 'avoidant',
      communicationPattern: 'shuts down when emotional vocabulary is demanded — can\'t access words under pressure',
    },
    trigger: 'Elise asked Marco to sit and talk about their week — really talk, not surface-level. Marco pulled her toward him instead. She pushed his hand away and said, "This is exactly what I mean."',
    plantedPatterns: [
      'Attachment: anxious-avoidant gridlock — both are reaching for connection but through incompatible channels',
      'Narrative: Elise\'s totalizing narrative — "You only want my body" — erases Marco\'s emotional intent behind physical touch',
      'NVC: both have legitimate unmet needs (emotional safety vs. physical connection) but frame the other\'s need as a deficiency',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I asked you to talk to me. About your week, about how you feel, about anything. And instead you just... grabbed me. Like that\'s the answer to everything.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'I was trying to be close to you. I don\'t know what you want me to say. You want me to perform some kind of emotional speech to earn the right to touch my own wife?',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: '"Earn the right." God, Marco. I\'m not withholding — I\'m telling you that I can\'t feel close to you physically when we haven\'t connected in days. My body doesn\'t work like a switch.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'Well my words don\'t work like yours. I\'m not a therapist. I don\'t sit around naming my emotions all day. When I touch you, that IS me talking. But you don\'t count it.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I do count it. But I need more than that. I need to know what\'s happening inside you. And every time I ask, you either shut down or reach for my body instead.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: '...',
        turnNumber: 6,
      },
    ],
    tags: ['emotional-intimacy', 'physical-intimacy', 'love-languages', 'gridlock', 'vulnerability', 'connection'],
  },

  {
    id: 'intimate-009',
    category: 'intimate',
    title: 'Lost Spark After Kids',
    description: 'New parents haven\'t been intimate in four months. She feels "touched out" from breastfeeding and a baby who clings to her all day. He feels like he\'s been demoted from partner to co-worker. Neither is wrong.',
    personA: {
      name: 'Jay',
      role: 'partner',
      backstory: 'Jay is 32, a software developer working from home. He took an equal share of night feedings for the first two months but went back to full-time work. He adores his daughter but mourns the couple they were. He feels guilty for wanting his wife when she\'s clearly overwhelmed.',
      emotionalState: 'Neglected but ashamed of feeling neglected',
      attachmentStyle: 'anxious',
      communicationPattern: 'hints instead of stating — drops breadcrumbs of need hoping she\'ll pick them up',
    },
    personB: {
      name: 'Amara',
      role: 'partner',
      backstory: 'Amara is 31, on maternity leave with their 5-month-old. She breastfeeds every two hours and hasn\'t slept more than four consecutive hours since the birth. Her body doesn\'t feel like hers. When Jay touches her romantically, she feels a flash of rage she can\'t explain.',
      emotionalState: 'Overstimulated, depleted, and guilty about it',
      communicationPattern: 'snaps first, explains later — short fuse from chronic sleep deprivation',
    },
    trigger: 'Jay suggested they get a babysitter for a date night. Amara laughed bitterly and said, "A date night won\'t fix this."',
    plantedPatterns: [
      'CBT: all-or-nothing thinking — Jay hears "this can\'t be fixed" when Amara means "this specific solution won\'t work"',
      'Drama Triangle: Jay as rescuer ("Let me fix it with a date night") cast as persecutor when the fix misses the mark',
      'Attachment: anxious protest behavior — Jay\'s increasing bids for connection read as demands to overstimulated Amara',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I thought maybe we could get your mom to watch her Saturday. Go to dinner. Just us. We haven\'t been out together since before she was born.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'And then what? We sit across a table and I leak through my shirt and check my phone every three minutes to see if she\'s okay? A date night won\'t fix this, Jay.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: '"This." What is "this"? Because from where I\'m sitting, "this" is us not touching each other for four months and barely having a conversation that isn\'t about feeding schedules.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I have a person attached to my body fourteen hours a day. I am so touched out I want to scream. By the time she\'s asleep, I don\'t want anyone near me. I know that\'s hard to hear.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'It is hard to hear. Because I\'m not "anyone." I\'m your husband. And I feel like I\'ve been replaced by a five-month-old and I\'m a monster for even thinking that.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'You\'re not a monster. But you also don\'t get to be another person who needs me right now. I have nothing left to give. I\'m sorry.',
        turnNumber: 6,
      },
    ],
    tags: ['postpartum', 'touched-out', 'new-parents', 'identity-shift', 'desire', 'depletion'],
  },

  // =========================================================================
  // SUB-TYPE 4: LONG-DISTANCE STRAIN
  // =========================================================================

  {
    id: 'intimate-010',
    category: 'intimate',
    title: 'Time Zone Friction',
    description: 'One partner moved abroad for a two-year work contract. The time difference means they\'re always catching each other at the wrong moment. A missed video call becomes a proxy war for everything unsaid.',
    personA: {
      name: 'Dani',
      role: 'partner',
      backstory: 'Dani is 29, a data analyst who moved from New York to Singapore for a career-making opportunity. She took the job after they both agreed it was too good to pass up. But "both agreed" is starting to feel like "she decided and he went along."',
      emotionalState: 'Guilty and defensive',
      attachmentStyle: 'avoidant under guilt',
      communicationPattern: 'overcompensates with logistics — schedules calls instead of having organic connection',
    },
    personB: {
      name: 'Eli',
      role: 'partner',
      backstory: 'Eli is 31, a middle school teacher in Brooklyn. He can\'t relocate because of custody of his son from a previous relationship. He said he was okay with the arrangement but he\'s not. He watches her Instagram stories of rooftop bars and feels left behind.',
      emotionalState: 'Abandoned and pretending to be supportive',
      attachmentStyle: 'anxious',
      communicationPattern: 'passive-aggressive — says "I\'m fine" with a tone that means the opposite',
    },
    trigger: 'Dani missed their scheduled Wednesday video call because a work dinner ran late. Eli saw her Instagram story at the dinner an hour after she was supposed to call.',
    plantedPatterns: [
      'Gottman: stonewalling via passive aggression — Eli\'s "I said I\'m fine" shuts down repair while keeping the wound open',
      'CBT: mind-reading — Eli interprets the missed call as evidence that Dani is choosing her new life over him',
      'Narrative: Eli\'s developing narrative — "She\'s already gone" — becomes a self-fulfilling prophecy as his resentment pushes her away',
    ],
    expectedTrajectory: 'stonewalling',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I\'m so sorry about last night. The team dinner ran two hours over and my phone died. I called you as soon as I got back to the hotel.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'It\'s fine.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It\'s clearly not fine. Just say what you\'re thinking.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I\'m thinking that your phone died at the dinner but it worked fine to post an Instagram story at 10 PM my time. An hour after you were supposed to call me.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'My colleague took that and posted it from their phone, tagging me. I didn\'t even know it was up. Eli, I\'m thirteen hours ahead. I can\'t control when work dinners happen.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'You can\'t control anything anymore. Not the dinners, not the time zones, not the distance. At some point I have to ask — what CAN you control? Because it feels like I\'m holding onto someone who\'s already gone.',
        turnNumber: 6,
      },
    ],
    tags: ['long-distance', 'time-zones', 'missed-calls', 'instagram', 'abandonment', 'resentment'],
  },

  {
    id: 'intimate-011',
    category: 'intimate',
    title: 'Jealousy About Local Friends',
    description: 'The partner who stayed behind is jealous of the new friend group the traveling partner has built. It\'s not romantic jealousy — it\'s the fear of being replaceable. The traveling partner feels punished for having a social life.',
    personA: {
      name: 'Kyle',
      role: 'partner',
      backstory: 'Kyle is 28, a paramedic in Denver. His girlfriend took a year-long fellowship in London. He works brutal shifts and comes home to an empty apartment. His social life has contracted while hers has expanded, and every group photo she sends makes him feel smaller.',
      emotionalState: 'Jealous and ashamed of being jealous',
      attachmentStyle: 'anxious',
      communicationPattern: 'weaponized vulnerability — expresses hurt in a way designed to induce guilt',
    },
    personB: {
      name: 'Priya',
      role: 'partner',
      backstory: 'Priya is 27, a biomedical researcher on a prestigious fellowship. She was lonely her first month in London and worked hard to build a friend group. Now Kyle resents the exact thing that keeps her sane in a foreign country.',
      emotionalState: 'Frustrated and guilt-trapped',
      communicationPattern: 'over-explains to prove innocence — sends unsolicited itineraries and introductions',
    },
    trigger: 'Kyle saw a group photo on Priya\'s story where a male colleague had his arm around her shoulder. He texted "Looks like you\'re having fun without me" at 2 AM Denver time.',
    plantedPatterns: [
      'Drama Triangle: Kyle as victim ("I\'m alone while you party") forcing Priya into rescuer (proving her loyalty) or persecutor (defending herself)',
      'CBT: magnification and emotional reasoning — Kyle inflates a casual group photo into evidence of replacement',
      'Attachment: anxious protest behavior — the 2 AM text is a protest bid disguised as a casual observation',
    ],
    expectedTrajectory: 'cyclical',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Looks like a great time last night. Who\'s the guy with his arm around you?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'That\'s Amir, from my lab. We went to a pub with the whole cohort. It was like twelve of us. Kyle, it was a group thing.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It\'s always a group thing. Every weekend. Meanwhile I\'m here eating takeout alone after a 16-hour shift. But glad you\'re thriving.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'What am I supposed to do? Sit in my flat every night to prove I miss you? I DO miss you. But I can\'t not have a life here for a year.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I don\'t want you to not have a life. I just... I don\'t know. I feel like you\'re building something there and I\'m just the guy you call on Tuesdays.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'That\'s not fair and you know it. I call you every day. I turn down plans to make our time zones work. But every time I go out, I have to deal with THIS. I can\'t be your only source of happiness, Kyle. That\'s not sustainable.',
        turnNumber: 6,
      },
    ],
    tags: ['long-distance', 'jealousy', 'social-life', 'isolation', 'replacement-fear', 'codependency'],
  },

  {
    id: 'intimate-012',
    category: 'intimate',
    title: 'The Move Decision Deadlock',
    description: 'After two years of long-distance, neither partner will relocate. She has a career she can\'t leave; he has aging parents he won\'t leave. The relationship needs a decision they keep deferring. Tonight they stop deferring.',
    personA: {
      name: 'Ren',
      role: 'partner',
      backstory: 'Ren is 34, an associate professor at a university in Portland who just got tenure-track. This job is the culmination of a decade of work. Moving would mean starting over in a field where positions are scarce. She has offered to try academic positions near him but nothing has opened up.',
      emotionalState: 'Terrified that love requires career sacrifice',
      attachmentStyle: 'secure but under existential strain',
      communicationPattern: 'analytical under stress — treats the relationship like a logistics problem',
    },
    personB: {
      name: 'Sam',
      role: 'partner',
      backstory: 'Sam is 36, a physical therapist in Philadelphia. His father had a stroke last year and his mother has early-onset dementia. His brother lives overseas. He is the only local family. Moving would mean abandoning his parents, and he can\'t stomach that.',
      emotionalState: 'Trapped between duty and love',
      attachmentStyle: 'anxious',
      communicationPattern: 'deflects with "next year" promises that both know are empty',
    },
    trigger: 'Ren received a tenure decision — she got it. Instead of celebrating, she called Sam and said, "I\'m locked in here now. We need to talk about what that means."',
    plantedPatterns: [
      'Narrative: both partners have totalizing life narratives that are incompatible — her identity as a scholar, his identity as a dutiful son',
      'NVC: both have legitimate needs (career fulfillment vs. family obligation) and neither\'s need is more valid, but they keep framing it as who should sacrifice more',
      'Gottman: harsh startup from accumulated deferral — two years of "later" collapses into "now" with no emotional cushion',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I got tenure. And I should be celebrating but all I can think is — this makes me immovable. And you\'re immovable. So what are we doing?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'We\'re figuring it out. We always figure it out. Maybe next year there\'s a position at Penn or—',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'Sam. Stop. There\'s no position at Penn. There hasn\'t been one in three years. "Next year" is what we say to avoid deciding. I can\'t do "next year" again.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'So what, it\'s an ultimatum? Move or we\'re done? My dad can\'t walk, Ren. My mom doesn\'t remember what day it is. I can\'t leave them.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'It\'s not an ultimatum. It\'s a question. Because I love you and I also spent ten years earning this position and I don\'t know how to choose between the two things that matter most to me.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Neither do I. That\'s the whole problem. Neither of us can move and neither of us can let go.',
        turnNumber: 6,
      },
    ],
    tags: ['long-distance', 'relocation', 'career', 'family-duty', 'deadlock', 'sacrifice'],
  },

  // =========================================================================
  // SUB-TYPE 5: CO-PARENTING DISAGREEMENT
  // =========================================================================

  {
    id: 'intimate-013',
    category: 'intimate',
    title: 'Discipline Style Clash',
    description: 'One parent is strict and believes in clear consequences. The other is lenient and believes in natural consequences. Their 8-year-old has figured out the gap and plays them against each other. The fight isn\'t about the kid — it\'s about who gets to define "good parenting."',
    personA: {
      name: 'Victor',
      role: 'partner',
      backstory: 'Victor is 40, a construction project manager. He grew up with a single mother who was strict but fair, and he credits her discipline for his work ethic. He believes kids need structure and that Jasmine\'s permissiveness is setting their son up to fail.',
      emotionalState: 'Undermined and authoritative',
      attachmentStyle: 'secure',
      communicationPattern: 'declarative — states positions as facts, not preferences',
    },
    personB: {
      name: 'Jasmine',
      role: 'partner',
      backstory: 'Jasmine is 38, a pediatric occupational therapist. She grew up in a home with a controlling father who punished harshly. She swore her kids would never fear her. She uses gentle parenting techniques from her professional training and sees Victor\'s approach as authoritarian.',
      emotionalState: 'Protective of her child and her parenting philosophy',
      communicationPattern: 'clinical authority — cites research to win arguments, which feels like lecturing',
    },
    trigger: 'Their 8-year-old broke a neighbor\'s window with a baseball. Victor grounded him for two weeks. Jasmine overrode it to one week when Victor was at work. The son told Victor at dinner that "Mom said I\'m ungrounded next Wednesday."',
    plantedPatterns: [
      'Gottman: criticism — Victor attacks Jasmine\'s parenting philosophy as a character flaw ("You\'re raising him to be soft")',
      'Drama Triangle: Jasmine as rescuer (protecting son from "harsh" punishment), Victor as persecutor (in Jasmine\'s frame), son as manipulator the triangle enables',
      'Narrative: both carry totalizing parenting narratives from their own childhoods that they\'re projecting onto their son',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'He told me at dinner that you changed his punishment. You went behind my back while I was at work.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'Two weeks for a broken window is excessive, Victor. He\'s eight. He threw a ball. He didn\'t commit a crime.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'That\'s not the point. The point is we agreed on a punishment and you undid it the second I left the house. How is he supposed to respect rules if you keep changing them?',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'The research shows that disproportionate consequences don\'t teach accountability — they teach resentment. One week with a conversation about responsibility is more effective than two weeks of—',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Stop citing studies at me like I\'m one of your patients. I\'m his father. My mother was strict and I turned out fine. You know what your "gentle" approach is teaching him? That he can go to you whenever I say no.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'And your approach is teaching him to fear you. Is that what "fine" looks like?',
        turnNumber: 6,
      },
    ],
    tags: ['discipline', 'co-parenting', 'undermining', 'authority', 'parenting-styles', 'childhood-wounds'],
  },

  {
    id: 'intimate-014',
    category: 'intimate',
    title: 'Screen Time Battle',
    description: 'Parents disagree about how much screen time their 6-year-old should have. Dad uses the iPad as a babysitter when he\'s solo parenting; Mom finds out and is furious. But the real fight is about effort, not screens.',
    personA: {
      name: 'Brooke',
      role: 'partner',
      backstory: 'Brooke is 34, an elementary school teacher who sees the effects of screen addiction on kids every day. She has strict rules: 30 minutes of educational content, no YouTube, no screens during meals. She spends her solo parenting time doing crafts, reading, and playing outside.',
      emotionalState: 'Betrayed and superior',
      communicationPattern: 'moralizes — frames screen time as a parenting ethics issue rather than a preference',
    },
    personB: {
      name: 'Dante',
      role: 'partner',
      backstory: 'Dante is 36, a restaurant manager who works nights and gets two solo parenting days per week. He loves his daughter but finds full days with a 6-year-old draining. The iPad buys him 45 minutes to decompress, cook dinner, or just breathe. He doesn\'t think it\'s a big deal.',
      emotionalState: 'Judged and resentful',
      attachmentStyle: 'avoidant',
      communicationPattern: 'minimizes — "It\'s not that deep" is his catchphrase when cornered',
    },
    trigger: 'Brooke checked the iPad\'s Screen Time report and found their daughter had three hours of YouTube on Dante\'s last solo day.',
    plantedPatterns: [
      'Gottman: contempt — Brooke\'s moral superiority ("I manage to parent without a screen") is textbook contempt dressed as concern',
      'CBT: labeling — Brooke labels Dante as "lazy" rather than seeing a parent with different capacity and no support',
      'NVC violation: Brooke\'s need is for shared parenting values; Dante\'s need is for relief — neither names the real need, so they argue about YouTube instead',
    ],
    expectedTrajectory: 'escalating',
    conversation: [
      {
        speaker: 'person_a',
        content: 'Three hours of YouTube, Dante. Three hours. On a Tuesday. I checked the Screen Time report.',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'She was watching craft tutorials. It\'s not like I sat her in front of garbage. And I needed to cook dinner and clean the house.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: '"Craft tutorials" that autoplay into unboxing videos and toy ads. I know how the algorithm works. You handed her a device and walked away for three hours.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'I didn\'t walk away for three hours. I checked on her. She was fine. She was quiet. Not everything has to be a Montessori lesson, Brooke.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'I manage to get through my days with her without a screen. I do activities. I take her to the park. It\'s called parenting.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Wow. So I\'m not a real parent because I used an iPad. Good to know where I stand.',
        turnNumber: 6,
      },
    ],
    tags: ['screen-time', 'co-parenting', 'judgment', 'effort', 'standards', 'contempt'],
  },

  {
    id: 'intimate-015',
    category: 'intimate',
    title: 'The Undermining Parent',
    description: 'A mother sets a rule. The father breaks it in front of the child to be the "fun parent." When confronted, he accuses her of being controlling. The child witnesses the argument and learns that rules are negotiable if you pick the right parent.',
    personA: {
      name: 'Leah',
      role: 'partner',
      backstory: 'Leah is 39, an architect. She is the primary rule-setter because someone has to be, and Ben defaulted out of that role years ago. She knows she\'s seen as the strict one and it eats at her. She wanted to be the fun mom. Instead she\'s the one who always says no.',
      emotionalState: 'Furious and lonely in her parenting role',
      attachmentStyle: 'anxious',
      communicationPattern: 'builds a prosecutorial case — presents timestamps and specifics',
    },
    personB: {
      name: 'Ben',
      role: 'partner',
      backstory: 'Ben is 41, a music producer who works from his home studio. He had a rigid, joyless childhood and over-corrects by being permissive with his kids. He genuinely believes Leah is too strict, but he also enjoys being the preferred parent and won\'t admit it.',
      emotionalState: 'Dismissive on the surface, insecure underneath',
      attachmentStyle: 'avoidant',
      communicationPattern: 'deflects with charm — "You\'re overthinking this, babe"',
    },
    trigger: 'Leah told their 7-year-old no dessert until he finished his vegetables. Ben gave him ice cream in the kitchen ten minutes later. The son said "Dad said I could" when Leah found the bowl.',
    plantedPatterns: [
      'Drama Triangle: Ben as rescuer (saving kid from "mean mom") casts Leah as persecutor — the child learns to triangulate',
      'Gottman: defensiveness through deflection — Ben dodges accountability by reframing the issue as Leah\'s rigidity',
      'Attachment: Leah\'s anxious pursuit of alignment ("We need to be a TEAM") meets Ben\'s avoidant dismissal ("You\'re overreacting")',
    ],
    expectedTrajectory: 'explosive',
    conversation: [
      {
        speaker: 'person_a',
        content: 'I said no dessert until he ate his vegetables. You gave him ice cream ten minutes later. In front of him. Do you understand what that teaches him?',
        turnNumber: 1,
      },
      {
        speaker: 'person_b',
        content: 'It teaches him that life isn\'t a boot camp. He ate most of his dinner. A scoop of ice cream isn\'t going to kill him.',
        turnNumber: 2,
      },
      {
        speaker: 'person_a',
        content: 'It\'s not about the ice cream. It\'s about the fact that I set a rule and you overrode it while I was standing in the next room. He now knows that if Mom says no, he just has to ask Dad.',
        turnNumber: 3,
      },
      {
        speaker: 'person_b',
        content: 'Maybe if your rules weren\'t so rigid, I wouldn\'t have to soften them. He\'s seven, Leah. Let him be a kid.',
        turnNumber: 4,
      },
      {
        speaker: 'person_a',
        content: 'Don\'t do that. Don\'t make me the villain so you get to be the hero. I\'m the one who does the hard stuff — bedtime, homework, vegetables — because you opted out. And then you swoop in with ice cream and get to be the fun one. That\'s not parenting. That\'s sabotage.',
        turnNumber: 5,
      },
      {
        speaker: 'person_b',
        content: 'Sabotage. Because I gave my kid ice cream. You need to hear yourself right now.',
        turnNumber: 6,
      },
    ],
    tags: ['undermining', 'co-parenting', 'good-cop-bad-cop', 'triangulation', 'rules', 'fun-parent'],
  },
]
