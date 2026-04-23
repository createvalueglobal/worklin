'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, MapPin, CreditCard, ScrollText, ArrowRight } from 'lucide-react'

const QUICK_ACTIONS = [
  {
    label: 'Gestionar usuarios',
    description: 'Activar, desactivar y consultar perfiles',
    href: '/admin/users',
    icon: <Users size={20} />,
    color: 'rgba(139,92,246,0.15)',
    borderColor: 'rgba(139,92,246,0.25)',
    iconColor: '#a78bfa',
  },
  {
    label: 'Ubicaciones',
    description: 'Países y provincias disponibles',
    href: '/admin/locations',
    icon: <MapPin size={20} />,
    color: 'rgba(59,130,246,0.15)',
    borderColor: 'rgba(59,130,246,0.25)',
    iconColor: '#60a5fa',
  },
  {
    label: 'Tiers de suscripción',
    description: 'Precios, límites y features',
    href: '/admin/tiers',
    icon: <CreditCard size={20} />,
    color: 'rgba(16,185,129,0.15)',
    borderColor: 'rgba(16,185,129,0.25)',
    iconColor: '#34d399',
  },
  {
    label: 'Logs de auditoría',
    description: 'Registro de acciones administrativas',
    href: '/admin/logs',
    icon: <ScrollText size={20} />,
    color: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.25)',
    iconColor: '#fbbf24',
  },
]

export function AdminQuickActions() {
  return (
    <div>
      <h2
        className="text-sm font-medium uppercase tracking-wider mb-3"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Accesos rápidos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
          >
            <Link
              href={action.href}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group"
              style={{
                background: action.color,
                border: `1px solid ${action.borderColor}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ color: action.iconColor }}
              >
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{action.label}</p>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  {action.description}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}