'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'                          // ← AÑADIDO
import { Zap, Users, Calendar, AlertTriangle, CheckCircle, TrendingUp, ChevronRight } from 'lucide-react'  // ← ChevronRight AÑADIDO
import type { ActiveSubscriptionSummary } from '@/types/company'

// ------------------------------------------------------------
// Helpers  (sin cambios)
// ------------------------------------------------------------

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getTierColor(tierName: string): { bg: string; border: string; text: string; accent: string } {
  const name = tierName.toLowerCase()
  if (name === 'business') return {
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.25)',
    text: 'rgba(252, 211, 77, 1)',
    accent: 'rgba(245, 158, 11, 1)',
  }
  if (name === 'pro') return {
    bg: 'rgba(99, 102, 241, 0.08)',
    border: 'rgba(99, 102, 241, 0.25)',
    text: 'rgba(165, 180, 252, 1)',
    accent: 'rgba(99, 102, 241, 1)',
  }
  if (name === 'básico' || name === 'basico') return {
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.25)',
    text: 'rgba(110, 231, 183, 1)',
    accent: 'rgba(16, 185, 129, 1)',
  }
  return {
    bg: 'rgba(100, 116, 139, 0.08)',
    border: 'rgba(100, 116, 139, 0.2)',
    text: 'rgba(148, 163, 184, 1)',
    accent: 'rgba(100, 116, 139, 1)',
  }
}

// ------------------------------------------------------------
// Progress bar  (sin cambios)
// ------------------------------------------------------------

function ProfilesProgressBar({
  used,
  limit,
  accent,
}: {
  used: number
  limit: number
  accent: string
}) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const isAlmostFull = pct >= 80
  const isFull = pct >= 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
          Perfiles desbloqueados
        </span>
        <span
          className="text-xs font-semibold"
          style={{
            color: isFull
              ? 'rgba(239, 68, 68, 0.9)'
              : isAlmostFull
              ? 'rgba(245, 158, 11, 0.9)'
              : 'rgba(203, 213, 225, 0.9)',
          }}
        >
          {used} / {limit}
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{
            background: isFull
              ? 'rgba(239, 68, 68, 0.8)'
              : isAlmostFull
              ? 'rgba(245, 158, 11, 0.8)'
              : accent,
          }}
        />
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Feature badge  (sin cambios)
// ------------------------------------------------------------

function FeatureBadge({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
      style={{
        background: enabled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)'}`,
        color: enabled ? 'rgba(110, 231, 183, 0.9)' : 'rgba(100, 116, 139, 0.6)',
      }}
    >
      {enabled ? <CheckCircle size={10} /> : <span style={{ width: 10, height: 10, display: 'inline-block' }}>–</span>}
      {label}
    </div>
  )
}

// ------------------------------------------------------------
// Main component
// ------------------------------------------------------------

interface SubscriptionStatusCardProps {
  subscription: ActiveSubscriptionSummary
}

export default function SubscriptionStatusCard({ subscription }: SubscriptionStatusCardProps) {
  const router = useRouter()                                          // ← AÑADIDO
  const colors = getTierColor(subscription.tier_name)
  const isWarning = subscription.days_remaining <= 7 && !subscription.is_expired
  const cupoAgotado = subscription.profiles_used >= subscription.profile_limit  // ← AÑADIDO

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl p-6"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header — sin cambios excepto badge cupoAgotado */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} style={{ color: colors.accent }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.text }}>
              Plan {subscription.tier_name}
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'rgba(224, 231, 255, 0.95)' }}>
            {subscription.price > 0 ? `${subscription.price} ${subscription.currency}/mes` : 'Gratuito'}
          </p>
        </div>

        {/* Badge: prioridad cupoAgotado > isWarning > activa */}
        {cupoAgotado ? (                                             // ← AÑADIDO
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle size={12} style={{ color: 'rgba(252, 165, 165, 0.9)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(252, 165, 165, 0.9)' }}>
              Cupo agotado
            </span>
          </div>
        ) : isWarning ? (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <AlertTriangle size={12} style={{ color: 'rgba(252, 211, 77, 0.9)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(252, 211, 77, 0.9)' }}>
              Vence pronto
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'rgba(16, 185, 129, 1)' }}
            />
            <span className="text-xs font-medium" style={{ color: 'rgba(110, 231, 183, 0.9)' }}>
              Activa
            </span>
          </div>
        )}
      </div>

      {/* Progress bar — sin cambios */}
      <div className="mb-5">
        <ProfilesProgressBar
          used={subscription.profiles_used}
          limit={subscription.profile_limit}
          accent={colors.accent}
        />
      </div>

      {/* Separador — sin cambios */}
      <div className="mb-4" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Fecha expiración — sin cambios */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={13} style={{ color: 'rgba(100, 116, 139, 0.7)' }} />
        <span className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.8)' }}>
          Válida hasta{' '}
          <span style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
            {formatDate(subscription.expires_at)}
          </span>
          {' '}·{' '}
          <span
            style={{
              color: isWarning ? 'rgba(252, 211, 77, 0.8)' : 'rgba(148, 163, 184, 0.7)',
            }}
          >
            {subscription.days_remaining} días restantes
          </span>
        </span>
      </div>

      {/* Features — sin cambios, solo añadido mb-5 cuando hay CTA */}
      <div className={`flex flex-wrap gap-2 ${cupoAgotado ? 'mb-5' : ''}`}>
        <FeatureBadge label="Filtros avanzados" enabled={subscription.allows_advanced_filters} />
        <FeatureBadge label="Favoritos" enabled={subscription.allows_favorites} />
        <FeatureBadge label="Historial" enabled={subscription.allows_history} />
      </div>

      {/* ── AÑADIDO: CTA solo cuando cupo agotado ──────────────────
          Regla de negocio: con suscripción activa y cupo disponible
          NO se puede contratar otra. Solo cuando profiles_used >= 
          profile_limit se habilita el nuevo checkout.
      ─────────────────────────────────────────────────────────── */}
      {cupoAgotado && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1rem' }} />

          <div
            className="flex items-start gap-3 p-3 rounded-xl mb-4"
            style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
            }}
          >
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(252, 165, 165, 0.8)' }} />
            <p className="text-xs" style={{ color: 'rgba(252, 165, 165, 0.7)' }}>
              Has agotado el cupo de perfiles. Puedes contratar un nuevo plan de forma inmediata.
            </p>
          </div>

          <button
            onClick={() => router.push('/pricing')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))',
            }}
          >
            <Zap size={15} />
            Contratar nuevo plan
            <ChevronRight size={14} />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}