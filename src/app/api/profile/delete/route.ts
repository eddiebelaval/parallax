import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getServerUser } from '@/lib/auth/server-auth'

/**
 * DELETE /api/profile/delete
 *
 * Permanently deletes the current user's account and all associated data.
 * Requires explicit confirmation in the request body.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { confirmed } = await request.json()

    if (!confirmed) {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Pass { confirmed: true } to permanently delete your account',
        },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Delete user profile (cascade handles related data)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', user.id)

    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Account permanently deleted',
    })
  } catch (error) {
    console.error('Error in DELETE /api/profile/delete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
