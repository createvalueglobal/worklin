'use client'

import { UseFormRegister, UseFormWatch } from 'react-hook-form'
import type { EditProfileFormValues } from './EditProfileForm'

interface AboutSectionProps {
  register: UseFormRegister<EditProfileFormValues>
  watch: UseFormWatch<EditProfileFormValues>
}

const inputClass =
  'w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:ring-2'
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  '--tw-ring-color': 'rgba(99,102,241,0.5)',
} as React.CSSProperties

export function AboutSection({ register, watch }: AboutSectionProps) {
  const aboutMe = watch('about_me') ?? ''
  const MAX = 2000

  return (
    <div className="space-y-5">
      {/* About me */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Sobre mí
          </label>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {aboutMe.length}/{MAX}
          </span>
        </div>
        <textarea
          {...register('about_me')}
          rows={5}
          maxLength={MAX}
          className={`${inputClass} resize-none`}
          style={inputStyle}
          placeholder="Describe tu experiencia, especialidades, lo que te hace diferente como profesional..."
        />
      </div>

      {/* CV URL — info note */}
      <div
        className="rounded-xl px-4 py-3.5 text-sm"
        style={{
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.15)',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        Para actualizar tu CV, por favor contacta con soporte o vuelve a hacer
        el proceso de onboarding desde tu cuenta. Esta funcionalidad estará
        disponible próximamente.
      </div>
    </div>
  )
}