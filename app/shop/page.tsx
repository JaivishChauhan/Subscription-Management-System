import Link from "next/link";
import Image from "next/image";
import {
  IconShoppingCart,
  IconApps,
  IconSearch,
  IconPlus,
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { prisma as db } from "@/lib/db";
import { Service } from "@prisma/client";

export const revalidate = 3600;

export default async function ShopPage() {
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" },
  });

  const grouped = services.reduce((acc: Record<string, Service[]>, svc: Service) => {
    acc[svc.category] = acc[svc.category] || [];
    acc[svc.category].push(svc);
    return acc;
  }, {} as Record<string, typeof services>);

  return (
    <div className="min-h-screen bg-background">
      <ShopNav />

      {/* Hero */}
      <section className="relative px-4 pt-12 pb-12 sm:px-6 sm:pt-20 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            App <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse our catalog of 50+ premium services. Add them to your custom bundle and unlock progressive discounts.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-md">
              <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for an app..."
                className="w-full rounded-full border border-border bg-card py-3 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* App Grid Grouped By Category */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {Object.entries(grouped).map(([category, svcs]) => (
            <div key={category} className="mb-16">
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-foreground capitalize">
                  {category}
                </h2>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {svcs.length} apps
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {svcs.map((svc) => (
                  <ServiceCard key={svc.id} service={svc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ShopFooter />
    </div>
  );
}

function ServiceCard({ service }: { service: any }) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-indigo-500 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-muted p-2">
          {service.logoUrl ? (
            <Image
              src={service.logoUrl}
              alt={service.name}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <IconApps className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-foreground">
            ₹{service.monthlyPrice}
          </span>
          <p className="text-xs font-medium text-muted-foreground">/ month</p>
        </div>
      </div>
      
      <div className="mt-4 flex-1">
        <h3 className="text-lg font-bold text-foreground line-clamp-1">{service.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {service.description || "Premium service seamlessly integrated into your bundle."}
        </p>
      </div>

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">
        <IconPlus className="h-4 w-4" />
        Add to Bundle
      </button>
    </div>
  );
}

function ShopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
            <IconShoppingCart className="h-5 w-5 text-white" stroke={2} />
          </div>
          <span className="text-xl font-bold text-gradient">App Store</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/bundles/builder"
            className="rounded-full px-5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground hover:bg-muted hidden sm:inline-block"
          >
            Custom Bundle
          </Link>
          <Link
            href="/dashboard"
            className="btn-gradient rounded-full px-5 py-2 text-sm font-semibold"
          >
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}

function ShopFooter() {
  return (
    <footer className="border-t border-border/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SubsMS. All prices in INR. GST applicable as per plan.
        </p>
      </div>
    </footer>
  );
}
