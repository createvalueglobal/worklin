'use client'

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import type { EditProfileFormValues } from './EditProfileForm'

interface PersonalSectionProps {
  register: UseFormRegister<EditProfileFormValues>
  watch: UseFormWatch<EditProfileFormValues>
  setValue: UseFormSetValue<EditProfileFormValues>
  errors: FieldErrors<EditProfileFormValues>
  countries: Array<{ id: string; name: string }>
  provinces: Array<{ id: string; name: string }>
  userEmail: string
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
const errorClass = 'text-xs mt-1'
const errorStyle = { color: '#f87171' }

export function PersonalSection({
  register,
  watch,
  setValue,
  errors,
  countries,
  provinces,
  userEmail,
}: PersonalSectionProps) {
  return (
    <div className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={labelStyle}>Nombre *</label>
          <input
            {...register('first_name')}
            className={inputClass}
            style={{ ...inputStyle, ...focusRingStyle }}
            placeholder="Tu nombre"
          />
          {errors.first_name && (
            <p className={errorClass} style={errorStyle}>{errors.first_name.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Apellidos *</label>
          <input
            {...register('last_name')}
            className={inputClass}
            style={{ ...inputStyle, ...focusRingStyle }}
            placeholder="Tus apellidos"
          />
          {errors.last_name && (
            <p className={errorClass} style={errorStyle}>{errors.last_name.message}</p>
          )}
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className={labelClass} style={labelStyle}>Género *</label>
        <div className="grid grid-cols-2 gap-3">
          {(['male', 'female'] as const).map((g) => {
            const selected = watch('gender') === g
            return (
              <button
                key={g}
                type="button"
                onClick={() => setValue('gender', g)}
                className="py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: selected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                  border: selected ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: selected ? '#818cf8' : 'rgba(255,255,255,0.5)',
                }}
              >
                {g === 'male' ? 'Hombre' : 'Mujer'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Email (readonly) */}
      <div>
        <label className={labelClass} style={labelStyle}>Email</label>
        <input
          value={userEmail}
          readOnly
          className={`${inputClass} cursor-not-allowed`}
          style={{ ...inputStyle, opacity: 0.5 }}
        />
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          El email está vinculado a tu cuenta Google y no puede modificarse aquí.
        </p>
      </div>

      {/* Phone + Birth date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={labelStyle}>Teléfono</label>
          <input
            {...register('phone')}
            className={inputClass}
            style={{ ...inputStyle, ...focusRingStyle }}
            placeholder="+34 600 000 000"
            type="tel"
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Fecha de nacimiento</label>
          <input
            {...register('birth_date')}
            className={inputClass}
            style={{ ...inputStyle, ...focusRingStyle }}
            type="date"
          />
        </div>
      </div>

      {/* Nationality */}
      <div>
        <label className={labelClass} style={labelStyle}>Nacionalidad</label>
        <input
          {...register('nationality')}
          className={inputClass}
          style={{ ...inputStyle, ...focusRingStyle }}
          placeholder="Española"
        />
      </div>

      {/* Country + Province */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={labelStyle}>País de residencia</label>
          <select
            {...register('country_id')}
            className={inputClass}
            style={{ ...inputStyle, ...focusRingStyle }}
          >
            <option value="">Seleccionar país</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Provincia</label>
          <select
            {...register('province_id')}
            className={inputClass}
            style={{ ...inputStyle, ...focusRingStyle }}
            disabled={provinces.length === 0}
          >
            <option value="">Seleccionar provincia</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id} style={{ background: '#1a1a2e' }}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}