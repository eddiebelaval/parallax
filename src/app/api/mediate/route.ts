import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import { mediateMessage } from '@/lib/opus'
import { parseConflictAnalysis } from '@/lib/prompts/index'
import { buildNameMap, toConversationHistory } from '@/lib/conversation'
import type { Message, ContextMode, OnboardingContext } from '@/types/database'

/**
 * POST /api/mediate
 *
 * Triggers Claude Conflict Intelligence analysis for a specific message.
 * V3: Fetches session context_mode and uses multi-lens prompt system.
 *
 * Calls Claude, parses the result, patches the message row
 * in Supabase, and returns the analysis as JSON.
 *
 * The client gets the update via Supabase Realtime (UPDATE event
 * on the messages table), so no streaming is needed here.
 *
 * Body: { session_id: string, message_id: string }
 * Response: { analysis: ConflictAnalysis, temperature: number }
 */
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request)
  if (rateLimited) return rateLimited

  const body = await request.json()
  const { session_id, message_id } = body as {
    session_id: string
    message_id: string
  }

  if (!session_id || !message_id) {
    return NextResponse.json(
      { error: 'session_id and message_id are required' },
      { status: 400 },
    )
  }

  const supabase = createServerClient()

  // Fetch the target message
  const { data: targetMessage, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', message_id)
    .eq('session_id', session_id)
    .single()

  if (msgError || !targetMessage) {
    return NextResponse.json(
      { error: 'Message not found' },
      { status: 404 },
    )
  }

  // Fetch session for participant names + context mode
  const { data: session } = await supabase
    .from('sessions')
    .select('person_a_name, person_b_name, context_mode, onboarding_context')
    .eq('id', session_id)
    .single()

  const contextMode: ContextMode = (session?.context_mode as ContextMode) || 'intimate'

  const nameMap = buildNameMap({
    person_a_name: session?.person_a_name ?? null,
    person_b_name: session?.person_b_name ?? null,
  })

  const senderName = nameMap[targetMessage.sender]
  const otherPersonName = targetMessage.sender === 'person_a'
    ? nameMap.person_b
    : nameMap.person_a

  // Fetch conversation history (all messages before this one, chronological)
  const { data: history } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', session_id)
    .lt('created_at', targetMessage.created_at)
    .order('created_at', { ascending: true })

  const conversationHistory = toConversationHistory(
    (history ?? []) as Message[],
    nameMap,
  )

  // Call Claude for Conflict Intelligence analysis
  let rawText: string
  try {
    const onboarding = session?.onboarding_context as OnboardingContext | null
    rawText = await mediateMessage(
      targetMessage.content,
      targetMessage.sender,
      senderName,
      otherPersonName,
      conversationHistory,
      contextMode,
      onboarding?.sessionGoals ? {
        goals: onboarding.sessionGoals,
        contextSummary: onboarding.contextSummary,
      } : undefined,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Claude API error'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Parse into typed ConflictAnalysis (V3) with V1 fallback
  const analysis = parseConflictAnalysis(rawText, contextMode)

  if (!analysis) {
    return NextResponse.json(
      { error: 'Failed to parse analysis from Claude response' },
      { status: 502 },
    )
  }

  // Extract temperature: prefer meta.overallSeverity for composite score,
  // fall back to emotionalTemperature for SignalRail compat
  const temperature = analysis.meta.overallSeverity

  // Patch the message in Supabase — Realtime pushes the update to clients
  // Column is still named nvc_analysis (JSONB absorbs expanded schema)
  const { error: updateError } = await supabase
    .from('messages')
    .update({
      nvc_analysis: analysis,
      emotional_temperature: temperature,
    })
    .eq('id', message_id)

  if (updateError) {
    return NextResponse.json(
      { error: `Analysis complete but failed to save: ${updateError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({
    analysis,
    temperature,
  })
}
