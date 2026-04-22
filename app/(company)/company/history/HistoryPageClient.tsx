'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, MapPin, Briefcase, ChevronDown,
  Sparkles, ArrowRight, CheckCircle, XCircle, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/common/Avatar'
import type { HistoryBySubscription, UnlockedProfile, SubscriptionStatus } from '@/types/company'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const STATUS_META: Record<SubscriptionStatus, { label: string; color: string; icon: React.ElementType }> = {
  active:    { label: 'Activa',     color: 'rgba(16, 185, 129, 0.8)',  icon: CheckCircle },
  completed: { label: 'Completada', color: 'rgba(99, 102, 241, 0.8)',  icon: CheckCircle },
  expired:   { label: 'Expirada',   color: 'rgba(245, 158, 11, 0.8)',  icon: AlertTriangle },
  cancelled: { label: 'Cancelada',  color: 'rgba(239, 68, 68, 0.8)',   icon: XCircle },
}

// ------------------------------------------------------------
// Banner sin acceso
// ------------------------------------------------------------

function UpgradeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 flex items-start gap-4"
      style={{
        background: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)' }}
      >
        <Sparkles size={18} style={{ color: 'rgba(165, 180, 252, 0.9)' }} />
      </div>
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'rgba(224, 231, 255, 0.95)' }}>
          El historial requiere plan Básico o superior
        </h3>
        <p className="text-sm mb-4" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
          Accede al registro completo de todos los perfiles que has desbloqueado, agrupados por cada suscripción contratada.
        </p>
        <Link href="/pricing">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: 'rgba(99, 102, 241, 0.85)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            <Sparkles size={14} />
            Ver planes
            <ArrowRight size={14} />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Fila de perfil desbloqueado
// ------------------------------------------------------------

function UnlockedProfileRow({ profile }: { profile: UnlockedProfile }) {
  const pro = profile.professional
  const fullName = `${pro.first_name} ${pro.last_name}`

  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <Avatar src={pro.photo_url} alt={fullName} size="sm" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'rgba(203, 213, 225, 0.9)' }}>
          {fullName}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          {pro.main_profession && (
            <span className="text-xs" style={{ color: 'rgba(99, 102, 241, 0.7)' }}>
              {pro.main_profession}
            </span>
          )}
          {pro.province_name && (
            <div className="flex items-center gap-1">
              <MapPin size={9} style={{ color: 'rgba(100, 116, 139, 0.5)' }} />
              <span className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
                {pro.province_name}
              </span>
            </div>
          )}
          {pro.years_experience != null && (
            <div className="flex items-center gap-1">
              <Briefcase size={9} style={{ color: 'rgba(100, 116, 139, 0.5)' }} />
              <span className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
                {pro.years_experience} {pro.years_experience === 1 ? 'año' : 'años'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="hidden sm:flex flex-col items-end gap-1 text-right flex-shrink-0">
        {profile.contact.phone && (
          <a
            href={`tel:${profile.contact.phone}`}
            className="text-xs"
            style={{ color: 'rgba(110, 231, 183, 0.7)' }}
          >
            {profile.contact.phone}
          </a>
        )}
        {profile.contact.contact_email && (
          <a
            href={`mailto:${profile.contact.contact_email}`}
            className="text-xs truncate max-w-[160px]"
            style={{ color: 'rgba(110, 231, 183, 0.7)' }}
          >
            {profile.contact.contact_email}
          </a>
        )}
      </div>

      {/* Fecha desbloqueo */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        <Clock size={10} style={{ color: 'rgba(100, 116, 139, 0.4)' }} />
        <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
          {formatDate(profile.unlocked_at)}
        </span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Bloque de suscripción (colapsable)
// ------------------------------------------------------------

function SubscriptionBlock({ group }: { group: HistoryBySubscription }) {
  const [open, setOpen] = useState(group.status === 'active')
  const statusMeta = STATUS_META[group.status]
  const StatusIcon = statusMeta.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Header colapsable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-5 text-left transition-colors"
        style={{
          background: open ? 'rgba(255,255,255,0.02)' : 'transparent',
        }}
      >
        {/* Badge tier */}
        <div
          className="px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: 'rgba(165, 180, 252, 0.9)',
          }}
        >
          {group.tier_name}
        </div>

        {/* Fechas */}
        <div className="flex-1 min-w-0">
          <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
            {formatDate(group.started_at)} → {formatDate(group.expires_at)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
            {group.profiles.length} perfil{group.profiles.length !== 1 ? 'es' : ''} desbloqueado{group.profiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusIcon size={12} style={{ color: statusMeta.color }} />
          <span className="text-xs hidden sm:inline" style={{ color: statusMeta.color }}>
            {statusMeta.label}
          </span>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={15} style={{ color: 'rgba(100, 116, 139, 0.5)' }} />
        </motion.div>
      </button>

      {/* Lista de perfiles */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="profiles"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              {group.profiles.map((profile) => (
                <UnlockedProfileRow key={profile.id} profile={profile} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Página principal
// ------------------------------------------------------------

interface HistoryPageClientProps {
  allowed: boolean
  history: HistoryBySubscription[]
}

export default function HistoryPageClient({ allowed, history }: HistoryPageClientProps) {
  const totalProfiles = history.reduce((sum, g) => sum + g.profiles.length, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'rgba(224, 231, 255, 0.97)' }}>
          Historial
        </h1>
        {allowed && history.length > 0 && (
          <p className="text-sm mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
            {totalProfiles} perfil{totalProfiles !== 1 ? 'es' : ''} desbloqueado{totalProfiles !== 1 ? 's' : ''} en {history.length} suscripción{history.length !== 1 ? 'es' : ''}
          </p>
        )}
      </div>

      {/* Contenido */}
      {!allowed ? (
        <UpgradeBanner />
      ) : history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Clock size={24} style={{ color: 'rgba(100, 116, 139, 0.4)' }} />
          </div>
          <p className="text-base font-medium mb-1" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
            Todavía no has desbloqueado ningún perfil
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
            Los perfiles que desbloquees aparecerán aquí agrupados por suscripción
          </p>
          <Link href="/company/search">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: 'rgba(165, 180, 252, 0.9)',
              }}
            >
              Buscar profesionales
              <ArrowRight size={14} />
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {history.map((group) => (
            <SubscriptionBlock key={group.subscription_id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}