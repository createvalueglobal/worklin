// ============================================================
// ADMIN TYPES
// ============================================================

// --- Enums / Literals ---

export type UserRole = 'professional' | 'company' | 'admin'
export type SubscriptionStatus = 'active' | 'completed' | 'expired' | 'cancelled'
export type AdminLogTargetType = 'user' | 'professional' | 'company' | 'subscription' | 'tier' | 'country' | 'province'
export type AdminLogAction =
  | 'activate_user'
  | 'deactivate_user'
  | 'activate_professional'
  | 'deactivate_professional'
  | 'activate_company'
  | 'deactivate_company'
  | 'cancel_subscription'
  | 'activate_tier'
  | 'deactivate_tier'
  | 'create_tier'
  | 'update_tier'
  | 'activate_country'
  | 'deactivate_country'
  | 'create_country'
  | 'activate_province'
  | 'deactivate_province'
  | 'create_province'

// --- Dashboard Stats ---

export interface AdminStats {
  totalProfessionals: number
  totalCompanies: number
  activeSubscriptions: number
  monthlyRevenue: number
  currency: string
  newUsersThisMonth: number
}

// --- Users ---

export interface AdminUserRow {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  onboardingCompleted: boolean
  createdAt: string
  // Joined fields
  profileName: string | null       // first_name + last_name OR company_name
  profilePhotoUrl: string | null
}

export interface AdminUserDetail extends AdminUserRow {
  // Professional fields (if role === 'professional')
  professional?: {
    id: string
    firstName: string
    lastName: string
    mainProfession: string | null
    phone: string | null
    province: string | null
    isVisible: boolean
    isActive: boolean
    createdAt: string
  }
  // Company fields (if role === 'company')
  company?: {
    id: string
    companyName: string
    sector: string | null
    province: string | null
    contactName: string | null
    contactPhone: string | null
    isActive: boolean
    createdAt: string
    activeSubscription?: {
      id: string
      tierName: string
      status: SubscriptionStatus
      profilesUsed: number
      profileLimit: number
      expiresAt: string | null
    } | null
  }
}

export interface AdminUsersFilters {
  role?: UserRole | 'all'
  isActive?: boolean | 'all'
  search?: string
  page?: number
  limit?: number
}

export interface AdminUsersResponse {
  data: AdminUserRow[]
  total: number
  page: number
  limit: number
}

// --- Locations ---

export interface AdminCountry {
  id: string
  name: string
  code: string
  isActive: boolean
  createdAt: string
  provincesCount?: number
}

export interface AdminProvince {
  id: string
  countryId: string
  countryName?: string
  name: string
  code: string
  isActive: boolean
  createdAt: string
}

export interface CreateCountryInput {
  name: string
  code: string
}

export interface UpdateCountryInput {
  name?: string
  code?: string
  isActive?: boolean
}

export interface CreateProvinceInput {
  countryId: string
  name: string
  code: string
}

export interface UpdateProvinceInput {
  name?: string
  code?: string
  isActive?: boolean
}

// --- Tiers ---

export interface AdminTier {
  id: string
  name: string
  price: number
  currency: string
  profileLimit: number
  allowsAdvancedFilters: boolean
  allowsFavorites: boolean
  allowsHistory: boolean
  exclusiveLock: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  activeSubscriptionsCount?: number
}

export interface CreateTierInput {
  name: string
  price: number
  currency: string
  profileLimit: number
  allowsAdvancedFilters: boolean
  allowsFavorites: boolean
  allowsHistory: boolean
  exclusiveLock: boolean
}

export interface UpdateTierInput extends Partial<CreateTierInput> {
  isActive?: boolean
}

// --- Subscriptions (admin view) ---

export interface AdminSubscription {
  id: string
  companyId: string
  companyName: string
  tierName: string
  status: SubscriptionStatus
  snapshotPrice: number
  snapshotCurrency: string
  snapshotProfileLimit: number
  profilesUsed: number
  stripeSubscriptionId: string | null
  adminNotes: string | null
  startedAt: string
  expiresAt: string | null
  createdAt: string
}

export interface CancelSubscriptionInput {
  subscriptionId: string
  adminNotes: string
}

// --- Logs ---

export interface AdminLog {
  id: string
  adminUserId: string
  adminEmail: string
  action: AdminLogAction
  targetType: AdminLogTargetType
  targetId: string
  notes: string | null
  createdAt: string
}

export interface AdminLogsFilters {
  action?: AdminLogAction | 'all'
  adminUserId?: string | 'all'
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface AdminLogsResponse {
  data: AdminLog[]
  total: number
  page: number
  limit: number
}

// --- API Responses ---

export interface AdminApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}