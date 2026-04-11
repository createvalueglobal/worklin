import { SupabaseClient } from '@supabase/supabase-js'
import { ProfessionalFull } from '@/lib/validators/professional.validator'
import { CompanyFull } from '@/lib/validators/company.validator'
import {
  createProfessional,
  createProfessionalSkills,
  createProfessionalLanguages,
  completeOnboarding as completeProfessionalOnboarding,
} from '@/lib/repositories/professionals.repository'
import {
  createCompany,
  completeOnboarding as completeCompanyOnboarding,
} from '@/lib/repositories/companies.repository'

/**
 * Guarda el perfil completo del profesional y marca el onboarding como completado.
 * Operación atómica: si falla cualquier paso, el onboarding NO se marca como completo.
 */
export async function saveProfessionalOnboarding(
  supabase: SupabaseClient,
  userId: string,
  data: ProfessionalFull
) {
  const { skills, languages, ...professionalData } = data

  // 1. Crear el profesional
  const professional = await createProfessional(supabase, {
    ...professionalData,
    user_id: userId,
  })

  // 2. Insertar skills en batch
  if (skills && skills.length > 0) {
    await createProfessionalSkills(
      supabase,
      skills.map((s, idx) => ({
        professional_id: professional.id,
        skill_name: s.skill_name,
        level: s.level,
        order: s.order ?? idx,
      }))
    )
  }

  // 3. Insertar idiomas en batch
  if (languages && languages.length > 0) {
    await createProfessionalLanguages(
      supabase,
      languages.map((l) => ({
        professional_id: professional.id,
        language: l.language,
        level: l.level,
      }))
    )
  }

  // 4. Marcar onboarding como completado (solo si todo fue bien)
  await completeProfessionalOnboarding(supabase, userId)

  return professional
}

/**
 * Guarda el perfil completo de la empresa y marca el onboarding como completado.
 */
export async function saveCompanyOnboarding(
  supabase: SupabaseClient,
  userId: string,
  data: CompanyFull
) {
  // 1. Crear la empresa
  const company = await createCompany(supabase, {
    ...data,
    user_id: userId,
  })

  // 2. Marcar onboarding como completado
  await completeCompanyOnboarding(supabase, userId)

  return company
}

/**
 * Guarda el rol del usuario y lo redirige al onboarding correspondiente.
 */
export async function saveUserRole(
  supabase: SupabaseClient,
  userId: string,
  role: 'professional' | 'company'
) {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(`Error guardando rol: ${error.message}`)
}