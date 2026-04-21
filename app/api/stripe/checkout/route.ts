/**
 * POST /api/stripe/checkout
 * Crea una Stripe Checkout Session para el tier solicitado.
 *
 * Body: { tier_id: string }
 * Responde: { url: string } → URL de Stripe Checkout
 *
 * Errores:
 *   401 — no autenticado o no es empresa
 *   404 — tier no encontrado
 *   409 — ya tiene suscripción activa con cupo disponible
 *   500 — error interno
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/services/stripe.service";
import {
  canCompanySubscribe,
  getCompanyIdByUserId,
} from "@/lib/services/subscription.service";

const CheckoutBodySchema = z.object({
  tier_id: z.string().uuid("tier_id debe ser un UUID válido"),
});

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

    // 2. Verificar que es empresa
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "company") {
      return NextResponse.json(
        { error: "Solo las empresas pueden contratar planes" },
        { status: 403 }
      );
    }

    // 3. Validar body
    const body = await req.json().catch(() => ({}));
    const parsed = CheckoutBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { tier_id } = parsed.data;

    // 4. Obtener company_id
    const companyId = await getCompanyIdByUserId(user.id);
    if (!companyId) {
      return NextResponse.json(
        { error: "Perfil de empresa no encontrado" },
        { status: 404 }
      );
    }

    // 5. Verificar si puede contratar
    const canSubscribe = await canCompanySubscribe(companyId);
    if (!canSubscribe) {
      return NextResponse.json(
        { error: "Ya tienes una suscripción activa con cupo disponible" },
        { status: 409 }
      );
    }

    // 6. Leer datos del tier
    const adminSupabase = createAdminClient();
    const { data: tier } = await adminSupabase
      .from("subscription_tiers")
      .select("id, name, price, currency")
      .eq("id", tier_id)
      .eq("is_active", true)
      .single();

    if (!tier) {
      return NextResponse.json(
        { error: "Plan no encontrado o no disponible" },
        { status: 404 }
      );
    }

    // 7. Crear sesión de Stripe
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.headers.get("origin") ?? "";

    const session = await createCheckoutSession({
      tierId: tier.id,
      tierName: tier.name,
      price: tier.price,
      currency: tier.currency,
      companyId,
      customerEmail: user.email!,
      successUrl: `${baseUrl}/company/dashboard?success=true`,
      cancelUrl: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout] Error:", err);
    return NextResponse.json(
      { error: "Error interno al procesar el pago" },
      { status: 500 }
    );
  }
}