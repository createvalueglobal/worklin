'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Pencil, Eye, EyeOff } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/Statusbadge'
import { useVisibilityToggle } from '@/hooks/useVisibilityToggle'
import type { ProfessionalDashboardDTO } from '@/types/professional'

interface ProfileSummaryCardProps {
  professional: ProfessionalDashboardDTO
  onVisibilityChange?: (isVisible: boolean) => void
}

export function ProfileSummaryCard({ professional, onVisibilityChange }: ProfileSummaryCardProps) {
  const { isVisible, isLoading, toggle } = useVisibilityToggle({
    initialValue: professional.isVisible,
    onSuccess: onVisibilityChange,
  })

  const location = [professional.provinceName, professional.countryName]
    .filter(Boolean)
    .join(', ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <Avatar src={professional.photoUrl} alt={professional.fullName} size="xl" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">
                {professional.fullName}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {professional.mainProfession}
              </p>
              {location && (
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {location}
                  </span>
                </div>
              )}
            </div>

            {/* Edit button */}
            <Link
              href="/professional/profile/edit"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-white/10"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              <Pencil className="w-3 h-3" />
              Editar
            </Link>
          </div>

          {/* Status row */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <StatusBadge
              active={professional.isActive}
              labelActive="Cuenta activa"
              labelInactive="Cuenta suspendida"
              size="sm"
            />

            {/* Visibility toggle */}
            <button
              onClick={toggle}
              disabled={isLoading || !professional.isActive}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isVisible ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isVisible ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)'}`,
                color: isVisible ? '#4ade80' : 'rgba(255,255,255,0.4)',
              }}
            >
              {isLoading ? (
                <span
                  className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin"
                />
              ) : isVisible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
              {isVisible ? 'Visible en búsquedas' : 'Oculto en búsquedas'}
            </button>
          </div>
        </div>
      </div>

      {/* Visibility explanation */}
      {!isVisible && professional.isActive && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 text-xs rounded-lg px-3 py-2.5"
          style={{
            background: 'rgba(255,193,7,0.08)',
            border: '1px solid rgba(255,193,7,0.15)',
            color: 'rgba(255,193,7,0.8)',
          }}
        >
          Tu perfil está oculto. Las empresas no pueden encontrarte en las búsquedas.
          Activa tu visibilidad para recibir oportunidades.
        </motion.p>
      )}
    </motion.div>
  )
}