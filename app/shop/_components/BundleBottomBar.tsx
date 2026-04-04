"use client"

import { useBundleStore } from "@/store/bundle"
import { IconChevronRight, IconShoppingCartPlus } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function BundleBottomBar() {
  const { services, getTotalPrice, getDiscount, getFinalPrice } =
    useBundleStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || services.length === 0) {
    return null
  }

  const finalPrice = getFinalPrice()
  const maxAvatars = 5

  return (
    <div className="border-border bg-card fixed right-0 bottom-0 left-0 z-50 translate-y-0 border-t p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-transform duration-300 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left section: Services info */}
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {services.slice(0, maxAvatars).map((svc, i) => (
              <div
                key={svc.id}
                className="border-card bg-muted z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm"
                style={{ zIndex: 10 - i }}
                title={svc.name}
              >
                <span className="text-foreground text-xs font-bold">
                  {svc.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            ))}
            {services.length > maxAvatars && (
              <div className="border-card z-0 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-indigo-100 shadow-sm dark:bg-indigo-900/50">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  +{services.length - maxAvatars}
                </span>
              </div>
            )}
          </div>

          <div className="hidden sm:block">
            <p className="text-foreground text-sm font-semibold">
              {services.length} app{services.length !== 1 ? "s" : ""} added to
              bundle
            </p>
            <p className="text-muted-foreground text-xs">
              Combine more to increase your discount
            </p>
          </div>
        </div>

        {/* Right section: Price and Action */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-foreground text-sm font-bold">
              ₹{finalPrice}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                / mon
              </span>
            </p>
            {getDiscount() > 0 && (
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                Saving ₹{getDiscount()}
              </p>
            )}
          </div>

          <Link
            href="/bundles/builder"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconShoppingCartPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Review Bundle</span>
            <span className="sm:hidden">Review</span>
            <IconChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
