'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PowerOff, Power, AlertTriangle, Check, X } from 'lucide-react'

interface ToggleActiveButtonProps {
  userId: string
  isActive: boolean
  userName: string
  onSuccess: (newValue: boolean) => void
}

export function ToggleActiveButton({
  userId,
  isActive,
  userName,
  onSuccess,
}: ToggleActiveButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !isActive,
          notes: isActive
            ? `Cuenta desactivada manualmente por el admin`
            : `Cuenta reactivada manualmente por el admin`,
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Error desconocido')

      onSuccess(!isActive)
      setConfirming(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  if (confirming) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2"
        >
          {error && (
            <span className="text-xs" style={{ color: '#f87171' }}>
              {error}
            </span>
          )}
          {!error && (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              ¿{isActive ? 'Desactivar' : 'Activar'}{' '}
              <span className="text-white font-medium">{userName}</span>?
            </span>
          )}
          <button
            onClick={handleToggle}
            disabled={loading}
            className="p-1.5 rounded-lg transition-colors duration-150 disabled:opacity-50"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}
            title="Confirmar"
          >
            {loading ? (
              <span className="block w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={14} />
            )}
          </button>
          <button
            onClick={() => { setConfirming(false); setError(null) }}
            disabled={loading}
            className="p-1.5 rounded-lg transition-colors duration-150 disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
            title="Cancelar"
          >
            <X size={14} />
          </button>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group"
      style={{
        background: isActive ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
        color: isActive ? 'rgba(248,113,113,0.7)' : 'rgba(52,211,153,0.7)',
        border: `1px solid ${isActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}`,
      }}
      title={isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
    >
      {isActive ? (
        <>
          <PowerOff size={13} />
          <span className="hidden sm:inline">Desactivar</span>
        </>
      ) : (
        <>
          <Power size={13} />
          <span className="hidden sm:inline">Activar</span>
        </>
      )}
    </button>
  )
}