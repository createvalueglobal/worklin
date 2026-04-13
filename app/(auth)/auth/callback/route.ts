import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // El rol viene en cookie porque Supabase descarta query params personalizados en redirectTo
  const pendingRole = request.cookies.get('pending_role')?.value
  const role = pendingRole === 'professional' || pendingRole === 'company'
    ? pendingRole
    : null

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] Exchange error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  const { data: publicUser, error: publicUserError } = await supabase
    .from('users')
    .select('id, role, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (publicUserError || !publicUser) {
    console.error('[auth/callback] public.users not found for:', user.id)
    return NextResponse.redirect(`${origin}/login?error=user_sync`)
  }

  // Si el onboarding ya está completado, ir al dashboard
  if (publicUser.onboarding_completed) {
    const dashboard = publicUser.role === 'professional'
      ? '/professional/dashboard'
      : publicUser.role === 'company'
        ? '/company/dashboard'
        : '/admin/dashboard'
    return NextResponse.redirect(`${origin}${dashboard}`)
  }

  // Onboarding pendiente: si viene con rol en cookie, guardarlo y saltar el selector
  if (role) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id)

    if (updateError) {
      console.error('[auth/callback] Error updating role:', updateError.message)
      return NextResponse.redirect(`${origin}/onboarding/role`)
    }

    // Limpiar la cookie de rol pendiente
    const response = NextResponse.redirect(`${origin}/onboarding/${role}`)
    response.cookies.set('pending_role', '', { maxAge: 0, path: '/' })
    return response
  }

  // Sin rol: mostrar selector
  return NextResponse.redirect(`${origin}/onboarding/role`)
}