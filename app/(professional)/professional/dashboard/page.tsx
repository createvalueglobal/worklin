import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfessionalDashboardData } from '@/lib/services/professional.service'
import { ProfileSummaryCard } from '@/components/features/professional/ProfileSummaryCard'
import { FavoritesCard } from '@/components/features/professional/FavoritesCard'
import { QuickLinks } from '@/components/features/professional/Quicklinks'
import { PendingPlanBanner } from '@/components/common/PendingPlanBanner'

export default async function ProfessionalDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dashboard = await getProfessionalDashboardData(user.id)

  if (!dashboard) redirect('/onboarding/role')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Bienvenido de vuelta, {dashboard.firstName}
        </p>
      </div>

      {/* Pending plan banner — client component reads cookie */}
      <PendingPlanBanner ctaHref="/pricing" />

      {/* Profile summary with inline visibility toggle */}
      <ProfileSummaryCard professional={dashboard} />

      {/* Stats row */}
      <FavoritesCard count={dashboard.favoritesCount} lastAt={dashboard.favoritesLastAt} />

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Accesos rápidos
        </h2>
        <QuickLinks />
      </div>
    </div>
  )
}