import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCompanyProfile, getHistory } from '@/lib/services/company.service'
import HistoryPageClient from './HistoryPageClient'

export const metadata = {
  title: 'Historial | WorkLin',
}

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const company = await getCompanyProfile(supabase, user.id)
  if (!company) redirect('/onboarding/role')

  const result = await getHistory(supabase, company.id)

  return (
    <HistoryPageClient
      allowed={result.allowed}
      history={result.history}
    />
  )
}