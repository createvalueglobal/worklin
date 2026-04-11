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

export type CompanyStep1 = z.infer<typeof companyStep1Schema>
export type CompanyStep2 = z.infer<typeof companyStep2Schema>
export type CompanyFull = z.infer<typeof companyFullSchema>