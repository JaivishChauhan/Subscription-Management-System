import { z } from "zod"

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value
  }
  const trimmedValue = value.trim()
  return trimmedValue === "" ? undefined : trimmedValue
}

export const bundleFiltersSchema = z.object({
  q: z.preprocess(
    emptyStringToUndefined,
    z.string().max(120, "Search query is too long.").optional()
  ),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  type: z
    .enum(["all", "predefined", "suggested", "custom"])
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
})

export type BundleFilters = z.infer<typeof bundleFiltersSchema>
