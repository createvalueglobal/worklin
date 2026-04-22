'use client'

import { motion } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import ProfessionalCard from './ProfessionalCard'
import type { ProfessionalCardData, SearchResult } from '@/types/company'

// ------------------------------------------------------------
// Estado vacío
// ------------------------------------------------------------

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <Search size={24} style={{ color: 'rgba(100, 116, 139, 0.5)' }} />
      </div>
      <p className="text-base font-medium mb-1" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
        {hasFilters ? 'Sin resultados para estos filtros' : 'No hay profesionales disponibles'}
      </p>
      <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
        {hasFilters
          ? 'Prueba a ampliar o cambiar los filtros de búsqueda'
          : 'Vuelve más tarde o ajusta tus criterios de búsqueda'}
      </p>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Skeleton loader
// ------------------------------------------------------------

function CardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 space-y-4 animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 rounded-md w-3/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-3 rounded-md w-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-3 rounded-md w-1/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
      <div className="flex gap-2">
        {[60, 80, 70].map((w, i) => (
          <div key={i} className="h-5 rounded-full" style={{ width: w, background: 'rgba(255,255,255,0.05)' }} />
        ))}
      </div>
      <div className="flex gap-1.5">
        {[50, 65, 45].map((w, i) => (
          <div key={i} className="h-5 rounded-md" style={{ width: w, background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />
      <div className="space-y-1.5">
        <div className="h-7 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-7 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Paginación
// ------------------------------------------------------------

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  // Generar rango de páginas visible
  const range: (number | '...')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      {/* Anterior */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          color: page === 1 ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.7)',
          cursor: page === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Números */}
      {range.map((item, i) =>
        item === '...' ? (
          <span key={`dots-${i}`} style={{ color: 'rgba(100, 116, 139, 0.5)' }} className="px-1">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item as number)}
            className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
            style={{
              background: page === item ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${page === item ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255,255,255,0.07)'}`,
              color: page === item ? 'rgba(165, 180, 252, 0.95)' : 'rgba(148, 163, 184, 0.7)',
            }}
          >
            {item}
          </button>
        )
      )}

      {/* Siguiente */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          color: page === totalPages ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.7)',
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ------------------------------------------------------------
// Grid principal
// ------------------------------------------------------------

interface ProfessionalGridProps {
  result: SearchResult | null
  isLoading: boolean
  hasFilters: boolean
  allowsFavorites: boolean
  page: number
  onPageChange: (p: number) => void
  onUnlock: (professionalId: string, professionalName: string) => void
  onFavoriteError?: (message: string) => void
}

export default function ProfessionalGrid({
  result,
  isLoading,
  hasFilters,
  allowsFavorites,
  page,
  onPageChange,
  onUnlock,
  onFavoriteError,
}: ProfessionalGridProps) {
  // Skeleton mientras carga
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Sin resultados
  if (!result || result.professionals.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState hasFilters={hasFilters} />
      </div>
    )
  }

  return (
    <div>
      {/* Contador */}
      <p className="text-xs mb-4" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
        {result.total} profesional{result.total !== 1 ? 'es' : ''} encontrado{result.total !== 1 ? 's' : ''}
        {result.total_pages > 1 && ` · Página ${page} de ${result.total_pages}`}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {result.professionals.map((pro: ProfessionalCardData, i: number) => (
          <ProfessionalCard
            key={pro.id}
            professional={pro}
            index={i}
            allowsFavorites={allowsFavorites}
            onUnlock={onUnlock}
            onFavoriteError={onFavoriteError}
          />
        ))}
      </div>

      {/* Paginación */}
      <Pagination
        page={page}
        totalPages={result.total_pages}
        onPageChange={onPageChange}
      />
    </div>
  )
}