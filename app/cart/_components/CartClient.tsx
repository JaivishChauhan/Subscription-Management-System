"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart"
import { IconShoppingCart, IconPackage, IconCloud } from "@tabler/icons-react"

export function CartClient() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const discount = useCartStore((s) => s.discount)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const applyDiscount = useCartStore((s) => s.applyDiscount)
  const removeDiscount = useCartStore((s) => s.removeDiscount)
  const [promoInput, setPromoInput] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const tax = Math.round(subtotal * 0.18)
  const discountAmount = discount
    ? discount.type === "percent"
      ? Math.round(subtotal * (discount.value / 100))
      : discount.value
    : 0
  const total = subtotal + tax - discountAmount

  const handleApply = () => {
    if (promoInput.toUpperCase() === "SUMMER10") {
      applyDiscount({ code: "SUMMER10", type: "percent", value: 10 })
    }
    setPromoInput("")
  }

  const handleCheckout = async () => {
    setIsCheckingAuth(true)
    try {
      const response = await fetch("/api/auth")
      const data = await response.json()

      if (data.session) {
        router.push("/checkout")
      } else {
        router.push("/login?callbackUrl=/checkout")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/login?callbackUrl=/checkout")
    } finally {
      setIsCheckingAuth(false)
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="anim-up mx-auto max-w-6xl px-6 pt-12 pb-24">
        <h1 className="f-syne text-foreground mb-2 text-[36px] font-extrabold">
          Your Cart
        </h1>
        <p className="f-mono mb-10 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
          {items.length} ITEMS IN YOUR SUBSCRIPTION LIST
        </p>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Left: Cart Items */}
          <div className="space-y-4 lg:col-span-3">
            {items.length === 0 && (
              <div className="border-border bg-card rounded-2xl border p-12 text-center shadow-sm">
                <IconShoppingCart className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                <p className="f-mono text-muted-foreground text-sm font-medium">
                  Your cart is empty
                </p>
                <Link
                  href="/pricing"
                  className="f-syne mt-2 inline-block text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Browse Store →
                </Link>
              </div>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="border-border bg-card flex items-start gap-4 rounded-2xl border p-4 shadow-sm"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                  {item.type === "bundle" ? (
                    <IconPackage className="h-7 w-7 text-indigo-500" />
                  ) : (
                    <IconCloud className="h-7 w-7 text-indigo-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="f-syne text-foreground text-[15px] font-bold">
                    {item.name}
                  </h3>
                  {item.type === "bundle" && item.services && (
                    <div className="mt-2 space-y-1">
                      {item.services.map((service, idx) => (
                        <div
                          key={idx}
                          className="text-muted-foreground flex items-center gap-1.5 text-xs"
                        >
                          <span className="h-1 w-1 rounded-full bg-indigo-500"></span>
                          {service}
                        </div>
                      ))}
                      {item.discount && item.discount > 0 && (
                        <span className="f-mono mt-2 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {item.discount}% Bundle Discount
                        </span>
                      )}
                    </div>
                  )}
                  {item.plan && !item.type && (
                    <span className="f-mono mt-1 inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {item.plan}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="f-mono border-border text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg border text-[14px] font-medium transition-colors hover:border-indigo-600 hover:bg-indigo-500/5 hover:text-indigo-600"
                  >
                    −
                  </button>
                  <span className="f-mono text-foreground w-8 text-center text-[14px] font-bold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="f-mono border-border text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg border text-[14px] font-medium transition-colors hover:border-indigo-600 hover:bg-indigo-500/5 hover:text-indigo-600"
                  >
                    +
                  </button>
                </div>
                <span className="f-syne text-foreground w-24 text-right text-[16px] font-bold">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(item.price * item.quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="f-mono text-destructive text-[10px] font-bold tracking-wider uppercase hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="border-border bg-card sticky top-24 rounded-2xl border p-6 shadow-sm">
              <h2 className="f-syne text-foreground mb-6 text-lg font-bold">
                Order Summary
              </h2>
              <div className="f-mono space-y-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-bold">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST 18%)</span>
                  <span className="text-foreground font-bold">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(tax)}
                  </span>
                </div>
                {discount && (
                  <div className="flex justify-between">
                    <span className="font-bold text-emerald-500">Discount</span>
                    <span className="font-bold text-emerald-500">
                      -
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(discountAmount)}
                    </span>
                  </div>
                )}
              </div>

              {discount && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="f-mono flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[12px] font-bold text-emerald-500 shadow-sm">
                    {discount.code}{" "}
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="text-muted-foreground hover:text-destructive text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {!discount && (
                <div className="mt-4 flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="f-mono border-border bg-muted text-foreground placeholder:text-muted-foreground/60 focus:bg-card flex-1 rounded-lg border px-3 py-2 text-[12px] transition-colors outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Promo code"
                  />
                  <button
                    type="button"
                    onClick={handleApply}
                    className="f-mono bg-foreground text-background rounded-lg px-4 text-[12px] font-bold shadow-sm transition-colors hover:opacity-80"
                  >
                    Apply
                  </button>
                </div>
              )}

              <div className="border-border mt-6 border-t pt-6">
                <p className="f-mono text-muted-foreground mb-1 text-[11px] font-bold tracking-widest uppercase">
                  Total / Month
                </p>
                <p className="f-syne text-[32px] font-extrabold tracking-tight text-indigo-600">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(total)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={items.length === 0 || isCheckingAuth}
                className="f-syne mt-6 w-full rounded-full bg-indigo-600 py-4 text-[14px] font-extrabold tracking-wide text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-indigo-700 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
              >
                {isCheckingAuth ? "CHECKING..." : "PROCEED TO CHECKOUT →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
