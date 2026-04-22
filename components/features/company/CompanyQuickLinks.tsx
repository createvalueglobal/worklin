'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Heart, Clock, Lock } from 'lucide-react'

interface QuickLink {
  href: string
  label: string
  description: string
  icon: React.ElementType
  accent: string
  accentBg: string
  locked?: boolean
  lockMessage?: string
}

interface CompanyQuickLinksProps {
  allowsFavorites: boolean
  allowsHistory: boolean
}

export default function CompanyQuickLinks({
  allowsFavorites,
  allowsHistory,
}: CompanyQuickLinksProps) {
  const links: QuickLink[] = [
    {
      href: '/company/search',
      label: 'Buscar profesionales',
      description: 'Encuentra el perfil que necesitas',
      icon: Search,
      accent: 'rgba(99, 102, 241, 1)',
      accentBg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      href: allowsFavorites ? '/company/favorites' : '#',
      label: 'Favoritos',
      description: allowsFavorites
        ? 'Accede a tus perfiles guardados'
        : 'Requiere plan Básico o superior',
      icon: Heart,
      accent: 'rgba(236, 72, 153, 1)',
      accentBg: 'rgba(236, 72, 153, 0.1)',
      locked: !allowsFavorites,
      lockMessage: 'Plan Básico+',
    },
    {
      href: allowsHistory ? '/company/history' : '#',
      label: 'Historial',
      description: allowsHistory
        ? 'Revisa los perfiles desbloqueados'
        : 'Requiere plan Básico o superior',
      icon: Clock,
      accent: 'rgba(16, 185, 129, 1)',
      accentBg: 'rgba(16, 185, 129, 0.1)',
      locked: !allowsHistory,
      lockMessage: 'Plan Básico+',
    },
  ]

  return (
    <div>
      <h2
        className="text-sm font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'rgba(100, 116, 139, 0.7)' }}
      >
        Accesos rápidos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {links.map((link, i) => {
          const Icon = link.icon
          const isLocked = link.locked

          return (
            <motion.div
              key={link.href + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
            >
              <Link
                href={link.href}
                className="block"
                style={{ pointerEvents: isLocked ? 'none' : 'auto' }}
                tabIndex={isLocked ? -1 : 0}
                aria-disabled={isLocked}
              >
                <motion.div
                  whileHover={isLocked ? {} : { y: -2, scale: 1.01 }}
                  whileTap={isLocked ? {} : { scale: 0.98 }}
                  className="relative p-4 rounded-xl h-full transition-all duration-200"
                  style={{
                    background: isLocked
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
                    backdropFilter: 'blur(8px)',
                    opacity: isLocked ? 0.55 : 1,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  {/* Icono */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: link.accentBg }}
                  >
                    <Icon size={18} style={{ color: link.accent }} />
                  </div>

                  {/* Texto */}
                  <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: 'rgba(203, 213, 225, 0.9)' }}
                  >
                    {link.label}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgba(100, 116, 139, 0.8)' }}
                  >
                    {link.description}
                  </p>

                  {/* Badge locked */}
                  {isLocked && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(100, 116, 139, 0.1)',
                        border: '1px solid rgba(100, 116, 139, 0.2)',
                      }}
                    >
                      <Lock size={9} style={{ color: 'rgba(100, 116, 139, 0.7)' }} />
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: 'rgba(100, 116, 139, 0.7)' }}
                      >
                        {link.lockMessage}
                      </span>
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}