import { z } from "zod"

const taxTypeValues = ["percentage", "fixed"] as const

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value
  }

  const trimmedValue = value.trim()
  return trimmedValue === "" ? undefined : trimmedValue
}

const taxBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tax name must be at least 2 characters long.")
    .max(120, "Tax name must be 120 characters or fewer."),
  type: z.enum(taxTypeValues, {
    error: "Please choose a valid tax type.",
  }),
  rate: z.coerce
    .number()
    .finite("Rate must be a valid number.")
    .min(0, "Rate must be 0 or greater."),
  description: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .max(500, "Description must be 500 characters or fewer.")
      .optional()
  ),
  isActive: z.coerce.boolean().optional(),
})

export const taxCreateSchema = taxBaseSchema
  .extend({
    isActive: z.coerce.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === "percentage" && data.rate > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rate"],
        message: "Percentage tax rate cannot exceed 100.",
      })
    }
  })

export const taxUpdateSchema = taxBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one tax field is required.",
      })
    }

    if (
      data.type === "percentage" &&
      typeof data.rate === "number" &&
      data.rate > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rate"],
        message: "Percentage tax rate cannot exceed 100.",
      })
    }
  })

export const taxFiltersSchema = z.object({
  q: z.preprocess(
    emptyStringToUndefined,
    z.string().max(120, "Search query is too long.").optional()
  ),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export type TaxType = (typeof taxTypeValues)[number]
export type TaxCreateInput = z.infer<typeof taxCreateSchema>
