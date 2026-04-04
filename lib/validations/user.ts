import { z } from "zod"

/**
 * Validation schemas for admin user management.
 * @security Admin-only — never expose to portal or internal users.
 */

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

/** Schema for creating a new internal user. Role is forced to "internal" by the API. */
export const adminCreateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  email: z
    .string()
    .email("Valid email required")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      PASSWORD_REGEX,
      "Password must have uppercase, lowercase, and a special character"
    ),
  phone: z.string().max(20).optional(),
  role: z.enum(["internal", "portal"]).default("internal"),
})

/** Schema for updating an existing managed user. */
export const adminUpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  role: z.enum(["internal", "portal"]).optional(),
  /** When true, the password field is required and will be re-hashed. */
  password: z
    .string()
    .min(8)
    .regex(PASSWORD_REGEX)
    .optional(),
})

/** Pagination + search filters for the user list. */
export const userFiltersSchema = z.object({
  q: z.string().optional(),
  role: z.enum(["all", "internal", "portal"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>
export type UserFilters = z.infer<typeof userFiltersSchema>
