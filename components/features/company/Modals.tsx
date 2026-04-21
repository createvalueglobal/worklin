'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LockKeyhole, X, AlertTriangle, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// ------------------------------------------------------------
// Backdrop compartido
// ------------------------------------------------------------

function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    />
  )
}

// Panel base del modal
function ModalPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 16 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 pointer-events-auto"
        style={{
          background: 'rgba(15, 15, 25, 0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Modal de confirmación de desbloqueo
// ------------------------------------------------------------

interface UnlockModalProps {
  isOpen: boolean
  isLoading: boolean
  professionalName: string
  profilesRemaining?: number
  onConfirm: () => void
  onClose: () => void
}

export function UnlockModal({
  isOpen,
  isLoading,
  professionalName,
  profilesRemaining,
  onConfirm,
  onClose,
}: UnlockModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClose={!isLoading ? onClose : () => {}} />
          <ModalPanel>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}
              >
                <LockKeyhole size={18} style={{ color: 'rgba(165, 180, 252, 0.9)' }} />
              </div>
              {!isLoading && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(100, 116, 139, 0.6)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Contenido */}
            <h2
              className="text-base font-semibold mb-1"
              style={{ color: 'rgba(224, 231, 255, 0.97)' }}
            >
              Desbloquear perfil
            </h2>
            <p className="text-sm mb-4" style={{ color: 'rgba(148, 163, 184, 0.75)' }}>
              Estás a punto de desbloquear los datos de contacto de{' '}
              <span style={{ color: 'rgba(203, 213, 225, 0.9)', fontWeight: 600 }}>
                {professionalName}
              </span>
              . Esto consumirá 1 crédito de tu plan.
            </p>

            {/* Info créditos restantes */}
            {profilesRemaining != null && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl mb-5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <CheckCircle size={14} style={{ color: 'rgba(16, 185, 129, 0.7)' }} />
                <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                  Tienes{' '}
                  <span style={{ color: 'rgba(110, 231, 183, 0.9)', fontWeight: 600 }}>
                    {profilesRemaining} crédito{profilesRemaining !== 1 ? 's' : ''}
                  </span>{' '}
                  disponible{profilesRemaining !== 1 ? 's' : ''} en tu plan
                </span>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(148, 163, 184, 0.8)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                Cancelar
              </button>
              <motion.button
                whileHover={isLoading ? {} : { scale: 1.02 }}
                whileTap={isLoading ? {} : { scale: 0.98 }}
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: isLoading ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.85)',
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  color: 'rgba(255,255,255,0.95)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: 'transparent' }}
                    />
                    Desbloqueando...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={14} />
                    Confirmar
                  </>
                )}
              </motion.button>
            </div>
          </ModalPanel>
        </>
      )}
    </AnimatePresence>
  )
}

// ------------------------------------------------------------
// Modal de upgrade (sin suscripción o sin cupo)
// ------------------------------------------------------------

type UpgradeReason =
  | 'NO_ACTIVE_SUBSCRIPTION'
  | 'NO_QUOTA_REMAINING'
  | 'SUBSCRIPTION_EXPIRED'

const UPGRADE_CONTENT: Record<UpgradeReason, { title: string; description: string }> = {
  NO_ACTIVE_SUBSCRIPTION: {
    title: 'Necesitas un plan activo',
    description:
      'Para desbloquear datos de contacto de profesionales necesitas contratar un plan. Desde 19€/mes.',
  },
  NO_QUOTA_REMAINING: {
    title: 'Has agotado tus créditos',
    description:
      'Has utilizado todos los perfiles de tu plan actual. Contrata un nuevo plan para seguir desbloqueando perfiles.',
  },
  SUBSCRIPTION_EXPIRED: {
    title: 'Tu plan ha expirado',
    description:
      'Tu suscripción ha llegado a su fecha de vencimiento. Renueva o contrata un nuevo plan para continuar.',
  },
}

interface UpgradeModalProps {
  isOpen: boolean
  reason: UpgradeReason | null
  onClose: () => void
}

export function UpgradeModal({ isOpen, reason, onClose }: UpgradeModalProps) {
  const content = reason ? UPGRADE_CONTENT[reason] : null

  return (
    <AnimatePresence>
      {isOpen && content && (
        <>
          <Backdrop onClose={onClose} />
          <ModalPanel>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              >
                <AlertTriangle size={18} style={{ color: 'rgba(252, 211, 77, 0.9)' }} />
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg"
                style={{ color: 'rgba(100, 116, 139, 0.6)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido */}
            <h2
              className="text-base font-semibold mb-2"
              style={{ color: 'rgba(224, 231, 255, 0.97)' }}
            >
              {content.title}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(148, 163, 184, 0.75)' }}>
              {content.description}
            </p>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(148, 163, 184, 0.8)',
                }}
              >
                Ahora no
              </button>
              <Link href="/pricing" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: 'rgba(252, 211, 77, 0.95)',
                  }}
                >
                  <Sparkles size={14} />
                  Ver planes
                  <ArrowRight size={13} />
                </motion.button>
              </Link>
            </div>
          </ModalPanel>
        </>
      )}
    </AnimatePresence>
  )
}