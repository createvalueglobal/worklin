'use client'

import { useState } from 'react'
import type { UnlockProfileResponse, UnlockError } from '@/types/company'

type UnlockState =
  | { status: 'idle' }
  | { status: 'confirming'; professionalId: string; professionalName: string }
  | { status: 'loading' }
  | { status: 'success'; data: UnlockProfileResponse }
  | { status: 'error'; error: UnlockError; message: string }
  | { status: 'upgrade_required'; reason: 'NO_ACTIVE_SUBSCRIPTION' | 'NO_QUOTA_REMAINING' | 'SUBSCRIPTION_EXPIRED' }

interface UseUnlockReturn {
  state: UnlockState
  // Abre el modal de confirmación
  requestUnlock: (professionalId: string, professionalName: string) => void
  // Confirma y ejecuta el desbloqueo
  confirmUnlock: () => Promise<void>
  // Cierra cualquier modal
  dismiss: () => void
}

export function useUnlock(onSuccess?: (professionalId: string, data: UnlockProfileResponse) => void): UseUnlockReturn {
  const [state, setState] = useState<UnlockState>({ status: 'idle' })

  const requestUnlock = (professionalId: string, professionalName: string) => {
    setState({ status: 'confirming', professionalId, professionalName })
  }

  const confirmUnlock = async () => {
    if (state.status !== 'confirming') return
    const { professionalId } = state

    setState({ status: 'loading' })

    try {
      const res = await fetch('/api/company/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professional_id: professionalId }),
      })

      const data = await res.json()

      if (!res.ok) {
        const upgradeErrors = ['NO_ACTIVE_SUBSCRIPTION', 'NO_QUOTA_REMAINING', 'SUBSCRIPTION_EXPIRED']
        if (upgradeErrors.includes(data.error)) {
          setState({
            status: 'upgrade_required',
            reason: data.error,
          })
          return
        }

        setState({
          status: 'error',
          error: data.error as UnlockError,
          message: data.message ?? 'No se pudo desbloquear el perfil.',
        })
        return
      }

      setState({ status: 'success', data })
      onSuccess?.(professionalId, data)
    } catch {
      setState({
        status: 'error',
        error: 'PROFESSIONAL_NOT_FOUND',
        message: 'Error de conexión. Inténtalo de nuevo.',
      })
    }
  }

  const dismiss = () => setState({ status: 'idle' })

  return { state, requestUnlock, confirmUnlock, dismiss }
}