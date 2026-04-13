'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'

interface LoginCardProps {
  role?: 'professional' | 'company' | null
  error?: string | null
  plan?: string | null
}

const COPY = {
  professional: {
    title: 'Encuentra tu próxima oportunidad',
    subtitle: 'Crea tu perfil profesional y conecta con empresas que buscan tu talento.',
    badge: 'Para profesionales',
    badgeColor: '#6366f1',
  },
  company: {
    title: 'Encuentra el profesional perfecto',
    subtitle: 'Accede a perfiles verificados del sector servicios listos para trabajar.',
    badge: 'Para empresas',
    badgeColor: '#8b5cf6',
  },
  default: {
    title: 'Bienvenido a WorkLin',
    subtitle: 'La plataforma que conecta profesionales y empresas del sector servicios.',
    badge: null,
    badgeColor: null,
  },
}

export default function LoginCard({ role, error, plan }: LoginCardProps) {
  const [loading, setLoading] = useState(false)

  const copy = role ? COPY[role] : COPY.default

  const handleGoogleLogin = async () => {
    setLoading(true)

    // Guardar el rol en cookie antes de salir a Google
    // (los query params del redirectTo son descartados por Supabase OAuth)
    if (role) {
      document.cookie = `pending_role=${role}; path=/; max-age=300; SameSite=Lax`
    }

    if (plan) {
      document.cookie = `pending_plan=${plan}; path=/; max-age=600; SameSite=Lax`
    } 

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (oauthError) {
      console.error('[LoginCard] OAuth error:', oauthError.message)
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: 'clamp(28px, 5vw, 48px)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      }}
    >
      {/* Badge de rol */}
      {copy.badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: `${copy.badgeColor}20`,
            border: `1px solid ${copy.badgeColor}40`,
            borderRadius: '20px',
            padding: '4px 12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: copy.badgeColor!,
            }}
          />
          <span style={{ fontSize: '12px', color: copy.badgeColor!, fontWeight: 500 }}>
            {copy.badge}
          </span>
        </motion.div>
      )}

      {/* Título y subtítulo */}
      <h2
        style={{
          fontSize: 'clamp(20px, 3.5vw, 26px)',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '10px',
          letterSpacing: '-0.3px',
          lineHeight: 1.3,
        }}
      >
        {copy.title}
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.45)',
          marginBottom: '36px',
          lineHeight: 1.6,
        }}
      >
        {copy.subtitle}
      </p>

      {/* Error de autenticación */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#fca5a5',
          }}
        >
          {error === 'account_disabled'
            ? 'Tu cuenta ha sido desactivada. Contacta con soporte.'
            : 'Ha ocurrido un error. Por favor, inténtalo de nuevo.'}
        </div>
      )}

      {/* Botón Google */}
      <motion.button
        onClick={handleGoogleLogin}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '14px 24px',
          backgroundColor: loading ? 'rgba(255,255,255,0.04)' : '#ffffff',
          color: loading ? 'rgba(255,255,255,0.3)' : '#1a1a2e',
          border: loading ? '1px solid rgba(255,255,255,0.1)' : 'none',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? (
          <>
            <Spinner />
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>Continuar con Google</span>
          </>
        )}
      </motion.button>

      {/* Texto legal */}
      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.2)',
          textAlign: 'center',
          marginTop: '20px',
          lineHeight: 1.5,
        }}
      >
        Al continuar, aceptas nuestros{' '}
        <a href="/legal/terms" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'underline' }}>
          Términos de uso
        </a>{' '}
        y{' '}
        <a href="/legal/privacy" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'underline' }}>
          Política de privacidad
        </a>
        .
      </p>
    </motion.div>
  )
}

// Icono SVG de Google
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

function Spinner() {
  return (
    <div
      style={{
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.1)',
        borderTopColor: 'rgba(255,255,255,0.4)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  )
}