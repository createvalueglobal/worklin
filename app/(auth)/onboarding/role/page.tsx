import { Metadata } from 'next'
import RoleSelector from '@/components/features/auth/RoleSelector'
import OnboardingLayout from '@/components/features/auth/shared/OnboardingLayout'

export const metadata: Metadata = {
  title: 'Elige tu perfil — WorkLin',
}

export default function OnboardingRolePage() {
  return (
    <OnboardingLayout
      title="¿Cómo quieres usar WorkLin?"
      subtitle="Selecciona tu tipo de perfil para personalizar tu experiencia"
    >
      <RoleSelector />
    </OnboardingLayout>
  )
}