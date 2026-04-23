import * as repo from '@/lib/repositories/admin.repository'
import * as mapper from '@/lib/mappers/admin.mapper'
import type {
  AdminStats,
  AdminUserRow,
  AdminUserDetail,
  AdminCountry,
  AdminProvince,
  AdminTier,
  AdminLog,
  AdminUsersResponse,
  AdminLogsResponse,
} from '@/types/admin'
import type {
  AdminUsersFiltersInput,
  CreateCountryInput,
  UpdateCountryInput,
  CreateProvinceInput,
  UpdateProvinceInput,
  CreateTierInput,
  UpdateTierInput,
  CancelSubscriptionInput,
  AdminLogsFiltersInput,
} from '@/lib/validators/admin.validators'

// ============================================================
// ADMIN SERVICE
// Orchestrates repository + mapper + audit logging
// ============================================================

// --- Stats ---

export async function getStats(): Promise<AdminStats> {
  const raw = await repo.getAdminStats()
  return mapper.mapAdminStats(raw)
}

// --- Users ---

export async function getUsers(
  filters: AdminUsersFiltersInput
): Promise<AdminUsersResponse> {
  const { data, total } = await repo.getAdminUsers({
    role: filters.role,
    isActive: filters.isActive as boolean | 'all',
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
  })

  return {
    data: data.map((row) => mapper.mapAdminUserRow(row as Record<string, unknown>)),
    total,
    page: filters.page,
    limit: filters.limit,
  }
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail> {
  const { userRow, professionalRow, companyRow, activeSubscription } =
    await repo.getAdminUserById(userId)

  return mapper.mapAdminUserDetail(
    userRow as Record<string, unknown>,
    professionalRow as Record<string, unknown> | null,
    companyRow as Record<string, unknown> | null,
    activeSubscription as Record<string, unknown> | null
  )
}

export async function toggleUserActive(
  userId: string,
  isActive: boolean,
  adminUserId: string,
  notes?: string
): Promise<void> {
  await repo.setUserActive(userId, isActive)

  await repo.createAdminLog({
    adminUserId,
    action: isActive ? 'activate_user' : 'deactivate_user',
    targetType: 'user',
    targetId: userId,
    notes: notes ?? (isActive ? 'Cuenta activada' : 'Cuenta desactivada'),
  })
}

// --- Countries ---

export async function getCountries(): Promise<AdminCountry[]> {
  const rows = await repo.getCountries()
  return rows.map((row) => mapper.mapAdminCountry(row as Record<string, unknown>))
}

export async function createCountry(
  input: CreateCountryInput,
  adminUserId: string
): Promise<AdminCountry> {
  const row = await repo.createCountry(input)

  await repo.createAdminLog({
    adminUserId,
    action: 'create_country',
    targetType: 'country',
    targetId: row.id,
    notes: `País creado: ${input.name} (${input.code})`,
  })

  return mapper.mapAdminCountry(row as Record<string, unknown>)
}

export async function updateCountry(
  countryId: string,
  input: UpdateCountryInput,
  adminUserId: string
): Promise<AdminCountry> {
  const row = await repo.updateCountry(countryId, input)

  if (input.isActive !== undefined) {
    await repo.createAdminLog({
      adminUserId,
      action: input.isActive ? 'activate_country' : 'deactivate_country',
      targetType: 'country',
      targetId: countryId,
      notes: `País ${input.isActive ? 'activado' : 'desactivado'}`,
    })
  }

  return mapper.mapAdminCountry(row as Record<string, unknown>)
}

// --- Provinces ---

export async function getProvinces(countryId?: string): Promise<AdminProvince[]> {
  const rows = await repo.getProvinces(countryId)
  return rows.map((row) => mapper.mapAdminProvince(row as Record<string, unknown>))
}

export async function createProvince(
  input: CreateProvinceInput,
  adminUserId: string
): Promise<AdminProvince> {
  const row = await repo.createProvince(input)

  await repo.createAdminLog({
    adminUserId,
    action: 'create_province',
    targetType: 'province',
    targetId: row.id,
    notes: `Provincia creada: ${input.name} (${input.code})`,
  })

  return mapper.mapAdminProvince(row as Record<string, unknown>)
}

export async function updateProvince(
  provinceId: string,
  input: UpdateProvinceInput,
  adminUserId: string
): Promise<AdminProvince> {
  const row = await repo.updateProvince(provinceId, input)

  if (input.isActive !== undefined) {
    await repo.createAdminLog({
      adminUserId,
      action: input.isActive ? 'activate_province' : 'deactivate_province',
      targetType: 'province',
      targetId: provinceId,
      notes: `Provincia ${input.isActive ? 'activada' : 'desactivada'}`,
    })
  }

  return mapper.mapAdminProvince(row as Record<string, unknown>)
}

// --- Tiers ---

export async function getTiers(): Promise<AdminTier[]> {
  const rows = await repo.getTiers()
  return rows.map((row) => mapper.mapAdminTier(row as Record<string, unknown>))
}

export async function createTier(
  input: CreateTierInput,
  adminUserId: string
): Promise<AdminTier> {
  const row = await repo.createTier(input)

  await repo.createAdminLog({
    adminUserId,
    action: 'create_tier',
    targetType: 'tier',
    targetId: row.id,
    notes: `Tier creado: ${input.name} (${input.price} ${input.currency}/mes)`,
  })

  return mapper.mapAdminTier(row as Record<string, unknown>)
}

export async function updateTier(
  tierId: string,
  input: UpdateTierInput,
  adminUserId: string
): Promise<AdminTier> {
  const row = await repo.updateTier(tierId, input)

  const action =
    input.isActive === true
      ? 'activate_tier'
      : input.isActive === false
        ? 'deactivate_tier'
        : 'update_tier'

  await repo.createAdminLog({
    adminUserId,
    action,
    targetType: 'tier',
    targetId: tierId,
    notes: input.isActive !== undefined
      ? `Tier ${input.isActive ? 'activado' : 'desactivado'}`
      : `Tier actualizado`,
  })

  return mapper.mapAdminTier(row as Record<string, unknown>)
}

// --- Subscriptions ---

export async function cancelSubscription(
  input: CancelSubscriptionInput,
  adminUserId: string
): Promise<void> {
  const { stripeSubscriptionId } = await repo.cancelSubscription(
    input.subscriptionId,
    input.adminNotes
  )

  await repo.createAdminLog({
    adminUserId,
    action: 'cancel_subscription',
    targetType: 'subscription',
    targetId: input.subscriptionId,
    notes: input.adminNotes,
  })

  // Note: Stripe cancellation is intentionally NOT done here.
  // The admin must manually cancel in the Stripe dashboard if needed.
  // This keeps the MVP simple and avoids accidental API calls.
  if (stripeSubscriptionId) {
    console.info(
      `[Admin] Subscription ${input.subscriptionId} cancelled in DB. ` +
      `Stripe subscription ${stripeSubscriptionId} must be cancelled manually if needed.`
    )
  }
}

// --- Logs ---

export async function getLogs(
  filters: AdminLogsFiltersInput
): Promise<AdminLogsResponse> {
  const { data, total } = await repo.getAdminLogs({
    action: filters.action,
    adminUserId: filters.adminUserId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: filters.page,
    limit: filters.limit,
  })

  return {
    data: data.map((row) => mapper.mapAdminLog(row as Record<string, unknown>)),
    total,
    page: filters.page,
    limit: filters.limit,
  }
}

export async function getAdminUsersForFilter() {
  return repo.getAdminUsers_ForFilter()
}