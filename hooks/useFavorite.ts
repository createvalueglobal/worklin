'use client'

import { useState } from 'react'

interface UseFavoriteOptions {
  initialIsFavorite: boolean
  professionalId: string
  onError?: (message: string) => void
}

interface UseFavoriteReturn {
  isFavorite: boolean
  isLoading: boolean
  toggle: () => Promise<void>
}

export function useFavorite({
  initialIsFavorite,
  professionalId,
  onError,
}: UseFavoriteOptions): UseFavoriteReturn {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)

  const toggle = async () => {
    if (isLoading) return

    // Optimistic update
    const previous = isFavorite
    setIsFavorite(!previous)
    setIsLoading(true)

    try {
      const method = previous ? 'DELETE' : 'POST'
      const res = await fetch('/api/company/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professional_id: professionalId }),
      })

      if (!res.ok) {
        const data = await res.json()
        // Revertir si falla
        setIsFavorite(previous)
        onError?.(
          data.message ?? 'No se pudo actualizar favoritos. Necesitas un plan activo.'
        )
      }
    } catch {
      setIsFavorite(previous)
      onError?.('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return { isFavorite, isLoading, toggle }
}