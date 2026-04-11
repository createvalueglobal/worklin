import { Metadata } from 'next'
import LoginCard from '@/components/features/auth/LoginCard'
import OnboardingLayout from '@/components/features/auth/shared/OnboardingLayout'

export const metadata: Metadata = {
  title: 'Iniciar sesión — WorkLin',
  description: 'Accede a WorkLin con tu cuenta de Google',
}

interface LoginPageProps {
  searchParams: Promise<{ role?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const role = params.role === 'professional' || params.role === 'company'
    ? params.role
    : null
  const error = params.error ?? null

  return (
    <OnboardingLayout
      title={
        role === 'professional'
          ? 'Accede como profesional'
          : role === 'company'
            ? 'Accede como empresa'
            : 'Bienvenido a WorkLin'
      }
      subtitle="Usa tu cuenta de Google para continuar"
    >
      <LoginCard role={role} error={error} />
    </OnboardingLayout>
  )
}