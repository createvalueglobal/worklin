'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { CompanyStep1 } from '@/lib/validators/company.validator'

interface Step1InfoProps {
  data: Partial<CompanyStep1>
  countries: { id: string; name: string }[]
  provinces: { id: string; name: string; country_id: string }[]
  onChange: (data: Partial<CompanyStep1>) => void
  onNext: () => void
}

const SECTORS = [
  'Hostelería y restauración',
  'Construcción y reformas',
  'Peluquería y estética',
  'Limpieza y mantenimiento',
  'Seguridad',
  'Logística y transporte',
  'Comercio y retail',
  'Salud y cuidados',
  'Educación y formación',
  'Eventos y entretenimiento',
  'Agricultura',
  'Industria y manufactura',
  'Tecnología',
  'Otro',
]

export default function Step1Info({ data, countries, provinces, onChange, onNext }: Step1InfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logo_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredProvinces = provinces.filter((p) => p.country_id === data.country_id)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.company_name || data.company_name.length < 2) errs.company_name = 'Mínimo 2 caracteres'
    if (!data.sector) errs.sector = 'Selecciona un sector'
    if (!data.country_id) errs.country_id = 'Selecciona un país'
    if (!data.province_id) errs.province_id = 'Selecciona una provincia'
    if (data.website && data.website.length > 0) {
      try { new URL(data.website) } catch { errs.website = 'URL inválida (ej: https://tuempresa.com)' }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true)
    setLogoPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'logo')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.url) onChange({ ...data, logo_url: json.url })
    } catch {
      setErrors((e) => ({ ...e, logo_url: 'Error al subir el logo' }))
      setLogoPreview(null)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onNext()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '2px dashed rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {uploadingLogo ? (
              <MiniSpinner />
            ) : logoPreview ? (
              <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '24px' }}>🏢</span>
            )}
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500, marginBottom: '4px' }}>Logo de la empresa</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>JPG, PNG o WEBP. Máx. 5MB.</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={outlineButtonStyle}>
              Subir logo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f) }}
          />
        </div>

        {/* Nombre comercial */}
        <Field label="Nombre comercial *" error={errors.company_name} style={{ marginBottom: '16px' }}>
          <input
            value={data.company_name || ''}
            onChange={(e) => onChange({ ...data, company_name: e.target.value })}
            placeholder="Nombre de tu empresa o negocio"
            style={inputStyle}
          />
        </Field>

        {/* Sector */}
        <Field label="Sector *" error={errors.sector} style={{ marginBottom: '16px' }}>
          <select
            value={data.sector || ''}
            onChange={(e) => onChange({ ...data, sector: e.target.value })}
            style={{ ...inputStyle, cursor: 'pointer', color: data.sector ? '#fff' : 'rgba(255,255,255,0.3)' }}
          >
            <option value="" disabled style={{ backgroundColor: '#1a1a2e' }}>Selecciona tu sector</option>
            {SECTORS.map((s) => (
              <option key={s} value={s} style={{ backgroundColor: '#1a1a2e', color: '#fff' }}>{s}</option>
            ))}
          </select>
        </Field>

        {/* País y Provincia */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <Field label="País *" error={errors.country_id}>
            <select
              value={data.country_id || ''}
              onChange={(e) => onChange({ ...data, country_id: e.target.value, province_id: '' })}
              style={{ ...inputStyle, cursor: 'pointer', color: data.country_id ? '#fff' : 'rgba(255,255,255,0.3)' }}
            >
              <option value="" disabled style={{ backgroundColor: '#1a1a2e' }}>País</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id} style={{ backgroundColor: '#1a1a2e', color: '#fff' }}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Provincia *" error={errors.province_id}>
            <select
              value={data.province_id || ''}
              onChange={(e) => onChange({ ...data, province_id: e.target.value })}
              disabled={!data.country_id}
              style={{
                ...inputStyle,
                cursor: !data.country_id ? 'not-allowed' : 'pointer',
                color: data.province_id ? '#fff' : 'rgba(255,255,255,0.3)',
                opacity: !data.country_id ? 0.5 : 1,
              }}
            >
              <option value="" disabled style={{ backgroundColor: '#1a1a2e' }}>Provincia</option>
              {filteredProvinces.map((p) => (
                <option key={p.id} value={p.id} style={{ backgroundColor: '#1a1a2e', color: '#fff' }}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Dirección */}
        <Field label="Dirección" style={{ marginBottom: '16px' }}>
          <input
            value={data.address || ''}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            placeholder="Calle, número, ciudad..."
            style={inputStyle}
          />
        </Field>

        {/* Web */}
        <Field label="Sitio web" error={errors.website} style={{ marginBottom: '28px' }}>
          <input
            type="url"
            value={data.website || ''}
            onChange={(e) => onChange({ ...data, website: e.target.value })}
            placeholder="https://tuempresa.com"
            style={inputStyle}
          />
        </Field>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={nextButtonStyle}
        >
          Siguiente →
        </motion.button>
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
      width: '20px', height: '20px',
      border: '2px solid rgba(255,255,255,0.1)',
      borderTopColor: '#6366f1',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
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

const outlineButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '8px',
  color: 'rgba(255,255,255,0.5)',
  fontSize: '12px',
  cursor: 'pointer',
}

const nextButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  border: 'none',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
}