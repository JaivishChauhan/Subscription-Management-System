"use client"

import Link from "next/link"
import Image from "next/image"
import { IconShoppingCart, IconApps } from "@tabler/icons-react"
import { Bundle, BundleService, Service } from "@prisma/client"
import { computeBundleFinalPrice } from "@/types/bundle"
import { useCartStore } from "@/store/cart"
import { toast } from "sonner"
import { useState } from "react"

type BundleWithServices = Bundle & {
  services: (BundleService & { service: Service })[]
}

export function BundleCardClient({
  bundle,
  originalPrice,
  finalPrice,
}: {
  bundle: BundleWithServices
  originalPrice: number
  finalPrice: number
}) {
  const addItem = useCartStore((s) => s.addItem)
  const [selectedPlan, setSelectedPlan] = useState("Monthly")

  const getPriceMultiplier = () => {
    switch (selectedPlan) {
      case "Daily":
        return 1 / 30
      case "Weekly":
        return 1 / 4
      case "Monthly":
        return 1
      case "Quarterly":
        return 3
      case "Yearly":
        return 12 // Assume 12 months for bundles for simplicity, unless we read service's yearly price
      default:
        return 1
    }
  }

  const multiplier = getPriceMultiplier()
  const adjOriginalPrice = originalPrice * multiplier
  const adjFinalPrice = finalPrice * multiplier

  const handleAddToCart = () => {
    const selectedServiceNames = bundle.services.map((bs) => bs.service.name)
    // Determine an approximate discount percentage for the UI
    const discountPercent =
      adjOriginalPrice > 0
        ? ((adjOriginalPrice - adjFinalPrice) / adjOriginalPrice) * 100
        : 0

    const bundleItem = {
      id: `pre-bundle-${bundle.id}-${selectedPlan.toLowerCase()}`,
      name: `${bundle.name} (${selectedPlan} Plan)`,
      price: adjFinalPrice,
      quantity: 1,
      plan: selectedPlan,
      discount: discountPercent,
    }

    addItem(bundleItem)
    toast.success(`${bundle.name} added to cart!`)
  }

  return (
    <div className="border-border bg-card relative flex flex-col rounded-2xl border p-6 transition-all hover:border-indigo-500/50 hover:shadow-xl sm:p-8">
      <h3 className="text-xl font-bold">{bundle.name}</h3>
      <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
        {bundle.description}
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(adjFinalPrice)}
          </span>
          <span className="text-muted-foreground text-sm line-through">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(adjOriginalPrice)}
          </span>
        </div>
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="border-border bg-card text-muted-foreground w-1/2 rounded border px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="bg-foreground text-background hover:bg-foreground/90 mt-8 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors focus:ring-2 focus:ring-indigo-500 focus-visible:outline-none"
      >
        <IconShoppingCart className="h-4 w-4" />
        Add to Cart
      </button>

      <div className="border-border mt-8 flex-1 border-t pt-6">
        <p className="text-foreground mb-4 text-sm font-semibold">
          Includes ({bundle.services.length} apps):
        </p>
        <ul className="space-y-3">
          {bundle.services.map((bs) => (
            <li key={bs.serviceId} className="flex items-center gap-3 text-sm">
              <div className="bg-muted relative flex h-6 w-6 shrink-0 items-center justify-center rounded p-1">
                {bs.service.logoUrl ? (
                  <Image
                    src={bs.service.logoUrl}
                    alt={bs.service.name}
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                ) : (
                  <IconApps className="text-muted-foreground h-4 w-4" />
                )}
              </div>
              <span className="text-muted-foreground flex-1 truncate">
                {bs.service.name}
              </span>
              <span className="text-foreground/50 text-xs font-medium">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(bs.service.monthlyPrice)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
