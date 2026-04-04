"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/hooks/use-session";
import { IconRocket, IconShoppingCart, IconUser, IconLogout } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

export function Navigation() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const { session, status } = useSession();
  const isLoading = status === "loading";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Failed to sign out");
    }
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md transition-transform group-hover:scale-105">
              <IconRocket className="h-5 w-5 text-white" stroke={2} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gradient">
              SubsMS
            </span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="/" label="Home" />
            <NavLink href="/shop" label="Shop Apps" />
            <NavLink href="/bundles" label="Bundles" />
            <NavLink href="/pricing" label="Pricing" />
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
          <NavLink href="/shop" label="Shop Apps" />
          <NavLink href="/bundles" label="Bundles" />
          <NavLink href="/pricing" label="Pricing" />
        </div>

        {/* Desktop Auth Buttons + Theme Toggle + Cart */}
        <div className="hidden items-center gap-3 md:flex">
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

          {/* Auth Section */}
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ) : session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground hover:bg-muted"
              >
                <IconUser className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{session.user.name || "Dashboard"}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground hover:bg-muted"
              >
                <IconLogout className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile: Theme Toggle + Cart + Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          
          {/* Cart Icon with Badge - Mobile */}
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-foreground/70 transition-colors hover:text-indigo-600"
            aria-label="Shopping cart"
          >
            <IconShoppingCart className="h-5 w-5" stroke={2} />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                {items.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/70 transition-colors hover:bg-muted"
            aria-label="Open navigation menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
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
