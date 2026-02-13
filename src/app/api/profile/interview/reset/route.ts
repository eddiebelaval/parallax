import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getServerUser } from '@/lib/auth/server-auth'

/**
 * POST /api/profile/interview/reset
 *
 * Resets the user's interview state and clears behavioral signals (solo_memory).
 * Requires explicit confirmation to prevent accidental data loss.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()

    const { confirmed } = await request.json()

    // HACKATHON DEMO: Allow reset without auth (just return success)
    if (!user) {
      if (!confirmed) {
        return NextResponse.json(
          {
            error: 'Confirmation required',
            message: 'Pass { confirmed: true } to reset interview data and behavioral signals',
          },
          { status: 400 }
        )
      }
      return NextResponse.json({
        success: true,
        message: 'Interview reset. Behavioral signals cleared. (demo mode)',
      })
    }

    if (!confirmed) {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Pass { confirmed: true } to reset interview data and behavioral signals',
        },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Reset interview state and clear solo_memory (behavioral signals)
    const { error } = await supabase
      .from('user_profiles')
      .update({
        interview_completed: false,
        last_interview_date: null,
        solo_memory: {},
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error resetting interview data:', error)
      return NextResponse.json({ error: 'Failed to reset interview data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Interview reset. Behavioral signals cleared.',
    })
  } catch (error) {
    console.error('Error in POST /api/profile/interview/reset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
