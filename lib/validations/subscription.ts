import { z } from "zod"

const subscriptionStatusValues = [
  "draft",
  "quotation",
  "confirmed",
  "active",
  "closed",
] as const

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value
  }

  const trimmedValue = value.trim()
  return trimmedValue === "" ? undefined : trimmedValue
}

const optionalDateField = (label: string) =>
  z.preprocess(
    (value) => {
      const normalizedValue = emptyStringToUndefined(value)

      if (normalizedValue === undefined) {
        return undefined
      }

      if (typeof normalizedValue === "string") {
        const parsedDate = new Date(`${normalizedValue}T00:00:00`)
        return Number.isNaN(parsedDate.getTime()) ? normalizedValue : parsedDate
      }

      return normalizedValue
    },
    z.date({ error: `${label} must be a valid date.` }).optional()
  )

const lineSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  variantId: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1, "Variant must be valid.").optional()
  ),
  taxId: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1, "Tax must be valid.").optional()
  ),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
  unitPrice: z.coerce
    .number()
    .finite("Unit price must be a valid number.")
    .min(0, "Unit price must be 0 or greater."),
  taxAmount: z.coerce
    .number()
    .finite("Tax amount must be a valid number.")
    .min(0, "Tax amount must be 0 or greater."),
})

const subscriptionBaseSchema = z.object({
  contactId: z.string().min(1, "Customer is required."),
  recurringPlanId: z.string().min(1, "Plan is required."),
  paymentTermsId: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1, "Payment terms must be valid.").optional()
  ),
  startDate: optionalDateField("Start date"),
  expirationDate: optionalDateField("Expiration date"),
  notes: z.preprocess(
    emptyStringToUndefined,
    z.string().max(2000, "Notes must be 2000 characters or fewer.").optional()
  ),
  lines: z.array(lineSchema).min(1, "At least one order line is required."),
})

export const subscriptionCreateSchema = subscriptionBaseSchema.superRefine(
  (data, ctx) => {
    if (
      data.startDate &&
      data.expirationDate &&
      data.expirationDate < data.startDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expirationDate"],
        message: "Expiration date must be on or after the start date.",
      })
    }
  }
)

export const subscriptionUpdateSchema = subscriptionBaseSchema.superRefine(
  (data, ctx) => {
    if (
      data.startDate &&
      data.expirationDate &&
      data.expirationDate < data.startDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expirationDate"],
        message: "Expiration date must be on or after the start date.",
      })
    }
  }
)

export const subscriptionStatusUpdateSchema = z.object({
  status: z.enum(subscriptionStatusValues, {
    error: "Please choose a valid subscription status.",
  }),
})

export const subscriptionFiltersSchema = z.object({
  q: z.preprocess(
    emptyStringToUndefined,
    z.string().max(120, "Search query is too long.").optional()
  ),
  status: z
    .enum(["all", ...subscriptionStatusValues])
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export type SubscriptionStatus = (typeof subscriptionStatusValues)[number]
export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>
export type SubscriptionLineInput = z.infer<typeof lineSchema>
