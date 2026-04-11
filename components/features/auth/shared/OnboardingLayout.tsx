'use client'

import { motion } from 'framer-motion'

interface OnboardingLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function OnboardingLayout({ children, title, subtitle }: OnboardingLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Orbes de fondo decorativos */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '40vw',
          height: '40vw',
          maxWidth: '500px',
          maxHeight: '500px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.08)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '35vw',
          height: '35vw',
          maxWidth: '450px',
          maxHeight: '450px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.06)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Logotipo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '32px', textAlign: 'center' }}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.5px',
          }}
        >
          Work<span style={{ color: '#818cf8' }}>Lin</span>
        </span>
      </motion.div>

      {/* Header de la sección */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '480px' }}
      >
        <h1
          style={{
            fontSize: 'clamp(22px, 4vw, 30px)',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: subtitle ? '8px' : 0,
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </motion.div>

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}
      >
        {children}
      </motion.div>
    </div>
  )
}