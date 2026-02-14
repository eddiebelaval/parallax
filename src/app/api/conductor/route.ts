import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import { conductorMessage } from '@/lib/opus'
import { buildNameMap, toConversationHistory, stripCodeFences } from '@/lib/conversation'
import {
  buildGreetingPrompt,
  buildGreetingAPrompt,
  buildProcessAPrompt,
  buildWaitingChatPrompt,
  buildGreetingBPrompt,
  buildSynthesisPrompt,
  buildInterventionPrompt,
  buildAdaptivePrompt,
  buildActiveResponsePrompt,
} from '@/lib/prompts/conductor'
import { checkForIntervention } from '@/lib/conductor/interventions'
import type { Message, ContextMode, ConductorPhase, ConflictAnalysis, OnboardingContext } from '@/types/database'

type ConductorTrigger =
  | 'session_active'
  | 'person_a_ready'
  | 'person_b_joined'
  | 'message_sent'
  | 'check_intervention'
  | 'in_person_message'
  | 'active_response'

/**
 * POST /api/conductor
 *
 * Orchestrates the Parallax conductor — manages conversational onboarding
 * and in-session interventions for both remote and in-person modes.
 *
 * Body: { session_id, trigger, message_id? }
 */
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request)
  if (rateLimited) return rateLimited

  const body = await request.json()
  const { session_id, trigger, message_id } = body as {
    session_id: string
    trigger: ConductorTrigger
    message_id?: string
  }

  if (!session_id || !trigger) {
    return NextResponse.json(
      { error: 'session_id and trigger are required' },
      { status: 400 },
    )
  }

  const supabase = createServerClient()

  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const contextMode: ContextMode = (session.context_mode as ContextMode) || 'intimate'
  const personAName = session.person_a_name || 'Person A'
  const personBName = session.person_b_name || 'Person B'
  const onboarding = (session.onboarding_context as OnboardingContext) || {}
  const phase: ConductorPhase | undefined = onboarding.conductorPhase

  // --- Trigger: person_a_ready ---
  // Person A just arrived at the session page (remote mode, conversational onboarding).
  // Parallax greets them, asks for name + situation.
  if (trigger === 'person_a_ready') {
    // Set greeting phase IMMEDIATELY so the client blocks input while Claude thinks
    await supabase
      .from('sessions')
      .update({
        onboarding_context: {
          ...onboarding,
          conductorPhase: 'greeting',
        },
      })
      .eq('id', session_id)

    const { system, user } = buildGreetingAPrompt(contextMode)

    let greeting: string
    try {
      greeting = await conductorMessage(system, user)
    } catch {
      await supabase
        .from('sessions')
        .update({
          onboarding_context: {
            ...onboarding,
            conductorPhase: 'active',
          },
        })
        .eq('id', session_id)
      return NextResponse.json({ error: 'Conductor greeting failed', phase: 'active' }, { status: 502 })
    }

    // Insert mediator message
    await supabase.from('messages').insert({
      session_id,
      sender: 'mediator',
      content: greeting,
    })

    // Advance phase to gather_a — Person A can now type
    await supabase
      .from('sessions')
      .update({
        onboarding_context: {
          ...onboarding,
          conductorPhase: 'gather_a',
        },
      })
      .eq('id', session_id)

    return NextResponse.json({ phase: 'gather_a', message: greeting })
  }

  // --- Trigger: person_b_joined ---
  // Person B just arrived at the session page (remote mode).
  // Parallax greets them, mentions A has already shared.
  if (trigger === 'person_b_joined') {
    // Set greeting phase — blocks input while Claude thinks
    await supabase
      .from('sessions')
      .update({
        onboarding_context: {
          ...onboarding,
          conductorPhase: 'greeting',
        },
      })
      .eq('id', session_id)

    const { system, user } = buildGreetingBPrompt(personAName, contextMode)

    let greeting: string
    try {
      greeting = await conductorMessage(system, user)
    } catch {
      await supabase
        .from('sessions')
        .update({
          onboarding_context: {
            ...onboarding,
            conductorPhase: 'active',
          },
        })
        .eq('id', session_id)
      return NextResponse.json({ error: 'Conductor greeting failed', phase: 'active' }, { status: 502 })
    }

    // Insert mediator message
    await supabase.from('messages').insert({
      session_id,
      sender: 'mediator',
      content: greeting,
    })

    // Advance phase to gather_b — Person B can now type
    await supabase
      .from('sessions')
      .update({
        onboarding_context: {
          ...onboarding,
          conductorPhase: 'gather_b',
        },
      })
      .eq('id', session_id)

    return NextResponse.json({ phase: 'gather_b', message: greeting })
  }

  // --- Trigger: session_active ---
  // Legacy fallback: both people joined simultaneously before conductor fired for A.
  // Uses the old greeting prompt that addresses both people.
  if (trigger === 'session_active') {
    await supabase
      .from('sessions')
      .update({
        onboarding_context: {
          ...onboarding,
          conductorPhase: 'greeting',
        },
      })
      .eq('id', session_id)

    const { system, user } = buildGreetingPrompt(personAName, personBName, contextMode)

    let greeting: string
    try {
      greeting = await conductorMessage(system, user)
    } catch {
      await supabase
        .from('sessions')
        .update({
          onboarding_context: {
            ...onboarding,
            conductorPhase: 'active',
          },
        })
        .eq('id', session_id)
      return NextResponse.json({ error: 'Conductor greeting failed', phase: 'active' }, { status: 502 })
    }

    await supabase.from('messages').insert({
      session_id,
      sender: 'mediator',
      content: greeting,
    })

    await supabase
      .from('sessions')
      .update({
        onboarding_context: {
          ...onboarding,
          conductorPhase: 'gather_a',
        },
      })
      .eq('id', session_id)

    return NextResponse.json({ phase: 'gather_a', message: greeting })
  }

  // --- Trigger: message_sent ---
  // A person sent a message during onboarding. Process based on current phase.
  if (trigger === 'message_sent') {
    if (!message_id) {
      return NextResponse.json({ error: 'message_id required for message_sent' }, { status: 400 })
    }

    const { data: msg } = await supabase
      .from('messages')
      .select('*')
      .eq('id', message_id)
      .single()

    if (!msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Phase: gather_a -> Person A just shared context (with name extraction)
    if (phase === 'gather_a') {
      const personAContext = msg.content

      const { system, user } = buildProcessAPrompt(personAContext, session.room_code)

      let responseText: string
      try {
        responseText = await conductorMessage(system, user)
      } catch {
        // Graceful degradation: advance phase even if Claude fails
        await supabase
          .from('sessions')
          .update({
            onboarding_context: {
              ...onboarding,
              conductorPhase: 'waiting_for_b',
              personAContext,
            },
          })
          .eq('id', session_id)
        return NextResponse.json({ phase: 'waiting_for_b', error: 'Process A failed' })
      }

      // Parse JSON response to extract name
      let acknowledgment: string
      let extractedName = 'Person A'
      try {
        const parsed = JSON.parse(stripCodeFences(responseText))
        acknowledgment = parsed.message || responseText
        extractedName = parsed.name || 'Person A'
      } catch {
        acknowledgment = responseText
      }

      // Insert mediator acknowledgment
      await supabase.from('messages').insert({
        session_id,
        sender: 'mediator',
        content: acknowledgment,
      })

      // Update session: store A's name + context, advance to waiting_for_b
      await supabase
        .from('sessions')
        .update({
          person_a_name: extractedName,
          onboarding_context: {
            ...onboarding,
            conductorPhase: 'waiting_for_b',
            personAContext,
          },
        })
        .eq('id', session_id)

      return NextResponse.json({ phase: 'waiting_for_b', message: acknowledgment, name: extractedName })
    }

    // Phase: waiting_for_b -> Person A is chatting while waiting for B
    if (phase === 'waiting_for_b') {
      // Fetch conversation history for context
      const { data: allMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', session_id)
        .order('created_at', { ascending: true })

      const nameMap: Record<string, string> = {
        person_a: personAName,
        mediator: 'Parallax',
      }
      const history = (allMessages || [])
        .map((m: Message) => `${nameMap[m.sender] || m.sender}: ${m.content}`)
        .join('\n')

      const { system, user } = buildWaitingChatPrompt(
        personAName,
        onboarding.personAContext || '',
        history,
        msg.content,
      )

      let responseText: string
      try {
        responseText = await conductorMessage(system, user)
      } catch {
        return NextResponse.json({ phase: 'waiting_for_b', error: 'Waiting chat failed' })
      }

      // Insert mediator response — phase stays at waiting_for_b
      await supabase.from('messages').insert({
        session_id,
        sender: 'mediator',
        content: responseText,
      })

      return NextResponse.json({ phase: 'waiting_for_b', message: responseText })
    }

    // Phase: gather_b -> Person B just shared context (with name extraction via synthesis)
    if (phase === 'gather_b') {
      const personBContext = msg.content
      const personAContext = onboarding.personAContext || ''

      // Set synthesize phase first so UI shows "Parallax is listening..."
      await supabase
        .from('sessions')
        .update({
          onboarding_context: {
            ...onboarding,
            conductorPhase: 'synthesize',
            personBContext,
          },
        })
        .eq('id', session_id)

      // Call Claude for synthesis — now also extracts Person B's name
      const { system, user } = buildSynthesisPrompt(
        personAName,
        'Person B', // B's name not yet known — synthesis will extract it
        personAContext,
        personBContext,
        contextMode,
      )

      let synthesisText: string
      try {
        synthesisText = await conductorMessage(system, user)
      } catch {
        await supabase
          .from('sessions')
          .update({
            onboarding_context: {
              ...onboarding,
              conductorPhase: 'active',
              personBContext,
            },
          })
          .eq('id', session_id)
        return NextResponse.json({ phase: 'active', error: 'Synthesis failed' })
      }

      // Parse the synthesis JSON
      let synthesisMessage: string
      let goals: string[] = []
      let contextSummary = ''
      let personBExtractedName = 'Person B'

      try {
        const parsed = JSON.parse(stripCodeFences(synthesisText))
        synthesisMessage = parsed.message || synthesisText
        goals = Array.isArray(parsed.goals) ? parsed.goals : []
        contextSummary = parsed.contextSummary || ''
        personBExtractedName = parsed.name || 'Person B'
      } catch {
        synthesisMessage = synthesisText
      }

      // Insert mediator synthesis message
      await supabase.from('messages').insert({
        session_id,
        sender: 'mediator',
        content: synthesisMessage,
      })

      // Update to active phase with goals + Person B's name
      await supabase
        .from('sessions')
        .update({
          person_b_name: personBExtractedName,
          onboarding_context: {
            ...onboarding,
            conductorPhase: 'active',
            personBContext,
            sessionGoals: goals,
            contextSummary,
          },
        })
        .eq('id', session_id)

      return NextResponse.json({
        phase: 'active',
        message: synthesisMessage,
        goals,
        contextSummary,
        name: personBExtractedName,
      })
    }

    // If message_sent during active phase, ignore (handled by mediate route)
    return NextResponse.json({ phase: phase || 'active' })
  }

  // --- Trigger: check_intervention ---
  // Called after mediation analysis during active phase
  if (trigger === 'check_intervention') {
    if (phase !== 'active') {
      return NextResponse.json({ phase, intervened: false })
    }

    // Fetch recent messages for intervention check
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    if (!recentMessages || recentMessages.length === 0) {
      return NextResponse.json({ phase: 'active', intervened: false })
    }

    // Get the latest analyzed message
    const latestAnalyzed = [...recentMessages]
      .reverse()
      .find((m) => m.nvc_analysis && 'meta' in (m.nvc_analysis as unknown as Record<string, unknown>))

    if (!latestAnalyzed) {
      return NextResponse.json({ phase: 'active', intervened: false })
    }

    const analysis = latestAnalyzed.nvc_analysis as ConflictAnalysis
    const check = checkForIntervention(recentMessages as Message[], analysis)

    if (!check.shouldIntervene || !check.type) {
      return NextResponse.json({ phase: 'active', intervened: false })
    }

    // Build intervention prompt
    const nameMap = buildNameMap({
      person_a_name: session.person_a_name,
      person_b_name: session.person_b_name,
    })
    const recentHistory = toConversationHistory(
      (recentMessages as Message[]).slice(-6),
      nameMap,
    )

    const { system, user } = buildInterventionPrompt(
      personAName,
      personBName,
      recentHistory,
      check.type,
      onboarding.sessionGoals || [],
      contextMode,
    )

    let interventionText: string
    try {
      interventionText = await conductorMessage(system, user)
    } catch {
      return NextResponse.json({ phase: 'active', intervened: false, error: 'Intervention call failed' })
    }

    // Insert mediator intervention
    await supabase.from('messages').insert({
      session_id,
      sender: 'mediator',
      content: interventionText,
    })

    return NextResponse.json({
      phase: 'active',
      intervened: true,
      interventionType: check.type,
      message: interventionText,
    })
  }

  // --- Trigger: active_response ---
  // Immediate conductor response during active phase — Parallax speaks after every message.
  // Weaves NVC analysis from prior messages into natural conversation flow.
  if (trigger === 'active_response') {
    if (phase !== 'active') {
      return NextResponse.json({ phase, responded: false })
    }

    // Fetch all messages with their analysis data
    const { data: allMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    if (!allMessages || allMessages.length === 0) {
      return NextResponse.json({ phase: 'active', responded: false })
    }

    const nameMap: Record<string, string> = {
      person_a: personAName,
      person_b: personBName,
      mediator: 'Parallax',
    }

    // Build analysis-enriched conversation history
    const enrichedLines = (allMessages as Message[]).map((m) => {
      const senderLabel = nameMap[m.sender] || m.sender
      let line = `[${senderLabel}]: ${m.content}`

      // Annotate human messages that have NVC analysis
      if (m.sender !== 'mediator' && m.nvc_analysis) {
        const a = m.nvc_analysis as ConflictAnalysis
        if (a.subtext) line += `\n  -> Insight: ${a.subtext}`
        if (a.blindSpots && a.blindSpots.length > 0) line += `\n  -> Blind spot: ${a.blindSpots[0]}`
        if (a.unmetNeeds && a.unmetNeeds.length > 0) line += `\n  -> Needs: ${a.unmetNeeds.join(', ')}`
      }

      return line
    })

    // Determine last speaker and next speaker
    const lastHuman = [...allMessages].reverse().find((m) => m.sender !== 'mediator')
    const lastSpeakerName = lastHuman
      ? nameMap[lastHuman.sender] || lastHuman.sender
      : personAName
    const nextSpeakerName = lastHuman?.sender === 'person_a' ? personBName : personAName

    const { system, user } = buildActiveResponsePrompt(
      lastSpeakerName,
      nextSpeakerName,
      enrichedLines.join('\n'),
      onboarding.sessionGoals || [],
      contextMode,
    )

    let responseText: string
    try {
      responseText = await conductorMessage(system, user, 256)
    } catch {
      return NextResponse.json({ phase: 'active', responded: false, error: 'Active response failed' })
    }

    // Insert mediator message — TTS auto-fires via existing useEffect
    await supabase.from('messages').insert({
      session_id,
      sender: 'mediator',
      content: responseText,
    })

    return NextResponse.json({
      phase: 'active',
      responded: true,
      message: responseText,
    })
  }

  // --- Trigger: in_person_message ---
  // Adaptive in-person conductor: send full history, Claude decides what to do
  if (trigger === 'in_person_message') {
    // Fetch all messages for context
    const { data: allMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    const nameMap: Record<string, string> = {
      person_a: session.person_a_name || 'Person A',
      person_b: session.person_b_name || 'Person B',
      mediator: 'Parallax',
    }

    const conversationHistory = (allMessages || []).map((m: Message) => ({
      sender: nameMap[m.sender] || m.sender,
      content: m.content,
    }))

    const { system, user } = buildAdaptivePrompt(conversationHistory, contextMode)

    let responseText: string
    try {
      responseText = await conductorMessage(system, user, 1024)
    } catch {
      // Graceful degradation: if Claude fails during onboarding, advance to active
      if (phase === 'onboarding') {
        await supabase
          .from('sessions')
          .update({
            onboarding_context: { ...onboarding, conductorPhase: 'active' },
          })
          .eq('id', session_id)
      }
      return NextResponse.json({ error: 'Adaptive conductor failed', phase: 'active' }, { status: 502 })
    }

    // Parse Claude's JSON response
    let parsed: {
      action?: string
      message?: string
      directed_to?: string
      names?: { a?: string | null; b?: string | null }
      goals?: string[]
      contextSummary?: string
    }

    try {
      parsed = JSON.parse(stripCodeFences(responseText))
    } catch {
      // Fallback: try to extract JSON object from within surrounding text
      const jsonMatch = responseText.match(/\{[\s\S]*"message"[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch {
          parsed = { action: 'continue', message: responseText, directed_to: 'person_a' }
        }
      } else {
        parsed = { action: 'continue', message: responseText, directed_to: 'person_a' }
      }
    }

    const mediatorMessage = parsed.message || responseText
    const directedTo = parsed.directed_to || 'person_a'

    // Update names if extracted
    const sessionUpdates: Record<string, unknown> = {}
    if (parsed.names?.a && !session.person_a_name) {
      sessionUpdates.person_a_name = parsed.names.a
    }
    if (parsed.names?.b && !session.person_b_name) {
      sessionUpdates.person_b_name = parsed.names.b
    }

    // Insert mediator message
    await supabase.from('messages').insert({
      session_id,
      sender: 'mediator',
      content: mediatorMessage,
    })

    // Handle synthesis transition
    if (parsed.action === 'synthesize') {
      const goals = Array.isArray(parsed.goals) ? parsed.goals : []
      const contextSummary = parsed.contextSummary || ''

      await supabase
        .from('sessions')
        .update({
          ...sessionUpdates,
          onboarding_context: {
            ...onboarding,
            conductorPhase: 'active',
            sessionGoals: goals,
            contextSummary,
          },
        })
        .eq('id', session_id)

      return NextResponse.json({
        phase: 'active',
        directed_to: directedTo,
        message: mediatorMessage,
        goals,
      })
    }

    // Continue onboarding — update names and keep phase
    if (Object.keys(sessionUpdates).length > 0) {
      await supabase
        .from('sessions')
        .update({
          ...sessionUpdates,
          onboarding_context: { ...onboarding, conductorPhase: 'onboarding' },
        })
        .eq('id', session_id)
    }

    return NextResponse.json({
      phase: 'onboarding',
      directed_to: directedTo,
      message: mediatorMessage,
    })
  }

  return NextResponse.json({ error: 'Unknown trigger' }, { status: 400 })
}
