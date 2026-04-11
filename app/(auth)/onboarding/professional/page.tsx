import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import OnboardingLayout from '@/components/features/auth/shared/OnboardingLayout'
import ProfessionalOnboarding from '@/components/features/auth/professional/ProfessionalOnboarding'

export const metadata: Metadata = {
  title: 'Crea tu perfil profesional — WorkLin',
}

export default async function OnboardingProfessionalPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )

  // Verificar sesión (el middleware ya protege esta ruta, pero doble check)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar rol
  const { data: publicUser } = await supabase
    .from('users')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!publicUser || publicUser.role !== 'professional') redirect('/onboarding/role')
  if (publicUser.onboarding_completed) redirect('/professional/dashboard')

  // Cargar países activos
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  // Cargar provincias activas
  const { data: provinces } = await supabase
    .from('provinces')
    .select('id, name, country_id')
    .eq('is_active', true)
    .order('name')

  return (
    <OnboardingLayout title="Crea tu perfil" subtitle="Solo te llevará unos minutos">
      <ProfessionalOnboarding
        userEmail={user.email ?? ''}
        countries={countries ?? []}
        provinces={provinces ?? []}
      />
    </OnboardingLayout>
  )
}