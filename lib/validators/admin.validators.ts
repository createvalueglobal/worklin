import { z } from 'zod'

// ============================================================
// ADMIN VALIDATORS
// ============================================================

// --- Users ---

export const adminUsersFiltersSchema = z.object({
  role: z.enum(['professional', 'company', 'admin', 'all']).optional().default('all'),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true
      if (val === 'false') return false
      return 'all' as const
    }),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export const toggleUserActiveSchema = z.object({
  isActive: z.boolean({ message: 'isActive debe ser un booleano' }),
  notes: z.string().max(500).optional(),
})

// --- Locations ---

export const createCountrySchema = z.object({
  name: z
    .string({ message: 'El nombre es obligatorio' })
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  code: z
    .string({ message: 'El código ISO es obligatorio' })
    .length(2, 'El código ISO debe tener exactamente 2 caracteres')
    .toUpperCase()
    .trim(),
})

export const updateCountrySchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  code: z.string().length(2).toUpperCase().trim().optional(),
  isActive: z.boolean().optional(),
})

export const createProvinceSchema = z.object({
  countryId: z.string({ message: 'El país es obligatorio' }).uuid('ID de país inválido'),
  name: z
    .string({ message: 'El nombre es obligatorio' })
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  code: z
    .string({ message: 'El código es obligatorio' })
    .min(2, 'Mínimo 2 caracteres')
    .max(10, 'Máximo 10 caracteres')
    .toUpperCase()
    .trim(),
})

export const updateProvinceSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  code: z.string().min(2).max(10).toUpperCase().trim().optional(),
  isActive: z.boolean().optional(),
})

// --- Tiers ---

export const createTierSchema = z.object({
  name: z
    .string({ message: 'El nombre es obligatorio' })
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .trim(),
  price: z
    .number({ message: 'El precio es obligatorio' })
    .min(0, 'El precio no puede ser negativo'),
  currency: z
    .string()
    .length(3, 'El código de moneda debe tener 3 caracteres')
    .toUpperCase()
    .default('EUR'),
  profileLimit: z
    .number({ message: 'El límite de perfiles es obligatorio' })
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo'),
  allowsAdvancedFilters: z.boolean().default(false),
  allowsFavorites: z.boolean().default(false),
  allowsHistory: z.boolean().default(false),
  exclusiveLock: z.boolean().default(false),
})

export const updateTierSchema = createTierSchema.partial().extend({
  isActive: z.boolean().optional(),
})

// --- Subscriptions ---

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string({ message: 'El ID de la suscripción es obligatorio' }).uuid('ID de suscripción inválido'),
  adminNotes: z
    .string({ message: 'Las notas son obligatorias para cancelar una suscripción' })
    .min(10, 'Por favor, añade una nota de al menos 10 caracteres explicando la cancelación')
    .max(1000, 'Máximo 1000 caracteres'),
})

// --- Logs ---

export const adminLogsFiltersSchema = z.object({
  action: z.string().optional(),
  adminUserId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

// --- Type exports ---

export type AdminUsersFiltersInput = z.infer<typeof adminUsersFiltersSchema>
export type ToggleUserActiveInput = z.infer<typeof toggleUserActiveSchema>
export type CreateCountryInput = z.infer<typeof createCountrySchema>
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>
export type CreateProvinceInput = z.infer<typeof createProvinceSchema>
export type UpdateProvinceInput = z.infer<typeof updateProvinceSchema>
export type CreateTierInput = z.infer<typeof createTierSchema>
export type UpdateTierInput = z.infer<typeof updateTierSchema>
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>
export type AdminLogsFiltersInput = z.infer<typeof adminLogsFiltersSchema>