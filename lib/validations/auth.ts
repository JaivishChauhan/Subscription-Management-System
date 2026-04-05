import { z } from "zod"

/**
 * Password complexity requirements (PRD AUTH-03 through AUTH-06):
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 */
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

const PASSWORD_REQUIREMENTS_MESSAGE =
  "Password must be at least 8 characters with uppercase, lowercase, and a special character"

/** Login form validation schema. */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

/** Signup form validation schema with password complexity enforcement. */
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be under 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

/** Password reset request schema. */
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

/** Inferred types from Zod schemas for type-safe form handling. */
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
