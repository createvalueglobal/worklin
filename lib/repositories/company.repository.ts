import { SupabaseClient } from '@supabase/supabase-js'
import type {
  Company,
  Subscription,
  ProfessionalCardData,
  ProfessionalPublicProfile,
  ProfessionalContactData,
  SearchParams,
  UnlockedProfile,
  FavoriteProfessional,
} from '@/types/company'

// ------------------------------------------------------------
// Company
// ------------------------------------------------------------

export async function getCompanyByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data as Company
}

// ------------------------------------------------------------
// Subscription
// ------------------------------------------------------------

export async function getActiveSubscription(
  supabase: SupabaseClient,
  companyId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) return null
  return data as Subscription
}

export async function getSubscriptionHistory(
  supabase: SupabaseClient,
  companyId: string
): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as Subscription[]
}

// ------------------------------------------------------------
// Professional search
// ------------------------------------------------------------

export async function searchProfessionals(
  supabase: SupabaseClient,
  companyId: string,
  params: SearchParams,
  activeSubscriptionId: string | null
): Promise<{ professionals: ProfessionalCardData[]; total: number }> {
  const { page, page_size, province_id, main_profession } = params
  const offset = (page - 1) * page_size

  // Base query — solo profesionales visibles y activos
  let query = supabase
    .from('professionals')
    .select(
      `
      id, first_name, last_name, photo_url,
      main_profession, years_experience,
      availability, availability_days, work_mode,
      province_id, country_id,
      salary_min, salary_max, salary_currency,
      has_vehicle, willing_to_travel, about_me,
      phone,
      users!professionals_user_id_fkey (email),
      provinces!professionals_province_id_fkey (name),
      professional_skills (id, skill_name, level, order),
      professional_languages (id, language, level)
      `,
      { count: 'exact' }
    )
    .eq('is_visible', true)
    .eq('is_active', true)

  // Filtros básicos
  if (province_id) query = query.eq('province_id', province_id)
  if (main_profession) query = query.ilike('main_profession', `%${main_profession}%`)

  // Filtros avanzados (solo se aplican si el tier los permite)
  if (params.availability) query = query.eq('availability', params.availability)
  if (params.work_mode) query = query.eq('work_mode', params.work_mode)
  if (params.salary_min != null) query = query.gte('salary_min', params.salary_min)
  if (params.salary_max != null) query = query.lte('salary_max', params.salary_max)

  // Paginación
  query = query.range(offset, offset + page_size - 1)

  //console.log('Search params:', JSON.stringify(params, null, 2))
  const { data, error, count } = await query

  //console.error('Search error:', error)
  //console.log('Search data count:', count)

  if (error || !data) return { professionals: [], total: 0 }

  // IDs de perfiles ya desbloqueados por esta empresa en la suscripción activa
  const unlockedIds = await getUnlockedProfessionalIds(supabase, companyId, activeSubscriptionId)

  // IDs marcados como favoritos
  const favoriteIds = await getFavoriteProfessionalIds(supabase, companyId)

  // Mapear resultados
  const professionals: ProfessionalCardData[] = (data as any[]).map((row) => {
    const isUnlocked = unlockedIds.has(row.id)
    const isFavorite = favoriteIds.has(row.id)

    const publicProfile: ProfessionalPublicProfile = {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      photo_url: row.photo_url,
      main_profession: row.main_profession,
      years_experience: row.years_experience,
      availability: row.availability,
      availability_days: row.availability_days,
      work_mode: row.work_mode,
      province_id: row.province_id,
      province_name: row.provinces?.name ?? null,
      country_id: row.country_id,
      salary_min: row.salary_min,
      salary_max: row.salary_max,
      salary_currency: row.salary_currency,
      has_vehicle: row.has_vehicle,
      willing_to_travel: row.willing_to_travel,
      about_me: row.about_me,
      skills: (row.professional_skills ?? []).sort((a: any, b: any) => a.order - b.order),
      languages: row.professional_languages ?? [],
    }

    const contact: ProfessionalContactData | null = isUnlocked
      ? { phone: row.phone, contact_email: row.users?.email ?? null }
      : null

    return {
      ...publicProfile,
      is_unlocked: isUnlocked,
      is_favorite: isFavorite,
      unlocked_at: null, // se enriquece si es necesario
      contact,
    }
  })

  return { professionals, total: count ?? 0 }
}

// IDs de profesionales desbloqueados por esta empresa
export async function getUnlockedProfessionalIds(
  supabase: SupabaseClient,
  companyId: string,
  subscriptionId: string | null
): Promise<Set<string>> {
  if (!subscriptionId) return new Set()

  const { data, error } = await supabase
    .from('subscription_profiles')
    .select('professional_id')
    .eq('subscription_id', subscriptionId)

  if (error || !data) return new Set()
  return new Set(data.map((r) => r.professional_id))
}

// IDs de profesionales en favoritos de esta empresa
export async function getFavoriteProfessionalIds(
  supabase: SupabaseClient,
  companyId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('favorites')
    .select('professional_id')
    .eq('company_id', companyId)

  if (error || !data) return new Set()
  return new Set(data.map((r) => r.professional_id))
}

// ------------------------------------------------------------
// Unlock
// ------------------------------------------------------------

export async function unlockProfile(
  supabase: SupabaseClient,
  subscriptionId: string,
  professionalId: string
): Promise<{ subscription_profile_id: string; profiles_used: number } | null> {
  // Insertar en subscription_profiles
  const { data: profileData, error: profileError } = await supabase
    .from('subscription_profiles')
    .insert({
      subscription_id: subscriptionId,
      professional_id: professionalId,
      unlocked_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (profileError || !profileData) return null

  // Incrementar profiles_used en la suscripción
  const { data: subData, error: subError } = await supabase.rpc('increment_profiles_used', {
    p_subscription_id: subscriptionId,
  })

  if (subError) return null

  return {
    subscription_profile_id: profileData.id,
    profiles_used: subData ?? 0,
  }
}

export async function isProfileAlreadyUnlocked(
  supabase: SupabaseClient,
  subscriptionId: string,
  professionalId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('subscription_profiles')
    .select('id')
    .eq('subscription_id', subscriptionId)
    .eq('professional_id', professionalId)
    .maybeSingle()

  return !error && data !== null
}

// ------------------------------------------------------------
// Favorites
// ------------------------------------------------------------

export async function getFavorites(
  supabase: SupabaseClient,
  companyId: string
): Promise<FavoriteProfessional[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      id,
      created_at,
      subscription_id,
      professionals!favorites_professional_id_fkey (
        id, first_name, last_name, photo_url,
        main_profession, years_experience,
        availability, availability_days, work_mode,
        province_id, country_id,
        salary_min, salary_max, salary_currency,
        has_vehicle, willing_to_travel, about_me,
        phone, contact_email,
        provinces!professionals_province_id_fkey (name),
        professional_skills (id, skill_name, level, order),
        professional_languages (id, language, level)
      )
      `
    )
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  // IDs desbloqueados (de todas las suscripciones)
  const allUnlocked = await getAllUnlockedProfessionalIds(supabase, companyId)

  return (data as any[]).map((row) => {
    const pro = row.professionals
    const isUnlocked = allUnlocked.has(pro.id)

    return {
      id: pro.id,
      first_name: pro.first_name,
      last_name: pro.last_name,
      photo_url: pro.photo_url,
      main_profession: pro.main_profession,
      years_experience: pro.years_experience,
      availability: pro.availability,
      availability_days: pro.availability_days,
      work_mode: pro.work_mode,
      province_id: pro.province_id,
      province_name: pro.provinces?.name ?? null,
      country_id: pro.country_id,
      salary_min: pro.salary_min,
      salary_max: pro.salary_max,
      salary_currency: pro.salary_currency,
      has_vehicle: pro.has_vehicle,
      willing_to_travel: pro.willing_to_travel,
      about_me: pro.about_me,
      skills: (pro.professional_skills ?? []).sort((a: any, b: any) => a.order - b.order),
      languages: pro.professional_languages ?? [],
      favorite_id: row.id,
      favorited_at: row.created_at,
      is_unlocked: isUnlocked,
      contact: isUnlocked
        ? { phone: pro.phone, contact_email: pro.contact_email }
        : null,
    } as FavoriteProfessional
  })
}

export async function addFavorite(
  supabase: SupabaseClient,
  companyId: string,
  professionalId: string,
  subscriptionId: string
): Promise<boolean> {
  const { error } = await supabase.from('favorites').insert({
    company_id: companyId,
    professional_id: professionalId,
    subscription_id: subscriptionId,
  })
  return !error
}

export async function removeFavorite(
  supabase: SupabaseClient,
  companyId: string,
  professionalId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('company_id', companyId)
    .eq('professional_id', professionalId)
  return !error
}

// ------------------------------------------------------------
// History
// ------------------------------------------------------------

export async function getUnlockedProfilesBySubscription(
  supabase: SupabaseClient,
  subscriptionId: string
): Promise<UnlockedProfile[]> {
  const { data, error } = await supabase
    .from('subscription_profiles')
    .select(
      `
      id, subscription_id, professional_id, unlocked_at, notes,
      professionals!subscription_profiles_professional_id_fkey (
        id, first_name, last_name, photo_url,
        main_profession, years_experience,
        availability, work_mode, province_id,
        phone, contact_email,
        provinces!professionals_province_id_fkey (name),
        professional_skills (id, skill_name, level, order),
        professional_languages (id, language, level)
      )
      `
    )
    .eq('subscription_id', subscriptionId)
    .order('unlocked_at', { ascending: false })

  if (error || !data) return []

  return (data as any[]).map((row) => {
    const pro = row.professionals
    return {
      id: row.id,
      subscription_id: row.subscription_id,
      professional_id: row.professional_id,
      unlocked_at: row.unlocked_at,
      notes: row.notes,
      professional: {
        id: pro.id,
        first_name: pro.first_name,
        last_name: pro.last_name,
        photo_url: pro.photo_url,
        main_profession: pro.main_profession,
        years_experience: pro.years_experience,
        availability: pro.availability,
        availability_days: null,
        work_mode: pro.work_mode,
        province_id: pro.province_id,
        province_name: pro.provinces?.name ?? null,
        country_id: null,
        salary_min: null,
        salary_max: null,
        salary_currency: null,
        has_vehicle: null,
        willing_to_travel: null,
        about_me: null,
        skills: (pro.professional_skills ?? []).sort((a: any, b: any) => a.order - b.order),
        languages: pro.professional_languages ?? [],
      },
      contact: {
        phone: pro.phone,
        contact_email: pro.contact_email,
      },
    } as UnlockedProfile
  })
}

// Todos los IDs desbloqueados por esta empresa (todas las suscripciones)
async function getAllUnlockedProfessionalIds(
  supabase: SupabaseClient,
  companyId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('company_id', companyId)

  if (error || !data || data.length === 0) return new Set()

  const subscriptionIds = data.map((s) => s.id)

  const { data: profiles, error: profileError } = await supabase
    .from('subscription_profiles')
    .select('professional_id')
    .in('subscription_id', subscriptionIds)

  if (profileError || !profiles) return new Set()
  return new Set(profiles.map((p) => p.professional_id))
}