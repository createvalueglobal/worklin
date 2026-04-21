'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function NoSubscriptionCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Glow decorativo */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        }}
      />

      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
        >
          <Sparkles size={18} style={{ color: 'rgba(165, 180, 252, 1)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: 'rgba(224, 231, 255, 0.95)' }}
          >
            Activa un plan para desbloquear perfiles
          </h3>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'rgba(148, 163, 184, 0.75)' }}
          >
            Con un plan activo puedes ver los datos de contacto de los profesionales
            que más te interesan. Desde 19€/mes.
          </p>

          <Link href="/pricing">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'rgba(99, 102, 241, 0.9)',
                color: 'rgba(255, 255, 255, 0.97)',
                border: '1px solid rgba(99, 102, 241, 0.6)',
              }}
            >
              Ver planes
              <ArrowRight size={15} />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}