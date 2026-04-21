/**
 * lib/services/stripe.service.ts
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export async function createCheckoutSession({
  tierId,
  tierName,
  price,
  currency,
  companyId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  tierId: string;
  tierName: string;
  price: number;
  currency: string;
  companyId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const unitAmount = Math.round(price * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    // Forzar creación de Customer aunque sea pago único.
    // Necesario para que session.customer tenga valor
    // y poder abrir el Billing Portal posteriormente.
    customer_creation: "always",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: `WorkLin — Plan ${tierName}`,
            description: `Acceso mensual al plan ${tierName} de WorkLin`,
          },
        },
      },
    ],
    metadata: {
      company_id: companyId,
      tier_id: tierId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: "es",
  });

  return session;
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}