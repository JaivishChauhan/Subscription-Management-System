"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconLoader2, IconMail, IconLock, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { signupSchema, type SignupFormData } from "@/lib/validations/auth";

/**
 * Signup page — new user registration.
 * Enforces password complexity requirements per PRD (AUTH-03 to AUTH-06).
 * Creates portal user via API route, then auto-signs in.
 *
 * @client Required for form interactivity.
 */
export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function handleSignupSubmit(data: SignupFormData) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Registration failed. Please try again.");
        return;
      }

      toast.success("Account created! Redirecting to login...");
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start managing your subscriptions today
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(handleSignupSubmit)}
        className="space-y-4"
        noValidate
      >
        {/* Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="block text-sm font-semibold text-foreground/90"
          >
            Full Name
          </label>
          <div className="relative">
            <IconUser className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                errors.name ? "border-destructive" : "border-input"
              }`}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-sm font-semibold text-foreground/90"
          >
            Email
          </label>
          <div className="relative">
            <IconMail className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                errors.email ? "border-destructive" : "border-input"
              }`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-sm font-semibold text-foreground/90"
          >
            Password
          </label>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                errors.password ? "border-destructive" : "border-input"
              }`}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Min 8 chars, uppercase, lowercase, and a special character.
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm-password"
            className="block text-sm font-semibold text-foreground/90"
          >
            Confirm Password
          </label>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signup-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                errors.confirmPassword ? "border-destructive" : "border-input"
              }`}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-gradient w-full rounded-full py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
