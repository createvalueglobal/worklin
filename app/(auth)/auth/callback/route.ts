import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') // viene de ?role=professional|company en la landing

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

  // Intercambiar el code por una sesión activa
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] Error exchanging code:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // Obtener el usuario recién autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  // Buscar el registro en public.users (creado por el trigger auth.users → public.users)
  const { data: publicUser, error: publicUserError } = await supabase
    .from('users')
    .select('id, role, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (publicUserError || !publicUser) {
    console.error('[auth/callback] public.users not found for:', user.id)
    return NextResponse.redirect(`${origin}/login?error=user_sync`)
  }

  // Si el onboarding ya está completado, ir al dashboard correspondiente
  if (publicUser.onboarding_completed) {
    const dashboard = publicUser.role === 'professional'
      ? '/professional/dashboard'
      : publicUser.role === 'company'
        ? '/company/dashboard'
        : '/admin/dashboard'
    return NextResponse.redirect(`${origin}${dashboard}`)
  }

  // Onboarding pendiente: si viene con ?role, guardarlo y saltar el selector
  if (role && (role === 'professional' || role === 'company')) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id)

    if (updateError) {
      console.error('[auth/callback] Error updating role:', updateError.message)
      return NextResponse.redirect(`${origin}/onboarding/role`)
    }

    return NextResponse.redirect(`${origin}/onboarding/${role}`)
  }

  // Sin rol: mostrar selector
  return NextResponse.redirect(`${origin}/onboarding/role`)
}