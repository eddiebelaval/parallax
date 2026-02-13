import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getServerUser } from '@/lib/auth/server-auth'

/**
 * POST /api/profile/export
 *
 * Exports all user data as a downloadable JSON file.
 * Includes profile, sessions, messages, and solo memory.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Fetch user profile (includes solo_memory)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Export: failed to fetch profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 })
    }

    // Fetch all sessions where the user participated
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .or(`person_a_user_id.eq.${user.id},person_b_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      console.error('Export: failed to fetch sessions:', sessionsError)
      return NextResponse.json({ error: 'Failed to fetch session data' }, { status: 500 })
    }

    // Fetch messages for all user sessions
    let messages: Record<string, unknown>[] = []
    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s) => s.id)
      const { data: messageData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Export: failed to fetch messages:', messagesError)
        return NextResponse.json({ error: 'Failed to fetch message data' }, { status: 500 })
      }

      messages = messageData ?? []
    }

    const exportData = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      profile,
      sessions: sessions ?? [],
      messages,
      solo_memory: profile?.solo_memory ?? null,
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="parallax-data-${user.id}.json"`,
      },
    })
  } catch (error) {
    console.error('Error in POST /api/profile/export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
