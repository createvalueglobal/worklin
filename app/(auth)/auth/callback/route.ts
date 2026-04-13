import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role')

  console.log('[auth/callback] START - code present:', !!code, '- role:', role)

  if (!code) {
    console.log('[auth/callback] No code, redirecting to error')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()

  // Log todas las cookies presentes para ver si el verifier está ahí
  const allCookies = cookieStore.getAll()
  console.log('[auth/callback] Cookies present:', allCookies.map(c => c.name).join(', '))

  const hasVerifier = allCookies.some(c => c.name.includes('code-verifier'))
  console.log('[auth/callback] Has PKCE verifier:', hasVerifier)

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

  console.log('[auth/callback] Attempting exchangeCodeForSession...')
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] Exchange error:', exchangeError.message, '| status:', exchangeError.status)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  console.log('[auth/callback] Exchange OK, getting user...')
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('[auth/callback] No user after exchange:', userError?.message)
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  console.log('[auth/callback] User found:', user.id)

  const { data: publicUser, error: publicUserError } = await supabase
    .from('users')
    .select('id, role, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (publicUserError || !publicUser) {
    console.error('[auth/callback] public.users error:', publicUserError?.message)
    return NextResponse.redirect(`${origin}/login?error=user_sync`)
  }

  console.log('[auth/callback] publicUser:', publicUser.role, '- onboarding:', publicUser.onboarding_completed)

  if (publicUser.onboarding_completed) {
    const dashboard = publicUser.role === 'professional'
      ? '/professional/dashboard'
      : publicUser.role === 'company'
        ? '/company/dashboard'
        : '/admin/dashboard'
    console.log('[auth/callback] Redirecting to dashboard:', dashboard)
    return NextResponse.redirect(`${origin}${dashboard}`)
  }

  if (role && (role === 'professional' || role === 'company')) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id)

    if (updateError) {
      console.error('[auth/callback] Role update error:', updateError.message)
      return NextResponse.redirect(`${origin}/onboarding/role`)
    }

    console.log('[auth/callback] Role saved, redirecting to onboarding/', role)
    return NextResponse.redirect(`${origin}/onboarding/${role}`)
  }

  console.log('[auth/callback] No role, redirecting to role selector')
  return NextResponse.redirect(`${origin}/onboarding/role`)
}