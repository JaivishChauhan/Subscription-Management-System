import Link from "next/link";
import {
  IconCheck,
  IconArrowRight,
  IconShoppingCart,
  IconStar,
} from "@tabler/icons-react";

/**
 * Shop page — lists available subscription products/plans.
 * Currently uses static data. Will be wired to Prisma queries in Phase 5.
 *
 * Mobile: stacked cards.
 * Desktop: 3-col grid with featured card emphasis.
 */
export default function ShopPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <ShopNav />

      {/* Hero */}
      <section className="relative px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-indigo-400/15 blur-[120px]" />
          <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-violet-400/10 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
            <IconStar className="h-4 w-4" />
            14-day free trial on all plans
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Choose Your <span className="text-gradient">Subscription Plan</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Whether you&apos;re just starting out or scaling up, we have a plan
            that fits your needs.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {SHOP_PRODUCTS.map((product, idx) => (
              <ProductCard key={idx} product={product} />
            ))}
          </div>

          {/* Add-ons Section */}
          <div className="mt-16">
            <h2 className="text-center text-2xl font-bold">
              Boost Your Plan
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
              Enhance your subscription with premium add-ons
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ADD_ONS.map((addon, idx) => (
                <div
                  key={idx}
                  className="card-elevated flex items-center gap-4 rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600/10 to-violet-600/10 dark:from-indigo-500/20 dark:to-violet-500/20">
                    <addon.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{addon.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {addon.description}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gradient">
                    +₹{addon.price}/mo
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <ShopFooter />
    </div>
  );
}

/* ============================================================================
   SHOP NAV
   ============================================================================ */

function ShopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md transition-transform group-hover:scale-105">
            <IconShoppingCart className="h-5 w-5 text-white" stroke={2} />
          </div>
          <span className="text-xl font-bold text-gradient">Shop</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted"
          >
            Home
          </Link>
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
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}

/* ============================================================================
   PRODUCT CARD
   ============================================================================ */

interface ShopProduct {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
  badge?: string;
}

function ProductCard({ product }: { product: ShopProduct }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
        product.popular
          ? "border-indigo-500 bg-card shadow-xl shadow-indigo-500/10 scale-100 lg:scale-105 z-10"
          : "border-border bg-card card-elevated"
      }`}
    >
      {product.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
          {product.badge}
        </div>
      )}

      <h3 className="text-xl font-bold">{product.name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {product.description}
      </p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold">₹{product.price}</span>
        <span className="text-sm text-muted-foreground">
          /{product.period}
        </span>
      </div>

      <Link
        href="/signup"
        className={`mt-8 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all ${
          product.popular
            ? "btn-gradient"
            : "border border-border bg-card text-foreground hover:bg-muted shadow-sm"
        }`}
      >
        Get Started
        <IconArrowRight className="h-4 w-4" />
      </Link>

      <ul className="mt-8 flex-1 space-y-3">
        {product.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-sm">
            <IconCheck className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================================
   SHOP FOOTER
   ============================================================================ */

function ShopFooter() {
  return (
    <footer className="border-t border-border/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SubsMS. All prices in INR. GST
          applicable as per plan.
        </p>
      </div>
    </footer>
  );
}

/* ============================================================================
   STATIC DATA (replaced by Prisma queries in Phase 5)
   ============================================================================ */

import {
  IconHeadset,
  IconCloudComputing,
  IconShieldCheck,
} from "@tabler/icons-react";

const SHOP_PRODUCTS: ShopProduct[] = [
  {
    name: "Starter",
    description:
      "Perfect for small teams getting started with subscription management.",
    price: "1,200",
    period: "month",
    popular: false,
    features: [
      "Up to 100 subscriptions",
      "Email + password auth",
      "Invoice generation",
      "Basic reporting",
      "Email support",
    ],
  },
  {
    name: "Professional",
    description:
      "Advanced features for growing businesses with complex billing needs.",
    price: "3,500",
    period: "month",
    popular: true,
    badge: "Best Value",
    features: [
      "Unlimited subscriptions",
      "Quotation templates",
      "Discount management",
      "Advanced tax rules",
      "Priority support",
      "Custom branding",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Full-scale solution for large organizations with custom integrations.",
    price: "8,000",
    period: "month",
    popular: false,
    features: [
      "Everything in Professional",
      "Dedicated support tier",
      "Custom integrations",
      "SLA guarantees",
      "Multi-role admin panel",
      "Audit trail logging",
    ],
  },
];

const ADD_ONS = [
  {
    name: "Priority Support",
    description: "24/7 dedicated support with 1-hour response time",
    price: "2,000",
    icon: IconHeadset,
  },
  {
    name: "Cloud Backup",
    description: "Daily automated backups with point-in-time recovery",
    price: "1,500",
    icon: IconCloudComputing,
  },
  {
    name: "Advanced Security",
    description: "2FA, IP whitelisting, and advanced audit logs",
    price: "3,000",
    icon: IconShieldCheck,
  },
];
