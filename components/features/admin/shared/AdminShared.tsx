'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, InboxIcon } from 'lucide-react'

// ============================================================
// ADMIN PAGINATION
// ============================================================

interface AdminPaginationProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ page, total, limit, onPageChange }: AdminPaginationProps) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2 text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ============================================================
// ADMIN EMPTY STATE
// ============================================================

interface AdminEmptyStateProps {
  message?: string
  icon?: React.ReactNode
}

export function AdminEmptyState({
  message = 'No hay resultados',
  icon,
}: AdminEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 gap-3"
    >
      <div style={{ color: 'rgba(255,255,255,0.15)' }}>
        {icon ?? <InboxIcon size={36} />}
      </div>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {message}
      </p>
    </motion.div>
  )
}

// ============================================================
// STATUS BADGE
// ============================================================

interface StatusBadgeProps {
  active: boolean
  labelOn?: string
  labelOff?: string
}

export function StatusBadge({
  active,
  labelOn = 'Activo',
  labelOff = 'Inactivo',
}: StatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
        color: active ? '#34d399' : '#f87171',
        border: `1px solid ${active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? '#34d399' : '#f87171' }}
      />
      {active ? labelOn : labelOff}
    </span>
  )
}

// ============================================================
// ROLE BADGE
// ============================================================

interface RoleBadgeProps {
  role: 'professional' | 'company' | 'admin'
}

const ROLE_STYLES = {
  professional: {
    bg: 'rgba(139,92,246,0.12)',
    color: '#a78bfa',
    border: 'rgba(139,92,246,0.2)',
    label: 'Profesional',
  },
  company: {
    bg: 'rgba(59,130,246,0.12)',
    color: '#60a5fa',
    border: 'rgba(59,130,246,0.2)',
    label: 'Empresa',
  },
  admin: {
    bg: 'rgba(245,158,11,0.12)',
    color: '#fbbf24',
    border: 'rgba(245,158,11,0.2)',
    label: 'Admin',
  },
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const style = ROLE_STYLES[role]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {style.label}
    </span>
  )
}

// ============================================================
// ADMIN CARD WRAPPER
// ============================================================

export function AdminCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {children}
    </div>
  )
}