import { Users, Building2, CreditCard, TrendingUp, UserPlus } from 'lucide-react'
import { AdminStatCard } from './AdminStatCard'
import type { AdminStats } from '@/types/admin'

interface AdminStatsGridProps {
  stats: AdminStats
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const cards = [
    {
      label: 'Profesionales',
      value: stats.totalProfessionals.toLocaleString('es-ES'),
      icon: <Users size={18} />,
      accentColor: 'rgba(139,92,246,0.8)',
      delay: 0,
    },
    {
      label: 'Empresas',
      value: stats.totalCompanies.toLocaleString('es-ES'),
      icon: <Building2 size={18} />,
      accentColor: 'rgba(59,130,246,0.8)',
      delay: 0.05,
    },
    {
      label: 'Suscripciones activas',
      value: stats.activeSubscriptions.toLocaleString('es-ES'),
      icon: <CreditCard size={18} />,
      accentColor: 'rgba(16,185,129,0.8)',
      delay: 0.1,
    },
    {
      label: 'Ingresos del mes',
      value: formatCurrency(stats.monthlyRevenue, stats.currency),
      icon: <TrendingUp size={18} />,
      accentColor: 'rgba(245,158,11,0.8)',
      delay: 0.15,
    },
    {
      label: 'Nuevos usuarios (mes)',
      value: stats.newUsersThisMonth.toLocaleString('es-ES'),
      icon: <UserPlus size={18} />,
      accentColor: 'rgba(236,72,153,0.8)',
      delay: 0.2,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => (
        <AdminStatCard key={card.label} {...card} />
      ))}
    </div>
  )
}