import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyProfile, getActiveSubscriptionSummary } from '@/lib/services/company.service'
import * as repo from '@/lib/repositories/company.repository'

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

    // Suscripción activa (puede ser null si no tiene)
    const subscription = await repo.getActiveSubscription(supabase, company.id)
    const subscriptionSummary = subscription
      ? await getActiveSubscriptionSummary(supabase, company.id)
      : null

    return NextResponse.json({
      company,
      subscription: subscriptionSummary,
    })
  } catch (err) {
    console.error('[GET /api/company/profile]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}