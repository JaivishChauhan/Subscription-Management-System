"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { IconRocket, IconShoppingCart, IconUser, IconLogout, IconMenu2, IconX } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { getDefaultPortalPath, getPortalLabel } from "@/lib/roles";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
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

  const userRole = session?.user?.role;
  const portalHref = getDefaultPortalPath(userRole);
  const portalLabel = getPortalLabel(userRole);
  const showCart = userRole !== "admin" && userRole !== "internal";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
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
          <NavLink href="/shop" label="Shop Apps" />
          <NavLink href="/bundles" label="Bundles" />
          <NavLink href="/pricing" label="Pricing" />
          {session?.user && (
            <>
              <NavLink href={portalHref} label={portalLabel} />
              {userRole === "portal" ? (
                <>
                  <NavLink href="/subscriptions" label="Subscriptions" />
                  <NavLink href="/invoices" label="Invoices" />
                </>
              ) : null}
            </>
          )}
        </div>

        {/* Desktop Auth Buttons + Theme Toggle + Cart */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          
          {/* Cart Icon with Badge */}
          {showCart ? (
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
          ) : null}

          {/* Auth Section */}
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ) : session?.user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground hover:bg-muted"
              >
                <IconUser className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{session.user.name || "Profile"}</span>
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
          {showCart ? (
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
          ) : null}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/70 transition-colors hover:bg-muted"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <IconX className="h-6 w-6" />
            ) : (
              <IconMenu2 className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-md md:hidden">
          <div className="space-y-1 px-4 py-4">
            <MobileNavLink href="/" label="Home" />
            <MobileNavLink href="/shop" label="Shop Apps" />
            <MobileNavLink href="/bundles" label="Bundles" />
            <MobileNavLink href="/pricing" label="Pricing" />
            
            {session?.user && (
              <>
                <div className="my-2 border-t border-border/50" />
                <MobileNavLink href={portalHref} label={portalLabel} />
                {userRole === "portal" ? (
                  <>
                    <MobileNavLink href="/subscriptions" label="Subscriptions" />
                    <MobileNavLink href="/invoices" label="Invoices" />
                  </>
                ) : null}
                <MobileNavLink href="/profile" label="Profile" />
              </>
            )}

            <div className="my-2 border-t border-border/50" />
            
            {isLoading ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            ) : session?.user ? (
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconLogout className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn-gradient block w-full rounded-lg px-3 py-2 text-center text-sm font-semibold"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/" 
    ? pathname === "/" 
    : pathname.startsWith(href);
  
  return (
    <Link
      href={href}
      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-muted text-foreground"
          : "text-foreground/70 hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/" 
    ? pathname === "/" 
    : pathname.startsWith(href);
  
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-muted text-foreground"
          : "text-foreground/70 hover:bg-muted hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
