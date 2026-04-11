import { SupabaseClient } from '@supabase/supabase-js'
import { CompanyFull } from '@/lib/validators/company.validator'

export interface CreateCompanyInput extends CompanyFull {
  user_id: string
}

/**
 * Crea el registro de empresa en public.companies.
 * is_active=true por defecto (el admin lo controla después).
 */
export async function createCompany(
  supabase: SupabaseClient,
  input: CreateCompanyInput
) {
  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      ...input,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Error creando empresa: ${error.message}`)
  return company
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