import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { summarizeSession } from '@/lib/opus'
import type { V3MessageContext } from '@/lib/opus'
import { buildNameMap, toConversationHistory, stripCodeFences } from '@/lib/conversation'
import { isConflictAnalysis } from '@/types/database'
import type { Message, ConflictAnalysis, NvcAnalysis, SessionSummaryData, OnboardingContext } from '@/types/database'

function parseSessionSummary(raw: string): SessionSummaryData | null {
  try {
    const parsed = JSON.parse(stripCodeFences(raw))

    if (!parsed.temperatureArc || !parsed.overallInsight) {
      return null
    }

    return {
      temperatureArc: String(parsed.temperatureArc),
      keyMoments: Array.isArray(parsed.keyMoments)
        ? parsed.keyMoments.map(String)
        : [],
      personANeeds: String(parsed.personANeeds || ''),
      personBNeeds: String(parsed.personBNeeds || ''),
      personATakeaway: String(parsed.personATakeaway || ''),
      personBTakeaway: String(parsed.personBTakeaway || ''),
      personAStrength: String(parsed.personAStrength || ''),
      personBStrength: String(parsed.personBStrength || ''),
      overallInsight: String(parsed.overallInsight),
      lensInsights: Array.isArray(parsed.lensInsights)
        ? parsed.lensInsights.map(String)
        : [],
      resolutionTrajectory: String(parsed.resolutionTrajectory || ''),
    }
  } catch {
    return null
  }
}

/**
 * Extract V3 context from messages that have ConflictAnalysis data.
 */
function extractV3Context(messages: Message[]): V3MessageContext[] {
  const contexts: V3MessageContext[] = []
  for (const msg of messages) {
    if (msg.nvc_analysis && isConflictAnalysis(msg.nvc_analysis as NvcAnalysis | ConflictAnalysis)) {
      const analysis = msg.nvc_analysis as ConflictAnalysis
      contexts.push({
        primaryInsight: analysis.meta.primaryInsight,
        resolutionDirection: analysis.meta.resolutionDirection,
        activeLenses: analysis.meta.activeLenses,
      })
    }
  }
  return contexts
}

/**
 * POST /api/sessions/[code]/summary
 *
 * Generates a session summary analyzing the full conversation arc.
 * Intended to be called when a session is completed.
 *
 * Response: { summary: SessionSummary }
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const supabase = createServerClient()

  // Fetch the session by room code
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('room_code', code.toUpperCase())
    .single()

  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 },
    )
  }

  // Fetch all messages in the session
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })

  if (messagesError || !messages || messages.length === 0) {
    return NextResponse.json(
      { error: 'No messages found for this session' },
      { status: 400 },
    )
  }

  const nameMap = buildNameMap(session)

  const conversationHistory = toConversationHistory(
    messages as Message[],
    nameMap,
  )

  // Extract V3 lens context from messages (if any have ConflictAnalysis)
  const v3Context = extractV3Context(messages as Message[])

  // Call Claude for session summary
  let rawText: string
  try {
    const onboarding = session.onboarding_context as OnboardingContext | null
    rawText = await summarizeSession(
      nameMap.person_a,
      nameMap.person_b,
      conversationHistory,
      v3Context.length > 0 ? v3Context : undefined,
      onboarding?.sessionGoals,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Claude API error'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const summary = parseSessionSummary(rawText)

  if (!summary) {
    return NextResponse.json(
      { error: 'Failed to parse session summary from Claude response' },
      { status: 502 },
    )
  }

  return NextResponse.json({ summary })
}
