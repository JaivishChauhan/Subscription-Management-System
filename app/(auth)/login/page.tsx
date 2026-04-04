"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { IconLoader2, IconMail, IconLock, IconBrandGoogle } from "@tabler/icons-react"
import { toast } from "sonner"
import { DEMO_LOGIN_CREDENTIALS } from "@/lib/demo-data"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"

/**
 * Login page — email + password authentication.
 * Uses React Hook Form + Zod for client-side validation.
 * Submits to NextAuth credentials provider.
 *
 * @client Required for form interactivity and signIn().
 */
export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function handleLoginSubmit(data: LoginFormData) {
    setIsSubmitting(true)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password. Please try again.")
        return
      }

      toast.success("Welcome back!")
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleAutofillDemo() {
    reset(DEMO_LOGIN_CREDENTIALS)
    toast.success("Demo login details added.")
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch {
      toast.error("Failed to sign in with Google")
      setIsGoogleLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Sign in to your SubsMS account
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(handleLoginSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-indigo-700 uppercase">
                Demo Admin Account
              </p>
              <p className="mt-1 text-xs text-indigo-900">
                admin@subsms.local / Admin@1234!
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
            htmlFor="login-email"
            className="text-foreground/90 block text-sm font-semibold"
          >
            Email
          </label>
          <div className="relative">
            <IconMail className="text-muted-foreground absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2" />
            <input
              id="login-email"
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-foreground/90 block text-sm font-semibold"
            >
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <IconLock className="text-muted-foreground absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2" />
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
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
              Signing in...
            </>
          ) : (
            "Sign in"
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
            Sign in with Google
          </>
        )}
      </button>

      {/* Footer */}
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Create one
        </Link>
      </p>
    </>
  )
}
