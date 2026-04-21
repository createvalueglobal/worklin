/**
 * POST /api/stripe/webhook
 */

import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/services/stripe.service";
import {
  cancelActiveSubscription,
  createSubscription,
  expireSubscription,
} from "@/lib/services/subscription.service";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma de Stripe" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    console.error("[webhook] Firma inválida:", err);
    return NextResponse.json({ error: "Firma de webhook inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`[webhook] Evento ignorado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[webhook] Error procesando ${event.type}:`, err);
    return NextResponse.json({ error: "Error procesando el evento" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const companyId = session.metadata?.company_id;
  const tierId = session.metadata?.tier_id;

  if (!companyId || !tierId) {
    throw new Error(
      `Metadata incompleta en sesión ${session.id}: company_id=${companyId}, tier_id=${tierId}`
    );
  }

  console.log(`[webhook] checkout.session.completed — company=${companyId}, tier=${tierId}`);

  await cancelActiveSubscription(companyId);

  // Extraer payment_intent ID
  const stripePaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null;

  // Extraer customer ID — con customer_creation:'always' siempre es un string
  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer as Stripe.Customer | null)?.id ?? null;

  if (!stripeCustomerId) {
    // Log de aviso pero no bloqueamos el flujo — la suscripción se crea igualmente
    console.warn(`[webhook] session.customer vacío para sesión ${session.id}. El portal de pagos no estará disponible.`);
  }

  console.log(`[webhook] customer_id extraído: ${stripeCustomerId}`);

  await createSubscription({
    companyId,
    tierId,
    stripeSessionId: session.id,
    stripePaymentIntentId,
    stripeCustomerId,
  });

  console.log(`[webhook] Suscripción activada para company=${companyId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`[webhook] payment_intent.payment_failed — id=${paymentIntent.id}`);
  await expireSubscription(paymentIntent.id);
}