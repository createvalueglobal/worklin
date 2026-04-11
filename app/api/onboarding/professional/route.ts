import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { professionalFullSchema } from '@/lib/validators/professional.validator'
import { saveProfessionalOnboarding } from '@/lib/services/onboarding.service'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) =>
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    )

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar que el usuario tiene rol 'professional'
    const { data: publicUser } = await supabase
      .from('users')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single()

    if (!publicUser || publicUser.role !== 'professional') {
      return NextResponse.json({ error: 'Rol incorrecto' }, { status: 403 })
    }

    if (publicUser.onboarding_completed) {
      return NextResponse.json({ error: 'Onboarding ya completado' }, { status: 409 })
    }

    // Validar body con Zod
    const body = await request.json()
    const parsed = professionalFullSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Guardar todo
    const professional = await saveProfessionalOnboarding(supabase, user.id, parsed.data)

    return NextResponse.json({ success: true, professionalId: professional.id })
  } catch (err: any) {
    console.error('[api/onboarding/professional] Error:', err.message)
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 })
  }
}