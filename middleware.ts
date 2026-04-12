import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/', '/login']

// Prefijos de rutas protegidas por rol
const PROTECTED_PREFIXES = {
  professional: '/professional',
  company: '/company',
  admin: '/admin',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas de auth y archivos estáticos sin procesar
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Crear respuesta base que permite propagar cookies de sesión
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar sesión (necesario para mantener tokens válidos)
  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Usuario NO autenticado intentando acceder a ruta protegida
  if (!user) {
    if (!isPublicRoute && !pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // Usuario autenticado: obtener datos de public.users
  const { data: publicUser } = await supabase
    .from('users')
    .select('role, onboarding_completed, is_active')
    .eq('id', user.id)
    .single()

  // Cuenta desactivada por admin
  if (publicUser && !publicUser.is_active) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=account_disabled', request.url))
  }

  // Onboarding incompleto: forzar al flujo de onboarding
  if (publicUser && !publicUser.onboarding_completed) {
    if (!pathname.startsWith('/onboarding') && !isPublicRoute) {
      return NextResponse.redirect(new URL('/onboarding/role', request.url))
    }
    return response
  }

  // Usuario autenticado con onboarding completo intentando acceder a login u onboarding
  if (isPublicRoute || pathname.startsWith('/onboarding')) {
    if (pathname !== '/') {
      const dashboard = publicUser?.role === 'professional'
        ? '/professional/dashboard'
        : publicUser?.role === 'company'
          ? '/company/dashboard'
          : '/admin/dashboard'
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
    return response
  }

  // Protección por rol: evitar que un rol acceda al área de otro
  if (publicUser) {
    const { role } = publicUser

    const isAccessingWrongArea =
      (role !== 'professional' && pathname.startsWith(PROTECTED_PREFIXES.professional)) ||
      (role !== 'company' && pathname.startsWith(PROTECTED_PREFIXES.company)) ||
      (role !== 'admin' && pathname.startsWith(PROTECTED_PREFIXES.admin))

    if (isAccessingWrongArea) {
      const dashboard = role === 'professional'
        ? '/professional/dashboard'
        : role === 'company'
          ? '/company/dashboard'
          : '/admin/dashboard'
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!auth/callback|api/|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}