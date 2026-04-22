'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subtext?: string
  accentColor?: string
  delay?: number
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accentColor = 'rgba(99,102,241,1)',
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accentColor}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {label}
        </p>
        {subtext && (
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  )
}