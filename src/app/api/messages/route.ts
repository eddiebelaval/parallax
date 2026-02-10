import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { MessageSender } from '@/types/database'

// POST /api/messages — send a message
export async function POST(request: Request) {
  const body = await request.json()
  const { session_id, sender, content } = body as {
    session_id: string
    sender: MessageSender
    content: string
  }

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      session_id,
      sender,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
