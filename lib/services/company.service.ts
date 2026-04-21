import { SupabaseClient } from '@supabase/supabase-js'
import type {
  Company,
  Subscription,
  ActiveSubscriptionSummary,
  SearchParams,
  SearchResult,
  UnlockProfileResponse,
  UnlockError,
  FavoriteProfessional,
  HistoryBySubscription,
} from '@/types/company'
import * as repo from '@/lib/repositories/company.repository'

// ------------------------------------------------------------
// Company profile
// ------------------------------------------------------------

export async function getCompanyProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Company | null> {
  return repo.getCompanyByUserId(supabase, userId)
}

// ------------------------------------------------------------
// Subscription summary
// ------------------------------------------------------------

export function buildSubscriptionSummary(
  subscription: Subscription
): ActiveSubscriptionSummary {
  const now = new Date()
  const expiresAt = new Date(subscription.expires_at)
  const daysRemaining = Math.max(
    0,
    Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )
  const isExpired = now >= expiresAt
  const profilesRemaining = Math.max(
    0,
    subscription.snapshot_profile_limit - subscription.profiles_used
  )
  const isFull = profilesRemaining === 0

  return {
    id: subscription.id,
    tier_name: subscription.snapshot_tier_name,
    price: subscription.snapshot_price,
    currency: subscription.snapshot_currency,
    profile_limit: subscription.snapshot_profile_limit,
    profiles_used: subscription.profiles_used,
    profiles_remaining: profilesRemaining,
    allows_advanced_filters: subscription.snapshot_allows_advanced_filters,
    allows_favorites: subscription.snapshot_allows_favorites,
    allows_history: subscription.snapshot_allows_history,
    expires_at: subscription.expires_at,
    days_remaining: daysRemaining,
    is_expired: isExpired,
    is_full: isFull,
  }
}

export async function getActiveSubscriptionSummary(
  supabase: SupabaseClient,
  companyId: string
): Promise<ActiveSubscriptionSummary | null> {
  const subscription = await repo.getActiveSubscription(supabase, companyId)
  if (!subscription) return null
  return buildSubscriptionSummary(subscription)
}

// ------------------------------------------------------------
// Search
// ------------------------------------------------------------

export async function searchProfessionals(
  supabase: SupabaseClient,
  companyId: string,
  params: SearchParams,
  subscription: Subscription | null
): Promise<SearchResult> {
  // Si el tier no permite filtros avanzados, los ignoramos
  const sanitizedParams: SearchParams = { ...params }

  if (!subscription?.snapshot_allows_advanced_filters) {
    delete sanitizedParams.availability
    delete sanitizedParams.work_mode
    delete sanitizedParams.salary_min
    delete sanitizedParams.salary_max
    delete sanitizedParams.language
    delete sanitizedParams.skill
  }

  const { professionals, total } = await repo.searchProfessionals(
    supabase,
    companyId,
    sanitizedParams,
    subscription?.id ?? null
  )

  const totalPages = Math.ceil(total / params.page_size)

  return {
    professionals,
    total,
    page: params.page,
    page_size: params.page_size,
    total_pages: totalPages,
  }
}

// ------------------------------------------------------------
// Unlock profile
// ------------------------------------------------------------

export async function unlockProfile(
  supabase: SupabaseClient,
  companyId: string,
  professionalId: string
): Promise<{ success: true; data: UnlockProfileResponse } | { success: false; error: UnlockError }> {
  // 1. Obtener suscripción activa
  const subscription = await repo.getActiveSubscription(supabase, companyId)

  if (!subscription) {
    return { success: false, error: 'NO_ACTIVE_SUBSCRIPTION' }
  }

  // 2. Verificar que no está expirada
  const isExpired = new Date() >= new Date(subscription.expires_at)
  if (isExpired) {
    return { success: false, error: 'SUBSCRIPTION_EXPIRED' }
  }

  // 3. Verificar cupo disponible
  const profilesRemaining =
    subscription.snapshot_profile_limit - subscription.profiles_used
  if (profilesRemaining <= 0) {
    return { success: false, error: 'NO_QUOTA_REMAINING' }
  }

  // 4. Verificar si ya está desbloqueado en esta suscripción
  const alreadyUnlocked = await repo.isProfileAlreadyUnlocked(
    supabase,
    subscription.id,
    professionalId
  )
  if (alreadyUnlocked) {
    return { success: false, error: 'ALREADY_UNLOCKED' }
  }

  // 5. Ejecutar desbloqueo
  const result = await repo.unlockProfile(supabase, subscription.id, professionalId)
  if (!result) {
    return { success: false, error: 'PROFESSIONAL_NOT_FOUND' }
  }

  const newProfilesUsed = result.profiles_used
  const newProfilesRemaining = Math.max(
    0,
    subscription.snapshot_profile_limit - newProfilesUsed
  )

  // 6. Si profiles_used = profile_limit → cerrar suscripción
  if (newProfilesUsed >= subscription.snapshot_profile_limit) {
    await supabase
      .from('subscriptions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', subscription.id)
  }

  return {
    success: true,
    data: {
      success: true,
      subscription_profile_id: result.subscription_profile_id,
      profiles_used: newProfilesUsed,
      profiles_remaining: newProfilesRemaining,
    },
  }
}

// ------------------------------------------------------------
// Favorites
// ------------------------------------------------------------

export async function getFavorites(
  supabase: SupabaseClient,
  companyId: string,
  subscription: Subscription | null
): Promise<{ allowed: boolean; favorites: FavoriteProfessional[] }> {
  // Requiere suscripción activa con allows_favorites
  if (!subscription || !subscription.snapshot_allows_favorites) {
    return { allowed: false, favorites: [] }
  }

  const favorites = await repo.getFavorites(supabase, companyId)
  return { allowed: true, favorites }
}

export async function addFavorite(
  supabase: SupabaseClient,
  companyId: string,
  professionalId: string,
  subscription: Subscription | null
): Promise<{ success: boolean; error?: string }> {
  if (!subscription || !subscription.snapshot_allows_favorites) {
    return { success: false, error: 'FAVORITES_NOT_ALLOWED' }
  }

  const ok = await repo.addFavorite(
    supabase,
    companyId,
    professionalId,
    subscription.id
  )
  return { success: ok }
}

export async function removeFavorite(
  supabase: SupabaseClient,
  companyId: string,
  professionalId: string
): Promise<{ success: boolean }> {
  const ok = await repo.removeFavorite(supabase, companyId, professionalId)
  return { success: ok }
}

// ------------------------------------------------------------
// History
// ------------------------------------------------------------

export async function getHistory(
  supabase: SupabaseClient,
  companyId: string
): Promise<{ allowed: boolean; history: HistoryBySubscription[] }> {
  // Obtener todas las suscripciones con allows_history
  const allSubscriptions = await repo.getSubscriptionHistory(supabase, companyId)
  const withHistory = allSubscriptions.filter((s) => s.snapshot_allows_history)

  if (withHistory.length === 0) {
    // Si no tiene ninguna suscripción con historial, verificar si la activa existe
    // const active = allSubscriptions.find((s) => s.status === 'active')
    // if (!active) return { allowed: false, history: [] }
    // Tiene suscripción activa pero sin allows_history
    return { allowed: false, history: [] }
  }

  // Cargar perfiles desbloqueados por suscripción
  const history: HistoryBySubscription[] = await Promise.all(
    withHistory.map(async (sub) => {
      const profiles = await repo.getUnlockedProfilesBySubscription(supabase, sub.id)
      return {
        subscription_id: sub.id,
        tier_name: sub.snapshot_tier_name,
        started_at: sub.started_at,
        expires_at: sub.expires_at,
        status: sub.status,
        profiles,
      }
    })
  )

  // Solo devolver suscripciones que tienen al menos un perfil
  const nonEmpty = history.filter((h) => h.profiles.length > 0)

  return { allowed: true, history: nonEmpty }
}