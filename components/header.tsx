"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "@/hooks/use-session"
import {
  IconRocket,
  IconShoppingCart,
  IconUser,
  IconLogout,
  IconMenu2,
  IconX,
} from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useCartStore } from "@/store/cart"
import { toast } from "sonner"
import { getDefaultPortalPath, getPortalLabel } from "@/lib/roles"

/**
 * Main public navigation header.
 * Renders auth state (sign in / user info) and cart badge.
 * Uses our custom useSession hook — no next-auth/react dependency.
 *
 * @client Required for hooks, router, and interactive state.
 */
export function Header() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const items = useCartStore((s) => s.items)
  const { session, status } = useSession()
  const isLoading = status === "loading"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  /** Signs out via our custom API then navigates home. */
  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" })
    } catch {
      toast.error("Failed to sign out")
    }
  }

  if (!mounted) {
    return (
      <header className="border-border/50 glass sticky top-0 z-50 w-full border-b">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md transition-transform group-hover:scale-105">
              <IconRocket className="h-5 w-5 text-white" stroke={2} />
            </div>
            <span className="text-gradient text-xl font-bold tracking-tight">
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
            <div className="bg-muted h-9 w-24 animate-pulse rounded-full" />
          </div>
          {/* Mobile: Theme Toggle + Menu Button Placeholder */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="text-foreground/70 hover:bg-muted inline-flex items-center justify-center rounded-lg p-2 transition-colors"
              aria-label="Toggle navigation menu"
              disabled
            >
              <IconMenu2 className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>
    )
  }

  const userRole = session?.user.role ?? null
  const portalHref = getDefaultPortalPath(userRole)
  const portalLabel = getPortalLabel(userRole)
  const showCart = userRole !== "admin" && userRole !== "internal"

  return (
    <header className="border-border/50 glass sticky top-0 z-50 w-full border-b">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md transition-transform group-hover:scale-105">
            <IconRocket className="h-5 w-5 text-white" stroke={2} />
          </div>
          <span className="text-gradient text-xl font-bold tracking-tight">
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
              className="text-foreground/70 hover:bg-muted relative rounded-full p-2 transition-colors hover:text-indigo-600"
              aria-label="Shopping cart"
            >
              <IconShoppingCart className="h-5 w-5" stroke={2} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                  {items.length}
                </span>
              )}
            </Link>
          ) : null}

          {/* Auth Section */}
          {isLoading ? (
            <div className="bg-muted h-9 w-24 animate-pulse rounded-full" />
          ) : session?.user ? (
            <>
              <Link
                href="/profile"
                className="text-foreground/80 hover:text-foreground hover:bg-muted flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
              >
                <IconUser className="h-4 w-4" />
                <span className="max-w-[100px] truncate">
                  {session.user.name || "Profile"}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-foreground/80 hover:text-foreground hover:bg-muted flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
              >
                <IconLogout className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-foreground/80 hover:text-foreground hover:bg-muted rounded-full px-5 py-2 text-sm font-semibold transition-colors"
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
              className="text-foreground/70 relative rounded-full p-2 transition-colors hover:text-indigo-600"
              aria-label="Shopping cart"
            >
              <IconShoppingCart className="h-5 w-5" stroke={2} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                  {items.length}
                </span>
              )}
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground/70 hover:bg-muted inline-flex items-center justify-center rounded-lg p-2 transition-colors"
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
        <div className="border-border/50 bg-background/95 border-t backdrop-blur-md md:hidden">
          <div className="space-y-1 px-4 py-4">
            <MobileNavLink href="/" label="Home" />
            <MobileNavLink href="/shop" label="Shop Apps" />
            <MobileNavLink href="/bundles" label="Bundles" />
            <MobileNavLink href="/pricing" label="Pricing" />

            {session?.user && (
              <>
                <div className="border-border/50 my-2 border-t" />
                <MobileNavLink href={portalHref} label={portalLabel} />
                {userRole === "portal" ? (
                  <>
                    <MobileNavLink
                      href="/subscriptions"
                      label="Subscriptions"
                    />
                  </>
                ) : null}
                <MobileNavLink href="/profile" label="Profile" />
              </>
            )}

            <div className="border-border/50 my-2 border-t" />

            {isLoading ? (
              <div className="bg-muted h-10 w-full animate-pulse rounded-lg" />
            ) : session?.user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-foreground/80 hover:bg-muted hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                <IconLogout className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="text-foreground/80 hover:bg-muted hover:text-foreground block w-full rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors"
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
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

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
  )
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

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
  )
}
