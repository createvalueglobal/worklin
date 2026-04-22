import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCompanyProfile, getFavorites } from '@/lib/services/company.service'
import { getActiveSubscription } from '@/lib/repositories/company.repository'
import FavoritesPageClient from './FavoritesPageClient'

export const metadata = {
  title: 'Favoritos | WorkLin',
}

export default async function FavoritesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const company = await getCompanyProfile(supabase, user.id)
  if (!company) redirect('/onboarding/role')

  const subscription = await getActiveSubscription(supabase, company.id)
  const result = await getFavorites(supabase, company.id, subscription)

  return (
    <FavoritesPageClient
      allowed={result.allowed}
      initialFavorites={result.favorites}
    />
  )
}