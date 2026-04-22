import { z } from 'zod'

// Step 1: Datos personales
export const professionalStep1Schema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  last_name: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres').max(100),
  gender: z.enum(['male', 'female'], { message: 'Selecciona un género' }),
  birth_date: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  nationality: z.string().min(2, 'La nacionalidad es obligatoria').max(100),
  country_id: z.string().uuid('País inválido'),
  province_id: z.string().uuid('Provincia inválida'),
  phone: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(20)
    .regex(/^[+\d\s\-()]+$/, 'Formato de teléfono inválido'),
  photo_url: z.string().url().optional(),
})

// Step 2: Perfil profesional
export const professionalStep2Schema = z.object({
  main_profession: z.string().min(2, 'La profesión principal es obligatoria').max(100),
  years_experience: z
    .number({ message: 'Indica los años de experiencia' })
    .min(0)
    .max(60),
  availability: z.enum(['immediate', 'in_days', 'not_available'], {
    message: 'Selecciona tu disponibilidad',
  }),
  availability_days: z.number().min(1).max(365).optional().nullable(),
  work_mode: z.enum(['presential', 'hybrid', 'remote'], {
    message: 'Selecciona la modalidad de trabajo',
  }),
  skills: z
    .array(
      z.object({
        skill_name: z.string().min(1).max(100),
        level: z.number().min(1).max(5),
        order: z.number(),
      })
    )
    .min(1, 'Añade al menos una habilidad')
    .max(20),
})

// Step 3: Idiomas y experiencia previa
export const professionalStep3Schema = z.object({
  languages: z
    .array(
      z.object({
        language: z.string().min(1).max(100),
        level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native']),
      })
    )
    .min(1, 'Añade al menos un idioma')
    .max(10),
  last_position: z.string().max(100).optional(),
  last_company: z.string().max(100).optional(),
})

// Step 4: Sobre mí y preferencias
export const professionalStep4Schema = z.object({
  about_me: z.string().max(1000).optional(),
  has_vehicle: z.boolean(),
  willing_to_travel: z.boolean(),
  salary_min: z.number().min(0).max(999999).optional().nullable(),
  salary_max: z.number().min(0).max(999999).optional().nullable(),
  salary_currency: z.string().length(3).optional().default('EUR'),
  cv_url: z.string().url().optional(),
})

// Schema completo (para validación final en API)
export const professionalFullSchema = professionalStep1Schema
  .merge(professionalStep2Schema)
  .merge(professionalStep3Schema)
  .merge(professionalStep4Schema)
  .refine(
    (data) => {
      if (data.availability === 'in_days') {
        return data.availability_days && data.availability_days > 0
      }
      return true
    },
    {
      message: 'Indica en cuántos días estarás disponible',
      path: ['availability_days'],
    }
  )
  .refine(
    (data) => {
      if (data.salary_min && data.salary_max) {
        return data.salary_max >= data.salary_min
      }
      return true
    },
    {
      message: 'El salario máximo debe ser mayor al mínimo',
      path: ['salary_max'],
    }
  )

// ─── Enums ────────────────────────────────────────────────────────────────────
 
export const availabilitySchema = z.enum(['immediate', 'in_days', 'not_available'])
export const workModeSchema = z.enum(['presential', 'hybrid', 'remote'])
export const skillLevelSchema = z.number().int().min(1).max(5)
export const languageLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'])
export const genderSchema = z.enum(['male', 'female'])
 
// ─── Sub-schemas ──────────────────────────────────────────────────────────────
 
export const skillSchema = z.object({
  skill_name: z.string().min(1).max(100),
  level: skillLevelSchema,
  order: z.number().int().min(0),
})
 
export const languageSchema = z.object({
  language: z.string().min(1).max(100),
  level: languageLevelSchema,
})
 
// ─── Visibility ───────────────────────────────────────────────────────────────
 
export const visibilitySchema = z.object({
  is_visible: z.boolean(),
})
 
export type VisibilityInput = z.infer<typeof visibilitySchema>
 
// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  // Personal
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  gender: genderSchema.optional(),
  birth_date: z.string().optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  country_id: z.string().uuid().optional().nullable(),
  province_id: z.string().uuid().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
 
  // Professional
  main_profession: z.string().min(1).max(150).optional(),
  years_experience: z.number().int().min(0).max(60).optional(),
  availability: availabilitySchema.optional(),
  availability_days: z.number().int().min(1).max(365).optional().nullable(),
  work_mode: workModeSchema.optional(),
  last_position: z.string().max(150).optional().nullable(),
  last_company: z.string().max(150).optional().nullable(),
 
  // Salary
  salary_min: z.number().min(0).optional().nullable(),
  salary_max: z.number().min(0).optional().nullable(),
  salary_currency: z.string().max(10).optional(),
 
  // Extras
  has_vehicle: z.boolean().optional(),
  willing_to_travel: z.boolean().optional(),
  about_me: z.string().max(2000).optional().nullable(),
  cv_url: z.string().url().optional().nullable(),
  is_visible: z.boolean().optional(),
 
  // Relations
  skills: z.array(skillSchema).optional(),
  languages: z.array(languageSchema).optional(),
})

export type ProfessionalStep1 = z.infer<typeof professionalStep1Schema>
export type ProfessionalStep2 = z.infer<typeof professionalStep2Schema>
export type ProfessionalStep3 = z.infer<typeof professionalStep3Schema>
export type ProfessionalStep4 = z.infer<typeof professionalStep4Schema>
export type ProfessionalFull = z.infer<typeof professionalFullSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>