import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { analyzeIssues } from '@/lib/opus'
import { parseIssueAnalysis } from '@/lib/prompts'
import { buildNameMap, toConversationHistory } from '@/lib/conversation'
import type { Message, MessageSender } from '@/types/database'

// POST /api/issues/analyze — extract issues + grade existing ones
export async function POST(request: Request) {
  const supabase = createServerClient()
  const { session_id, message_id } = await request.json()

  if (!session_id || !message_id) {
    return NextResponse.json({ error: 'session_id and message_id required' }, { status: 400 })
  }

  // Fetch session + target message + all messages + existing issues in parallel
  const [sessionResult, messageResult, messagesResult, issuesResult] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', session_id).single(),
    supabase.from('messages').select('*').eq('id', message_id).single(),
    supabase.from('messages').select('*').eq('session_id', session_id).order('created_at', { ascending: true }),
    supabase.from('issues').select('*').eq('session_id', session_id),
  ])

  const session = sessionResult.data
  const targetMessage = messageResult.data as Message | null
  const allMessages = (messagesResult.data ?? []) as Message[]
  const existingIssues = (issuesResult.data ?? []) as Array<{
    id: string; label: string; description: string; raised_by: string; status: string
  }>

  if (!session || !targetMessage) {
    return NextResponse.json({ error: 'Session or message not found' }, { status: 404 })
  }

  if (session.mode !== 'in_person') {
    return NextResponse.json({ error: 'Issue analysis only for in-person mode' }, { status: 400 })
  }

  const nameMap = buildNameMap(session)
  const senderName = nameMap[targetMessage.sender as MessageSender]
  const otherSender: MessageSender = targetMessage.sender === 'person_a' ? 'person_b' : 'person_a'
  const otherPersonName = nameMap[otherSender]

  // Build conversation history (messages before target)
  const priorMessages = allMessages.filter(
    (m) => new Date(m.created_at) < new Date(targetMessage.created_at)
  )
  const conversationHistory = toConversationHistory(priorMessages, nameMap)

  // Call Claude
  const raw = await analyzeIssues(
    targetMessage.content,
    targetMessage.sender as MessageSender,
    senderName,
    otherPersonName,
    conversationHistory,
    existingIssues,
  )

  const result = parseIssueAnalysis(raw)
  if (!result) {
    return NextResponse.json({ error: 'Failed to parse issue analysis' }, { status: 500 })
  }

  // Insert new issues
  if (result.newIssues.length > 0) {
    const maxPosition = existingIssues.reduce(
      (max, i) => Math.max(max, (i as unknown as { position: number }).position ?? 0),
      0
    )
    const raisedBy: 'person_a' | 'person_b' = targetMessage.sender === 'person_a' ? 'person_a' : 'person_b'
    const inserts = result.newIssues.map((issue: { label: string; description: string }, i: number) => ({
      session_id,
      raised_by: raisedBy,
      source_message_id: message_id,
      label: issue.label,
      description: issue.description,
      position: maxPosition + i + 1,
    }))

    await supabase.from('issues').insert(inserts)
  }

  // Update graded issues
  for (const graded of result.gradedIssues) {
    await supabase
      .from('issues')
      .update({
        status: graded.status,
        addressed_by_message_id: message_id,
        grading_rationale: graded.rationale,
      })
      .eq('id', graded.issueId)
      .eq('session_id', session_id)
  }

  return NextResponse.json({
    newIssues: result.newIssues.length,
    gradedIssues: result.gradedIssues.length,
  })
}
