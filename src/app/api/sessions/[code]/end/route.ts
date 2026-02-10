import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/sessions/[code]/end
 *
 * Sets session status to 'completed', ending the conversation.
 * Both sides see the change via Supabase Realtime subscription.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('sessions')
    .update({ status: 'completed' as const })
    .eq('room_code', code.toUpperCase())
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Session not found' },
      { status: error?.code === 'PGRST116' ? 404 : 500 },
    )
  }

  return NextResponse.json(data)
}
