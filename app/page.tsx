import Link from "next/link";
import Image from "next/image";
import {
  IconRocket,
  IconShoppingBag,
  IconTags,
  IconPuzzle,
  IconCheck,
  IconStar,
  IconApps,
  IconDiscount,
  IconSearch,
} from "@tabler/icons-react";

import { prisma as db } from "@/lib/db";
import type { Service, Bundle, BundleService } from "@prisma/client";

export const revalidate = 3600; // Cache for 1 hour

export default async function LandingPage() {
  const featuredServices = await db.service.findMany({
    where: { isActive: true },
    take: 12,
    orderBy: { monthlyPrice: "desc" },
  });

  const featuredBundles = await db.bundle.findMany({
    where: { isActive: true, type: "predefined" },
    take: 3,
    include: {
      services: {
        include: { service: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background atmospheric orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-400/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-400/15 blur-[140px] animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300/10 blur-[100px] animate-float" />
      </div>

      <HeroSection />
      {featuredServices.length > 0 && <TopServicesSection services={featuredServices} />}
      <FeaturesSection />
      {featuredBundles.length > 0 && <BundlesSection bundles={featuredBundles} />}
      <CTASection />
      <Footer />
    </div>
  );
}

/* ============================================================================
   HERO SECTION
   ============================================================================ */

function HeroSection() {
  return (
    <section className="relative px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-32 lg:pb-36">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
            <IconStar className="h-4 w-4" />
            Your Ultimate Subscription Marketplace
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
            Bundle Your Favorite Apps & <br className="hidden lg:block"/>
            <span className="text-gradient">Save Up to 40%</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Netflix, Spotify, ChatGPT Plus, and 50+ other premium services in one single subscription manager. Pick your apps, build a custom bundle, and unlock automated discount tiers.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="btn-gradient inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <IconShoppingBag className="h-5 w-5" />
              Browse App Store
            </Link>
            <Link
              href="/bundles/builder"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-8 py-4 text-base font-semibold text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md hover:-translate-y-0.5"
            >
              <IconPuzzle className="h-5 w-5" />
              Build a Custom Bundle
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   TOP SERVICES SECTION
   ============================================================================ */

function TopServicesSection({ services }: { services: Service[] }) {
  return (
    <section className="relative px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Trusted by users worldwide to manage leading premium services
          </p>
        </div>
        
        {/* We use a marquee-style or grid approach. Here we'll do a responsive grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {services.map((svc) => (
            <Link
              key={svc.id}
              href={`/shop?category=${svc.category}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10"
            >
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-muted p-2 transition-transform group-hover:scale-110">
                {svc.logoUrl ? (
                  <Image
                    src={svc.logoUrl}
                    alt={svc.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <IconApps className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-center text-sm font-medium text-foreground line-clamp-1">{svc.name}</p>
            </Link>
          ))}
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
    icon: IconApps,
    title: "50+ Premium Apps",
    description:
      "From streaming to productivity, find all your favorite apps in one unified catalog. No more jumping between websites.",
  },
  {
    icon: IconPuzzle,
    title: "Custom Bundles",
    description:
      "Mix and match any services you want. Create your dream bundle and have it managed under a single invoice.",
  },
  {
    icon: IconDiscount,
    title: "Automated Discounts",
    description:
      "The more you bundle, the more you save. Our dynamic discount engine automatically applies up to 40% off.",
  },
  {
    icon: IconTags,
    title: "Curated Packages",
    description:
      "Don't know what to pick? Choose from our pre-defined themed bundles like the 'Ultimate Entertainment Pack' or 'Creator ProKit'.",
  },
  {
    icon: IconCheck,
    title: "One Central Dashboard",
    description:
      "Track your active services, manage payment methods, and monitor upcoming renewals—all in one place.",
  },
  {
    icon: IconRocket,
    title: "Instant Activation",
    description:
      "Checkout once and get access instantly. We handle the provisioning and subscription lifecycles automatically.",
  },
] as const;

function FeaturesSection() {
  return (
    <section className="relative border-t border-border/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Why Use SubsMS
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            A Smarter Way to <span className="text-gradient">Subscribe</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stop managing dozens of individual charges across different credit cards. Unify your digital life.
          </p>
        </div>

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
   BUNDLES SECTION
   ============================================================================ */

type BundleWithServices = Bundle & {
  services: (BundleService & { service: Service })[];
};

function BundlesSection({ bundles }: { bundles: BundleWithServices[] }) {
  return (
    <section id="bundles" className="relative border-t border-border/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent dark:via-indigo-950/10" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Featured Bundles
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Curated For <span className="text-gradient">Maximum Value</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get the best deals on grouped apps, hand-picked by our experts.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:gap-8 lg:grid-cols-3">
          {bundles.map((bundle, idx) => {
            const basePrice = bundle.services.reduce((acc: number, bs: BundleService & { service: Service }) => acc + bs.service.monthlyPrice, 0);
            const discountedPrice = bundle.discountType === "fixed" ? Math.max(0, basePrice - bundle.discountValue) : basePrice * (1 - bundle.discountValue / 100);
            
            return (
            <div
              key={bundle.id}
              className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
                idx === 1
                  ? "border-indigo-500 bg-card shadow-xl shadow-indigo-500/10 scale-100 lg:scale-105 z-10"
                  : "border-border bg-card card-elevated"
              }`}
            >
              {idx === 1 && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-bold">{bundle.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {bundle.description}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">₹{discountedPrice.toFixed(0)}</span>
                <span className="text-sm text-muted-foreground line-through">
                  ₹{basePrice.toFixed(0)}
                </span>
                <span className="text-sm text-emerald-500 font-semibold">/mo</span>
              </div>

              <Link
                href={`/bundles/${bundle.id}`}
                className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-all ${
                  idx === 1
                    ? "btn-gradient"
                    : "border border-border bg-card text-foreground hover:bg-muted shadow-sm"
                }`}
              >
                View Details
              </Link>

              <div className="mt-8 border-t border-border pt-6">
                <p className="mb-4 text-sm font-semibold text-foreground">Includes:</p>
                <ul className="space-y-3">
                  {bundle.services.slice(0, 5).map((bs: BundleService & { service: Service }) => (
                    <li
                      key={bs.serviceId}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="relative h-6 w-6 shrink-0 rounded bg-muted flex items-center justify-center p-1">
                         {bs.service.logoUrl ? (
                           <Image src={bs.service.logoUrl} alt={bs.service.name} width={16} height={16} className="object-contain" />
                         ) : (
                           <IconApps className="h-4 w-4 text-muted-foreground" />
                         )}
                      </div>
                      <span className="text-muted-foreground truncate">{bs.service.name}</span>
                    </li>
                  ))}
                  {bundle.services.length > 5 && (
                    <li className="text-sm text-muted-foreground italic">
                      + {bundle.services.length - 5} more apps
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )})}
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
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-8 text-center shadow-2xl sm:p-16 relative">
        {/* Glow effects inside CTA */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-violet-500/30 blur-[80px]" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Ready to build your dream bundle?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-200">
            Join thousands of users who are saving money every month by uniting their subscriptions on SubsMS. Get started for free.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-indigo-900 shadow-lg transition-all hover:scale-105 hover:bg-indigo-50 hover:shadow-xl"
            >
              <IconSearch className="h-5 w-5" />
              Explore Apps
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
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
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
              <IconRocket className="h-4 w-4 text-white" stroke={2} />
            </div>
            <span className="text-lg font-bold text-gradient">SubsMS</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/shop" className="hover:text-foreground transition-colors">App Store</Link>
            <Link href="/bundles" className="hover:text-foreground transition-colors">Bundles</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SubsMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
