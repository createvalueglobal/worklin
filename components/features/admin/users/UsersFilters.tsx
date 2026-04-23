'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'

// ============================================================
// USERS FILTERS
// URL-driven filters — no local state needed
// ============================================================

export function UsersFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const role = searchParams.get('role') ?? 'all'
  const isActive = searchParams.get('isActive') ?? 'all'
  const search = searchParams.get('search') ?? ''

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // reset to page 1 on filter change
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const clearAll = () => {
    router.push(pathname)
  }

  const hasFilters = role !== 'all' || isActive !== 'all' || search !== ''

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        />
        <input
          type="text"
          placeholder="Buscar por email..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParam('search', (e.target as HTMLInputElement).value)
            }
          }}
          onBlur={(e) => updateParam('search', e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-colors duration-150"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.85)',
          }}
        />
      </div>

      {/* Role filter */}
      <select
        value={role}
        onChange={(e) => updateParam('role', e.target.value)}
        className="px-3 py-2 rounded-lg text-sm outline-none transition-colors duration-150 cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.75)',
        }}
      >
        <option value="all">Todos los roles</option>
        <option value="professional">Profesional</option>
        <option value="company">Empresa</option>
        <option value="admin">Admin</option>
      </select>

      {/* Active filter */}
      <select
        value={isActive}
        onChange={(e) => updateParam('isActive', e.target.value)}
        className="px-3 py-2 rounded-lg text-sm outline-none transition-colors duration-150 cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.75)',
        }}
      >
        <option value="all">Todos los estados</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
          style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <X size={14} />
          Limpiar
        </button>
      )}
    </div>
  )
}