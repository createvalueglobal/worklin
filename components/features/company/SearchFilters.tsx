'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Lock, ChevronDown, X } from 'lucide-react'
import type { SearchFilters, AvailabilityStatus, WorkMode } from '@/types/company'

// ------------------------------------------------------------
// Datos estáticos de opciones
// ------------------------------------------------------------

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: 'immediate', label: 'Disponible ahora' },
  { value: 'in_days', label: 'En pocos días' },
  { value: 'not_available', label: 'No disponible' },
]

const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: 'presential', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'remote', label: 'Remoto' },
]

const LANGUAGES = [
  'Español', 'Inglés', 'Francés', 'Alemán', 'Italiano',
  'Portugués', 'Chino', 'Árabe', 'Ruso', 'Japonés',
]

// ------------------------------------------------------------
// Sub-componentes de inputs
// ------------------------------------------------------------

function FilterInput({
  label,
  placeholder,
  value,
  onChange,
  icon,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  icon?: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
            {icon}
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(203, 213, 225, 0.9)',
            padding: icon ? '10px 12px 10px 36px' : '10px 12px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = '1px solid rgba(99, 102, 241, 0.4)'
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          }}
        />
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: value ? 'rgba(203, 213, 225, 0.9)' : 'rgba(100, 116, 139, 0.6)',
          padding: '10px 12px',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#1a1a2e' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function LockedAdvancedFilters() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl p-4 flex items-center gap-3"
      style={{
        background: 'rgba(100, 116, 139, 0.05)',
        border: '1px dashed rgba(100, 116, 139, 0.2)',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(100, 116, 139, 0.1)' }}
      >
        <Lock size={14} style={{ color: 'rgba(100, 116, 139, 0.6)' }} />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
          Filtros avanzados
        </p>
        <p className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
          Disponibles desde el plan Pro. Filtra por disponibilidad, modalidad, idioma, salario y skills.
        </p>
      </div>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------

interface SearchFiltersProps {
  allowsAdvancedFilters: boolean
  provinces: { id: string; name: string }[]
  onSearch: (filters: SearchFilters) => void
  isLoading: boolean
}

export default function SearchFiltersPanel({
  allowsAdvancedFilters,
  provinces,
  onSearch,
  isLoading,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})

  const set = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }, [])

  const handleSearch = () => onSearch(filters)

  const hasActiveFilters = Object.values(filters).some(Boolean)

  const handleClear = () => {
    setFilters({})
    onSearch({})
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header filtros */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} style={{ color: 'rgba(99, 102, 241, 0.8)' }} />
          <span className="text-sm font-semibold" style={{ color: 'rgba(203, 213, 225, 0.9)' }}>
            Filtros
          </span>
          {hasActiveFilters && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'rgba(165, 180, 252, 0.9)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              Activos
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: 'rgba(100, 116, 139, 0.7)' }}
          >
            <X size={12} />
            Limpiar
          </button>
        )}
      </div>

      {/* Filtros básicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <FilterSelect
          label="Provincia"
          value={filters.province_id ?? ''}
          onChange={(v) => set('province_id', v)}
          options={provinces.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Todas las provincias"
        />
        <FilterInput
          label="Profesión"
          placeholder="Ej: Cocinero, Electricista..."
          value={filters.main_profession ?? ''}
          onChange={(v) => set('main_profession', v)}
          icon={<Search size={14} />}
        />
      </div>

      {/* Toggle filtros avanzados */}
      <button
        onClick={() => allowsAdvancedFilters && setShowAdvanced((v) => !v)}
        className="flex items-center gap-2 text-xs mb-3 transition-colors"
        style={{
          color: allowsAdvancedFilters
            ? 'rgba(99, 102, 241, 0.8)'
            : 'rgba(100, 116, 139, 0.5)',
          cursor: allowsAdvancedFilters ? 'pointer' : 'default',
        }}
      >
        <motion.div
          animate={{ rotate: showAdvanced && allowsAdvancedFilters ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={13} />
        </motion.div>
        {allowsAdvancedFilters ? 'Filtros avanzados' : 'Filtros avanzados (Plan Pro+)'}
        {!allowsAdvancedFilters && <Lock size={11} />}
      </button>

      {/* Panel avanzado */}
      <AnimatePresence>
        {!allowsAdvancedFilters ? (
          <LockedAdvancedFilters />
        ) : showAdvanced ? (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 pb-4">
              <FilterSelect
                label="Disponibilidad"
                value={filters.availability ?? ''}
                onChange={(v) => set('availability', v as AvailabilityStatus)}
                options={AVAILABILITY_OPTIONS}
                placeholder="Cualquier disponibilidad"
              />
              <FilterSelect
                label="Modalidad"
                value={filters.work_mode ?? ''}
                onChange={(v) => set('work_mode', v as WorkMode)}
                options={WORK_MODE_OPTIONS}
                placeholder="Cualquier modalidad"
              />
              <FilterSelect
                label="Idioma"
                value={filters.language ?? ''}
                onChange={(v) => set('language', v)}
                options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                placeholder="Cualquier idioma"
              />
              <FilterInput
                label="Salario mínimo (€/año)"
                placeholder="Ej: 18000"
                value={filters.salary_min?.toString() ?? ''}
                onChange={(v) => set('salary_min', v ? parseInt(v) : undefined)}
              />
              <FilterInput
                label="Salario máximo (€/año)"
                placeholder="Ej: 30000"
                value={filters.salary_max?.toString() ?? ''}
                onChange={(v) => set('salary_max', v ? parseInt(v) : undefined)}
              />
              <FilterInput
                label="Skill específico"
                placeholder="Ej: Bartender, AutoCAD..."
                value={filters.skill ?? ''}
                onChange={(v) => set('skill', v)}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Botón buscar */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSearch}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{
          background: isLoading ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.85)',
          color: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(99, 102, 241, 0.5)',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? (
          <>
            <div
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: 'transparent' }}
            />
            Buscando...
          </>
        ) : (
          <>
            <Search size={15} />
            Buscar profesionales
          </>
        )}
      </motion.button>
    </motion.div>
  )
}