import { z } from 'zod'

// Step 1: Datos de la empresa
export const companyStep1Schema = z.object({
  company_name: z.string().min(2, 'El nombre comercial debe tener al menos 2 caracteres').max(150),
  sector: z.string().min(2, 'El sector es obligatorio').max(100),
  country_id: z.string().uuid('País inválido'),
  province_id: z.string().uuid('Provincia inválida'),
  address: z.string().max(255).optional(),
  website: z
    .string()
    .url('Introduce una URL válida (ej: https://tuempresa.com)')
    .optional()
    .or(z.literal('')),
  logo_url: z.string().url().optional(),
})

// Step 2: Datos de contacto
export const companyStep2Schema = z.object({
  contact_name: z.string().min(2, 'El nombre del responsable es obligatorio').max(100),
  contact_phone: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(20)
    .regex(/^[+\d\s\-()]+$/, 'Formato de teléfono inválido'),
  contact_email: z.string().email('Introduce un email válido'),
})

// Schema completo (para validación final en API)
export const companyFullSchema = companyStep1Schema.merge(companyStep2Schema)

// ------------------------------------------------------------
// Favorites
// ------------------------------------------------------------
 
export const addFavoriteSchema = z.object({
  professional_id: z.string().uuid({ message: 'ID de profesional inválido' }),
})
 
export const removeFavoriteSchema = z.object({
  professional_id: z.string().uuid({ message: 'ID de profesional inválido' }),
})

// ------------------------------------------------------------
// Unlock
// ------------------------------------------------------------
 
export const unlockProfileSchema = z.object({
  professional_id: z.string().uuid({ message: 'ID de profesional inválido' }),
})

// ------------------------------------------------------------
// Search
// ------------------------------------------------------------
 
export const searchParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  page_size: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 12))
    .pipe(z.number().int().min(1).max(50)),
  province_id: z.string().uuid().optional(),
  main_profession: z.string().max(100).optional(),
  // Filtros avanzados (se validan pero el servicio los ignora si el tier no los permite)
  availability: z.enum(['immediate', 'in_days', 'not_available']).optional(),
  work_mode: z.enum(['presential', 'hybrid', 'remote']).optional(),
  salary_min: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(0).optional()),
  salary_max: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(0).optional()),
  language: z.string().max(50).optional(),
  skill: z.string().max(100).optional(),
})

export type CompanyStep1 = z.infer<typeof companyStep1Schema>
export type CompanyStep2 = z.infer<typeof companyStep2Schema>
export type CompanyFull = z.infer<typeof companyFullSchema>
export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>
export type RemoveFavoriteInput = z.infer<typeof removeFavoriteSchema>
export type UnlockProfileInput = z.infer<typeof unlockProfileSchema>
export type SearchParamsInput = z.input<typeof searchParamsSchema>
export type SearchParamsOutput = z.output<typeof searchParamsSchema>