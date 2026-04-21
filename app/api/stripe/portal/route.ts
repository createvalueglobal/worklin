/**
 * POST /api/stripe/portal
 * Crea una sesión del Billing Portal de Stripe para que la empresa
 * pueda gestionar sus pagos e historial de facturas.
 *
 * NOTA: El portal de Stripe requiere que el cliente exista en Stripe
 * (customer_id). En nuestro flujo de pago único (mode: "payment"),
 * Stripe crea un Customer automáticamente si se pasa customer_email.
 * Guardamos ese customer_id en la suscripción cuando lo recibimos.
 *
 * Si no existe customer_id, retornamos un error claro.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPortalSession } from "@/lib/services/stripe.service";

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticación
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 2. Verificar rol empresa
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "company") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // 3. Obtener company
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    // 4. Buscar la suscripción más reciente con stripe_customer_id
    const adminSupabase = createAdminClient();
    const { data: subscription } = await adminSupabase
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json(
        {
          error:
            "No se encontró un cliente de Stripe asociado. Realiza al menos un pago primero.",
        },
        { status: 404 }
      );
    }

    // 5. Crear sesión del portal
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      req.headers.get("origin") ??
      "";

    const session = await createPortalSession({
      customerId,
      returnUrl: `${baseUrl}/company/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/portal] Error:", err);
    return NextResponse.json(
      { error: "Error al acceder al portal de pagos" },
      { status: 500 }
    );
  }
}