'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ProfessionalStep1 } from '@/lib/validators/professional.validator'

interface Step1PersonalProps {
  data: Partial<ProfessionalStep1>
  userEmail: string
  countries: { id: string; name: string }[]
  provinces: { id: string; name: string; country_id: string }[]
  onChange: (data: Partial<ProfessionalStep1>) => void
  onNext: () => void
}

export default function Step1Personal({
  data, userEmail, countries, provinces, onChange, onNext,
}: Step1PersonalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(data.photo_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredProvinces = provinces.filter((p) => p.country_id === data.country_id)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.first_name || data.first_name.length < 2) errs.first_name = 'Mínimo 2 caracteres'
    if (!data.last_name || data.last_name.length < 2) errs.last_name = 'Mínimo 2 caracteres'
    if (!data.gender) errs.gender = 'Selecciona un género'
    if (!data.birth_date) errs.birth_date = 'La fecha es obligatoria'
    if (!data.nationality || data.nationality.length < 2) errs.nationality = 'Obligatorio'
    if (!data.country_id) errs.country_id = 'Selecciona un país'
    if (!data.province_id) errs.province_id = 'Selecciona una provincia'
    if (!data.phone || data.phone.length < 9) errs.phone = 'Mínimo 9 dígitos'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true)
    const preview = URL.createObjectURL(file)
    setPhotoPreview(preview)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'photo')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.url) onChange({ ...data, photo_url: json.url })
    } catch {
      setErrors((e) => ({ ...e, photo_url: 'Error al subir la foto' }))
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onNext()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* Foto de perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '2px dashed rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {uploadingPhoto ? (
              <MiniSpinner />
            ) : photoPreview ? (
              <img src={photoPreview} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '28px' }}>📷</span>
            )}
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500, marginBottom: '4px' }}>
              Foto de perfil
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
              JPG, PNG o WEBP. Máx. 5MB.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={outlineButtonStyle}
            >
              Subir foto
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handlePhotoUpload(file)
            }}
          />
        </div>

        {/* Nombre y apellidos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <Field label="Nombre *" error={errors.first_name}>
            <Input
              value={data.first_name || ''}
              onChange={(v) => onChange({ ...data, first_name: v })}
              placeholder="Tu nombre"
            />
          </Field>
          <Field label="Apellidos *" error={errors.last_name}>
            <Input
              value={data.last_name || ''}
              onChange={(v) => onChange({ ...data, last_name: v })}
              placeholder="Tus apellidos"
            />
          </Field>
        </div>

        {/* Email (readonly) */}
        <Field label="Email" style={{ marginBottom: '16px' }}>
          <Input value={userEmail} onChange={() => {}} disabled placeholder="" />
        </Field>

        {/* Género y fecha de nacimiento */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <Field label="Género *" error={errors.gender}>
            <Select
              value={data.gender || ''}
              onChange={(v) => onChange({ ...data, gender: v as 'male' | 'female' })}
              options={[
                { value: 'male', label: 'Hombre' },
                { value: 'female', label: 'Mujer' },
              ]}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="Fecha de nacimiento *" error={errors.birth_date}>
            <Input
              type="date"
              value={data.birth_date || ''}
              onChange={(v) => onChange({ ...data, birth_date: v })}
              placeholder=""
            />
          </Field>
        </div>

        {/* Nacionalidad */}
        <Field label="Nacionalidad *" error={errors.nationality} style={{ marginBottom: '16px' }}>
          <Input
            value={data.nationality || ''}
            onChange={(v) => onChange({ ...data, nationality: v })}
            placeholder="Ej: Española"
          />
        </Field>

        {/* País y provincia */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <Field label="País *" error={errors.country_id}>
            <Select
              value={data.country_id || ''}
              onChange={(v) => onChange({ ...data, country_id: v, province_id: '' })}
              options={countries.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Selecciona país"
            />
          </Field>
          <Field label="Provincia *" error={errors.province_id}>
            <Select
              value={data.province_id || ''}
              onChange={(v) => onChange({ ...data, province_id: v })}
              options={filteredProvinces.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Selecciona provincia"
              disabled={!data.country_id}
            />
          </Field>
        </div>

        {/* Teléfono */}
        <Field label="Teléfono *" error={errors.phone} style={{ marginBottom: '28px' }}>
          <Input
            type="tel"
            value={data.phone || ''}
            onChange={(v) => onChange({ ...data, phone: v })}
            placeholder="+34 600 000 000"
          />
        </Field>

        <SubmitButton>Siguiente →</SubmitButton>
      </Card>
    </form>
  )
}

// ─── Sub-componentes reutilizables dentro de este step ───

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: 'clamp(20px, 4vw, 36px)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  )
}

function Field({
  label, error, children, style,
}: {
  label: string; error?: string; children: React.ReactNode; style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>{error}</p>
      )}
    </div>
  )
}

function Input({
  value, onChange, placeholder, type = 'text', disabled,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  type?: string; disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 14px',
        backgroundColor: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: disabled ? 'rgba(255,255,255,0.3)' : '#ffffff',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    />
  )
}

function Select({
  value, onChange, options, placeholder, disabled,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string; disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 14px',
        backgroundColor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: value ? '#ffffff' : 'rgba(255,255,255,0.3)',
        fontSize: '14px',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxSizing: 'border-box',
      }}
    >
      <option value="" disabled style={{ backgroundColor: '#1a1a2e' }}>{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ backgroundColor: '#1a1a2e', color: '#fff' }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        border: 'none',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {children}
    </motion.button>
  )
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