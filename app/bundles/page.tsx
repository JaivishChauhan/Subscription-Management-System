import Link from "next/link";
import Image from "next/image";
import { IconShoppingCart, IconPuzzle, IconApps } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { db } from "@/lib/db";
import { BundleType } from "@prisma/client";

export const revalidate = 3600;

export default async function BundlesPage() {
  const bundles = await db.bundle.findMany({
    where: { isActive: true, type: BundleType.PREDEFINED },
    include: {
      services: {
        include: { service: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-background">
      <BundlesNav />

      <section className="relative px-4 pt-12 pb-12 sm:px-6 sm:pt-20 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Predefined <span className="text-gradient">Bundles</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Get the best deals on curated app collections, or build your own custom bundle to maximize savings.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/bundles/builder"
              className="btn-gradient inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <IconPuzzle className="h-5 w-5" />
              Build a Custom Bundle
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </div>
      </section>
      
      <BundlesFooter />
    </div>
  );
}

function BundleCard({ bundle }: { bundle: any }) {
  const originalPrice = bundle.services.reduce((acc: number, bs: any) => acc + bs.service.basePrice, 0);

  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all hover:shadow-xl hover:border-indigo-500/50">
      <h3 className="text-xl font-bold">{bundle.name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
        {bundle.description}
      </p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold">₹{bundle.price}</span>
        <span className="text-sm text-muted-foreground line-through">₹{originalPrice}</span>
        <span className="text-sm text-emerald-500 font-semibold">/mo</span>
      </div>

      <Link
        href={`/cart/add?type=bundle&id=${bundle.id}`}
        className="mt-8 flex items-center justify-center gap-2 w-full rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
      >
        <IconShoppingCart className="h-4 w-4" />
        Add to Cart
      </Link>

      <div className="mt-8 border-t border-border pt-6 flex-1">
        <p className="mb-4 text-sm font-semibold text-foreground">Includes ({bundle.services.length} apps):</p>
        <ul className="space-y-3">
          {bundle.services.map((bs: any) => (
            <li key={bs.serviceId} className="flex items-center gap-3 text-sm">
              <div className="relative h-6 w-6 shrink-0 rounded bg-muted flex items-center justify-center p-1">
                {bs.service.logoUrl ? (
                  <Image src={bs.service.logoUrl} alt={bs.service.name} width={16} height={16} className="object-contain" />
                ) : (
                  <IconApps className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className="text-muted-foreground truncate flex-1">{bs.service.name}</span>
              <span className="text-xs font-medium text-foreground/50">₹{bs.service.basePrice}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BundlesNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
            <IconPuzzle className="h-5 w-5 text-white" stroke={2} />
          </div>
          <span className="text-xl font-bold text-gradient">Bundles</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/shop"
            className="rounded-full px-5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground hover:bg-muted hidden sm:inline-block"
          >
            App Store
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

function BundlesFooter() {
  return (
    <footer className="border-t border-border/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SubsMS. All prices in INR.
        </p>
      </div>
    </footer>
  );
}
