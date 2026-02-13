import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/sessions/[code] — get session by room code
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('room_code', code.toUpperCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PATCH /api/sessions/[code] — update session settings
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { timer_duration_ms } = body

    // Validate timer duration if provided
    if (timer_duration_ms !== undefined && timer_duration_ms !== null) {
      if (typeof timer_duration_ms !== 'number' || timer_duration_ms < 60000 || timer_duration_ms > 1800000) {
        return NextResponse.json(
          { error: 'timer_duration_ms must be between 60000 (1 min) and 1800000 (30 min)' },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('sessions')
      .update({ timer_duration_ms, updated_at: new Date().toISOString() })
      .eq('room_code', code.toUpperCase())
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    )
  }
}
