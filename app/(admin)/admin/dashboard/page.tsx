import { AdminHeader } from '@/components/features/admin/layout/AdminHeader'
import { AdminStatsGrid } from '@/components/features/admin/dashboard/AdminStatsGrid'
import { AdminQuickActions } from '@/components/features/admin/dashboard/AdminQuickActions'
import { getStats } from '@/lib/services/admin.service'

// ============================================================
// ADMIN DASHBOARD PAGE
// Server component — fetches stats directly from service.
// ============================================================

export default async function AdminDashboardPage() {
  // Fetch stats server-side — no loading state needed
  let stats
  try {
    stats = await getStats()
  } catch {
    stats = {
      totalProfessionals: 0,
      totalCompanies: 0,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
      currency: 'EUR',
      newUsersThisMonth: 0,
    }
  }

  const now = new Date()
  const monthName = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Dashboard"
        description={`Resumen de actividad — ${monthName}`}
      />

      <AdminStatsGrid stats={stats} />

      <AdminQuickActions />
    </div>
  )
}