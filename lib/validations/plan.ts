import { z } from "zod"

const billingPeriodValues = ["daily", "weekly", "monthly", "yearly"] as const

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

const recurringPlanBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Plan name must be at least 2 characters long.")
    .max(120, "Plan name must be 120 characters or fewer."),
  billingPeriod: z.enum(billingPeriodValues, {
    error: "Please choose a valid billing period.",
  }),
  price: z.coerce
    .number()
    .finite("Price must be a valid number.")
    .min(0, "Price must be 0 or greater."),
  minQuantity: z.coerce
    .number()
    .int("Minimum quantity must be a whole number.")
    .min(1, "Minimum quantity must be at least 1."),
  startDate: optionalDateField("Start date"),
  endDate: optionalDateField("End date"),
  autoClose: z.coerce.boolean().optional().default(false),
  closable: z.coerce.boolean().optional().default(true),
  pausable: z.coerce.boolean().optional().default(false),
  renewable: z.coerce.boolean().optional().default(true),
  isActive: z.coerce.boolean().optional().default(true),
})

export const recurringPlanCreateSchema = recurringPlanBaseSchema.superRefine(
  (data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be on or after the start date.",
      })
    }
  }
)

export const recurringPlanUpdateSchema = recurringPlanBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one plan field is required.",
      })
    }

    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be on or after the start date.",
      })
    }
  })

export const recurringPlanFiltersSchema = z.object({
  q: z.preprocess(
    emptyStringToUndefined,
    z.string().max(120, "Search query is too long.").optional()
  ),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export type BillingPeriod = (typeof billingPeriodValues)[number]
export type RecurringPlanCreateInput = z.infer<typeof recurringPlanCreateSchema>
