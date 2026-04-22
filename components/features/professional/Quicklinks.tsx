'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { UserCircle, Heart, ArrowRight } from 'lucide-react'

const QUICK_LINKS = [
  {
    href: '/professional/profile/edit',
    icon: UserCircle,
    label: 'Editar mi perfil',
    description: 'Actualiza tu experiencia, skills e idiomas',
    color: 'rgba(99,102,241,1)',
  },
  {
    href: '/professional/favorites',
    icon: Heart,
    label: 'Ver favoritos',
    description: 'Descubre cuántas empresas están interesadas',
    color: 'rgba(239,68,68,1)',
  },
]

export function QuickLinks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {QUICK_LINKS.map((item, i) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
        >
          <Link
            href={item.href}
            className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={{ background: `${item.color}18` }}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {item.description}
              </p>
            </div>
            <ArrowRight
              className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}