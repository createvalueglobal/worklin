import { createClient } from '@/lib/supabase/server'
import type {
  Professional,
  ProfessionalWithRelations,
  ProfessionalSkill,
  ProfessionalLanguage,
  UpdateProfessionalPayload,
} from '@/types/professional'

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function getProfessionalByUserId(
  userId: string
): Promise<ProfessionalWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('professionals')
    .select(
      `
      *,
      country:countries(id, name, code),
      province:provinces(id, name, code),
      skills:professional_skills(id, skill_name, level, order),
      languages:professional_languages(id, language, level)
    `
    )
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data as ProfessionalWithRelations
}

export async function getProfessionalById(
  professionalId: string
): Promise<ProfessionalWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('professionals')
    .select(
      `
      *,
      country:countries(id, name, code),
      province:provinces(id, name, code),
      skills:professional_skills(id, skill_name, level, order),
      languages:professional_languages(id, language, level)
    `
    )
    .eq('id', professionalId)
    .single()

  if (error || !data) return null
  return data as ProfessionalWithRelations
}

// ─── FAVORITES COUNT ──────────────────────────────────────────────────────────

export async function getFavoritesCount(
  professionalId: string
): Promise<{ total: number; lastAt: string | null }> {
  const supabase = await createClient()

  const { data, error, count } = await supabase
    .from('favorites')
    .select('created_at', { count: 'exact' })
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) return { total: 0, lastAt: null }

  const lastAt = data && data.length > 0 ? data[0].created_at : null
  return { total: count ?? 0, lastAt }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateProfessionalVisibility(
  professionalId: string,
  isVisible: boolean
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('professionals')
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
    .eq('id', professionalId)

  return !error
}

export async function updateProfessional(
  professionalId: string,
  payload: UpdateProfessionalPayload
): Promise<Professional | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('professionals')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', professionalId)
    .select()
    .single()

  if (error || !data) return null
  return data as Professional
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────

export async function replaceSkills(
  professionalId: string,
  skills: Array<{ skill_name: string; level: number; order: number }>
): Promise<boolean> {
  const supabase = await createClient()

  // Delete existing and re-insert (simple replace strategy for MVP)
  const { error: deleteError } = await supabase
    .from('professional_skills')
    .delete()
    .eq('professional_id', professionalId)

  if (deleteError) return false

  if (skills.length === 0) return true

  const { error: insertError } = await supabase
    .from('professional_skills')
    .insert(skills.map((s) => ({ ...s, professional_id: professionalId })))

  return !insertError
}

// ─── LANGUAGES ────────────────────────────────────────────────────────────────

export async function replaceLanguages(
  professionalId: string,
  languages: Array<{ language: string; level: string }>
): Promise<boolean> {
  const supabase = await createClient()

  const { error: deleteError } = await supabase
    .from('professional_languages')
    .delete()
    .eq('professional_id', professionalId)

  if (deleteError) return false

  if (languages.length === 0) return true

  const { error: insertError } = await supabase
    .from('professional_languages')
    .insert(languages.map((l) => ({ ...l, professional_id: professionalId })))

  return !insertError
}