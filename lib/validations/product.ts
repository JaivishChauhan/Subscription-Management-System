import { z } from "zod"

const productTypeValues = ["service", "goods"] as const

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value
  }

  const trimmedValue = value.trim()
  return trimmedValue === "" ? undefined : trimmedValue
}

const optionalTextField = (label: string, maxLength: number) =>
  z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .max(maxLength, `${label} must be ${maxLength} characters or fewer.`)
      .optional()
  )

const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters long.")
    .max(120, "Product name must be 120 characters or fewer."),
  type: z.enum(productTypeValues, {
    error: "Please choose a valid product type.",
  }),
  salesPrice: z.coerce
    .number()
    .finite("Sales price must be a valid number.")
    .min(0, "Sales price must be 0 or greater."),
  costPrice: z.coerce
    .number()
    .finite("Cost price must be a valid number.")
    .min(0, "Cost price must be 0 or greater."),
  description: optionalTextField("Description", 1000),
  notes: optionalTextField("Notes", 1000),
  image: z.preprocess(
    emptyStringToUndefined,
    z.string().url("Image must be a valid URL.").optional()
  ),
  isActive: z.coerce.boolean().optional(),
})

export const productCreateSchema = productBaseSchema.extend({
  isActive: z.coerce.boolean().optional().default(true),
})

export const productUpdateSchema = productBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one product field is required.",
  })

export const productFiltersSchema = z.object({
  q: z.preprocess(
    emptyStringToUndefined,
    z.string().max(120, "Search query is too long.").optional()
  ),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export type ProductType = (typeof productTypeValues)[number]
export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>
