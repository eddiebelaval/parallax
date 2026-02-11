import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { conductorMessage } from '@/lib/opus'
import { buildNameMap, toConversationHistory } from '@/lib/conversation'
import { stripCodeFences } from '@/lib/conversation'
import {
  buildGreetingPrompt,
  buildAcknowledgeAPrompt,
  buildSynthesisPrompt,
  buildInterventionPrompt,
} from '@/lib/prompts/conductor'
import { checkForIntervention } from '@/lib/conductor/interventions'
import type { Message, ContextMode, ConductorPhase, ConflictAnalysis, OnboardingContext } from '@/types/database'

type ConductorTrigger = 'session_active' | 'message_sent' | 'check_intervention'

/**
 * POST /api/conductor
 *
 * Orchestrates the Parallax conductor — manages conversational onboarding
 * and in-session interventions for remote mode.
 *
 * Body: { session_id, trigger, message_id?, analysis? }
 */
export async function POST(request: Request) {
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

  // --- Trigger: session_active ---
  // Both people joined. Send the greeting and advance to gather_a.
  if (trigger === 'session_active') {
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

    const { system, user } = buildGreetingPrompt(personAName, personBName, contextMode)

    let greeting: string
    try {
      greeting = await conductorMessage(system, user)
    } catch {
      // Graceful degradation: advance to active if greeting fails
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

    // Advance phase to gather_a — Sarah can now type
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
    // Fetch the message that was sent
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

    // Phase: gather_a -> Person A just shared context
    if (phase === 'gather_a') {
      const personAContext = msg.content

      // Acknowledge A and invite B
      const { system, user } = buildAcknowledgeAPrompt(personAName, personBName, personAContext)

      let acknowledgment: string
      try {
        acknowledgment = await conductorMessage(system, user)
      } catch {
        // Graceful degradation: advance phase even if Claude fails
        await supabase
          .from('sessions')
          .update({
            onboarding_context: {
              ...onboarding,
              conductorPhase: 'gather_b',
              personAContext,
            },
          })
          .eq('id', session_id)
        return NextResponse.json({ phase: 'gather_b', error: 'Acknowledgment failed' })
      }

      // Insert mediator acknowledgment
      await supabase.from('messages').insert({
        session_id,
        sender: 'mediator',
        content: acknowledgment,
      })

      // Update phase + store Person A's context
      await supabase
        .from('sessions')
        .update({
          onboarding_context: {
            ...onboarding,
            conductorPhase: 'gather_b',
            personAContext,
          },
        })
        .eq('id', session_id)

      return NextResponse.json({ phase: 'gather_b', message: acknowledgment })
    }

    // Phase: gather_b -> Person B just shared context
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

      // Call Claude for synthesis (returns JSON with message, goals, contextSummary)
      const { system, user } = buildSynthesisPrompt(
        personAName,
        personBName,
        personAContext,
        personBContext,
        contextMode,
      )

      let synthesisText: string
      try {
        synthesisText = await conductorMessage(system, user)
      } catch {
        // Graceful degradation: advance to active even if synthesis fails
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

      try {
        const parsed = JSON.parse(stripCodeFences(synthesisText))
        synthesisMessage = parsed.message || synthesisText
        goals = Array.isArray(parsed.goals) ? parsed.goals : []
        contextSummary = parsed.contextSummary || ''
      } catch {
        // If JSON parsing fails, use raw text as message
        synthesisMessage = synthesisText
      }

      // Insert mediator synthesis message
      await supabase.from('messages').insert({
        session_id,
        sender: 'mediator',
        content: synthesisMessage,
      })

      // Update to active phase with goals
      await supabase
        .from('sessions')
        .update({
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

  return NextResponse.json({ error: 'Unknown trigger' }, { status: 400 })
}
