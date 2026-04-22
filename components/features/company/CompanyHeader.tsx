'use client'

import { motion } from 'framer-motion'
import { Building2, MapPin, Globe } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import type { CompanyWithLocation } from '@/types/company'

interface CompanyHeaderProps {
  company: CompanyWithLocation
  greeting?: string
}

export default function CompanyHeader({ company, greeting }: CompanyHeaderProps) {
  const displayName = company.company_name || 'Tu empresa'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center gap-4"
    >
      {/* Logo empresa */}
      <Avatar
        src={company.logo_url}
        alt={displayName}
        size="lg"
      />

      {/* Info */}
      <div>
        {greeting && (
          <p className="text-xs mb-0.5" style={{ color: 'rgba(100, 116, 139, 0.8)' }}>
            {greeting}
          </p>
        )}
        <h1
          className="text-xl font-bold leading-tight"
          style={{ color: 'rgba(224, 231, 255, 0.97)' }}
        >
          {displayName}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {company.sector && (
            <div className="flex items-center gap-1">
              <Building2 size={12} style={{ color: 'rgba(99, 102, 241, 0.7)' }} />
              <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                {company.sector}
              </span>
            </div>
          )}
          {company.province_name && (
            <div className="flex items-center gap-1">
              <MapPin size={12} style={{ color: 'rgba(99, 102, 241, 0.7)' }} />
              <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                {company.province_name}
              </span>
            </div>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors"
              style={{ color: 'rgba(99, 102, 241, 0.7)' }}
            >
              <Globe size={12} />
              <span className="text-xs underline-offset-2 hover:underline">
                Web
              </span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}