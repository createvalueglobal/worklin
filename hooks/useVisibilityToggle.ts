'use client'

import { useState } from 'react'

interface UseVisibilityToggleOptions {
  initialValue: boolean
  onSuccess?: (isVisible: boolean) => void
  onError?: (error: string) => void
}

export function useVisibilityToggle({
  initialValue,
  onSuccess,
  onError,
}: UseVisibilityToggleOptions) {
  const [isVisible, setIsVisible] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)

  const toggle = async () => {
    const newValue = !isVisible

    // Optimistic update
    setIsVisible(newValue)
    setIsLoading(true)

    try {
      const response = await fetch('/api/professional/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: newValue }),
      })

      if (!response.ok) {
        // Rollback on error
        setIsVisible(!newValue)
        onError?.('Error al actualizar la visibilidad')
        return
      }

      const data = await response.json()
      setIsVisible(data.is_visible)
      onSuccess?.(data.is_visible)
    } catch {
      // Rollback on network error
      setIsVisible(!newValue)
      onError?.('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return { isVisible, isLoading, toggle }
}