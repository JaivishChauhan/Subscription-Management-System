import Link from "next/link";
import {
  IconRocket,
  IconShieldCheck,
  IconChartBar,
  IconCreditCard,
  IconFileInvoice,
  IconUsers,
  IconArrowRight,
  IconCheck,
  IconStar,
} from "@tabler/icons-react";

/**
 * Landing page — the first thing users see.
 * Mobile-first design with progressive enhancement for larger screens.
 *
 * Sections:
 * 1. Hero — gradient headline, CTA, feature highlights
 * 2. Features — 6 key capabilities
 * 3. Pricing — 3-tier plan comparison
 * 4. Stats — vanity metrics
 * 5. CTA — final conversion push
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background atmospheric orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-400/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-400/15 blur-[140px] animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300/10 blur-[100px] animate-float" />
      </div>

      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

/* ============================================================================
   NAV BAR
   ============================================================================ */

function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md transition-transform group-hover:scale-105">
            <IconRocket className="h-5 w-5 text-white" stroke={2} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">
            SubsMS
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/" label="Home" />
          <NavLink href="/shop" label="Shop" />
          <NavLink href="/pricing" label="Pricing" />
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground hover:bg-muted"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-gradient rounded-full px-5 py-2 text-sm font-semibold"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/70 transition-colors hover:bg-muted md:hidden"
          aria-label="Open navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted"
    >
      {label}
    </Link>
  );
}

/* ============================================================================
   HERO SECTION
   ============================================================================ */

function HeroSection() {
  return (
    <section className="relative px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-32 lg:pb-36">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left lg:gap-16">
          {/* Text Content */}
          <div className="max-w-2xl animate-fade-in-up lg:flex-1">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
              <IconStar className="h-4 w-4" />
              Built for recurring revenue businesses
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Manage Subscriptions{" "}
              <span className="text-gradient">with Confidence</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              One platform for billing, invoicing, analytics, and customer
              management. Automate your subscription lifecycle and focus on
              growing your business.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/signup"
                className="btn-gradient inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold"
              >
                Start Free Trial
                <IconArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 text-base font-semibold text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md"
              >
                View Pricing
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <div className="flex -space-x-2.5">
                {[
                  "bg-indigo-400",
                  "bg-violet-400",
                  "bg-emerald-400",
                  "bg-amber-400",
                ].map((bg, idx) => (
                  <div
                    key={idx}
                    className={`h-9 w-9 rounded-full ${bg} ring-2 ring-background flex items-center justify-center text-xs font-bold text-white`}
                  >
                    {["A", "J", "S", "M"][idx]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">500+</span>{" "}
                businesses trust SubsMS
              </div>
            </div>
          </div>

          {/* Isometric Hero Card (Desktop only) */}
          <div className="mt-16 hidden lg:mt-0 lg:block lg:flex-1">
            <div className="relative mx-auto max-w-md">
              {/* Main Card */}
              <div className="card-elevated rounded-2xl border border-border bg-card p-6 [transform:perspective(1200px)_rotateY(-8deg)_rotateX(6deg)]">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Monthly Revenue
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    +24%
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-gradient">
                  ₹12,45,000
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  vs ₹10,04,032 last month
                </p>
                {/* Mini chart bars */}
                <div className="mt-6 flex items-end gap-1.5">
                  {[40, 55, 35, 60, 75, 50, 85, 70, 90, 65, 80, 95].map(
                    (height, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-600 to-violet-500 opacity-80"
                        style={{ height: `${height}px` }}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-lg animate-float">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/50">
                  <IconCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Invoice Paid</p>
                  <p className="text-xs text-muted-foreground">₹35,000</p>
                </div>
              </div>

              {/* Floating subscription count */}
              <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-lg animate-float [animation-delay:3s]">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/50">
                  <IconUsers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Active Subs</p>
                  <p className="text-xs text-muted-foreground">1,284</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   FEATURES SECTION
   ============================================================================ */

const FEATURES = [
  {
    icon: IconCreditCard,
    title: "Recurring Billing",
    description:
      "Support daily, weekly, monthly, and yearly billing cycles with auto-renewal, pausing, and closure options.",
  },
  {
    icon: IconFileInvoice,
    title: "Auto Invoicing",
    description:
      "Invoices are auto-generated when subscriptions activate. Confirm, send, and track payments effortlessly.",
  },
  {
    icon: IconShieldCheck,
    title: "Role-Based Access",
    description:
      "Three distinct roles — Admin, Internal, and Portal — with granular permission controls on every action.",
  },
  {
    icon: IconChartBar,
    title: "Real-Time Analytics",
    description:
      "Track MRR, active subscriptions, revenue trends, overdue invoices, and payment summaries at a glance.",
  },
  {
    icon: IconUsers,
    title: "Customer Portal",
    description:
      "Subscribers browse plans, manage their account, view invoices, and make payments — all self-service.",
  },
  {
    icon: IconRocket,
    title: "Quotation Templates",
    description:
      "Predefined templates for rapid subscription setup. Pre-fill plan details, product lines, and validity periods.",
  },
] as const;

function FeaturesSection() {
  return (
    <section className="relative border-t border-border/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Everything You Need
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Built for <span className="text-gradient">Subscription Businesses</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From plan configuration to payment collection, manage your entire
            billing lifecycle in one platform.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="card-elevated group rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md transition-transform group-hover:scale-110">
                <feature.icon className="h-6 w-6 text-white" stroke={1.5} />
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   PRICING SECTION
   ============================================================================ */

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "1,200",
    period: "month",
    description: "For small teams getting started",
    features: [
      "Up to 100 subscriptions",
      "Email + password auth",
      "Invoice generation",
      "Basic reporting",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "3,500",
    period: "month",
    description: "For growing businesses",
    features: [
      "Unlimited subscriptions",
      "Quotation templates",
      "Discount management",
      "Advanced tax rules",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "8,000",
    period: "month",
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Dedicated support tier",
      "Custom integrations",
      "SLA guarantees",
      "Multi-role admin panel",
      "Audit trail logging",
    ],
    cta: "Contact Sales",
    popular: false,
  },
] as const;

function PricingSection() {
  return (
    <section id="pricing" className="relative border-t border-border/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      {/* Subtle gradient bg */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent dark:via-indigo-950/10" />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Simple Pricing
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Choose the plan that <span className="text-gradient">fits you</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-6 sm:gap-8 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-indigo-500 bg-card shadow-xl shadow-indigo-500/10 scale-100 lg:scale-105 z-10"
                  : "border-border bg-card card-elevated"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">₹{plan.price}</span>
                <span className="text-sm text-muted-foreground">
                  /{plan.period}
                </span>
              </div>

              <Link
                href="/signup"
                className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? "btn-gradient"
                    : "border border-border bg-card text-foreground hover:bg-muted shadow-sm"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature, featureIdx) => (
                  <li
                    key={featureIdx}
                    className="flex items-center gap-3 text-sm"
                  >
                    <IconCheck className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   STATS SECTION
   ============================================================================ */

const STATS = [
  { value: "500+", label: "Active Businesses" },
  { value: "₹2Cr+", label: "Revenue Processed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "24/7", label: "Support Available" },
] as const;

function StatsSection() {
  return (
    <section className="border-t border-border/50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl font-extrabold text-gradient sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   CTA SECTION
   ============================================================================ */

function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-8 text-center shadow-2xl sm:p-16">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Ready to simplify your billing?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-200">
          Join hundreds of businesses that trust SubsMS to manage their
          subscription lifecycle. Start your 14-day free trial today.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-indigo-900 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl"
          >
            Get Started Free
            <IconArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
          >
            Compare Plans
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   FOOTER
   ============================================================================ */

function Footer() {
  return (
    <footer className="border-t border-border/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
              <IconRocket className="h-4 w-4 text-white" stroke={2} />
            </div>
            <span className="text-lg font-bold text-gradient">SubsMS</span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SubsMS
          </p>
        </div>
      </div>
    </footer>
  );
}
