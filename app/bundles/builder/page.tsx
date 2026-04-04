"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  IconRocket,
  IconTrash,
  IconShoppingCart,
  IconArrowLeft,
} from "@tabler/icons-react"
import { useCartStore } from "@/store/cart"
import { useBundleStore } from "@/store/bundle"
import { toast } from "sonner"
import Image from "next/image"

export default function BundleBuilderPage() {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const {
    services,
    removeService,
    getFinalPrice,
    getTotalPrice,
    getDiscount,
    clearBundle,
  } = useBundleStore()
  const [bundleName, setBundleName] = useState("")

  const totalPrice = getTotalPrice()
  const finalPrice = getFinalPrice()
  const discountAmount = getDiscount()
  const discountPercentage =
    totalPrice > 0 ? (discountAmount / totalPrice) * 100 : 0

  const handleAddToCart = () => {
    if (services.length === 0) {
      toast.error("Please select at least one service from the shop")
      return
    }

    const selectedServiceNames = services.map((s) => s.name)

    const bundleItem = {
      id: `bundle-${Date.now()}`,
      name: bundleName || `Custom Bundle (${services.length} services)`,
      price: finalPrice,
      quantity: 1,
      plan: "Monthly" as const,
      type: "bundle" as const,
      services: selectedServiceNames,
      discount: discountPercentage,
    }

    addItem(bundleItem)
    toast.success("Bundle added to cart!")

    // Reset form and bundle store
    setBundleName("")
    clearBundle()

    // Navigate to cart
    setTimeout(() => {
      router.push("/cart")
    }, 500)
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/shop"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            <IconArrowLeft className="h-4 w-4" /> Back to App Marketplace
          </Link>
          <h1 className="text-3xl font-bold">Review Your Custom Bundle</h1>
          <p className="text-muted-foreground mt-2">
            Review your selected services and proceed to add them to your cart.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Service Selection review */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold">
                Bundle Name (Optional)
              </label>
              <input
                type="text"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                placeholder="My Custom Bundle"
                className="border-border bg-card w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <h2 className="mb-4 text-xl font-bold">
              Selected Services ({services.length})
            </h2>

            {services.length === 0 ? (
              <div className="border-border text-muted-foreground rounded-2xl border border-dashed p-12 text-center">
                <p className="mb-4">
                  You haven&apos;t added any apps to your bundle yet.
                </p>
                <Link
                  href="/shop"
                  className="btn-gradient inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  Browse App Store
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service) => {
                  return (
                    <div
                      key={service.id}
                      className="rounded-lg border border-indigo-500 bg-indigo-50 p-4 text-left transition-all dark:bg-indigo-900/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {service.logoUrl ? (
                            <div className="bg-card flex h-10 w-10 shrink-0 items-center justify-center rounded-lg p-1">
                              <Image
                                src={service.logoUrl}
                                alt={service.name}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-500 dark:bg-indigo-900/50">
                              {service.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                              {service.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(service.monthlyPrice)}</p>
                          <p className="text-muted-foreground text-xs">
                            /month
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeService(service.id)}
                          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                          <IconTrash className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {services.length > 0 && (
              <div className="bg-muted mt-6 flex justify-between rounded-xl p-4">
                <span className="text-sm font-medium">
                  Want to unlock higher discounts?
                </span>
                <Link
                  href="/shop"
                  className="text-sm font-semibold text-indigo-600 hover:underline"
                >
                  Add more apps +
                </Link>
              </div>
            )}
          </div>

          {/* Bundle Summary */}
          <div>
            <div className="border-border bg-card sticky top-24 rounded-lg border p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">Bundle Summary</h2>

              {services.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Select services to build your bundle
                </p>
              ) : (
                <>
                  <div className="custom-scrollbar mb-4 max-h-48 space-y-2 overflow-y-auto pr-2">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate pr-4">{service.name}</span>
                        <span className="font-semibold whitespace-nowrap">
                          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(service.monthlyPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-border border-t pt-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalPrice)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-semibold text-emerald-500">
                          Bundle Discount ({Math.round(discountPercentage)}%)
                        </span>
                        <span className="font-semibold text-emerald-500">
                          -{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="border-border mt-4 flex justify-between border-t pt-4">
                      <span className="font-bold">Total / Month</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(finalPrice)}
                      </span>
                    </div>
                  </div>

                  {services.length >= 3 && (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                      <p className="text-xs leading-snug font-semibold text-emerald-700 dark:text-emerald-400">
                        🎉 Great choice! You're saving {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(discountAmount)} every month.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    <IconShoppingCart className="h-5 w-5" />
                    Move to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
