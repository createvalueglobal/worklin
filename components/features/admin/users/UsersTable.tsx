'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { AdminPagination, AdminEmptyState, StatusBadge, RoleBadge, AdminCard } from '../shared/AdminShared'
import { ToggleActiveButton } from './ToggleActiveButton'
import { UserDetailModal } from './UserDetailModal'
import type { AdminUserRow, AdminUsersResponse } from '@/types/admin'

// ============================================================
// USERS TABLE
// ============================================================

interface UsersTableProps {
  initialData: AdminUsersResponse
  currentPage: number
}

function UserAvatar({ user }: { user: AdminUserRow }) {
  if (user.profilePhotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.profilePhotoUrl}
        alt={user.profileName ?? user.email}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      />
    )
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
    >
      {(user.profileName ?? user.email).charAt(0).toUpperCase()}
    </div>
  )
}

export function UsersTable({ initialData, currentPage }: UsersTableProps) {
  const [rows, setRows] = useState<AdminUserRow[]>(initialData.data)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Optimistic update on toggle
  const handleToggleSuccess = useCallback((userId: string, newValue: boolean) => {
    setRows((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: newValue } : u))
    )
  }, [])

  if (rows.length === 0) {
    return <AdminEmptyState message="No se encontraron usuarios con esos filtros" />
  }

  return (
    <>
      <AdminCard>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Usuario', 'Email', 'Rol', 'Estado', 'Registro', 'Acciones'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group transition-colors duration-150"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar user={user} />
                      <span className="text-white font-medium truncate max-w-[140px]">
                        {user.profileName ?? '(sin nombre)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <span className="truncate block max-w-[180px]">{user.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={user.isActive} />
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="p-1.5 rounded-lg transition-colors duration-150"
                        style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
                        title="Ver detalle"
                      >
                        <Eye size={14} />
                      </button>
                      {user.role !== 'admin' && (
                        <ToggleActiveButton
                          userId={user.id}
                          isActive={user.isActive}
                          userName={user.profileName ?? user.email}
                          onSuccess={(val) => handleToggleSuccess(user.id, val)}
                        />
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {rows.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={user} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.profileName ?? '(sin nombre)'}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <RoleBadge role={user.role} />
                <StatusBadge active={user.isActive} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(user.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedUserId(user.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors duration-150"
                  style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Eye size={13} />
                  Ver detalle
                </button>
                {user.role !== 'admin' && (
                  <ToggleActiveButton
                    userId={user.id}
                    isActive={user.isActive}
                    userName={user.profileName ?? user.email}
                    onSuccess={(val) => handleToggleSuccess(user.id, val)}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-4 pb-4">
          <AdminPagination
            page={currentPage}
            total={initialData.total}
            limit={initialData.limit}
            onPageChange={(p) => {
              const url = new URL(window.location.href)
              url.searchParams.set('page', String(p))
              window.location.href = url.toString()
            }}
          />
        </div>
      </AdminCard>

      {/* Detail modal */}
      <UserDetailModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  )
}