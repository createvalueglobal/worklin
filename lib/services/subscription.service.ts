/**
 * lib/services/subscription.service.ts
 * Lógica de negocio relacionada con suscripciones.
 * Opera siempre con el cliente de Supabase de servidor (service role).
 */

import { createAdminClient } from "@/lib/supabase/admin";

export interface SubscriptionSnapshot {
  snapshot_tier_name: string;
  snapshot_price: number;
  snapshot_currency: string;
  snapshot_profile_limit: number;
  snapshot_allows_advanced_filters: boolean;
  snapshot_allows_favorites: boolean;
  snapshot_allows_history: boolean;
}

/**
 * Retorna la suscripción activa de una empresa, o null si no existe.
 */
export async function getActiveSubscription(companyId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "active")
    .single();

  return data ?? null;
}

/**
 * Comprueba si una empresa puede contratar una nueva suscripción.
 * Retorna true si:
 *   - No tiene suscripción activa, O
 *   - Tiene suscripción activa pero el cupo está agotado
 */
export async function canCompanySubscribe(companyId: string): Promise<boolean> {
  const active = await getActiveSubscription(companyId);
  if (!active) return true;

  const cupoAgotado = active.profiles_used >= active.snapshot_profile_limit;
  return cupoAgotado;
}

/**
 * Cancela cualquier suscripción activa de la empresa.
 * Se llama antes de crear una nueva para garantizar
 * que no coexistan dos suscripciones activas.
 */
export async function cancelActiveSubscription(
  companyId: string
): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .eq("status", "active");
}

/**
 * Crea una suscripción activa con snapshot del tier.
 * Se llama desde el webhook de Stripe tras confirmar el pago.
 *
 * stripeCustomerId: el Customer ID que Stripe crea automáticamente
 * cuando el usuario paga (session.customer). Se guarda para poder
 * abrir el Billing Portal posteriormente.
 */
export async function createSubscription({
  companyId,
  tierId,
  stripeSessionId,
  stripePaymentIntentId,
  stripeCustomerId,
}: {
  companyId: string;
  tierId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
}) {
  const supabase = createAdminClient();

  // Leer el tier actual de la BD para generar el snapshot
  const { data: tier, error: tierError } = await supabase
    .from("subscription_tiers")
    .select("*")
    .eq("id", tierId)
    .single();

  if (tierError || !tier) {
    throw new Error(`Tier no encontrado: ${tierId}`);
  }

  const snapshot: SubscriptionSnapshot = {
    snapshot_tier_name: tier.name,
    snapshot_price: tier.price,
    snapshot_currency: tier.currency,
    snapshot_profile_limit: tier.profile_limit,
    snapshot_allows_advanced_filters: tier.allows_advanced_filters,
    snapshot_allows_favorites: tier.allows_favorites,
    snapshot_allows_history: tier.allows_history,
  };

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30); // +30 días

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      company_id: companyId,
      tier_id: tierId,
      ...snapshot,
      stripe_subscription_id: stripeSessionId,
      stripe_payment_intent_id: stripePaymentIntentId,
      stripe_customer_id: stripeCustomerId,
      status: "active",
      profiles_used: 0,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creando suscripción: ${error.message}`);
  }

  return data;
}

/**
 * Marca una suscripción como expired.
 * Se llama desde el webhook payment_intent.payment_failed.
 * Busca por stripe_payment_intent_id porque ese es el dato
 * que tenemos disponible en ese evento.
 */
export async function expireSubscription(
  stripePaymentIntentId: string
): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from("subscriptions")
    .update({
      status: "expired",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_payment_intent_id", stripePaymentIntentId);
}

/**
 * Retorna el company_id a partir del user_id autenticado.
 */
export async function getCompanyIdByUserId(
  userId: string
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", userId)
    .single();

  return data?.id ?? null;
}