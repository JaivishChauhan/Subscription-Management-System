"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconShoppingCart,
  IconArrowLeft,
  IconSearch,
  IconPlus,
  IconX,
} from "@tabler/icons-react"
import { useCartStore } from "@/store/cart"
import { useBundleStore, BundleService } from "@/store/bundle"
import { toast } from "sonner"
import Image from "next/image"

interface BundleBuilderClientProps {
  availableServices: BundleService[]
}

export function BundleBuilderClient({
  availableServices,
}: BundleBuilderClientProps) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const {
    services,
    addService,
    removeService,
    getFinalPrice,
    getTotalPrice,
    getDiscount,
    clearBundle,
  } = useBundleStore()
  const [bundleName, setBundleName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

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

  const selectedApiIds = new Set(services.map((s) => s.id))

  const filteredAvailableServices = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return a few suggestions if no search
      return availableServices
        .filter((s) => !selectedApiIds.has(s.id))
        .slice(0, 8)
    }
    return availableServices.filter(
      (s) =>
        !selectedApiIds.has(s.id) &&
        (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [availableServices, searchQuery, selectedApiIds])

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
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            <div className="bg-card border-border rounded-xl border p-6">
              <label className="mb-2 block text-sm font-semibold">
                Bundle Name (Optional)
              </label>
              <input
                type="text"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                placeholder="My Custom Bundle"
                className="border-border bg-background w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Add / Search Section */}
            <div className="bg-card border-border rounded-xl border p-6">
              <h2 className="mb-4 text-xl font-bold">Quick Add Services</h2>
              <div className="relative mb-4">
                <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search to add more apps..."
                  className="border-border bg-background w-full rounded-full border py-2.5 pr-4 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {filteredAvailableServices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredAvailableServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => addService(service)}
                      className="group flex items-center justify-between gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 py-1.5 pr-3 pl-2 text-sm transition-colors hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40"
                    >
                      <div className="flex items-center gap-2">
                        {service.logoUrl ? (
                          <div className="bg-card flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0.5">
                            <Image
                              src={service.logoUrl}
                              alt={service.name}
                              width={16}
                              height={16}
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-[10px] font-bold text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200">
                            {service.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-foreground font-medium">
                          {service.name}
                        </span>
                      </div>
                      <IconPlus className="text-muted-foreground h-3.5 w-3.5 group-hover:text-indigo-600" />
                    </button>
                  ))}
                  {!searchQuery && (
                    <Link
                      href="/shop"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 rounded-full border border-transparent px-3 py-1.5 text-sm transition-colors"
                    >
                      More...
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {searchQuery
                    ? "No services found."
                    : "All suggestions added."}
                </p>
              )}
            </div>

            {/* Selected Services section */}
            <div>
              <h2 className="mb-4 text-xl font-bold">
                Selected Services ({services.length})
              </h2>

              {services.length === 0 ? (
                <div className="border-border text-muted-foreground flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                  <p className="mb-4">
                    You haven&apos;t added any apps to your bundle yet.
                  </p>
                  <p className="text-sm">
                    Search and add apps from the list above!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="group relative flex items-start gap-4 rounded-xl border border-indigo-500 bg-indigo-50 p-4 text-left transition-all hover:shadow-md dark:bg-indigo-900/20"
                    >
                      <button
                        onClick={() => removeService(service.id)}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-800/80"
                        title="Remove service"
                      >
                        <IconX className="h-3.5 w-3.5" />
                      </button>

                      {service.logoUrl ? (
                        <div className="bg-card flex h-12 w-12 shrink-0 items-center justify-center rounded-lg p-1.5 shadow-sm">
                          <Image
                            src={service.logoUrl}
                            alt={service.name}
                            width={28}
                            height={28}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg font-bold text-indigo-500 shadow-sm dark:bg-indigo-900/50">
                          {service.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-foreground font-semibold">
                              {service.name}
                            </h3>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              {service.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground font-bold">
                              {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              }).format(service.monthlyPrice)}
                            </p>
                            <p className="text-muted-foreground text-[10px]/tight">
                              /mo
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bundle Summary */}
          <div>
            <div className="border-border bg-card sticky top-24 rounded-xl border p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">Bundle Summary</h2>

              {services.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Select services to build your bundle
                </p>
              ) : (
                <>
                  <div className="custom-scrollbar mb-4 max-h-48 space-y-3 overflow-y-auto pr-2">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {service.logoUrl ? (
                            <Image
                              src={service.logoUrl}
                              alt={service.name}
                              width={16}
                              height={16}
                              className="h-4 w-4 shrink-0 rounded-sm object-contain"
                            />
                          ) : (
                            <div className="h-4 w-4 shrink-0 rounded-sm bg-indigo-100 text-center text-[10px] font-bold text-indigo-500 dark:bg-indigo-900/50">
                              {service.name.charAt(0)}
                            </div>
                          )}
                          <span className="truncate">{service.name}</span>
                        </div>
                        <span className="pl-4 font-medium whitespace-nowrap">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(service.monthlyPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-border border-t pt-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(totalPrice)}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Bundle Discount ({Math.round(discountPercentage)}%)
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          -
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="border-border mt-4 flex justify-between border-t pt-4">
                      <span className="font-bold">Total / Month</span>
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(finalPrice)}
                      </span>
                    </div>
                  </div>

                  {services.length >= 3 && (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                      <p className="text-xs leading-snug font-semibold text-emerald-700 dark:text-emerald-400">
                        🎉 Great choice! You're saving{" "}
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(discountAmount)}{" "}
                        every month.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
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
