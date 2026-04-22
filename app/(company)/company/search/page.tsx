import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCompanyProfile } from '@/lib/services/company.service'
import { getActiveSubscription } from '@/lib/repositories/company.repository'
import { buildSubscriptionSummary } from '@/lib/services/company.service'
import SearchPageClient from './SearchPageClient'

export const metadata = {
  title: 'Buscar profesionales | WorkLin',
}

export default async function SearchPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const company = await getCompanyProfile(supabase, user.id)
  if (!company) redirect('/onboarding/role')

  // Suscripción activa
  const subscription = await getActiveSubscription(supabase, company.id)
  const summary = subscription ? buildSubscriptionSummary(subscription) : null

  // Provincias para el filtro (solo activas)
  const { data: provinces } = await supabase
    .from('provinces')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <SearchPageClient
      allowsAdvancedFilters={summary?.allows_advanced_filters ?? false}
      allowsFavorites={summary?.allows_favorites ?? false}
      profilesRemaining={summary?.profiles_remaining ?? null}
      provinces={provinces ?? []}
    />
  )
}