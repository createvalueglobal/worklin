'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Building2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { StatusBadge, RoleBadge } from '../shared/AdminShared'
import type { AdminUserDetail } from '@/types/admin'

// ============================================================
// USER DETAIL MODAL (slide-over)
// ============================================================

interface UserDetailModalProps {
  userId: string | null
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </span>
      <span className="text-sm text-white">{value ?? '—'}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  )
}

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setUser(null)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.data)
        else setError(data.error ?? 'Error cargando usuario')
      })
      .catch(() => setError('Error de red'))
      .finally(() => setLoading(false))
  }, [userId])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const isOpen = !!userId

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] overflow-y-auto flex flex-col"
            style={{
              background: 'rgba(12, 10, 24, 0.98)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
              style={{
                background: 'rgba(12,10,24,0.95)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <h2 className="text-base font-semibold text-white">Detalle de usuario</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-6 space-y-8">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <span
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'rgba(139,92,246,0.5)', borderTopColor: 'transparent' }}
                  />
                </div>
              )}

              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                >
                  {error}
                </div>
              )}

              {user && !loading && (
                <>
                  {/* Avatar + name */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 overflow-hidden"
                      style={{ background: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.2)' }}
                    >
                      {user.profilePhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.profilePhotoUrl}
                          alt={user.profileName ?? user.email}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span style={{ color: '#a78bfa' }}>
                          {(user.profileName ?? user.email).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-white truncate">
                        {user.profileName ?? '(sin nombre)'}
                      </p>
                      <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <RoleBadge role={user.role} />
                        <StatusBadge active={user.isActive} />
                      </div>
                    </div>
                  </div>

                  {/* Account info */}
                  <Section title="Cuenta">
                    <DetailRow label="ID de usuario" value={
                      <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {user.id.slice(0, 16)}…
                      </span>
                    } />
                    <DetailRow label="Registro" value={
                      new Date(user.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })
                    } />
                    <DetailRow label="Onboarding" value={
                      <span style={{ color: user.onboardingCompleted ? '#34d399' : '#fbbf24' }}>
                        {user.onboardingCompleted ? 'Completado' : 'Pendiente'}
                      </span>
                    } />
                  </Section>

                  {/* Professional data */}
                  {user.professional && (
                    <Section title="Perfil profesional">
                      <DetailRow label="Nombre" value={`${user.professional.firstName} ${user.professional.lastName}`} />
                      <DetailRow label="Profesión" value={user.professional.mainProfession} />
                      <DetailRow label="Teléfono" value={user.professional.phone} />
                      <DetailRow label="Provincia" value={user.professional.province} />
                      <DetailRow label="Visibilidad" value={
                        <span className="flex items-center gap-1.5" style={{ color: user.professional.isVisible ? '#34d399' : 'rgba(255,255,255,0.4)' }}>
                          {user.professional.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                          {user.professional.isVisible ? 'Visible' : 'Oculto'}
                        </span>
                      } />
                      <DetailRow label="Estado perfil" value={
                        <StatusBadge active={user.professional.isActive} />
                      } />
                    </Section>
                  )}

                  {/* Company data */}
                  {user.company && (
                    <>
                      <Section title="Perfil empresa">
                        <DetailRow label="Nombre comercial" value={user.company.companyName} />
                        <DetailRow label="Sector" value={user.company.sector} />
                        <DetailRow label="Provincia" value={user.company.province} />
                        <DetailRow label="Responsable" value={user.company.contactName} />
                        <DetailRow label="Teléfono contacto" value={user.company.contactPhone} />
                        <DetailRow label="Estado perfil" value={
                          <StatusBadge active={user.company.isActive} />
                        } />
                      </Section>

                      {/* Active subscription */}
                      {user.company.activeSubscription && (
                        <div>
                          <h3
                            className="text-xs font-semibold uppercase tracking-wider mb-3"
                            style={{ color: 'rgba(255,255,255,0.3)' }}
                          >
                            Suscripción activa
                          </h3>
                          <div
                            className="rounded-lg p-4 space-y-3"
                            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-white">
                                {user.company.activeSubscription.tierName}
                              </span>
                              <StatusBadge active={true} labelOn="Activa" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <DetailRow
                                label="Perfiles usados"
                                value={`${user.company.activeSubscription.profilesUsed} / ${user.company.activeSubscription.profileLimit}`}
                              />
                              <DetailRow
                                label="Vence"
                                value={
                                  user.company.activeSubscription.expiresAt
                                    ? new Date(user.company.activeSubscription.expiresAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : 'Sin fecha'
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {!user.company.activeSubscription && (
                        <div
                          className="rounded-lg px-4 py-3 text-sm"
                          style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          Sin suscripción activa
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}