import { SupabaseClient } from '@supabase/supabase-js'
import { ProfessionalFull } from '@/lib/validators/professional.validator'

export interface CreateProfessionalInput extends Omit<ProfessionalFull, 'skills' | 'languages'> {
  user_id: string
}

export interface CreateSkillInput {
  professional_id: string
  skill_name: string
  level: number
  order: number
}

export interface CreateLanguageInput {
  professional_id: string
  language: string
  level: string
}

/**
 * Crea el registro principal del profesional en public.professionals.
 * Inicializa is_visible=false e is_active=true (el admin lo controla después).
 */
export async function createProfessional(
  supabase: SupabaseClient,
  input: CreateProfessionalInput
) {
  const { skills, languages, ...data } = input as any

  const { data: professional, error } = await supabase
    .from('professionals')
    .insert({
      ...data,
      is_visible: false, // el profesional lo activa manualmente después
      is_active: true,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Error creando profesional: ${error.message}`)
  return professional
}

/**
 * Inserta las skills del profesional en batch.
 */
export async function createProfessionalSkills(
  supabase: SupabaseClient,
  skills: CreateSkillInput[]
) {
  const { error } = await supabase.from('professional_skills').insert(skills)
  if (error) throw new Error(`Error insertando skills: ${error.message}`)
}

/**
 * Inserta los idiomas del profesional en batch.
 */
export async function createProfessionalLanguages(
  supabase: SupabaseClient,
  languages: CreateLanguageInput[]
) {
  const { error } = await supabase.from('professional_languages').insert(languages)
  if (error) throw new Error(`Error insertando idiomas: ${error.message}`)
}

/**
 * Marca el onboarding como completado en public.users.
 */
export async function completeOnboarding(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', userId)

  if (error) throw new Error(`Error completando onboarding: ${error.message}`)
}