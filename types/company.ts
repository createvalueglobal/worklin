// ============================================================
// TYPES — Company area
// ============================================================

// ------------------------------------------------------------
// Company
// ------------------------------------------------------------

export interface Company {
  id: string
  user_id: string
  company_name: string
  logo_url: string | null
  sector: string | null
  country_id: string | null
  province_id: string | null
  address: string | null
  website: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CompanyWithLocation extends Company {
  province_name?: string | null
  country_name?: string | null
}

// ------------------------------------------------------------
// Subscription
// ------------------------------------------------------------

export type SubscriptionStatus = 'active' | 'completed' | 'expired' | 'cancelled'

export interface Subscription {
  id: string
  company_id: string
  tier_id: string
  // Snapshot del tier al contratar
  snapshot_tier_name: string
  snapshot_price: number
  snapshot_currency: string
  snapshot_profile_limit: number
  snapshot_allows_advanced_filters: boolean
  snapshot_allows_favorites: boolean
  snapshot_allows_history: boolean
  // Stripe
  stripe_subscription_id: string | null
  stripe_payment_intent_id: string | null
  // Estado
  status: SubscriptionStatus
  profiles_used: number
  started_at: string
  expires_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionTier {
  id: string
  name: string
  price: number
  currency: string
  profile_limit: number
  allows_advanced_filters: boolean
  allows_favorites: boolean
  allows_history: boolean
  is_active: boolean
}

// Vista enriquecida para el dashboard
export interface ActiveSubscriptionSummary {
  id: string
  tier_name: string
  price: number
  currency: string
  profile_limit: number
  profiles_used: number
  profiles_remaining: number
  allows_advanced_filters: boolean
  allows_favorites: boolean
  allows_history: boolean
  expires_at: string
  days_remaining: number
  is_expired: boolean
  is_full: boolean
}

// ------------------------------------------------------------
// Professional (vista desde empresa)
// ------------------------------------------------------------

export type AvailabilityStatus = 'immediate' | 'in_days' | 'not_available'
export type WorkMode = 'presential' | 'hybrid' | 'remote'

export interface ProfessionalSkill {
  id: string
  skill_name: string
  level: number
  order: number
}

export interface ProfessionalLanguage {
  id: string
  language: string
  level: string
}

// Perfil público (datos siempre visibles)
export interface ProfessionalPublicProfile {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  main_profession: string | null
  years_experience: number | null
  availability: AvailabilityStatus | null
  availability_days: number | null
  work_mode: WorkMode | null
  province_id: string | null
  province_name: string | null
  country_id: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  has_vehicle: boolean | null
  willing_to_travel: boolean | null
  about_me: string | null
  skills: ProfessionalSkill[]
  languages: ProfessionalLanguage[]
}

// Datos de contacto (solo visibles si está desbloqueado)
export interface ProfessionalContactData {
  phone: string | null
  contact_email: string | null
}

// Vista completa para empresa (perfil + metadatos de interacción)
export interface ProfessionalCardData extends ProfessionalPublicProfile {
  is_unlocked: boolean          // esta empresa ya desbloqueó este perfil
  is_favorite: boolean          // esta empresa lo marcó como favorito
  unlocked_at: string | null    // cuándo se desbloqueó (si aplica)
  contact: ProfessionalContactData | null  // null si no está desbloqueado
}

// ------------------------------------------------------------
// Search
// ------------------------------------------------------------

export interface SearchFilters {
  // Filtros básicos (todos los tiers)
  province_id?: string
  main_profession?: string
  // Filtros avanzados (Pro / Business)
  availability?: AvailabilityStatus
  work_mode?: WorkMode
  salary_min?: number
  salary_max?: number
  language?: string
  skill?: string
}

export interface SearchParams extends SearchFilters {
  page: number
  page_size: number
}

export interface SearchResult {
  professionals: ProfessionalCardData[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ------------------------------------------------------------
// Favorites
// ------------------------------------------------------------

export interface Favorite {
  id: string
  company_id: string
  professional_id: string
  subscription_id: string
  created_at: string
}

export interface FavoriteProfessional extends ProfessionalPublicProfile {
  favorite_id: string
  favorited_at: string
  is_unlocked: boolean
  contact: ProfessionalContactData | null
}

// ------------------------------------------------------------
// History
// ------------------------------------------------------------

export interface UnlockedProfile {
  id: string                    // subscription_profiles.id
  subscription_id: string
  professional_id: string
  unlocked_at: string
  notes: string | null
  professional: ProfessionalPublicProfile
  contact: ProfessionalContactData
}

export interface HistoryBySubscription {
  subscription_id: string
  tier_name: string
  started_at: string
  expires_at: string
  status: SubscriptionStatus
  profiles: UnlockedProfile[]
}

// ------------------------------------------------------------
// Unlock
// ------------------------------------------------------------

export interface UnlockProfileRequest {
  professional_id: string
}

export interface UnlockProfileResponse {
  success: boolean
  subscription_profile_id: string
  profiles_used: number
  profiles_remaining: number
}

export type UnlockError =
  | 'NO_ACTIVE_SUBSCRIPTION'
  | 'NO_QUOTA_REMAINING'
  | 'ALREADY_UNLOCKED'
  | 'PROFESSIONAL_NOT_FOUND'
  | 'SUBSCRIPTION_EXPIRED'