'use client'

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import type { EditProfileFormValues } from './EditProfileForm'

interface ProfessionalSectionProps {
  register: UseFormRegister<EditProfileFormValues>
  watch: UseFormWatch<EditProfileFormValues>
  setValue: UseFormSetValue<EditProfileFormValues>
  errors: FieldErrors<EditProfileFormValues>
}

const inputClass =
  'w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:ring-2'
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}
const focusRingStyle = { '--tw-ring-color': 'rgba(99,102,241,0.5)' } as React.CSSProperties
const labelClass = 'block text-sm font-medium mb-1.5'
const labelStyle = { color: 'rgba(255,255,255,0.65)' }
const errorStyle = { color: '#f87171' }

const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Disponibilidad inmediata' },
  { value: 'in_days', label: 'Disponible en X días' },
  { value: 'not_available', label: 'No disponible' },
] as const

const WORK_MODE_OPTIONS = [
  { value: 'presential', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'remote', label: 'Remoto' },
] as const

export function ProfessionalSection({
  register,
  watch,
  setValue,
  errors,
}: ProfessionalSectionProps) {
  const availability = watch('availability')
  const workMode = watch('work_mode')

  return (
    <div className="space-y-5">
      {/* Main profession */}
      <div>
        <label className={labelClass} style={labelStyle}>Profesión principal *</label>
        <input
          {...register('main_profession')}
          className={inputClass}
          style={{ ...inputStyle, ...focusRingStyle }}
          placeholder="Ej: Cocinero, Electricista, Peluquero..."
        />
        {errors.main_profession && (
          <p className="text-xs mt-1" style={errorStyle}>{errors.main_profession.message}</p>
        )}
      </div>

      {/* Years experience */}
      <div>
        <label className={labelClass} style={labelStyle}>Años de experiencia *</label>
        <input
          {...register('years_experience', { valueAsNumber: true })}
          type="number"
          min={0}
          max={60}
          className={inputClass}
          style={{ ...inputStyle, ...focusRingStyle }}
          placeholder="0"
        />
      </div>

      {/* Last position + company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={labelStyle}>Último cargo</label>
          <input
            {...register('last_position')}
            className={inputClass}
            style={{ ...inputStyle, ...focusRingStyle }}
            placeholder="Ej: Jefe de cocina"
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Última empresa</label>
          <input
            {...register('last_company')}
            className={inputClass}
            style={{ ...inputStyle, ...focusRingStyle }}
            placeholder="Nombre de la empresa"
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className={labelClass} style={labelStyle}>Disponibilidad</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => {
            const selected = availability === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('availability', opt.value)}
                className="py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200 text-center"
                style={{
                  background: selected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                  border: selected ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: selected ? '#818cf8' : 'rgba(255,255,255,0.5)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {/* Days input when in_days */}
        {availability === 'in_days' && (
          <div className="mt-3">
            <input
              {...register('availability_days', { valueAsNumber: true })}
              type="number"
              min={1}
              max={365}
              className={inputClass}
              style={{ ...inputStyle, ...focusRingStyle }}
              placeholder="Número de días"
            />
          </div>
        )}
      </div>

      {/* Work mode */}
      <div>
        <label className={labelClass} style={labelStyle}>Modalidad de trabajo</label>
        <div className="grid grid-cols-3 gap-2">
          {WORK_MODE_OPTIONS.map((opt) => {
            const selected = workMode === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('work_mode', opt.value)}
                className="py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  background: selected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                  border: selected ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: selected ? '#818cf8' : 'rgba(255,255,255,0.5)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Salary */}
      <div>
        <label className={labelClass} style={labelStyle}>Expectativa salarial (€/año)</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register('salary_min', { valueAsNumber: true })}
              type="number"
              min={0}
              className={inputClass}
              style={{ ...inputStyle, ...focusRingStyle }}
              placeholder="Mínimo"
            />
          </div>
          <div>
            <input
              {...register('salary_max', { valueAsNumber: true })}
              type="number"
              min={0}
              className={inputClass}
              style={{ ...inputStyle, ...focusRingStyle }}
              placeholder="Máximo"
            />
          </div>
        </div>
      </div>

      {/* Extras */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { field: 'has_vehicle' as const, label: 'Tengo vehículo propio' },
          { field: 'willing_to_travel' as const, label: 'Dispuesto a viajar' },
        ].map(({ field, label }) => {
          const checked = watch(field)
          return (
            <button
              key={field}
              type="button"
              onClick={() => setValue(field, !checked)}
              className="py-3 px-4 rounded-xl text-sm font-medium text-left transition-all duration-200"
              style={{
                background: checked ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                border: checked ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
                color: checked ? '#4ade80' : 'rgba(255,255,255,0.4)',
              }}
            >
              <span className="mr-2">{checked ? '✓' : '○'}</span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}