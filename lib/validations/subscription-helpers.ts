import type { SubscriptionStatus } from "./subscription"

export const STATUS_ORDER: SubscriptionStatus[] = [
  "draft",
  "quotation",
  "confirmed",
  "active",
  "closed",
]

export function getNextAllowedStatus(currentStatus: SubscriptionStatus) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  return STATUS_ORDER[currentIndex + 1] ?? null
}

export function canTransitionSubscriptionStatus({
  currentStatus,
  nextStatus,
  closable,
}: {
  currentStatus: SubscriptionStatus
  nextStatus: SubscriptionStatus
  closable: boolean
}) {
  const allowedNextStatus = getNextAllowedStatus(currentStatus)

  if (!allowedNextStatus || allowedNextStatus !== nextStatus) {
    return {
      ok: false,
      error: `Invalid status transition from ${currentStatus} to ${nextStatus}.`,
    }
  }

  if (currentStatus === "active" && nextStatus === "closed" && !closable) {
    return {
      ok: false,
      error: "This plan does not allow manual closure of active subscriptions.",
    }
  }

  return { ok: true as const }
}

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateLineSubtotal({
  quantity,
  unitPrice,
  taxAmount,
}: {
  quantity: number
  unitPrice: number
  taxAmount: number
}) {
  return roundCurrency(quantity * unitPrice + taxAmount)
}

export function calculateTaxAmount({
  quantity,
  unitPrice,
  taxType,
  taxRate,
}: {
  quantity: number
  unitPrice: number
  taxType: string
  taxRate: number
}) {
  if (taxType === "fixed") {
    return roundCurrency(taxRate * quantity)
  }

  return roundCurrency(quantity * unitPrice * (taxRate / 100))
}
