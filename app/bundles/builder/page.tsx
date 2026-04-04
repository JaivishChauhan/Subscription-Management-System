"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconRocket, IconTrash, IconShoppingCart, IconArrowLeft } from "@tabler/icons-react";
import { useCartStore } from "@/store/cart";
import { useBundleStore } from "@/store/bundle";
import { toast } from "sonner";
import Image from "next/image";

export default function BundleBuilderPage() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { services, removeService, getFinalPrice, getTotalPrice, getDiscount, clearBundle } = useBundleStore();
  const [bundleName, setBundleName] = useState("");

  const totalPrice = getTotalPrice();
  const finalPrice = getFinalPrice();
  const discountAmount = getDiscount();
  const discountPercentage = totalPrice > 0 ? (discountAmount / totalPrice) * 100 : 0;

  const handleAddToCart = () => {
    if (services.length === 0) {
      toast.error("Please select at least one service from the shop");
      return;
    }

    const selectedServiceNames = services.map((s) => s.name);

    const bundleItem = {
      id: `bundle-${Date.now()}`,
      name: bundleName || `Custom Bundle (${services.length} services)`,
      price: finalPrice,
      quantity: 1,
      plan: "Monthly" as const,
      type: "bundle" as const,
      services: selectedServiceNames,
      discount: discountPercentage,
    };

    addItem(bundleItem);
    toast.success("Bundle added to cart!");
    
    // Reset form and bundle store
    setBundleName("");
    clearBundle();
    
    // Navigate to cart
    setTimeout(() => {
      router.push("/cart");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <BuilderNav />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline mb-4">
             <IconArrowLeft className="h-4 w-4" /> Back to App Marketplace
          </Link>
          <h1 className="text-3xl font-bold">Review Your Custom Bundle</h1>
          <p className="mt-2 text-muted-foreground">
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
                className="w-full rounded-lg border border-border bg-card px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <h2 className="mb-4 text-xl font-bold">Selected Services ({services.length})</h2>
            
            {services.length === 0 ? (
               <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                 <p className="mb-4">You haven&apos;t added any apps to your bundle yet.</p>
                 <Link href="/shop" className="btn-gradient inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm">
                   Browse App Store
                 </Link>
               </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service) => {
                  return (
                    <div
                      key={service.id}
                      className="rounded-lg border border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-4 text-left transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           {service.logoUrl ? (
                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card p-1">
                               <Image src={service.logoUrl} alt={service.name} width={24} height={24} className="object-contain" />
                             </div>
                           ) : (
                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-500 dark:bg-indigo-900/50">
                               {service.name.charAt(0)}
                             </div>
                           )}
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {service.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{service.monthlyPrice}</p>
                          <p className="text-xs text-muted-foreground">/month</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeService(service.id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-md transition-colors"
                        >
                          <IconTrash className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {services.length > 0 && (
              <div className="mt-6 flex justify-between rounded-xl bg-muted p-4">
                <span className="text-sm font-medium">Want to unlock higher discounts?</span>
                <Link href="/shop" className="text-sm font-semibold text-indigo-600 hover:underline">Add more apps +</Link>
              </div>
            )}
          </div>

          {/* Bundle Summary */}
          <div>
            <div className="sticky top-24 rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">Bundle Summary</h2>

              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Select services to build your bundle
                </p>
              ) : (
                <>
                  <div className="mb-4 max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate pr-4">{service.name}</span>
                        <span className="font-semibold whitespace-nowrap">₹{service.monthlyPrice}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">₹{totalPrice}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-emerald-500 font-semibold">
                          Bundle Discount ({Math.round(discountPercentage)}%)
                        </span>
                        <span className="text-emerald-500 font-semibold">
                          -₹{discountAmount}
                        </span>
                      </div>
                    )}
                    <div className="mt-4 flex justify-between border-t border-border pt-4">
                      <span className="font-bold">Total / Month</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        ₹{finalPrice}
                      </span>
                    </div>
                  </div>

                  {services.length >= 3 && (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 leading-snug">
                        🎉 Great choice! You're saving ₹{discountAmount} every month.
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
  );
}

function BuilderNav() {
  const items = useCartStore((s) => s.items);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md transition-transform group-hover:scale-105">
            <IconRocket className="h-5 w-5 text-white" stroke={2} />
          </div>
          <span className="text-xl font-bold text-gradient">Bundle Builder</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/cart"
            className="relative text-indigo-600 transition-colors hover:text-indigo-700"
          >
            <IconShoppingCart className="h-6 w-6" />
            {items.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                {items.length}
              </span>
            )}
          </Link>
          <Link
            href="/bundles"
            className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground hidden sm:block"
          >
            View Predefined Bundles
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 hidden sm:block"
          >
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
