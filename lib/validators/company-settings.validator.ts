/**
 * lib/validators/company-settings.validator.ts
 * Esquemas Zod para la edición del perfil de empresa.
 * Usados tanto en cliente (formulario) como en servidor (API route).
 */

import { z } from "zod";

export const CompanyInfoSchema = z.object({
  company_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  sector: z
    .string()
    .min(2, "El sector es obligatorio")
    .max(80, "El sector no puede superar los 80 caracteres"),
  province_id: z.string().uuid("Selecciona una provincia válida"),
  address: z
    .string()
    .max(200, "La dirección no puede superar los 200 caracteres")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Introduce una URL válida (ej: https://miempresa.com)")
    .optional()
    .or(z.literal("")),
});

export const ContactSchema = z.object({
  contact_name: z
    .string()
    .min(2, "El nombre del responsable es obligatorio")
    .max(100),
  contact_phone: z
    .string()
    .regex(
      /^[+]?[\d\s\-().]{6,20}$/,
      "Introduce un teléfono válido"
    )
    .optional()
    .or(z.literal("")),
  contact_email: z
    .string()
    .email("Introduce un email de contacto válido")
    .optional()
    .or(z.literal("")),
});

/** Schema completo para el PATCH /api/company/settings */
export const CompanySettingsPatchSchema = z.object({
  // Al menos uno de los dos bloques debe estar presente
  company_info: CompanyInfoSchema.partial().optional(),
  contact: ContactSchema.partial().optional(),
  logo_url: z.string().url().optional(),
});

export type CompanyInfoValues = z.infer<typeof CompanyInfoSchema>;
export type ContactValues = z.infer<typeof ContactSchema>;
export type CompanySettingsPatch = z.infer<typeof CompanySettingsPatchSchema>;