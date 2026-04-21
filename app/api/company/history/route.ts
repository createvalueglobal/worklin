import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyProfile, getHistory } from '@/lib/services/company.service'

export async function GET() {
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

    const result = await getHistory(supabase, company.id)

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'HISTORY_NOT_ALLOWED',
          message: 'El historial de perfiles requiere un plan Básico o superior.',
          history: [],
          allowed: false,
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ history: result.history, allowed: true })
  } catch (err) {
    console.error('[GET /api/company/history]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}