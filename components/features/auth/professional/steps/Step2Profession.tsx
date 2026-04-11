'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProfessionalStep2 } from '@/lib/validators/professional.validator'

interface Step2ProfessionProps {
  data: Partial<ProfessionalStep2>
  onChange: (data: Partial<ProfessionalStep2>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Profession({ data, onChange, onNext, onBack }: Step2ProfessionProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [skillInput, setSkillInput] = useState('')

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.main_profession || data.main_profession.length < 2) errs.main_profession = 'Obligatorio'
    if (data.years_experience === undefined || data.years_experience === null) errs.years_experience = 'Obligatorio'
    if (!data.availability) errs.availability = 'Selecciona disponibilidad'
    if (data.availability === 'in_days' && !data.availability_days) errs.availability_days = 'Indica cuántos días'
    if (!data.work_mode) errs.work_mode = 'Selecciona modalidad'
    if (!data.skills || data.skills.length === 0) errs.skills = 'Añade al menos una habilidad'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    const current = data.skills || []
    if (current.find((s) => s.skill_name.toLowerCase() === trimmed.toLowerCase())) return
    onChange({
      ...data,
      skills: [...current, { skill_name: trimmed, level: 3, order: current.length }],
    })
    setSkillInput('')
  }

  const removeSkill = (name: string) => {
    onChange({ ...data, skills: (data.skills || []).filter((s) => s.skill_name !== name) })
  }

  const updateSkillLevel = (name: string, level: number) => {
    onChange({
      ...data,
      skills: (data.skills || []).map((s) => s.skill_name === name ? { ...s, level } : s),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onNext()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* Profesión principal */}
        <Field label="Profesión principal *" error={errors.main_profession} style={{ marginBottom: '16px' }}>
          <Input
            value={data.main_profession || ''}
            onChange={(v) => onChange({ ...data, main_profession: v })}
            placeholder="Ej: Cocinero, Electricista, Peluquero..."
          />
        </Field>

        {/* Años de experiencia */}
        <Field label="Años de experiencia *" error={errors.years_experience} style={{ marginBottom: '16px' }}>
          <Input
            type="number"
            value={data.years_experience?.toString() || ''}
            onChange={(v) => onChange({ ...data, years_experience: parseInt(v) || 0 })}
            placeholder="0"
          />
        </Field>

        {/* Disponibilidad */}
        <Field label="Disponibilidad *" error={errors.availability} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { value: 'immediate', label: 'Inmediata' },
              { value: 'in_days', label: 'En X días' },
              { value: 'not_available', label: 'No disponible' },
            ].map((opt) => (
              <ToggleChip
                key={opt.value}
                label={opt.label}
                active={data.availability === opt.value}
                onClick={() => onChange({ ...data, availability: opt.value as any, availability_days: undefined })}
              />
            ))}
          </div>
        </Field>

        {/* Días de disponibilidad (condicional) */}
        <AnimatePresence>
          {data.availability === 'in_days' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: '16px' }}
            >
              <Field label="¿En cuántos días?" error={errors.availability_days}>
                <Input
                  type="number"
                  value={data.availability_days?.toString() || ''}
                  onChange={(v) => onChange({ ...data, availability_days: parseInt(v) || undefined })}
                  placeholder="Ej: 15"
                />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modalidad de trabajo */}
        <Field label="Modalidad de trabajo *" error={errors.work_mode} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { value: 'presential', label: '🏢 Presencial' },
              { value: 'hybrid', label: '⚡ Híbrido' },
              { value: 'remote', label: '🏠 Remoto' },
            ].map((opt) => (
              <ToggleChip
                key={opt.value}
                label={opt.label}
                active={data.work_mode === opt.value}
                onClick={() => onChange({ ...data, work_mode: opt.value as any })}
              />
            ))}
          </div>
        </Field>

        {/* Skills */}
        <Field label="Habilidades *" error={errors.skills} style={{ marginBottom: '28px' }}>
          {/* Input para añadir skill */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              placeholder="Añade una habilidad y pulsa Enter..."
              style={inputStyle}
            />
            <button
              type="button"
              onClick={addSkill}
              style={{
                padding: '10px 16px',
                background: 'rgba(99,102,241,0.3)',
                border: '1px solid rgba(99,102,241,0.4)',
                borderRadius: '10px',
                color: '#a5b4fc',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + Añadir
            </button>
          </div>

          {/* Lista de skills añadidas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {(data.skills || []).map((skill) => (
                <motion.div
                  key={skill.skill_name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ flex: 1, fontSize: '13px', color: '#fff' }}>{skill.skill_name}</span>

                  {/* Selector de nivel 1-5 */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => updateSkillLevel(skill.skill_name, lvl)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: lvl <= skill.level ? '#6366f1' : 'rgba(255,255,255,0.08)',
                          cursor: 'pointer',
                          fontSize: '10px',
                          color: lvl <= skill.level ? '#fff' : 'rgba(255,255,255,0.3)',
                          fontWeight: 600,
                        }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  {/* Quitar skill */}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.skill_name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.25)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      lineHeight: 1,
                      padding: '0 2px',
                    }}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Field>

        {/* Navegación */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            ← Atrás
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 2,
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
            Siguiente →
          </motion.button>
        </div>
      </Card>
    </form>
  )
}

// ─── Helpers ───

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        backgroundColor: active ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '20px',
        color: active ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: active ? 500 : 400,
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
}

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

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  )
}