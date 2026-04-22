import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyProfile, searchProfessionals } from '@/lib/services/company.service'
import { getActiveSubscription } from '@/lib/repositories/company.repository'
import { searchParamsSchema } from '@/lib/validators/company.validator'

export async function GET(request: NextRequest) {
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

    // Parsear y validar query params
    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = searchParamsSchema.safeParse(rawParams)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Suscripción activa (puede ser null → empresa FREE)
    const subscription = await getActiveSubscription(supabase, company.id)

    const result = await searchProfessionals(
      supabase,
      company.id,
      parsed.data,
      subscription
    )

    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/company/search]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}