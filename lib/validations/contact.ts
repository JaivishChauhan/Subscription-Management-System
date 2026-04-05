import { z } from "zod"

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value
  }
  const trimmedValue = value.trim()
  return trimmedValue === "" ? undefined : trimmedValue
}

export const contactFiltersSchema = z.object({
  q: z.preprocess(
    emptyStringToUndefined,
    z.string().max(120, "Search query is too long.").optional()
  ),
  role: z
    .enum(["all", "admin", "internal", "portal"])
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export type ContactFilters = z.infer<typeof contactFiltersSchema>
