import { createAdminClient } from '@/lib/supabase/admin'
import type {
  CreateCountryInput,
  UpdateCountryInput,
  CreateProvinceInput,
  UpdateProvinceInput,
  CreateTierInput,
  UpdateTierInput,
} from '@/lib/validators/admin.validators'

// ============================================================
// ADMIN REPOSITORY
// All queries use service_role client (bypasses RLS)
// ============================================================

// --- Stats ---

export async function getAdminStats() {
  const supabase = createAdminClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const [
    { count: totalProfessionals },
    { count: totalCompanies },
    { count: activeSubscriptions },
    { data: revenueData },
    { count: newUsers },
  ] = await Promise.all([
    supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('companies')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),

    // Revenue: suscripciones del mes (activas, completadas o expiradas)
    supabase
      .from('subscriptions')
      .select('snapshot_price, snapshot_currency')
      .in('status', ['active', 'completed', 'expired'])
      .gte('started_at', monthStart)
      .lte('started_at', monthEnd),

    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd),
  ])

  const monthlyRevenue = (revenueData ?? []).reduce(
    (sum, row) => sum + (row.snapshot_price ?? 0),
    0
  )

  return {
    totalProfessionals: totalProfessionals ?? 0,
    totalCompanies: totalCompanies ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    monthlyRevenue,
    currency: 'EUR',
    newUsersThisMonth: newUsers ?? 0,
  }
}

// --- Users ---

export async function getAdminUsers(params: {
  role?: string
  isActive?: boolean | 'all'
  search?: string
  page: number
  limit: number
}) {
  const supabase = createAdminClient()
  const { role, isActive, search, page, limit } = params
  const offset = (page - 1) * limit

  // Base query joining professionals and companies to get profile name
  let query = supabase
    .from('users')
    .select(
      `
      id, email, role, is_active, onboarding_completed, created_at,
      professionals!left(first_name, last_name, photo_url),
      companies!left(company_name, logo_url)
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (role && role !== 'all') {
    query = query.eq('role', role)
  }

  if (isActive !== 'all' && isActive !== undefined) {
    query = query.eq('is_active', isActive)
  }

  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  const { data, count, error } = await query

  if (error) throw new Error(`Error fetching users: ${error.message}`)

  // Normalize joined data (Supabase returns array for one-to-many joins)
  const normalized = (data ?? []).map((row) => {
    const professional = Array.isArray(row.professionals)
      ? row.professionals[0]
      : row.professionals
    const company = Array.isArray(row.companies) ? row.companies[0] : row.companies

    const profileName =
      row.role === 'professional' && professional
        ? `${professional.first_name ?? ''} ${professional.last_name ?? ''}`.trim()
        : row.role === 'company' && company
          ? company.company_name
          : null

    const profilePhotoUrl =
      row.role === 'professional'
        ? (professional?.photo_url ?? null)
        : (company?.logo_url ?? null)

    return {
      ...row,
      profile_name: profileName,
      profile_photo_url: profilePhotoUrl,
    }
  })

  return { data: normalized, total: count ?? 0 }
}

export async function getAdminUserById(userId: string) {
  const supabase = createAdminClient()

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('id, email, role, is_active, onboarding_completed, created_at')
    .eq('id', userId)
    .single()

  if (userError || !userRow) throw new Error('Usuario no encontrado')

  let professionalRow = null
  let companyRow = null
  let activeSubscription = null

  if (userRow.role === 'professional') {
    const { data } = await supabase
      .from('professionals')
      .select(
        `
        id, first_name, last_name, main_profession, phone, 
        is_visible, is_active, created_at,
        provinces!left(name)
        `
      )
      .eq('user_id', userId)
      .single()

    if (data) {
      const province = Array.isArray(data.provinces) ? data.provinces[0] : data.provinces
      professionalRow = { ...data, province_name: province?.name ?? null }
    }
  }

  if (userRow.role === 'company') {
    const { data } = await supabase
      .from('companies')
      .select(
        `
        id, company_name, sector, contact_name, contact_phone,
        is_active, created_at,
        provinces!left(name)
        `
      )
      .eq('user_id', userId)
      .single()

    if (data) {
      const province = Array.isArray(data.provinces) ? data.provinces[0] : data.provinces
      companyRow = { ...data, province_name: province?.name ?? null }

      // Active subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select(
          'id, snapshot_tier_name, status, profiles_used, snapshot_profile_limit, expires_at'
        )
        .eq('company_id', data.id)
        .eq('status', 'active')
        .maybeSingle()

      activeSubscription = sub ?? null
    }
  }

  return { userRow, professionalRow, companyRow, activeSubscription }
}

export async function setUserActive(userId: string, isActive: boolean) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw new Error(`Error actualizando usuario: ${error.message}`)

  // Also update the linked professional or company table
  await supabase
    .from('professionals')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  await supabase
    .from('companies')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

// --- Countries ---

export async function getCountries() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('countries')
    .select('id, name, code, is_active, created_at')
    .order('name', { ascending: true })

  if (error) throw new Error(`Error fetching countries: ${error.message}`)

  // Get province counts per country
  const { data: provinceCounts } = await supabase
    .from('provinces')
    .select('country_id')

  const countMap = new Map<string, number>()
  for (const p of provinceCounts ?? []) {
    countMap.set(p.country_id, (countMap.get(p.country_id) ?? 0) + 1)
  }

  return (data ?? []).map((row) => ({
    ...row,
    provinces_count: countMap.get(row.id) ?? 0,
  }))
}

export async function createCountry(input: CreateCountryInput) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('countries')
    .insert({ name: input.name, code: input.code, is_active: true })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un país con ese código ISO')
    throw new Error(`Error creando país: ${error.message}`)
  }

  return data
}

export async function updateCountry(countryId: string, input: UpdateCountryInput) {
  const supabase = createAdminClient()

  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.code !== undefined) updateData.code = input.code
  if (input.isActive !== undefined) updateData.is_active = input.isActive

  const { data, error } = await supabase
    .from('countries')
    .update(updateData)
    .eq('id', countryId)
    .select()
    .single()

  if (error) throw new Error(`Error actualizando país: ${error.message}`)
  return data
}

// --- Provinces ---

export async function getProvinces(countryId?: string) {
  const supabase = createAdminClient()

  let query = supabase
    .from('provinces')
    .select(
      `
      id, country_id, name, code, is_active, created_at,
      countries!left(name)
      `
    )
    .order('name', { ascending: true })

  if (countryId) {
    query = query.eq('country_id', countryId)
  }

  const { data, error } = await query

  if (error) throw new Error(`Error fetching provinces: ${error.message}`)

  return (data ?? []).map((row) => {
    const country = Array.isArray(row.countries) ? row.countries[0] : row.countries
    return { ...row, country_name: country?.name ?? null }
  })
}

export async function createProvince(input: CreateProvinceInput) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('provinces')
    .insert({
      country_id: input.countryId,
      name: input.name,
      code: input.code,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Ya existe una provincia con ese código en este país')
    throw new Error(`Error creando provincia: ${error.message}`)
  }

  return data
}

export async function updateProvince(provinceId: string, input: UpdateProvinceInput) {
  const supabase = createAdminClient()

  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.code !== undefined) updateData.code = input.code
  if (input.isActive !== undefined) updateData.is_active = input.isActive

  const { data, error } = await supabase
    .from('provinces')
    .update(updateData)
    .eq('id', provinceId)
    .select()
    .single()

  if (error) throw new Error(`Error actualizando provincia: ${error.message}`)
  return data
}

// --- Tiers ---

export async function getTiers() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .order('price', { ascending: true })

  if (error) throw new Error(`Error fetching tiers: ${error.message}`)

  // Count active subscriptions per tier
  const { data: subCounts } = await supabase
    .from('subscriptions')
    .select('tier_id')
    .eq('status', 'active')

  const countMap = new Map<string, number>()
  for (const s of subCounts ?? []) {
    if (s.tier_id) countMap.set(s.tier_id, (countMap.get(s.tier_id) ?? 0) + 1)
  }

  return (data ?? []).map((row) => ({
    ...row,
    active_subscriptions_count: countMap.get(row.id) ?? 0,
  }))
}

export async function createTier(input: CreateTierInput) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('subscription_tiers')
    .insert({
      name: input.name,
      price: input.price,
      currency: input.currency,
      profile_limit: input.profileLimit,
      allows_advanced_filters: input.allowsAdvancedFilters,
      allows_favorites: input.allowsFavorites,
      allows_history: input.allowsHistory,
      exclusive_lock: input.exclusiveLock,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw new Error(`Error creando tier: ${error.message}`)
  return data
}

export async function updateTier(tierId: string, input: UpdateTierInput) {
  const supabase = createAdminClient()

  // If deactivating, check for active subscriptions
  if (input.isActive === false) {
    const { count } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('tier_id', tierId)
      .eq('status', 'active')

    if ((count ?? 0) > 0) {
      throw new Error(
        'No se puede desactivar un tier con suscripciones activas. Espera a que venzan o cancélalas primero.'
      )
    }
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name !== undefined) updateData.name = input.name
  if (input.price !== undefined) updateData.price = input.price
  if (input.currency !== undefined) updateData.currency = input.currency
  if (input.profileLimit !== undefined) updateData.profile_limit = input.profileLimit
  if (input.allowsAdvancedFilters !== undefined) updateData.allows_advanced_filters = input.allowsAdvancedFilters
  if (input.allowsFavorites !== undefined) updateData.allows_favorites = input.allowsFavorites
  if (input.allowsHistory !== undefined) updateData.allows_history = input.allowsHistory
  if (input.exclusiveLock !== undefined) updateData.exclusive_lock = input.exclusiveLock
  if (input.isActive !== undefined) updateData.is_active = input.isActive

  const { data, error } = await supabase
    .from('subscription_tiers')
    .update(updateData)
    .eq('id', tierId)
    .select()
    .single()

  if (error) throw new Error(`Error actualizando tier: ${error.message}`)
  return data
}

// --- Subscriptions ---

export async function cancelSubscription(subscriptionId: string, adminNotes: string) {
  const supabase = createAdminClient()

  // Verify subscription exists and is active
  const { data: sub, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, status, stripe_subscription_id, company_id')
    .eq('id', subscriptionId)
    .single()

  if (fetchError || !sub) throw new Error('Suscripción no encontrada')
  if (sub.status !== 'active') throw new Error('Solo se pueden cancelar suscripciones activas')

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      admin_notes: adminNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)

  if (error) throw new Error(`Error cancelando suscripción: ${error.message}`)

  return { stripeSubscriptionId: sub.stripe_subscription_id, companyId: sub.company_id }
}

// --- Logs ---

export async function createAdminLog(params: {
  adminUserId: string
  action: string
  targetType: string
  targetId: string
  notes?: string
}) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('admin_logs').insert({
    admin_user_id: params.adminUserId,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId,
    notes: params.notes ?? null,
  })

  if (error) {
    // Logs should not break the main operation — log to console
    console.error('Error creating admin log:', error.message)
  }
}

export async function getAdminLogs(params: {
  action?: string
  adminUserId?: string
  dateFrom?: string
  dateTo?: string
  page: number
  limit: number
}) {
  const supabase = createAdminClient()
  const { action, adminUserId, dateFrom, dateTo, page, limit } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from('admin_logs')
    .select(
      `
      id, admin_user_id, action, target_type, target_id, notes, created_at,
      users!admin_logs_admin_user_id_fkey(email)
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (action && action !== 'all') query = query.eq('action', action)
  if (adminUserId && adminUserId !== 'all') query = query.eq('admin_user_id', adminUserId)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  const { data, count, error } = await query

  if (error) throw new Error(`Error fetching logs: ${error.message}`)

  const normalized = (data ?? []).map((row) => {
    const userArr = Array.isArray(row.users) ? row.users[0] : row.users
    return { ...row, admin_email: userArr?.email ?? null }
  })

  return { data: normalized, total: count ?? 0 }
}

export async function getAdminUsers_ForFilter() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('users')
    .select('id, email')
    .eq('role', 'admin')
    .order('email')

  return data ?? []
}