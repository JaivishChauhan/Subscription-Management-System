"use client";

import Link from "next/link";
import { IconRocket, IconShoppingCart, IconUser } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCartStore } from "@/store/cart";

export function DashboardNav({ user }: { user: { name?: string | null; image?: string | null } }) {
  const items = useCartStore((s) => s.items);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md transition-transform group-hover:scale-105">
            <IconRocket className="h-5 w-5 text-white" stroke={2} />
          </div>
          <span className="text-xl font-bold text-gradient">SubsMS</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {/* Cart Icon with Badge */}
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-foreground/70 transition-colors hover:text-indigo-600 hover:bg-muted"
            aria-label="Shopping cart"
          >
            <IconShoppingCart className="h-5 w-5" stroke={2} />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                {items.length}
              </span>
            )}
          </Link>
          
          <Link
            href="/shop"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-block"
          >
            Shop
          </Link>
          <Link
            href="/subscriptions"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-block"
          >
            Subscriptions
          </Link>
          <Link
            href="/invoices"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-block"
          >
            Invoices
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <IconUser className="h-4 w-4" />
            Profile
          </Link>
        </div>
      </nav>
    </header>
  );
}
