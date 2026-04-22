'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Plan labels mapping
const PLAN_LABELS: Record<string, { name: string; color: string; accent: string }> = {
  basico: {
    name: 'Básico',
    color: 'rgba(99,102,241,0.15)',
    accent: '#818cf8',
  },
  pro: {
    name: 'Pro',
    color: 'rgba(168,85,247,0.15)',
    accent: '#c084fc',
  },
  business: {
    name: 'Business',
    color: 'rgba(245,158,11,0.15)',
    accent: '#fbbf24',
  },
}

interface PendingPlanBannerProps {
  /** href destino del CTA, e.g. "/pricing" o "/company/billing" */
  ctaHref?: string
  /** Cookie name a leer y limpiar. Default: "pending_plan" */
  cookieName?: string
}

export function PendingPlanBanner({
  ctaHref = '/pricing',
  cookieName = 'pending_plan',
}: PendingPlanBannerProps) {
  const [plan, setPlan] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Read cookie on client
    const value = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${cookieName}=`))
      ?.split('=')[1]

    if (value && PLAN_LABELS[value]) {
      setPlan(value)
    }
  }, [cookieName])

  const handleDismiss = () => {
    setDismissed(true)
    // Clear the cookie
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }

  if (!plan || dismissed) return null

  const config = PLAN_LABELS[plan]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative rounded-xl overflow-hidden mb-6"
        style={{
          background: config.color,
          border: `1px solid ${config.accent}40`,
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top left, ${config.accent}40 0%, transparent 70%)`,
          }}
        />

        <div className="relative flex items-center gap-4 px-5 py-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${config.accent}25` }}
          >
            <Sparkles className="w-4 h-4" style={{ color: config.accent }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              Seleccionaste el plan{' '}
              <span style={{ color: config.accent }} className="font-semibold">
                {config.name}
              </span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Actívalo ahora para empezar a encontrar profesionales
            </p>
          </div>

          {/* CTA */}
          <Link
            href={ctaHref}
            onClick={handleDismiss}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: config.accent,
              color: '#0a0a0f',
            }}
          >
            Activar
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}