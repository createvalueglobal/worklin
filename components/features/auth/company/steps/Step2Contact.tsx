'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CompanyStep2 } from '@/lib/validators/company.validator'

interface Step2ContactProps {
  data: Partial<CompanyStep2>
  onChange: (data: Partial<CompanyStep2>) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}

export default function Step2Contact({ data, onChange, onSubmit, onBack, submitting }: Step2ContactProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.contact_name || data.contact_name.length < 2) errs.contact_name = 'Mínimo 2 caracteres'
    if (!data.contact_phone || data.contact_phone.length < 9) errs.contact_phone = 'Mínimo 9 dígitos'
    if (!data.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
      errs.contact_email = 'Email inválido'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* Texto informativo */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '10px',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            Esta información nos permite gestionar tu cuenta. No se mostrará públicamente salvo el email de contacto, que las empresas usarán para comunicarse contigo.
          </p>
        </div>

        {/* Nombre del responsable */}
        <Field label="Nombre del responsable *" error={errors.contact_name} style={{ marginBottom: '16px' }}>
          <input
            value={data.contact_name || ''}
            onChange={(e) => onChange({ ...data, contact_name: e.target.value })}
            placeholder="Nombre y apellidos"
            style={inputStyle}
          />
        </Field>

        {/* Teléfono de contacto */}
        <Field label="Teléfono de contacto *" error={errors.contact_phone} style={{ marginBottom: '16px' }}>
          <input
            type="tel"
            value={data.contact_phone || ''}
            onChange={(e) => onChange({ ...data, contact_phone: e.target.value })}
            placeholder="+34 600 000 000"
            style={inputStyle}
          />
        </Field>

        {/* Email de contacto */}
        <Field label="Email de contacto *" error={errors.contact_email} style={{ marginBottom: '32px' }}>
          <input
            type="email"
            value={data.contact_email || ''}
            onChange={(e) => onChange({ ...data, contact_email: e.target.value })}
            placeholder="contacto@tuempresa.com"
            style={inputStyle}
          />
        </Field>

        {/* Navegación */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={onBack} disabled={submitting} style={backButtonStyle}>
            ← Atrás
          </button>
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={submitting ? {} : { scale: 1.02 }}
            whileTap={submitting ? {} : { scale: 0.98 }}
            style={{
              ...nextButtonStyle,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <MiniSpinner /> Guardando...
              </span>
            ) : (
              '✓ Completar registro'
            )}
          </motion.button>
        </div>
      </Card>
    </form>
  )
}

// ─── Helpers ───

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      padding: 'clamp(20px, 4vw, 36px)',
      backdropFilter: 'blur(20px)',
    }}>{children}</div>
  )
}

function Field({ label, error, children, style }: {
  label: string; error?: string; children: React.ReactNode; style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}

function MiniSpinner() {
  return (
    <div style={{
      width: '16px', height: '16px',
      border: '2px solid rgba(255,255,255,0.15)',
      borderTopColor: '#a5b4fc',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const backButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '14px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '15px',
  cursor: 'pointer',
}

const nextButtonStyle: React.CSSProperties = {
  flex: 2,
  padding: '14px',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  border: 'none',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
}