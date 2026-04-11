'use client'

import { motion } from 'framer-motion'

interface StepProgressBarProps {
  currentStep: number   // 1-based
  totalSteps: number
  labels?: string[]     // opcional: etiquetas por step
}

export default function StepProgressBar({ currentStep, totalSteps, labels }: StepProgressBarProps) {
  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Barra de progreso continua */}
      <div
        style={{
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Indicadores de steps */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep

          return (
            <div
              key={step}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
            >
              {/* Círculo indicador */}
              <motion.div
                animate={{
                  backgroundColor: isCompleted
                    ? '#6366f1'
                    : isCurrent
                      ? 'rgba(99,102,241,0.2)'
                      : 'rgba(255,255,255,0.06)',
                  borderColor: isCompleted || isCurrent
                    ? '#6366f1'
                    : 'rgba(255,255,255,0.12)',
                  scale: isCurrent ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '2px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isCompleted || isCurrent ? '#fff' : 'rgba(255,255,255,0.3)',
                }}
              >
                {isCompleted ? '✓' : step}
              </motion.div>

              {/* Etiqueta opcional */}
              {labels && labels[i] && (
                <span
                  style={{
                    fontSize: '10px',
                    color: isCurrent ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
                    textAlign: 'center',
                    maxWidth: '60px',
                    lineHeight: 1.2,
                  }}
                >
                  {labels[i]}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}