import { z } from "zod"

/**
 * Validation schemas for the Discount module.
 * @security Admin-only — portal and internal users CANNOT manage discounts.
 */

export const discountCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(50)
    .toUpperCase()
    .regex(
      /^[A-Z0-9_-]+$/,
      "Code can only contain letters, numbers, hyphens, and underscores"
    ),
  type: z.enum(["fixed", "percentage"]),
  value: z.number().positive("Discount value must be positive"),
  minPurchase: z.number().min(0).optional().nullable(),
  minQuantity: z.number().int().min(1).optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  /** Optional list of product IDs this discount applies to. Empty = all products. */
  productIds: z.array(z.string().cuid()).default([]),
})

export const discountUpdateSchema = discountCreateSchema.partial()

export const discountFiltersSchema = z.object({
  q: z.string().optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  type: z.enum(["all", "fixed", "percentage"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type DiscountCreateInput = z.infer<typeof discountCreateSchema>
export type DiscountUpdateInput = z.infer<typeof discountUpdateSchema>
export type DiscountFilters = z.infer<typeof discountFiltersSchema>
