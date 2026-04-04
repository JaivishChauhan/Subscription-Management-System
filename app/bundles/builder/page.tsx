"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconRocket, IconPlus, IconTrash, IconShoppingCart } from "@tabler/icons-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

export default function BundleBuilderPage() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [bundleName, setBundleName] = useState("");

  const availableServices = [
    { id: "1", name: "Netflix", price: 649, category: "Entertainment" },
    { id: "2", name: "Spotify", price: 119, category: "Music" },
    { id: "3", name: "ChatGPT Plus", price: 1500, category: "AI" },
    { id: "4", name: "Adobe Creative Cloud", price: 3999, category: "Design" },
    { id: "5", name: "Microsoft 365", price: 489, category: "Productivity" },
    { id: "6", name: "Dropbox", price: 799, category: "Storage" },
  ];

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const totalPrice = availableServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const discount = selectedServices.length >= 3 ? 0.15 : selectedServices.length >= 2 ? 0.1 : 0;
  const finalPrice = Math.round(totalPrice * (1 - discount));

  const handleAddToCart = () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    const selectedServiceNames = availableServices
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => s.name);

    const bundleItem = {
      id: `bundle-${Date.now()}`,
      name: bundleName || `Custom Bundle (${selectedServices.length} services)`,
      price: finalPrice,
      quantity: 1,
      plan: "Monthly" as const,
      type: "bundle" as const,
      services: selectedServiceNames,
      discount: discount * 100,
    };

    addItem(bundleItem);
    toast.success("Bundle added to cart!");
    
    // Reset form
    setSelectedServices([]);
    setBundleName("");
    
    // Navigate to cart after a short delay
    setTimeout(() => {
      router.push("/cart");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <BuilderNav />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Build Your Custom Bundle</h1>
          <p className="mt-2 text-muted-foreground">
            Select services and save up to 40% with our bundle discounts
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Service Selection */}
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

            <h2 className="mb-4 text-xl font-bold">Select Services</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {availableServices.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-border bg-card hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {service.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{service.price}</p>
                        <p className="text-xs text-muted-foreground">/month</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {isSelected ? (
                        <>
                          <IconTrash className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-semibold text-red-500">
                            Remove
                          </span>
                        </>
                      ) : (
                        <>
                          <IconPlus className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-semibold text-indigo-600">
                            Add to Bundle
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bundle Summary */}
          <div>
            <div className="sticky top-24 rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">Bundle Summary</h2>

              {selectedServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Select services to build your bundle
                </p>
              ) : (
                <>
                  <div className="mb-4 space-y-2">
                    {availableServices
                      .filter((s) => selectedServices.includes(s.id))
                      .map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{service.name}</span>
                          <span className="font-semibold">₹{service.price}</span>
                        </div>
                      ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">₹{totalPrice}</span>
                    </div>
                    {discount > 0 && (
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-emerald-500 font-semibold">
                          Bundle Discount ({Math.round(discount * 100)}%)
                        </span>
                        <span className="text-emerald-500 font-semibold">
                          -₹{totalPrice - finalPrice}
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

                  {selectedServices.length >= 2 && (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        🎉 You&apos;re saving ₹{totalPrice - finalPrice} per month!
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    <IconShoppingCart className="h-5 w-5" />
                    Add Bundle to Cart
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
            className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          >
            View Bundles
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
