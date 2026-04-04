import { z } from "zod"

const invoiceStatusValues = ["draft", "confirmed", "paid", "cancelled"] as const

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value
  }

  const trimmedValue = value.trim()
  return trimmedValue === "" ? undefined : trimmedValue
}

export const invoiceFiltersSchema = z.object({
  q: z.preprocess(
    emptyStringToUndefined,
    z.string().max(120, "Search query is too long.").optional()
  ),
  status: z
    .enum(["all", ...invoiceStatusValues])
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export const invoiceStatusUpdateSchema = z.object({
  status: z.enum(invoiceStatusValues, {
    error: "Please choose a valid invoice status.",
  }),
})

export type InvoiceStatus = (typeof invoiceStatusValues)[number]

export function getNextInvoiceStatus(currentStatus: string) {
  switch (currentStatus) {
    case "draft":
      return "confirmed"
    case "confirmed":
      return "paid"
    default:
      return null
  }
}

export function canTransitionInvoiceStatus({
  currentStatus,
  nextStatus,
}: {
  currentStatus: string
  nextStatus: string
}) {
  if (currentStatus === "cancelled" || currentStatus === "paid") {
    return {
      ok: false,
      error: `Invoices in ${currentStatus} status cannot be updated.`,
    }
  }

  if (nextStatus === "cancelled") {
    return {
      ok: currentStatus === "draft" || currentStatus === "confirmed",
      error: "Only draft or confirmed invoices can be cancelled.",
    }
  }

  const allowedNextStatus = getNextInvoiceStatus(currentStatus)
  if (!allowedNextStatus || allowedNextStatus !== nextStatus) {
    return {
      ok: false,
      error: `Invalid invoice status transition from ${currentStatus} to ${nextStatus}.`,
    }
  }

  return { ok: true as const }
}

export function formatInvoiceStatus(status: string) {
  switch (status) {
    case "confirmed":
      return "confirmed"
    case "paid":
      return "paid"
    case "cancelled":
      return "cancelled"
    default:
      return "draft"
  }
}
