'use client'

import { motion } from 'framer-motion'

interface SectionCardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  delay?: number
  noPadding?: boolean
}

export function SectionCard({
  title,
  subtitle,
  children,
  className = '',
  delay = 0,
  noPadding = false,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`rounded-2xl ${noPadding ? '' : 'p-6'} ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {(title || subtitle) && (
        <div className={`${noPadding ? 'px-6 pt-6' : ''} mb-5`}>
          {title && (
            <h2 className="text-base font-semibold text-white">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  )
}