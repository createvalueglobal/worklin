// ─── Base Types ───────────────────────────────────────────────────────────────

export type AvailabilityStatus = 'immediate' | 'in_days' | 'not_available'
export type WorkMode = 'presential' | 'hybrid' | 'remote'
export type SkillLevel = 1 | 2 | 3 | 4 | 5
export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native'
export type Gender = 'male' | 'female'

// ─── DB Models ────────────────────────────────────────────────────────────────

export interface ProfessionalSkill {
  id: string
  professional_id: string
  skill_name: string
  level: SkillLevel
  order: number
}

export interface ProfessionalLanguage {
  id: string
  professional_id: string
  language: string
  level: LanguageLevel
}

export interface Professional {
  id: string
  user_id: string
  first_name: string
  last_name: string
  gender: Gender
  photo_url: string | null
  birth_date: string | null
  nationality: string | null
  country_id: string | null
  province_id: string | null
  phone: string | null
  main_profession: string
  years_experience: number
  availability: AvailabilityStatus
  availability_days: number | null
  work_mode: WorkMode
  last_position: string | null
  last_company: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  has_vehicle: boolean
  willing_to_travel: boolean
  about_me: string | null
  cv_url: string | null
  is_visible: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProfessionalWithRelations extends Professional {
  country: { id: string; name: string; code: string } | null
  province: { id: string; name: string; code: string } | null
  skills: ProfessionalSkill[]
  languages: ProfessionalLanguage[]
}

// ─── Update Payload ────────────────────────────────────────────────────────────

// Omit fields that should never be updated from the profile editor
export type UpdateProfessionalPayload = Partial<
  Omit<Professional, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>
>

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface ProfessionalDashboardDTO {
  id: string
  userId: string
  firstName: string
  lastName: string
  fullName: string
  mainProfession: string
  photoUrl: string | null
  isVisible: boolean
  isActive: boolean
  provinceName: string | null
  countryName: string | null
  favoritesCount: number
  favoritesLastAt: string | null
}

export interface ProfessionalProfileDTO extends ProfessionalWithRelations {
  fullName: string
}