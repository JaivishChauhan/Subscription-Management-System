/**
 * Stripe payment service stub.
 * UI-ready, logic-gated behind `STRIPE_SECRET_KEY` env var.
 * Once Stripe keys are provided, replace stubs with actual Stripe SDK calls.
 *
 * @architecture All payment logic is centralized here so the rest of the app
 * calls these functions without knowing if Stripe is live or stubbed.
 */

const STRIPE_CONFIGURED = !!process.env.STRIPE_SECRET_KEY

interface CreateCheckoutSessionParams {
  /** Customer email for Stripe. */
  customerEmail: string
  /** Line items for the checkout session. */
  lineItems: Array<{
    name: string
    unitAmount: number // In paisa (smallest currency unit)
    quantity: number
  }>
  /** URL to redirect after successful payment. */
  successUrl: string
  /** URL to redirect on cancel. */
  cancelUrl: string
}

interface CheckoutSessionResult {
  /** Stripe checkout session URL. Null if stubbed. */
  url: string | null
  /** Session ID. */
  sessionId: string
  /** Whether this is a real or stubbed session. */
  isLive: boolean
}

/**
 * Creates a Stripe Checkout session for one-time or subscription payment.
 * Falls back to a stub if Stripe keys aren't configured.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  if (!STRIPE_CONFIGURED) {
    console.info("[STRIPE_STUB] Would create checkout session:", {
      email: params.customerEmail,
      items: params.lineItems.length,
      total: params.lineItems.reduce(
        (sum, item) => sum + item.unitAmount * item.quantity,
        0
      ),
    })

    return {
      url: params.successUrl + "?session_id=stub_session_" + Date.now(),
      sessionId: "stub_session_" + Date.now(),
      isLive: false,
    }
  }

  // TODO: Replace with actual Stripe SDK integration
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const session = await stripe.checkout.sessions.create({ ... });
  // return { url: session.url, sessionId: session.id, isLive: true };

  throw new Error(
    "Stripe is configured but SDK integration is not yet implemented"
  )
}

/**
 * Verifies a Stripe webhook event signature.
 * Returns the parsed event or null if verification fails.
 */
export async function verifyWebhookSignature(): Promise<{
  type: string
  data: Record<string, unknown>
} | null> {
  if (!STRIPE_CONFIGURED) {
    console.warn(
      "[STRIPE_STUB] Webhook verification skipped — Stripe not configured."
    )
    return null
  }

  // TODO: Implement actual webhook verification
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  // return event;

  console.warn("[STRIPE] Webhook verification not yet implemented.")
  return null
}

/**
 * Checks if Stripe payment processing is available.
 * Use this in UI to show/hide payment-related features.
 */
export function isPaymentEnabled(): boolean {
  return STRIPE_CONFIGURED
}
