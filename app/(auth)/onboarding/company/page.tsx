import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import OnboardingLayout from '@/components/features/auth/shared/OnboardingLayout'
import CompanyOnboarding from '@/components/features/auth/company/CompanyOnboarding'

export const metadata: Metadata = {
  title: 'Registra tu empresa — WorkLin',
}

export default async function OnboardingCompanyPage() {
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: publicUser } = await supabase
    .from('users')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!publicUser || publicUser.role !== 'company') redirect('/onboarding/role')
  if (publicUser.onboarding_completed) redirect('/company/dashboard')

  const { data: countries } = await supabase
    .from('countries')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  const { data: provinces } = await supabase
    .from('provinces')
    .select('id, name, country_id')
    .eq('is_active', true)
    .order('name')

  return (
    <OnboardingLayout title="Registra tu empresa" subtitle="Empieza a encontrar el talento que necesitas">
      <CompanyOnboarding
        countries={countries ?? []}
        provinces={provinces ?? []}
      />
    </OnboardingLayout>
  )
}