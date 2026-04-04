"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { IconLoader2, IconMail, IconLock, IconUser, IconBrandGoogle } from "@tabler/icons-react"
import { toast } from "sonner"
import { getDemoSignupData } from "@/lib/demo-data"
import { signupSchema, type SignupFormData } from "@/lib/validations/auth"

/**
 * Signup page — new user registration.
 * Enforces password complexity requirements per PRD (AUTH-03 to AUTH-06).
 * Creates portal user via API route, then auto-signs in.
 *
 * @client Required for form interactivity.
 */
export default function SignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function handleSignupSubmit(data: SignupFormData) {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error ?? "Registration failed. Please try again.")
        return
      }

      toast.success("Account created! Redirecting to login...")
      router.push("/login")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleAutofillDemo() {
    reset(getDemoSignupData())
    toast.success("Sample registration details added.")
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    try {
      window.location.href = `/api/auth/google/init?callbackUrl=/auth/redirect`
    } catch {
      toast.error("Failed to sign in with Google")
      setIsGoogleLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Start managing your subscriptions today
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(handleSignupSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-indigo-700 uppercase">
                Demo Registration
              </p>
              <p className="mt-1 text-xs text-indigo-900">
                Uses a fresh sample email each time so repeated sign-ups keep
                working.
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

        {/* Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="text-foreground/90 block text-sm font-semibold"
          >
            Full Name
          </label>
          <div className="relative">
            <IconUser className="text-muted-foreground absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2" />
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              className={`bg-background focus:ring-primary/30 focus:border-primary w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none ${
                errors.name ? "border-destructive" : "border-input"
              }`}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-destructive text-xs">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="text-foreground/90 block text-sm font-semibold"
          >
            Email
          </label>
          <div className="relative">
            <IconMail className="text-muted-foreground absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2" />
            <input
              id="signup-email"
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

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="text-foreground/90 block text-sm font-semibold"
          >
            Password
          </label>
          <div className="relative">
            <IconLock className="text-muted-foreground absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2" />
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={`bg-background focus:ring-primary/30 focus:border-primary w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none ${
                errors.password ? "border-destructive" : "border-input"
              }`}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-destructive text-xs">
              {errors.password.message}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            Min 8 chars, uppercase, lowercase, and a special character.
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm-password"
            className="text-foreground/90 block text-sm font-semibold"
          >
            Confirm Password
          </label>
          <div className="relative">
            <IconLock className="text-muted-foreground absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2" />
            <input
              id="signup-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={`bg-background focus:ring-primary/30 focus:border-primary w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none ${
                errors.confirmPassword ? "border-destructive" : "border-input"
              }`}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="btn-gradient flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || isGoogleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-input bg-background py-3 text-sm font-semibold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGoogleLoading ? (
          <>
            <IconLoader2 className="h-5 w-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <IconBrandGoogle className="h-5 w-5" />
            Sign up with Google
          </>
        )}
      </button>

      {/* Footer */}
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{" "}
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
