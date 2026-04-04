import { createHmac, timingSafeEqual } from "node:crypto"

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1"

type RazorpayOrder = {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

type RazorpayPayment = {
  id: string
  amount: number
  currency: string
  status: string
  method: string
  email?: string | null
  contact?: string | null
  order_id: string
  notes?: Record<string, string>
}

function getServerConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_NOT_CONFIGURED")
  }

  return { keyId, keySecret }
}

function buildAuthHeader() {
  const { keyId, keySecret } = getServerConfig()
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
}

function safeCompareText(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

async function parseRazorpayError(response: Response) {
  const fallback = `${response.status} ${response.statusText}`

  try {
    const payload = (await response.json()) as {
      error?: { description?: string }
    }

    return payload.error?.description || fallback
  } catch {
    return fallback
  }
}

export function isRazorpayEnabled() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

export function getRazorpayPublicKey() {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    null
  )
}

export async function createRazorpayOrder(params: {
  amount: number
  currency?: string
  receipt: string
  notes?: Record<string, string>
}) {
  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(params.amount),
      currency: params.currency ?? "INR",
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await parseRazorpayError(response))
  }

  return (await response.json()) as RazorpayOrder
}

export async function fetchRazorpayPayment(paymentId: string) {
  const response = await fetch(`${RAZORPAY_API_BASE}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: buildAuthHeader(),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await parseRazorpayError(response))
  }

  return (await response.json()) as RazorpayPayment
}

export function verifyRazorpayPaymentSignature(params: {
  orderId: string
  paymentId: string
  signature: string
}) {
  const { keySecret } = getServerConfig()
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex")

  return safeCompareText(expectedSignature, params.signature)
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string
) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
    return false
  }

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex")
  return safeCompareText(expectedSignature, signature)
}
