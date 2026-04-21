'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { PersonalSection } from './Personalsection'
import { ProfessionalSection } from './Professionalsection'
import { SkillsSection } from './Skillssection'
import { LanguagesSection } from './Languagessection'
import { AboutSection } from './Aboutsection'
import type { ProfessionalWithRelations } from '@/types/professional'

// ─── Form schema ──────────────────────────────────────────────────────────────

const formSchema = z.object({
  // Personal
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'Los apellidos son requeridos'),
  gender: z.enum(['male', 'female']),
  birth_date: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  country_id: z.string().optional().nullable(),
  province_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),

  // Professional
  main_profession: z.string().min(1, 'La profesión es requerida'),
  years_experience: z.number().min(0).max(60),
  last_position: z.string().optional().nullable(),
  last_company: z.string().optional().nullable(),
  availability: z.enum(['immediate', 'in_days', 'not_available']),
  availability_days: z.number().optional().nullable(),
  work_mode: z.enum(['presential', 'hybrid', 'remote']),
  salary_min: z.number().optional().nullable(),
  salary_max: z.number().optional().nullable(),
  has_vehicle: z.boolean(),
  willing_to_travel: z.boolean(),

  // About
  about_me: z.string().max(2000).optional().nullable(),

  // Relations
  skills: z.array(z.object({
    skill_name: z.string(),
    level: z.number().min(1).max(5),
    order: z.number(),
  })).optional(),
  languages: z.array(z.object({
    language: z.string(),
    level: z.string(),
  })).optional(),
})

export type EditProfileFormValues = z.infer<typeof formSchema>

// ─── Section types ────────────────────────────────────────────────────────────

type SectionId = 'personal' | 'professional' | 'skills' | 'languages' | 'about'

const SECTIONS: Array<{ id: SectionId; label: string; description: string }> = [
  { id: 'personal', label: 'Datos personales', description: 'Nombre, contacto, ubicación' },
  { id: 'professional', label: 'Información profesional', description: 'Profesión, experiencia, disponibilidad' },
  { id: 'skills', label: 'Habilidades', description: 'Skills y nivel de competencia' },
  { id: 'languages', label: 'Idiomas', description: 'Idiomas y nivel' },
  { id: 'about', label: 'Sobre mí', description: 'Descripción personal y CV' },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditProfileFormProps {
  professional: ProfessionalWithRelations
  countries: Array<{ id: string; name: string }>
  provinces: Array<{ id: string; name: string }>
  userEmail: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditProfileForm({
  professional,
  countries,
  provinces: initialProvinces,
  userEmail,
}: EditProfileFormProps) {
  const [openSection, setOpenSection] = useState<SectionId>('personal')
  const [provinces, setProvinces] = useState(initialProvinces)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: professional.first_name,
      last_name: professional.last_name,
      gender: professional.gender,
      birth_date: professional.birth_date ?? '',
      nationality: professional.nationality ?? '',
      country_id: professional.country_id ?? '',
      province_id: professional.province_id ?? '',
      phone: professional.phone ?? '',
      main_profession: professional.main_profession,
      years_experience: professional.years_experience,
      last_position: professional.last_position ?? '',
      last_company: professional.last_company ?? '',
      availability: professional.availability,
      availability_days: professional.availability_days ?? undefined,
      work_mode: professional.work_mode,
      salary_min: professional.salary_min ?? undefined,
      salary_max: professional.salary_max ?? undefined,
      has_vehicle: professional.has_vehicle,
      willing_to_travel: professional.willing_to_travel,
      about_me: professional.about_me ?? '',
      skills: professional.skills.map((s) => ({
        skill_name: s.skill_name,
        level: s.level,
        order: s.order,
      })),
      languages: professional.languages.map((l) => ({
        language: l.language,
        level: l.level,
      })),
    },
  })

  // Reload provinces when country changes
  const selectedCountry = watch('country_id')
  useEffect(() => {
    if (!selectedCountry) return
    fetch(`/api/locations/provinces?country_id=${selectedCountry}`)
      .then((r) => r.json())
      .then((data) => setProvinces(data.provinces ?? []))
      .catch(() => {})
  }, [selectedCountry])

  const onSubmit = async (values: EditProfileFormValues) => {
    setSaveStatus('saving')
    setErrorMessage('')

    try {
      const response = await fetch('/api/professional/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        setSaveStatus('error')
        setErrorMessage(data.error ?? 'Error al guardar los cambios')
        return
      }

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
      setErrorMessage('Error de conexión. Inténtalo de nuevo.')
    }
  }

  const toggleSection = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? prev : id))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {SECTIONS.map((section) => {
        const isOpen = openSection === section.id

        return (
          <div
            key={section.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: isOpen
                ? '1px solid rgba(99,102,241,0.3)'
                : '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
            >
              <div>
                <p className="text-sm font-semibold text-white">{section.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {section.description}
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#818cf8' }} />
              ) : (
                <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
              )}
            </button>

            {/* Section content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-6 pb-6 pt-1"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {section.id === 'personal' && (
                      <PersonalSection
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        countries={countries}
                        provinces={provinces}
                        userEmail={userEmail}
                      />
                    )}
                    {section.id === 'professional' && (
                      <ProfessionalSection
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                      />
                    )}
                    {section.id === 'skills' && (
                      <SkillsSection watch={watch} setValue={setValue} />
                    )}
                    {section.id === 'languages' && (
                      <LanguagesSection watch={watch} setValue={setValue} />
                    )}
                    {section.id === 'about' && (
                      <AboutSection register={register} watch={watch} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Error message */}
      <AnimatePresence>
        {saveStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saveStatus === 'saving' || saveStatus === 'success'}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
          style={{
            background: saveStatus === 'success'
              ? 'rgba(34,197,94,0.2)'
              : 'rgba(99,102,241,0.9)',
            border: saveStatus === 'success'
              ? '1px solid rgba(34,197,94,0.4)'
              : '1px solid rgba(99,102,241,0.5)',
            color: saveStatus === 'success' ? '#4ade80' : '#fff',
          }}
        >
          {saveStatus === 'saving' && (
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          )}
          {saveStatus === 'success' && <CheckCircle className="w-4 h-4" />}
          {saveStatus === 'idle' && <Save className="w-4 h-4" />}
          {saveStatus === 'saving'
            ? 'Guardando...'
            : saveStatus === 'success'
            ? 'Cambios guardados'
            : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}