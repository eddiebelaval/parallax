import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/sessions/[code]/join — join a session as person A or B
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const body = await request.json()
  const { name, side, user_id } = body as { name: string; side: 'a' | 'b'; user_id?: string }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
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

  // Check if slot is already taken
  if (session[field] !== null) {
    return NextResponse.json({ error: `Person ${side.toUpperCase()} has already joined` }, { status: 409 })
  }

  // Build update — if both will be present, set status to active
  const otherField = side === 'a' ? 'person_b_name' : 'person_a_name'
  const bothPresent = session[otherField] !== null

  const userIdField = side === 'a' ? 'person_a_user_id' : 'person_b_user_id'

  const { data, error } = await supabase
    .from('sessions')
    .update({
      [field]: name.trim(),
      ...(user_id ? { [userIdField]: user_id } : {}),
      ...(bothPresent ? { status: 'active' as const } : {}),
    })
    .eq('id', session.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
