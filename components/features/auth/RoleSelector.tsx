'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function RoleSelector() {
  const router = useRouter()
  const [loading, setLoading] = useState<'professional' | 'company' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSelect = async (role: 'professional' | 'company') => {
    setLoading(role)
    setError(null)

    try {
      const res = await fetch('/api/onboarding/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar el rol')
      }

      router.push(`/onboarding/${role}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(null)
    }
  }

  return (
    <div>
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#fca5a5',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <RoleCard
          role="professional"
          icon="👤"
          title="Soy profesional"
          description="Busco oportunidades laborales y quiero que las empresas puedan encontrarme"
          features={['Perfil gratuito', 'Control de visibilidad', 'Recibe ofertas']}
          accentColor="#6366f1"
          loading={loading === 'professional'}
          disabled={loading !== null}
          onClick={() => handleSelect('professional')}
        />
        <RoleCard
          role="company"
          icon="🏢"
          title="Soy empresa"
          description="Busco profesionales del sector servicios para mi negocio"
          features={['Filtros avanzados', 'Acceso a contactos', 'Gestión de favoritos']}
          accentColor="#8b5cf6"
          loading={loading === 'company'}
          disabled={loading !== null}
          onClick={() => handleSelect('company')}
        />
      </div>
    </div>
  )
}

interface RoleCardProps {
  role: 'professional' | 'company'
  icon: string
  title: string
  description: string
  features: string[]
  accentColor: string
  loading: boolean
  disabled: boolean
  onClick: () => void
}

function RoleCard({
  icon, title, description, features, accentColor, loading, disabled, onClick,
}: RoleCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        backgroundColor: loading
          ? `${accentColor}15`
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${loading ? `${accentColor}50` : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        width: '100%',
      }}
    >
      {/* Icono */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: `${accentColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          marginBottom: '16px',
        }}
      >
        {loading ? <Spinner color={accentColor} /> : icon}
      </div>

      {/* Título */}
      <h3
        style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      {/* Descripción */}
      <p
        style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.5,
          marginBottom: '16px',
        }}
      >
        {description}
      </p>

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{f}</span>
          </li>
        ))}
      </ul>
    </motion.button>
  )
}

function Spinner({ color }: { color: string }) {
  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        border: `2px solid ${color}30`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  )
}