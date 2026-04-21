import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getProfessionalProfile,
  updateProfessionalProfile,
} from '@/lib/services/professional.service'
import { updateProfileSchema } from '@/lib/validators/professional.validator'

// ─── GET — obtener perfil completo del profesional autenticado ────────────────

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await getProfessionalProfile(user.id)

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('[GET /api/professional/profile]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ─── PATCH — actualizar perfil (campos + skills + idiomas) ───────────────────

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
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Get professional ID from user
    const profile = await getProfessionalProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const { skills, languages, ...fields } = parsed.data

    const result = await updateProfessionalProfile({
      professionalId: profile.id,
      fields,
      skills,
      languages,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/professional/profile]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}