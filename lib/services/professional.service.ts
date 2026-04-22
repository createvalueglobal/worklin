import {
  getProfessionalByUserId,
  getFavoritesCount,
  updateProfessionalVisibility,
  updateProfessional,
  replaceSkills,
  replaceLanguages,
} from '@/lib/repositories/professional.repository'
import type {
  ProfessionalDashboardDTO,
  ProfessionalWithRelations,
  UpdateProfessionalPayload,
} from '@/types/professional'

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getProfessionalDashboardData(
  userId: string
): Promise<ProfessionalDashboardDTO | null> {
  const professional = await getProfessionalByUserId(userId)
  if (!professional) return null

  const { total, lastAt } = await getFavoritesCount(professional.id)

  return {
    id: professional.id,
    userId: professional.user_id,
    firstName: professional.first_name,
    lastName: professional.last_name,
    fullName: `${professional.first_name} ${professional.last_name}`,
    mainProfession: professional.main_profession,
    photoUrl: professional.photo_url,
    isVisible: professional.is_visible,
    isActive: professional.is_active,
    provinceName: professional.province?.name ?? null,
    countryName: professional.country?.name ?? null,
    favoritesCount: total,
    favoritesLastAt: lastAt,
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfessionalProfile(
  userId: string
): Promise<ProfessionalWithRelations | null> {
  return getProfessionalByUserId(userId)
}

// ─── Visibility ───────────────────────────────────────────────────────────────

export async function toggleVisibility(
  userId: string,
  isVisible: boolean
): Promise<{ success: boolean; isVisible: boolean }> {
  const professional = await getProfessionalByUserId(userId)
  if (!professional) return { success: false, isVisible: false }

  const ok = await updateProfessionalVisibility(professional.id, isVisible)
  return { success: ok, isVisible: ok ? isVisible : professional.is_visible }
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export interface UpdateProfileInput {
  professionalId: string
  fields: UpdateProfessionalPayload
  skills?: Array<{ skill_name: string; level: number; order: number }>
  languages?: Array<{ language: string; level: string }>
}

export async function updateProfessionalProfile(
  input: UpdateProfileInput
): Promise<{ success: boolean; error?: string }> {
  const { professionalId, fields, skills, languages } = input

  // Update main fields
  if (Object.keys(fields).length > 0) {
    const updated = await updateProfessional(professionalId, fields)
    if (!updated) return { success: false, error: 'Error actualizando el perfil' }
  }

  // Replace skills if provided
  if (skills !== undefined) {
    const ok = await replaceSkills(professionalId, skills)
    if (!ok) return { success: false, error: 'Error actualizando las habilidades' }
  }

  // Replace languages if provided
  if (languages !== undefined) {
    const ok = await replaceLanguages(professionalId, languages)
    if (!ok) return { success: false, error: 'Error actualizando los idiomas' }
  }

  return { success: true }
}