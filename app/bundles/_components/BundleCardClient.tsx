"use client";

import Link from "next/link";
import Image from "next/image";
import { IconShoppingCart, IconApps } from "@tabler/icons-react";
import { Bundle, BundleService, Service } from "@prisma/client";
import { computeBundleFinalPrice } from "@/types/bundle";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

type BundleWithServices = Bundle & { services: (BundleService & { service: Service })[] };

export function BundleCardClient({ bundle, originalPrice, finalPrice }: { bundle: BundleWithServices, originalPrice: number, finalPrice: number }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    const selectedServiceNames = bundle.services.map((bs) => bs.service.name);
    // Determine an approximate discount percentage for the UI
    const discountPercent = originalPrice > 0 ? ((originalPrice - finalPrice) / originalPrice) * 100 : 0;

    const bundleItem = {
      id: `pre-bundle-${bundle.id}`,
      name: bundle.name,
      price: finalPrice,
      quantity: 1,
      plan: "Monthly" as const,
      type: "bundle" as const,
      services: selectedServiceNames,
      discount: discountPercent,
    };

    addItem(bundleItem);
    toast.success(`${bundle.name} added to cart!`);
  };

  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all hover:shadow-xl hover:border-indigo-500/50">
      <h3 className="text-xl font-bold">{bundle.name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
        {bundle.description}
      </p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(finalPrice)}</span>
        <span className="text-sm text-muted-foreground line-through">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(originalPrice)}</span>
        <span className="text-sm text-emerald-500 font-semibold">/mo</span>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-8 flex items-center justify-center gap-2 w-full rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <IconShoppingCart className="h-4 w-4" />
        Add to Cart
      </button>

      <div className="mt-8 border-t border-border pt-6 flex-1">
        <p className="mb-4 text-sm font-semibold text-foreground">Includes ({bundle.services.length} apps):</p>
        <ul className="space-y-3">
          {bundle.services.map((bs) => (
            <li key={bs.serviceId} className="flex items-center gap-3 text-sm">
              <div className="relative h-6 w-6 shrink-0 rounded bg-muted flex items-center justify-center p-1">
                {bs.service.logoUrl ? (
                  <Image src={bs.service.logoUrl} alt={bs.service.name} width={16} height={16} className="object-contain" />
                ) : (
                  <IconApps className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className="text-muted-foreground truncate flex-1">{bs.service.name}</span>
              <span className="text-xs font-medium text-foreground/50">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(bs.service.monthlyPrice)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
