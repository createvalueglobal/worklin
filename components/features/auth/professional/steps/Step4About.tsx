'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ProfessionalStep4 } from '@/lib/validators/professional.validator'

interface Step4AboutProps {
  data: Partial<ProfessionalStep4>
  onChange: (data: Partial<ProfessionalStep4>) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}

export default function Step4About({ data, onChange, onSubmit, onBack, submitting }: Step4AboutProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingCv, setUploadingCv] = useState(false)
  const [cvFileName, setCvFileName] = useState<string | null>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (data.salary_min && data.salary_max && data.salary_max < data.salary_min) {
      errs.salary_max = 'El máximo debe ser mayor que el mínimo'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCvUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrors((e) => ({ ...e, cv_url: 'Solo se admiten archivos PDF' }))
      return
    }
    setUploadingCv(true)
    setCvFileName(file.name)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'cv')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.url) {
        onChange({ ...data, cv_url: json.url })
        setErrors((e) => { const { cv_url, ...rest } = e; return rest })
      } else {
        setErrors((e) => ({ ...e, cv_url: 'Error al subir el CV' }))
        setCvFileName(null)
      }
    } catch {
      setErrors((e) => ({ ...e, cv_url: 'Error al subir el CV' }))
      setCvFileName(null)
    } finally {
      setUploadingCv(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* Sobre mí */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Sobre mí</label>
          <textarea
            value={data.about_me || ''}
            onChange={(e) => onChange({ ...data, about_me: e.target.value })}
            placeholder="Cuéntanos algo sobre ti, tu trayectoria, tus puntos fuertes..."
            rows={4}
            maxLength={1000}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '100px',
              lineHeight: 1.6,
            }}
          />
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px', textAlign: 'right' }}>
            {(data.about_me || '').length}/1000
          </p>
        </div>

        {/* Toggles: vehículo y viajes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <Toggle
            label="Tengo vehículo propio"
            description="Dispongo de coche o moto para desplazarme"
            value={data.has_vehicle ?? false}
            onChange={(v) => onChange({ ...data, has_vehicle: v })}
          />
          <Toggle
            label="Dispuesto a viajar"
            description="Acepto desplazamientos o trabajo en otras ciudades"
            value={data.willing_to_travel ?? false}
            onChange={(v) => onChange({ ...data, willing_to_travel: v })}
          />
        </div>

        {/* Expectativa salarial */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Expectativa salarial (€/año)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              value={data.salary_min?.toString() || ''}
              onChange={(e) => onChange({ ...data, salary_min: e.target.value ? Number(e.target.value) : null })}
              placeholder="Mínimo"
              min={0}
              style={inputStyle}
            />
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', textAlign: 'center' }}>—</span>
            <input
              type="number"
              value={data.salary_max?.toString() || ''}
              onChange={(e) => onChange({ ...data, salary_max: e.target.value ? Number(e.target.value) : null })}
              placeholder="Máximo"
              min={0}
              style={inputStyle}
            />
          </div>
          {errors.salary_max && (
            <p style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>{errors.salary_max}</p>
          )}
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>
            Opcional. Ayuda a las empresas a encontrarte más fácilmente.
          </p>
        </div>

        {/* Subida de CV */}
        <div style={{ marginBottom: '32px' }}>
          <label style={labelStyle}>Currículum (PDF)</label>
          <div
            onClick={() => !uploadingCv && cvInputRef.current?.click()}
            style={{
              padding: '20px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: `2px dashed ${data.cv_url ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '12px',
              cursor: uploadingCv ? 'wait' : 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            {uploadingCv ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <MiniSpinner />
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Subiendo CV...</p>
              </div>
            ) : data.cv_url ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <p style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 500 }}>
                  {cvFileName || 'CV subido correctamente'}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                  Haz clic para reemplazarlo
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '28px' }}>📄</span>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                  Haz clic para subir tu CV
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                  Solo PDF. Máx. 10MB. Opcional.
                </p>
              </div>
            )}
          </div>
          {errors.cv_url && (
            <p style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>{errors.cv_url}</p>
          )}
          <input
            ref={cvInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleCvUpload(file)
            }}
          />
        </div>

        {/* Navegación */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={onBack} disabled={submitting} style={backButtonStyle}>
            ← Atrás
          </button>
          <motion.button
            type="submit"
            disabled={submitting || uploadingCv}
            whileHover={submitting ? {} : { scale: 1.02 }}
            whileTap={submitting ? {} : { scale: 0.98 }}
            style={{
              ...nextButtonStyle,
              opacity: submitting || uploadingCv ? 0.7 : 1,
              cursor: submitting || uploadingCv ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <MiniSpinner /> Guardando...
              </span>
            ) : (
              '✓ Completar perfil'
            )}
          </motion.button>
        </div>
      </Card>
    </form>
  )
}

// ─── Toggle component ───

function Toggle({
  label, description, value, onChange,
}: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '14px 16px',
        backgroundColor: value ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${value ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        userSelect: 'none',
      }}
    >
      <div>
        <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500, marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{description}</p>
      </div>

      {/* Switch visual */}
      <div
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          backgroundColor: value ? '#6366f1' : 'rgba(255,255,255,0.1)',
          position: 'relative',
          flexShrink: 0,
          transition: 'background-color 0.2s',
        }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            top: '3px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
          }}
        />
      </div>
    </div>
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
    }}>
      {children}
    </div>
  )
}

function MiniSpinner() {
  return (
    <div style={{
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255,255,255,0.15)',
      borderTopColor: '#a5b4fc',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: 'rgba(255,255,255,0.5)',
  marginBottom: '6px',
  fontWeight: 500,
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
  cursor: 'pointer',
}