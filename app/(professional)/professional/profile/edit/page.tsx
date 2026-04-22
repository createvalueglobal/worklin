import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfessionalByUserId } from '@/lib/repositories/professional.repository'
import { EditProfileForm } from '@/components/features/professional/edit/EditProfileForm'

async function getCountries() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('countries')
    .select('id, name')
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

async function getProvincesByCountry(countryId: string | null) {
  if (!countryId) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('provinces')
    .select('id, name')
    .eq('country_id', countryId)
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

export default async function EditProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const professional = await getProfessionalByUserId(user.id)
  if (!professional) redirect('/onboarding/role')

  const [countries, provinces] = await Promise.all([
    getCountries(),
    getProvincesByCountry(professional.country_id),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Editar perfil</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Mantén tu perfil actualizado para aparecer en más búsquedas
        </p>
      </div>

      {/* Form */}
      <EditProfileForm
        professional={professional}
        countries={countries}
        provinces={provinces}
        userEmail={user.email ?? ''}
      />
    </div>
  )
}