import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { saveUserRole } from '@/lib/services/onboarding.service'

const roleSchema = z.object({
  role: z.enum(['professional', 'company']),
})

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

    // Validar body
    const body = await request.json()
    const parsed = roleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Rol inválido', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await saveUserRole(supabase, user.id, parsed.data.role)

    return NextResponse.json({ success: true, role: parsed.data.role })
  } catch (err: any) {
    console.error('[api/onboarding/role] Error:', err.message)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}