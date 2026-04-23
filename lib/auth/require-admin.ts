import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// ============================================================
// REQUIRE ADMIN HELPER
// Call at the top of every /api/admin/* route handler.
// Returns the admin's user id if valid, or a 403 NextResponse.
// ============================================================

export async function requireAdmin(
): Promise<{ adminUserId: string } | NextResponse> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Read-only context — safe to ignore
          }
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { success: false, error: 'No autenticado' },
      { status: 401 }
    )
  }

  // Check role in public.users table (source of truth for roles)
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin' || !userData.is_active) {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado' },
      { status: 403 }
    )
  }

  return { adminUserId: user.id }
}