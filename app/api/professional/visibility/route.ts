import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toggleVisibility } from '@/lib/services/professional.service'
import { visibilitySchema } from '@/lib/validators/professional.validator'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = visibilitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await toggleVisibility(user.id, parsed.data.is_visible)

    if (!result.success) {
      return NextResponse.json({ error: 'Error al actualizar visibilidad' }, { status: 500 })
    }

    return NextResponse.json({ is_visible: result.isVisible })
  } catch (error) {
    console.error('[PATCH /api/professional/visibility]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}