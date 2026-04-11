'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProfessionalStep3 } from '@/lib/validators/professional.validator'

interface Step3LanguagesProps {
  data: Partial<ProfessionalStep3>
  onChange: (data: Partial<ProfessionalStep3>) => void
  onNext: () => void
  onBack: () => void
}

const LANGUAGE_LEVELS = [
  { value: 'A1', label: 'A1 — Principiante' },
  { value: 'A2', label: 'A2 — Elemental' },
  { value: 'B1', label: 'B1 — Intermedio' },
  { value: 'B2', label: 'B2 — Intermedio alto' },
  { value: 'C1', label: 'C1 — Avanzado' },
  { value: 'C2', label: 'C2 — Maestría' },
  { value: 'native', label: 'Nativo' },
]

export default function Step3Languages({ data, onChange, onNext, onBack }: Step3LanguagesProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [langInput, setLangInput] = useState('')
  const [langLevel, setLangLevel] = useState<string>('B1')

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.languages || data.languages.length === 0) {
      errs.languages = 'Añade al menos un idioma'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const addLanguage = () => {
    const trimmed = langInput.trim()
    if (!trimmed) return
    const current = data.languages || []
    if (current.find((l) => l.language.toLowerCase() === trimmed.toLowerCase())) return
    onChange({
      ...data,
      languages: [...current, { language: trimmed, level: langLevel as any }],
    })
    setLangInput('')
    setLangLevel('B1')
  }

  const removeLanguage = (language: string) => {
    onChange({
      ...data,
      languages: (data.languages || []).filter((l) => l.language !== language),
    })
  }

  const updateLanguageLevel = (language: string, level: string) => {
    onChange({
      ...data,
      languages: (data.languages || []).map((l) =>
        l.language === language ? { ...l, level: level as any } : l
      ),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onNext()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* Idiomas */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>Idiomas *</label>

          {/* Fila de añadir idioma */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <input
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage() } }}
              placeholder="Ej: Español, Inglés, Francés..."
              style={{ ...inputStyle, flex: '1 1 140px', minWidth: '120px' }}
            />
            <select
              value={langLevel}
              onChange={(e) => setLangLevel(e.target.value)}
              style={{ ...selectStyle, flex: '0 0 auto' }}
            >
              {LANGUAGE_LEVELS.map((l) => (
                <option key={l.value} value={l.value} style={{ backgroundColor: '#1a1a2e' }}>
                  {l.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={addLanguage} style={addButtonStyle}>
              + Añadir
            </button>
          </div>

          {errors.languages && (
            <p style={{ fontSize: '11px', color: '#f87171', marginBottom: '8px' }}>
              {errors.languages}
            </p>
          )}

          {/* Lista de idiomas añadidos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {(data.languages || []).map((lang) => (
                <motion.div
                  key={lang.language}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ flex: 1, fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                    {lang.language}
                  </span>
                  <select
                    value={lang.level}
                    onChange={(e) => updateLanguageLevel(lang.language, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#a5b4fc',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {LANGUAGE_LEVELS.map((l) => (
                      <option key={l.value} value={l.value} style={{ backgroundColor: '#1a1a2e' }}>
                        {l.value === 'native' ? 'Nativo' : l.value}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang.language)}
                    style={removeButtonStyle}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Último cargo */}
        <Field label="Último cargo ocupado" style={{ marginBottom: '16px' }}>
          <input
            value={data.last_position || ''}
            onChange={(e) => onChange({ ...data, last_position: e.target.value })}
            placeholder="Ej: Jefe de cocina, Electricista senior..."
            style={inputStyle}
          />
        </Field>

        {/* Última empresa */}
        <Field label="Última empresa" style={{ marginBottom: '28px' }}>
          <input
            value={data.last_company || ''}
            onChange={(e) => onChange({ ...data, last_company: e.target.value })}
            placeholder="Ej: Restaurante El Mar, Construcciones López..."
            style={inputStyle}
          />
        </Field>

        {/* Navegación */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={onBack} style={backButtonStyle}>
            ← Atrás
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={nextButtonStyle}
          >
            Siguiente →
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
    }}>
      {children}
    </div>
  )
}

function Field({ label, children, style }: {
  label: string; children: React.ReactNode; style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
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

const selectStyle: React.CSSProperties = {
  padding: '10px 12px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
}

const addButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  backgroundColor: 'rgba(99,102,241,0.3)',
  border: '1px solid rgba(99,102,241,0.4)',
  borderRadius: '10px',
  color: '#a5b4fc',
  fontSize: '13px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const removeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.25)',
  cursor: 'pointer',
  fontSize: '18px',
  lineHeight: 1,
  padding: '0 2px',
  flexShrink: 0,
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