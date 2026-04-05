import Link from "next/link"
import Image from "next/image"
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
} from "@tabler/icons-react"

import { prisma as db } from "@/lib/db"
import type { Service, Bundle, BundleService } from "@prisma/client"

import { HeroAnimatedBackground } from "@/components/hero-animated-background"
import { ScrollReveal } from "@/components/scroll-reveal"

export const revalidate = 3600 // Cache for 1 hour

export default async function LandingPage() {
  const featuredServices = await db.service.findMany({
    where: { isActive: true },
    take: 12,
    orderBy: { monthlyPrice: "desc" },
  })

  const featuredBundles = await db.bundle.findMany({
    where: { isActive: true, type: "predefined" },
    take: 3,
    include: {
      services: {
        include: { service: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background atmospheric orbs */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-indigo-400/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-violet-400/15 blur-[140px] [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 animate-bounce rounded-full bg-sky-300/10 blur-[100px] [animation-duration:8s]" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 animate-ping rounded-full bg-fuchsia-300/10 blur-[90px] [animation-duration:10s]" />
      </div>

      <HeroSection />
      {featuredServices.length > 0 && (
        <TopServicesSection services={featuredServices} />
      )}
      <FeaturesSection />
      {featuredBundles.length > 0 && (
        <BundlesSection bundles={featuredBundles} />
      )}
      <CTASection />
      <Footer />
    </div>
  )
}

/* ============================================================================
   HERO SECTION
   ============================================================================ */

function HeroSection() {
  return (
    <section className="relative z-0 overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-32 lg:pb-36">
      <HeroAnimatedBackground />
      <div className="pointer-events-none relative z-10 mx-auto max-w-7xl">
        <div className="pointer-events-auto flex flex-col items-center text-center">
          {/* Badge */}
          <ScrollReveal delay={0.1}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm dark:border-indigo-800/50 dark:bg-indigo-950/50 dark:text-indigo-300">
              <IconStar className="h-4 w-4 text-amber-500" />
              <span>Your Ultimate Subscription Marketplace</span>
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal delay={0.2}>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
              Bundle Your Favorite Apps & <br className="hidden lg:block" />
              <span className="text-gradient">Save Up to 40%</span>
            </h1>
          </ScrollReveal>

          {/* Subheadline */}
          <ScrollReveal delay={0.3}>
            <p className="text-muted-foreground mt-8 max-w-2xl text-lg leading-relaxed sm:text-xl">
              Netflix, Spotify, ChatGPT Plus, and 50+ other premium services in
              one single subscription manager. Pick your apps, build a custom
              bundle, and unlock automated discount tiers.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={0.4}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="btn-gradient inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
              >
                <IconShoppingBag className="h-5 w-5" />
                Browse App Store
              </Link>
              <Link
                href="/bundles/builder"
                className="border-border bg-card text-foreground hover:bg-muted inline-flex items-center justify-center gap-2 rounded-full border px-8 py-4 text-base font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <IconPuzzle className="h-5 w-5" />
                Build a Custom Bundle
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

/* ============================================================================
   TOP SERVICES SECTION
   ============================================================================ */

function TopServicesSection({ services }: { services: Service[] }) {
  return (
    <section className="relative px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal delay={0.1}>
          <div className="mb-10 text-center">
            <p className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Trusted by users worldwide to manage leading premium services
            </p>
          </div>
        </ScrollReveal>

        {/* We use a marquee-style or grid approach. Here we'll do a responsive grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {services.map((svc, idx) => (
            <ScrollReveal
              key={svc.id}
              delay={0.1 + (idx % 6) * 0.05}
              direction="up"
              className="h-full"
            >
              <Link
                href={`/shop?category=${svc.category}`}
                className="group border-border bg-card flex h-full flex-col items-center justify-center gap-3 rounded-2xl border p-6 shadow-sm transition-all hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10"
              >
                <div className="bg-muted relative flex h-14 w-14 items-center justify-center rounded-2xl p-2 transition-transform group-hover:scale-110">
                  {svc.logoUrl ? (
                    <Image
                      src={svc.logoUrl}
                      alt={svc.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <IconApps className="text-muted-foreground h-8 w-8" />
                  )}
                </div>
                <p className="text-foreground line-clamp-1 text-center text-sm font-medium transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {svc.name}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
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
] as const

function FeaturesSection() {
  return (
    <section className="border-border/50 relative border-t px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 animate-spin rounded-full bg-violet-500/5 blur-[120px] [animation-duration:20s]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[600px] w-[600px] -translate-x-1/3 translate-y-1/3 animate-pulse rounded-full bg-indigo-400/5 blur-[100px] [animation-duration:6s]" />

      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              Why Use SubsMS
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              A Smarter Way to <span className="text-gradient">Subscribe</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Stop managing dozens of individual charges across different credit
              cards. Unify your digital life.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <ScrollReveal key={idx} delay={0.1 + (idx % 3) * 0.1}>
              <div className="card-elevated group border-border bg-card/80 h-full rounded-3xl border p-6 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 sm:p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className="h-7 w-7 text-white" stroke={1.5} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================================
   BUNDLES SECTION
   ============================================================================ */

type BundleWithServices = Bundle & {
  services: (BundleService & { service: Service })[]
}

function BundlesSection({ bundles }: { bundles: BundleWithServices[] }) {
  return (
    <section
      id="bundles"
      className="border-border/50 relative border-t px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-indigo-50/50 to-transparent dark:via-indigo-950/20" />
      <div className="pointer-events-none absolute top-1/4 left-1/4 -z-10 h-96 w-96 animate-spin rounded-full bg-cyan-300/10 blur-[150px] [animation-duration:15s]" />

      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              Featured Bundles
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Curated For <span className="text-gradient">Maximum Value</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Get the best deals on grouped apps, hand-picked by our experts.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 sm:gap-8 lg:grid-cols-3">
          {bundles.map((bundle, idx) => {
            const basePrice = bundle.services.reduce(
              (acc: number, bs: BundleService & { service: Service }) =>
                acc + bs.service.monthlyPrice,
              0
            )
            const discountedPrice =
              bundle.discountType === "fixed"
                ? Math.max(0, basePrice - bundle.discountValue)
                : basePrice * (1 - bundle.discountValue / 100)

            return (
              <ScrollReveal key={bundle.id} delay={0.1 + idx * 0.1}>
                <div
                  className={`bg-card group relative h-full rounded-3xl border p-6 transition-all duration-300 sm:p-8 ${
                    idx === 1
                      ? "z-10 scale-100 border-indigo-500 shadow-2xl shadow-indigo-500/20 lg:scale-105"
                      : "border-border/60 shadow-lg hover:-translate-y-2 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10"
                  }`}
                >
                  {idx === 1 && (
                    <div className="absolute -top-4 left-0 flex w-full justify-center">
                      <span className="animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-1.5 text-xs font-bold text-white shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold">{bundle.name}</h3>
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                    {bundle.description}
                  </p>

                  <div className="mt-8 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tight">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(discountedPrice)}
                    </span>
                    <span className="text-muted-foreground text-sm line-through">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(basePrice)}
                    </span>
                    <span className="text-sm font-semibold text-emerald-500">
                      /mo
                    </span>
                  </div>

                  <Link
                    href={`/bundles/${bundle.id}`}
                    className={`mt-10 block w-full rounded-full py-3.5 text-center text-sm font-bold transition-all ${
                      idx === 1
                        ? "btn-gradient shadow-lg shadow-indigo-500/25 hover:scale-[1.02] hover:shadow-indigo-500/40"
                        : "border border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                    }`}
                  >
                    View Bundle Details
                  </Link>

                  <div className="border-border/50 mt-10 border-t pt-8">
                    <p className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                      What's Included
                    </p>
                    <ul className="space-y-4">
                      {bundle.services
                        .slice(0, 5)
                        .map((bs: BundleService & { service: Service }) => (
                          <li
                            key={bs.serviceId}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="bg-muted relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg p-1.5 shadow-sm">
                              {bs.service.logoUrl ? (
                                <Image
                                  src={bs.service.logoUrl}
                                  alt={bs.service.name}
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                />
                              ) : (
                                <IconApps className="text-muted-foreground h-4 w-4" />
                              )}
                            </div>
                            <span className="text-foreground truncate font-medium">
                              {bs.service.name}
                            </span>
                          </li>
                        ))}
                      {bundle.services.length > 5 && (
                        <li className="text-muted-foreground pl-11 text-sm font-medium italic">
                          + {bundle.services.length - 5} more apps
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ============================================================================
   CTA SECTION
   ============================================================================ */

function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <ScrollReveal delay={0.2} direction="up">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-950 p-8 text-center shadow-2xl sm:p-20">
          {/* Glow effects inside CTA */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[300px] w-[300px] animate-pulse-slow rounded-full bg-indigo-500/40 blur-[100px]" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[300px] w-[300px] animate-pulse-slow rounded-full bg-violet-500/40 blur-[100px] [animation-delay:2s]" />

          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ready to build your dream bundle?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-indigo-100">
              Join thousands of users who are saving money every month by
              uniting their subscriptions on SubsMS. Get started for free.
            </p>
            <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-lg font-bold text-indigo-950 shadow-xl transition-all hover:scale-105 hover:bg-indigo-50 hover:shadow-2xl hover:shadow-white/20 sm:w-auto"
              >
                <IconSearch className="h-6 w-6" />
                Explore Apps
              </Link>
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/30 px-10 py-4 text-lg font-semibold text-white transition-all hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* ============================================================================
   FOOTER
   ============================================================================ */

function Footer() {
  return (
    <footer className="border-border/50 border-t px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
              <IconRocket className="h-4 w-4 text-white" stroke={2} />
            </div>
            <span className="text-gradient text-lg font-bold">SubsMS</span>
          </Link>

          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              href="/shop"
              className="hover:text-foreground transition-colors"
            >
              App Store
            </Link>
            <Link
              href="/bundles"
              className="hover:text-foreground transition-colors"
            >
              Bundles
            </Link>
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="hover:text-foreground transition-colors"
            >
              Sign up
            </Link>
          </div>

          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} SubsMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
