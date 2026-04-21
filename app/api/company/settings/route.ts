/**
 * PATCH /api/company/settings
 * Actualiza los datos de empresa y/o contacto del perfil.
 *
 * Body: Partial<CompanySettingsPatch>
 * Responde: { success: true, data: Company }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CompanySettingsPatchSchema } from "@/lib/validators/company-settings.validator";

export async function PATCH(req: NextRequest) {
  try {
    // 1. Autenticación
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 2. Verificar rol
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "company") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // 3. Validar body
    const body = await req.json().catch(() => ({}));
    const parsed = CompanySettingsPatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { company_info, contact, logo_url } = parsed.data;

    // 4. Construir el objeto de actualización
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (company_info) {
      if (company_info.company_name !== undefined)
        updates.company_name = company_info.company_name;
      if (company_info.sector !== undefined)
        updates.sector = company_info.sector;
      if (company_info.province_id !== undefined)
        updates.province_id = company_info.province_id;
      if (company_info.address !== undefined)
        updates.address = company_info.address;
      if (company_info.website !== undefined)
        updates.website = company_info.website;
    }

    if (contact) {
      if (contact.contact_name !== undefined)
        updates.contact_name = contact.contact_name;
      if (contact.contact_phone !== undefined)
        updates.contact_phone = contact.contact_phone;
      if (contact.contact_email !== undefined)
        updates.contact_email = contact.contact_email;
    }

    if (logo_url) {
      updates.logo_url = logo_url;
    }

    // Verificar que hay algo que actualizar
    if (Object.keys(updates).length === 1) {
      // Solo updated_at → nada que hacer
      return NextResponse.json(
        { error: "No se enviaron datos para actualizar" },
        { status: 400 }
      );
    }

    // 5. Actualizar en Supabase (RLS garantiza que solo actualiza su empresa)
    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[company/settings PATCH] Error Supabase:", error);
      return NextResponse.json(
        { error: "Error al guardar los cambios" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[company/settings PATCH] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}