import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/sessions/[code]/join — join a session as person A or B
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const body = await request.json()
  const { name, side, user_id } = body as { name: string; side: string; user_id?: string }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  if (side !== 'a' && side !== 'b') {
    return NextResponse.json({ error: 'side must be "a" or "b"' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Fetch session first
  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('*')
    .eq('room_code', code.toUpperCase())
    .single()

  if (fetchError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Determine which field to update
  const field = side === 'a' ? 'person_a_name' : 'person_b_name'
  const otherField = side === 'a' ? 'person_b_name' : 'person_a_name'
  const userIdField = side === 'a' ? 'person_a_user_id' : 'person_b_user_id'

  // Atomic conditional update: only succeeds if the slot is still null.
  // Prevents race condition where two requests try to claim the same slot.
  const bothPresent = session[otherField] !== null

  const { data, error } = await supabase
    .from('sessions')
    .update({
      [field]: name.trim(),
      ...(user_id ? { [userIdField]: user_id } : {}),
      ...(bothPresent ? { status: 'active' as const } : {}),
    })
    .eq('id', session.id)
    .is(field, null)
    .select()
    .single()

  if (error) {
    // If no rows matched, the slot was already taken (race condition resolved)
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: `Person ${side.toUpperCase()} has already joined` }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
