import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { mediateMessage } from '@/lib/opus'
import { parseNvcAnalysis } from '@/lib/prompts'
import { buildNameMap, toConversationHistory } from '@/lib/conversation'
import type { Message } from '@/types/database'

/**
 * POST /api/mediate
 *
 * Triggers Claude NVC analysis for a specific message.
 * Calls Claude, parses the result, patches the message row
 * in Supabase, and returns the analysis as JSON.
 *
 * The client gets the update via Supabase Realtime (UPDATE event
 * on the messages table), so no streaming is needed here.
 *
 * Body: { session_id: string, message_id: string }
 * Response: { analysis: NvcAnalysis, temperature: number }
 */
export async function POST(request: Request) {
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

  // Fetch session for participant names
  const { data: session } = await supabase
    .from('sessions')
    .select('person_a_name, person_b_name')
    .eq('id', session_id)
    .single()

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

  // Call Claude for NVC analysis
  let rawText: string
  try {
    rawText = await mediateMessage(
      targetMessage.content,
      targetMessage.sender,
      senderName,
      otherPersonName,
      conversationHistory,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Claude API error'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Parse into typed NvcAnalysis
  const analysis = parseNvcAnalysis(rawText)

  if (!analysis) {
    return NextResponse.json(
      { error: 'Failed to parse NVC analysis from Claude response' },
      { status: 502 },
    )
  }

  // Patch the message in Supabase — Realtime pushes the update to clients
  const { error: updateError } = await supabase
    .from('messages')
    .update({
      nvc_analysis: analysis,
      emotional_temperature: analysis.emotionalTemperature,
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
    temperature: analysis.emotionalTemperature,
  })
}
