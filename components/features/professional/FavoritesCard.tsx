'use client'

import { motion } from 'framer-motion'
import { Heart, Flame, Clock } from 'lucide-react'

interface FavoritesCardProps {
  count: number
  lastAt: string | null
}

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
  return `hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`
}

export function FavoritesCard({ count, lastAt }: FavoritesCardProps) {
  const hasAny = count > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: hasAny
          ? 'rgba(239,68,68,0.06)'
          : 'rgba(255,255,255,0.04)',
        border: hasAny
          ? '1px solid rgba(239,68,68,0.2)'
          : '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: hasAny ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
          }}
        >
          <Heart
            className="w-5 h-5"
            style={{ color: hasAny ? '#f87171' : 'rgba(255,255,255,0.2)' }}
            fill={hasAny ? 'rgba(239,68,68,0.4)' : 'none'}
          />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Empresas interesadas
          </p>
          <p className="text-2xl font-bold text-white leading-none mt-0.5">{count}</p>
        </div>
      </div>

      {/* Message */}
      {hasAny ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5" style={{ color: '#fb923c' }} />
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {count === 1
                ? '1 empresa tiene tu perfil en favoritos'
                : `${count} empresas tienen tu perfil en favoritos`}
            </p>
          </div>

          {lastAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Último favorito recibido {formatRelativeDate(lastAt)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Aún no tienes favoritos. Completa tu perfil y activa tu visibilidad para aparecer en
          búsquedas.
        </p>
      )}
    </motion.div>
  )
}