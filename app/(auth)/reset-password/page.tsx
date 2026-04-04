"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { IconLoader2, IconMail } from "@tabler/icons-react"
import { toast } from "sonner"
import { DEMO_RESET_PASSWORD_DATA } from "@/lib/demo-data"
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth"

/**
 * Password reset request page.
 * Currently stubbed — shows success message but doesn't send email.
 * Wire up when SMTP credentials are configured.
 *
 * @client Required for form interactivity.
 */
export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  })

  async function handleResetSubmit(data: ResetPasswordFormData) {
    setIsSubmitting(true)

    try {
      // TODO: Wire up real email sending when SMTP is configured
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.info("[STUB] Password reset requested for:", data.email)

      setIsEmailSent(true)
      toast.success("If an account exists, a reset link has been sent.")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleAutofillDemo() {
    reset(DEMO_RESET_PASSWORD_DATA)
    toast.success("Demo reset email added.")
  }

  if (isEmailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
          <IconMail className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          If an account with that email exists, we&apos;ve sent a password reset
          link. Check your inbox and spam folder.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to login
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Enter your email and we&apos;ll send a reset link
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(handleResetSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-indigo-700 uppercase">
                Demo Reset Request
              </p>
              <p className="mt-1 text-xs text-indigo-900">
                Uses the seeded admin email for quick testing.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              Autofill
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="reset-email"
            className="text-foreground/90 block text-sm font-semibold"
          >
            Email
          </label>
          <div className="relative">
            <IconMail className="text-muted-foreground absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2" />
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className={`bg-background focus:ring-primary/30 focus:border-primary w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none ${
                errors.email ? "border-destructive" : "border-input"
              }`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-gradient flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
