'use client'

import { motion } from 'framer-motion'

interface AdminHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start justify-between gap-4 mb-6"
    >
      <div>
        <h1 className="text-xl font-semibold text-white leading-tight">{title}</h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </motion.div>
  )
}