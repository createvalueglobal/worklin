import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyProfile, unlockProfile } from '@/lib/services/company.service'
import { unlockProfileSchema } from '@/lib/validators/company.validator'

// Mensajes de error legibles para el cliente
const ERROR_MESSAGES: Record<string, { message: string; status: number }> = {
  NO_ACTIVE_SUBSCRIPTION: {
    message: 'Necesitas una suscripción activa para desbloquear perfiles.',
    status: 403,
  },
  SUBSCRIPTION_EXPIRED: {
    message: 'Tu suscripción ha expirado. Contrata un nuevo plan para continuar.',
    status: 403,
  },
  NO_QUOTA_REMAINING: {
    message: 'Has alcanzado el límite de perfiles de tu plan actual.',
    status: 403,
  },
  ALREADY_UNLOCKED: {
    message: 'Este perfil ya está desbloqueado en tu suscripción actual.',
    status: 409,
  },
  PROFESSIONAL_NOT_FOUND: {
    message: 'No se pudo encontrar el perfil del profesional.',
    status: 404,
  },
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const company = await getCompanyProfile(supabase, user.id)
    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    // Validar body
    const body = await request.json()
    const parsed = unlockProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await unlockProfile(supabase, company.id, parsed.data.professional_id)

    if (!result.success) {
      const errorInfo = ERROR_MESSAGES[result.error] ?? {
        message: 'Error al desbloquear el perfil.',
        status: 500,
      }
      return NextResponse.json(
        { error: result.error, message: errorInfo.message },
        { status: errorInfo.status }
      )
    }

    return NextResponse.json(result.data, { status: 200 })
  } catch (err) {
    console.error('[POST /api/company/unlock]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}