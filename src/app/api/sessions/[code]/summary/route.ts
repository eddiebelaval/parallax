import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import { summarizeSession } from '@/lib/opus'
import type { V3MessageContext } from '@/lib/opus'
import { buildNameMap, toConversationHistory, stripCodeFences } from '@/lib/conversation'
import { isConflictAnalysis } from '@/types/database'
import type { Message, ConflictAnalysis, NvcAnalysis, SessionSummaryData, OnboardingContext, SoloMemory } from '@/types/database'

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
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const rateLimited = checkRateLimit(request)
  if (rateLimited) return rateLimited

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
      {
        personA: !!session.person_a_user_id,
        personB: !!session.person_b_user_id,
      },
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

  // File summary into each authenticated participant's solo_memory.recentSessions
  const participants: Array<[string, string | null]> = [
    ['person_a', session.person_a_user_id],
    ['person_b', session.person_b_user_id],
  ]

  for (const [role, userId] of participants) {
    if (!userId) continue

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('solo_memory')
      .eq('user_id', userId)
      .single()

    // Skip participant on read failure to avoid overwriting with empty defaults
    if (profileError && profileError.code !== 'PGRST116') {
      console.error(`[summary] Failed to load profile for ${role}:`, {
        userId,
        error: profileError.message,
      })
      continue
    }

    const existing = (profile?.solo_memory &&
      typeof profile.solo_memory === 'object' &&
      Object.keys(profile.solo_memory).length > 0)
      ? profile.solo_memory as SoloMemory
      : null

    const recentSessions = [...(existing?.recentSessions || [])]

    recentSessions.push({
      date: new Date().toISOString(),
      summary: summary.overallInsight,
      topics: summary.keyMoments.slice(0, 3),
      emotionalArc: summary.temperatureArc,
    })

    // Keep last 5 sessions
    while (recentSessions.length > 5) recentSessions.shift()

    const updatedMemory: SoloMemory = {
      identity: existing?.identity || { name: null, bio: null, importantPeople: [] },
      themes: existing?.themes || [],
      patterns: existing?.patterns || [],
      values: existing?.values || [],
      strengths: existing?.strengths || [],
      recentSessions,
      currentSituation: existing?.currentSituation || null,
      emotionalState: existing?.emotionalState || null,
      actionItems: existing?.actionItems || [],
      sessionCount: (existing?.sessionCount || 0) + 1,
      lastSeenAt: new Date().toISOString(),
    }

    const { error: upsertError } = await supabase.from('user_profiles').upsert(
      { user_id: userId, solo_memory: updatedMemory },
      { onConflict: 'user_id' },
    )
    if (upsertError) {
      console.error(`[summary] Failed to file summary for ${role}:`, {
        userId,
        error: upsertError.message,
      })
    }
  }

  return NextResponse.json({ summary })
}
