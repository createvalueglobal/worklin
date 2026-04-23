'use client'

import { motion } from 'framer-motion'

interface AdminStatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  accentColor?: string
  delay?: number
}

export function AdminStatCard({
  label,
  value,
  icon,
  trend,
  accentColor = 'rgba(139,92,246,0.8)',
  delay = 0,
}: AdminStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative rounded-xl p-5 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Subtle accent glow top-left */}
      <div
        className="absolute -top-6 -left-6 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: accentColor }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {label}
          </p>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          {trend && (
            <p
              className="text-xs mt-2"
              style={{ color: trend.positive ? '#4ade80' : '#f87171' }}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>

        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: `rgba(${accentColor}, 0.1)`,
            border: `1px solid ${accentColor.replace('0.8', '0.25')}`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}