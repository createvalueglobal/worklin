'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import SearchFiltersPanel from '@/components/features/company/SearchFilters'
import ProfessionalGrid from '@/components/features/company/ProfessionalGrid'
import { UnlockModal, UpgradeModal } from '@/components/features/company/Modals'
import { useUnlock } from '@/hooks/useUnlock'
import type { SearchFilters, SearchResult, ProfessionalCardData } from '@/types/company'

// ------------------------------------------------------------
// Tipos de props — datos que vienen del Server Component padre
// ------------------------------------------------------------

interface SearchPageClientProps {
  allowsAdvancedFilters: boolean
  allowsFavorites: boolean
  profilesRemaining: number | null
  provinces: { id: string; name: string }[]
}

export default function SearchPageClient({
  allowsAdvancedFilters,
  allowsFavorites,
  profilesRemaining,
  provinces,
}: SearchPageClientProps) {
  const [result, setResult] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({})
  const [page, setPage] = useState(1)
  const hasFilters = Object.values(currentFilters).some(Boolean)

  // Referencia para evitar fetch doble en StrictMode
  const fetchRef = useRef<AbortController | null>(null)

  // ------------------------------------------------------------
  // Fetch de búsqueda
  // ------------------------------------------------------------

  const fetchProfessionals = useCallback(async (filters: SearchFilters, targetPage: number) => {
    // Cancelar fetch anterior si existe
    fetchRef.current?.abort()
    const controller = new AbortController()
    fetchRef.current = controller

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(targetPage))
      params.set('page_size', '12')

      if (filters.province_id) params.set('province_id', filters.province_id)
      if (filters.main_profession) params.set('main_profession', filters.main_profession)
      if (filters.availability) params.set('availability', filters.availability)
      if (filters.work_mode) params.set('work_mode', filters.work_mode)
      if (filters.salary_min != null) params.set('salary_min', String(filters.salary_min))
      if (filters.salary_max != null) params.set('salary_max', String(filters.salary_max))
      if (filters.language) params.set('language', filters.language)
      if (filters.skill) params.set('skill', filters.skill)

      const res = await fetch(`/api/company/search?${params.toString()}`, {
        signal: controller.signal,
      })

      if (!res.ok) throw new Error('Error en la búsqueda')
      const data: SearchResult = await res.json()
      setResult(data)
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      toast.error('No se pudieron cargar los resultados. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carga inicial
  useEffect(() => {
    fetchProfessionals({}, 1)
  }, [fetchProfessionals])

  // ------------------------------------------------------------
  // Búsqueda con filtros
  // ------------------------------------------------------------

  const handleSearch = useCallback((filters: SearchFilters) => {
    setCurrentFilters(filters)
    setPage(1)
    fetchProfessionals(filters, 1)
  }, [fetchProfessionals])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    fetchProfessionals(currentFilters, newPage)
    // Scroll suave al inicio de los resultados
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentFilters, fetchProfessionals])

  // ------------------------------------------------------------
  // Desbloqueo
  // ------------------------------------------------------------

  // Al desbloquear con éxito, actualizar la tarjeta en el resultado local
  const handleUnlockSuccess = useCallback((professionalId: string) => {
    setResult((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        professionals: prev.professionals.map((p: ProfessionalCardData) =>
          p.id === professionalId
            ? { ...p, is_unlocked: true }
            : p
        ),
      }
    })
    toast.success('Perfil desbloqueado correctamente')
  }, [])

  const { state: unlockState, requestUnlock, confirmUnlock, dismiss } = useUnlock(
    handleUnlockSuccess
  )

  const isConfirming = unlockState.status === 'confirming'
  const isUnlocking = unlockState.status === 'loading'
  const isUpgradeRequired = unlockState.status === 'upgrade_required'

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Título */}
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'rgba(224, 231, 255, 0.97)' }}>
            Buscar profesionales
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
            {allowsAdvancedFilters
              ? 'Filtros avanzados activos en tu plan'
              : 'Actualiza tu plan para acceder a filtros avanzados'}
          </p>
        </div>

        {/* Filtros */}
        <SearchFiltersPanel
          allowsAdvancedFilters={allowsAdvancedFilters}
          provinces={provinces}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Resultados */}
        <ProfessionalGrid
          result={result}
          isLoading={isLoading}
          hasFilters={hasFilters}
          allowsFavorites={allowsFavorites}
          page={page}
          onPageChange={handlePageChange}
          onUnlock={requestUnlock}
          onFavoriteError={(msg) => toast.error(msg)}
        />
      </div>

      {/* Modal confirmación desbloqueo */}
      <UnlockModal
        isOpen={isConfirming || isUnlocking}
        isLoading={isUnlocking}
        professionalName={
          isConfirming || isUnlocking
            ? (unlockState as any).professionalName ?? ''
            : ''
        }
        profilesRemaining={profilesRemaining ?? undefined}
        onConfirm={confirmUnlock}
        onClose={dismiss}
      />

      {/* Modal upgrade */}
      <UpgradeModal
        isOpen={isUpgradeRequired}
        reason={isUpgradeRequired ? (unlockState as any).reason : null}
        onClose={dismiss}
      />
    </>
  )
}