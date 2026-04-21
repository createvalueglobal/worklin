import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfessionalByUserId } from '@/lib/repositories/professional.repository'
import { getFavoritesCount } from '@/lib/repositories/professional.repository'
import { motion } from 'framer-motion'
import { Heart, Flame, Clock, ShieldCheck } from 'lucide-react'

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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

export default async function ProfessionalFavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const professional = await getProfessionalByUserId(user.id)
  if (!professional) redirect('/onboarding/role')

  const { total, lastAt } = await getFavoritesCount(professional.id)
  const hasAny = total > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Favoritos recibidos</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Empresas que han guardado tu perfil
        </p>
      </div>

      {/* Hero metric */}
      <div
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{
          background: hasAny ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)',
          border: hasAny ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Background glow */}
        {hasAny && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.12) 0%, transparent 70%)',
            }}
          />
        )}

        <div className="relative flex flex-col items-center gap-4">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: hasAny ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)' }}
          >
            <Heart
              className="w-8 h-8"
              style={{ color: hasAny ? '#f87171' : 'rgba(255,255,255,0.2)' }}
              fill={hasAny ? 'rgba(239,68,68,0.35)' : 'none'}
            />
          </div>

          {/* Count */}
          <div>
            <p
              className="text-6xl font-bold leading-none"
              style={{ color: hasAny ? '#f87171' : 'rgba(255,255,255,0.15)' }}
            >
              {total}
            </p>
            <p className="text-base font-medium mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {total === 0
                ? 'empresas han guardado tu perfil'
                : total === 1
                ? 'empresa tiene tu perfil en favoritos'
                : 'empresas tienen tu perfil en favoritos'}
            </p>
          </div>

          {/* Last received */}
          {hasAny && lastAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Último favorito recibido{' '}
                <span className="text-white font-medium">{formatRelativeDate(lastAt)}</span>
                {' '}·{' '}
                <span>{formatDate(lastAt)}</span>
              </p>
            </div>
          )}

          {/* Motivational message */}
          {hasAny && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(251,146,60,0.12)',
                border: '1px solid rgba(251,146,60,0.2)',
              }}
            >
              <Flame className="w-3.5 h-3.5" style={{ color: '#fb923c' }} />
              <p className="text-sm font-medium" style={{ color: '#fb923c' }}>
                ¡Tu perfil está generando interés!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Privacy notice */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3.5"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(99,102,241,0.7)' }} />
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span className="text-white font-medium">Tu privacidad está protegida.</span>{' '}
          Solo ves el número total de empresas interesadas. No revelamos qué empresas específicas
          han guardado tu perfil para garantizar un proceso justo y transparente.
        </p>
      </div>

      {/* Empty state */}
      {!hasAny && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-sm font-medium text-white mb-1">Aún no tienes favoritos</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Asegúrate de que tu perfil está completo y visible en búsquedas.
            Las empresas podrán encontrarte y guardar tu perfil.
          </p>
        </div>
      )}
    </div>
  )
}