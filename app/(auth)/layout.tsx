import { IconRocket } from "@tabler/icons-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Auth layout — shared across login, signup, and reset-password.
 * Split-screen (Mobile: stack, Desktop: side-by-side).
 * Left: Branded feature showcase.
 * Right: Authentication forms.
 *
 * Dark/Light mode fully supported — all colors use CSS design tokens.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      {/* LEFT: Branding Panel (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-muted/40 px-12 py-16 lg:flex border-r border-border">
        {/* Abstract ambient glow */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-400/10 blur-[80px]" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-400/10 blur-[100px]" />
        </div>

        <div className="relative z-10 space-y-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
              <IconRocket className="h-5 w-5 text-white" stroke={2} />
            </div>
            <span className="text-2xl font-bold text-foreground">SubsMS</span>
          </Link>

          <div className="mt-16">
            <h1 className="f-syne max-w-lg text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground">
              The simplest way to manage your subscriptions
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Automate billing, reduce churn, and scale your recurring revenue
              businesses with our intelligent AI-powered platform.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="mt-8 space-y-3">
            {[
              "Auto-generated invoices on subscription activation",
              "Role-based access: Admin, Internal & Portal",
              "Real-time MRR, churn, and revenue analytics",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60">
                  <svg className="h-3 w-3 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Feature UI Mockup */}
        <div className="relative z-10 mt-12 w-full flex-grow rounded-tr-2xl rounded-tl-2xl bg-card shadow-2xl overflow-hidden border border-border">
          {/* Fake Window Header */}
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <span className="f-mono text-[10px] text-muted-foreground ml-2">SubsMS — Dashboard</span>
          </div>
          {/* Fake App Data */}
          <div className="p-6 space-y-4">
            <div className="h-6 w-40 rounded bg-indigo-100 dark:bg-indigo-950/50" />
            <div className="grid grid-cols-3 gap-3">
              {["bg-indigo-50 dark:bg-indigo-950/30", "bg-violet-50 dark:bg-violet-950/30", "bg-emerald-50 dark:bg-emerald-950/30"].map((cls, i) => (
                <div key={i} className={`h-16 rounded-lg border border-border ${cls}`} />
              ))}
            </div>
            <div className="h-24 w-full rounded-lg border border-border bg-muted/30" />
            <div className="flex gap-3">
              <div className="h-10 flex-1 rounded bg-muted/40 border border-border" />
              <div className="h-10 flex-1 rounded bg-muted/40 border border-border" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Auth Card */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 sm:px-6 z-10 relative">
        {/* Theme toggle in top-right */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[420px]">
          {/* Mobile Only Brand (Hidden on Desktop) */}
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2.5 transition-opacity hover:opacity-80 lg:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
              <IconRocket className="h-5 w-5 text-white" stroke={2} />
            </div>
            <span className="text-2xl font-bold text-foreground">SubsMS</span>
          </Link>

          <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
