"use client"

import Image from "next/image"
import {
  IconApps,
  IconPlus,
  IconShoppingCart,
  IconCheck,
} from "@tabler/icons-react"
import { Service } from "@prisma/client"
import { useBundleStore } from "@/store/bundle"
import { useCartStore } from "@/store/cart"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export function ServiceCardClient({ service }: { service: Service }) {
  const { services, addService, removeService } = useBundleStore()
  const { addItem } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAddedToBundle = services.some((s) => s.id === service.id)

  const handleToggleBundle = () => {
    if (isAddedToBundle) {
      removeService(service.id)
      toast.success(`${service.name} removed from bundle`)
    } else {
      addService({
        id: service.id,
        name: service.name,
        category: service.category,
        monthlyPrice: service.monthlyPrice,
        logoUrl: service.logoUrl,
      })
      toast.success(`${service.name} added to bundle`)
    }
  }

  const handleAddToCart = () => {
    addItem({
      id: service.id,
      name: service.name,
      price: service.monthlyPrice,
      quantity: 1,
      plan: "Monthly",
      type: "plan",
    })
    toast.success(`${service.name} added to cart`)
  }

  return (
    <div className="group border-border bg-card relative flex flex-col rounded-2xl border p-5 shadow-sm transition-all hover:border-indigo-500 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="bg-muted relative flex h-14 w-14 items-center justify-center rounded-xl p-2">
          {service.logoUrl ? (
            <Image
              src={service.logoUrl}
              alt={service.name}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <IconApps className="text-muted-foreground h-8 w-8" />
          )}
        </div>
        <div className="text-right">
          <span className="text-foreground text-lg font-bold">
            ₹{service.monthlyPrice}
          </span>
          <p className="text-muted-foreground text-xs font-medium">/ month</p>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <h3 className="text-foreground line-clamp-1 text-lg font-bold">
          {service.name}
        </h3>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
          {service.description ||
            "Premium service seamlessly integrated into your bundle."}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={handleToggleBundle}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            mounted && isAddedToBundle
              ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400"
          }`}
        >
          {mounted && isAddedToBundle ? (
            <>
              <IconCheck className="h-4 w-4" />
              In Bundle
            </>
          ) : (
            <>
              <IconPlus className="h-4 w-4" />
              Add to Bundle
            </>
          )}
        </button>

        <button
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <IconShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
