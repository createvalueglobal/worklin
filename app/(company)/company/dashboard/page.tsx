import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getCompanyProfile } from '@/lib/services/company.service'
import { getActiveSubscription } from '@/lib/repositories/company.repository'
import { buildSubscriptionSummary } from '@/lib/services/company.service'
import CompanyHeader from '@/components/features/company/CompanyHeader'
import SubscriptionStatusCard from '@/components/features/company/SubscriptionStatusCard'
import CompanyQuickLinks from '@/components/features/company/CompanyQuickLinks'
import NoSubscriptionCTA from '@/components/features/company/NoSubscriptionCTA'
import { PendingPlanBanner } from '@/components/common/PendingPlanBanner'

export const metadata = {
  title: 'Dashboard | WorkLin Empresa',
}

// Saludo dinámico según hora del día
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 13) return 'Buenos días,'
  if (hour < 20) return 'Buenas tardes,'
  return 'Buenas noches,'
}

export default async function CompanyDashboardPage() {
  const supabase = await createClient()

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Datos de la empresa
  const company = await getCompanyProfile(supabase, user.id)
  if (!company) redirect('/onboarding/role')

  // Suscripción activa
  const subscription = await getActiveSubscription(supabase, company.id)
  const subscriptionSummary = subscription ? buildSubscriptionSummary(subscription) : null

  // Cookie pending_plan (banner post-pago)
  const cookieStore = await cookies()
  const hasPendingPlan = cookieStore.has('pending_plan')

  // Features disponibles según suscripción activa
  const allowsFavorites = subscriptionSummary?.allows_favorites ?? false
  const allowsHistory = subscriptionSummary?.allows_history ?? false

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Banner post-pago (si existe cookie) */}
      {hasPendingPlan && <PendingPlanBanner />}

      {/* Header empresa */}
      <CompanyHeader
        company={company}
        greeting={getGreeting()}
      />

      {/* Estado de suscripción o CTA */}
      {subscriptionSummary ? (
        <SubscriptionStatusCard subscription={subscriptionSummary} />
      ) : (
        <NoSubscriptionCTA />
      )}

      {/* Accesos rápidos */}
      <CompanyQuickLinks
        allowsFavorites={allowsFavorites}
        allowsHistory={allowsHistory}
      />

    </div>
  )
}