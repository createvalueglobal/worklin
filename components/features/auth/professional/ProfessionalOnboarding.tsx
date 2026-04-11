'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import StepProgressBar from '@/components/features/auth/shared/StepProgressBar'
import Step1Personal from './steps/Step1Personal'
import Step2Profession from './steps/Step2Profession'
import Step3Languages from './steps/Step3Languages'
import Step4About from './steps/Step4About'

import type { ProfessionalStep1 } from '@/lib/validators/professional.validator'
import type { ProfessionalStep2 } from '@/lib/validators/professional.validator'
import type { ProfessionalStep3 } from '@/lib/validators/professional.validator'
import type { ProfessionalStep4 } from '@/lib/validators/professional.validator'

interface ProfessionalOnboardingProps {
  userEmail: string
  countries: { id: string; name: string }[]
  provinces: { id: string; name: string; country_id: string }[]
}

// Estado combinado de todos los steps
type FormData = Partial<ProfessionalStep1> &
  Partial<ProfessionalStep2> &
  Partial<ProfessionalStep3> &
  Partial<ProfessionalStep4>

const STEP_LABELS = ['Personal', 'Profesión', 'Idiomas', 'Sobre mí']
const TOTAL_STEPS = 4

const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Cuéntanos sobre ti', subtitle: 'Datos personales y de contacto' },
  2: { title: 'Tu perfil profesional', subtitle: 'Profesión, habilidades y disponibilidad' },
  3: { title: 'Idiomas y experiencia', subtitle: 'Idiomas que dominas y tu trayectoria' },
  4: { title: 'Últimos detalles', subtitle: 'Preferencias, salario y CV' },
}

export default function ProfessionalOnboarding({
  userEmail,
  countries,
  provinces,
}: ProfessionalOnboardingProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    has_vehicle: false,
    willing_to_travel: false,
    salary_currency: 'EUR',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)

  const goNext = () => {
    setDirection(1)
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const goBack = () => {
    setDirection(-1)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  const handleDataChange = (partial: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/onboarding/professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Error al guardar el perfil')
      }

      // Onboarding completado: redirigir al dashboard
      router.push('/professional/dashboard')
    } catch (err: any) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  const { title, subtitle } = STEP_TITLES[currentStep]

  // Variantes de animación para transición entre steps
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Título dinámico por step */}
      <motion.div
        key={`title-${currentStep}`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ textAlign: 'center', marginBottom: '24px' }}
      >
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          {title}
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>
      </motion.div>

      {/* Barra de progreso */}
      <StepProgressBar
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        labels={STEP_LABELS}
      />

      {/* Error global de envío */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#fca5a5',
          }}
        >
          {submitError}
        </motion.div>
      )}

      {/* Steps con animación de transición */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {currentStep === 1 && (
            <Step1Personal
              data={formData}
              userEmail={userEmail}
              countries={countries}
              provinces={provinces}
              onChange={handleDataChange}
              onNext={goNext}
            />
          )}
          {currentStep === 2 && (
            <Step2Profession
              data={formData}
              onChange={handleDataChange}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <Step3Languages
              data={formData}
              onChange={handleDataChange}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && (
            <Step4About
              data={formData}
              onChange={handleDataChange}
              onSubmit={handleSubmit}
              onBack={goBack}
              submitting={submitting}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}