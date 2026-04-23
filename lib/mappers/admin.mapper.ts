import type {
  AdminUserRow,
  AdminUserDetail,
  AdminCountry,
  AdminProvince,
  AdminTier,
  AdminLog,
  AdminSubscription,
  AdminStats,
} from '@/types/admin'

// ============================================================
// ADMIN MAPPER
// Raw DB rows → typed DTOs
// ============================================================

// --- Stats ---

export function mapAdminStats(raw: {
  totalProfessionals: number
  totalCompanies: number
  activeSubscriptions: number
  monthlyRevenue: number
  currency: string
  newUsersThisMonth: number
}): AdminStats {
  return {
    totalProfessionals: raw.totalProfessionals,
    totalCompanies: raw.totalCompanies,
    activeSubscriptions: raw.activeSubscriptions,
    monthlyRevenue: raw.monthlyRevenue,
    currency: raw.currency || 'EUR',
    newUsersThisMonth: raw.newUsersThisMonth,
  }
}

// --- Users ---

export function mapAdminUserRow(row: Record<string, unknown>): AdminUserRow {
  return {
    id: row.id as string,
    email: row.email as string,
    role: row.role as AdminUserRow['role'],
    isActive: row.is_active as boolean,
    onboardingCompleted: row.onboarding_completed as boolean,
    createdAt: row.created_at as string,
    profileName: (row.profile_name as string | null) ?? null,
    profilePhotoUrl: (row.profile_photo_url as string | null) ?? null,
  }
}

export function mapAdminUserDetail(
  userRow: Record<string, unknown>,
  professionalRow?: Record<string, unknown> | null,
  companyRow?: Record<string, unknown> | null,
  activeSubscription?: Record<string, unknown> | null
): AdminUserDetail {
  const base = mapAdminUserRow(userRow)

  const detail: AdminUserDetail = { ...base }

  if (professionalRow) {
    detail.professional = {
      id: professionalRow.id as string,
      firstName: professionalRow.first_name as string,
      lastName: professionalRow.last_name as string,
      mainProfession: (professionalRow.main_profession as string | null) ?? null,
      phone: (professionalRow.phone as string | null) ?? null,
      province: (professionalRow.province_name as string | null) ?? null,
      isVisible: professionalRow.is_visible as boolean,
      isActive: professionalRow.is_active as boolean,
      createdAt: professionalRow.created_at as string,
    }
  }

  if (companyRow) {
    detail.company = {
      id: companyRow.id as string,
      companyName: companyRow.company_name as string,
      sector: (companyRow.sector as string | null) ?? null,
      province: (companyRow.province_name as string | null) ?? null,
      contactName: (companyRow.contact_name as string | null) ?? null,
      contactPhone: (companyRow.contact_phone as string | null) ?? null,
      isActive: companyRow.is_active as boolean,
      createdAt: companyRow.created_at as string,
      activeSubscription: activeSubscription
        ? {
            id: activeSubscription.id as string,
            tierName: activeSubscription.snapshot_tier_name as string,
            status: activeSubscription.status as AdminSubscription['status'],
            profilesUsed: activeSubscription.profiles_used as number,
            profileLimit: activeSubscription.snapshot_profile_limit as number,
            expiresAt: (activeSubscription.expires_at as string | null) ?? null,
          }
        : null,
    }
  }

  return detail
}

// --- Countries ---

export function mapAdminCountry(row: Record<string, unknown>): AdminCountry {
  return {
    id: row.id as string,
    name: row.name as string,
    code: row.code as string,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    provincesCount: (row.provinces_count as number | null) ?? 0,
  }
}

// --- Provinces ---

export function mapAdminProvince(row: Record<string, unknown>): AdminProvince {
  return {
    id: row.id as string,
    countryId: row.country_id as string,
    countryName: (row.country_name as string | null) ?? undefined,
    name: row.name as string,
    code: row.code as string,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  }
}

// --- Tiers ---

export function mapAdminTier(row: Record<string, unknown>): AdminTier {
  return {
    id: row.id as string,
    name: row.name as string,
    price: row.price as number,
    currency: row.currency as string,
    profileLimit: row.profile_limit as number,
    allowsAdvancedFilters: row.allows_advanced_filters as boolean,
    allowsFavorites: row.allows_favorites as boolean,
    allowsHistory: row.allows_history as boolean,
    exclusiveLock: row.exclusive_lock as boolean,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    activeSubscriptionsCount: (row.active_subscriptions_count as number | null) ?? 0,
  }
}

// --- Subscriptions ---

export function mapAdminSubscription(row: Record<string, unknown>): AdminSubscription {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    companyName: (row.company_name as string) ?? 'Empresa desconocida',
    tierName: row.snapshot_tier_name as string,
    status: row.status as AdminSubscription['status'],
    snapshotPrice: row.snapshot_price as number,
    snapshotCurrency: row.snapshot_currency as string,
    snapshotProfileLimit: row.snapshot_profile_limit as number,
    profilesUsed: row.profiles_used as number,
    stripeSubscriptionId: (row.stripe_subscription_id as string | null) ?? null,
    adminNotes: (row.admin_notes as string | null) ?? null,
    startedAt: row.started_at as string,
    expiresAt: (row.expires_at as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

// --- Logs ---

export function mapAdminLog(row: Record<string, unknown>): AdminLog {
  return {
    id: row.id as string,
    adminUserId: row.admin_user_id as string,
    adminEmail: (row.admin_email as string) ?? 'admin@sistema',
    action: row.action as AdminLog['action'],
    targetType: row.target_type as AdminLog['targetType'],
    targetId: row.target_id as string,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}