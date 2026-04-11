'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import StepProgressBar from '@/components/features/auth/shared/StepProgressBar'
import Step1Info from './steps/Step1Info'
import Step2Contact from './steps/Step2Contact'

import type { CompanyStep1 } from '@/lib/validators/company.validator'
import type { CompanyStep2 } from '@/lib/validators/company.validator'

interface CompanyOnboardingProps {
  countries: { id: string; name: string }[]
  provinces: { id: string; name: string; country_id: string }[]
}

type FormData = Partial<CompanyStep1> & Partial<CompanyStep2>

const STEP_LABELS = ['Tu empresa', 'Contacto']
const TOTAL_STEPS = 2

const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Datos de tu empresa', subtitle: 'Información básica de tu negocio' },
  2: { title: 'Persona de contacto', subtitle: 'Quién gestionará la cuenta' },
}

export default function CompanyOnboarding({ countries, provinces }: CompanyOnboardingProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)

  const goNext = () => { setDirection(1); setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS)) }
  const goBack = () => { setDirection(-1); setCurrentStep((s) => Math.max(s - 1, 1)) }
  const handleDataChange = (partial: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...partial }))

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/onboarding/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al guardar los datos')

      router.push('/company/dashboard')
    } catch (err: any) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  }

  const { title, subtitle } = STEP_TITLES[currentStep]

  return (
    <div style={{ width: '100%' }}>
      {/* Título dinámico */}
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

      <StepProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />

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
            <Step1Info
              data={formData}
              countries={countries}
              provinces={provinces}
              onChange={handleDataChange}
              onNext={goNext}
            />
          )}
          {currentStep === 2 && (
            <Step2Contact
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