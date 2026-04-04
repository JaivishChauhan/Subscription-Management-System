"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

export function CartClient() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const discount = useCartStore((s) => s.discount);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const applyDiscount = useCartStore((s) => s.applyDiscount);
  const removeDiscount = useCartStore((s) => s.removeDiscount);
  const [promoInput, setPromoInput] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const discountAmount = discount
    ? discount.type === "percent"
      ? Math.round(subtotal * (discount.value / 100))
      : discount.value
    : 0;
  const total = subtotal + tax - discountAmount;

  const handleApply = () => {
    if (promoInput.toUpperCase() === "SUMMER10") {
      applyDiscount({ code: "SUMMER10", type: "percent", value: 10 });
    }
    setPromoInput("");
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#1E2D42]/40 bg-[#0D1117]/80 px-6 backdrop-blur-md">
        <Link
          href="/pricing"
          className="f-syne text-[22px] font-bold text-[#E8EDF5]"
        >
          SubMS
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative text-[#00E5FF] transition-colors"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00E5FF] text-[9px] font-bold text-[#080B10]">
                {items.length}
              </span>
            )}
          </Link>
          <button className="text-[#8A9BB5] transition-colors hover:text-[#00E5FF]">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </nav>

      <div className="anim-up mx-auto max-w-6xl px-6 pb-24 pt-12">
        <h1 className="f-syne mb-2 text-[36px] font-extrabold text-[#E8EDF5]">
          Your Cart
        </h1>
        <p className="f-mono mb-10 text-[11px] uppercase tracking-widest text-[#4A5D78]">
          {items.length} ITEMS IN YOUR SUBSCRIPTION LIST
        </p>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Left: Cart Items */}
          <div className="space-y-4 lg:col-span-3">
            {items.length === 0 && (
              <div className="rounded-xl border border-[#1E2D42] bg-[#111820] p-12 text-center">
                <span className="material-symbols-outlined mb-4 block text-[48px] text-[#4A5D78]">
                  shopping_cart
                </span>
                <p className="f-mono text-sm text-[#8A9BB5]">
                  Your cart is empty
                </p>
                <Link
                  href="/pricing"
                  className="f-syne mt-2 inline-block text-sm font-bold text-[#00E5FF]"
                >
                  Browse Store →
                </Link>
              </div>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-[#1E2D42] bg-[#111820] p-4"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#1A2535]">
                  <span className="material-symbols-outlined text-[28px] text-[#00E5FF]">
                    cloud
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="f-syne text-[15px] font-semibold text-[#E8EDF5]">
                    {item.name}
                  </h3>
                  {item.plan && (
                    <span className="f-mono mt-1 inline-block rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/5 px-2.5 py-0.5 text-[11px] text-[#00E5FF]">
                      {item.plan}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="f-mono flex h-8 w-8 items-center justify-center border border-[#243347] text-[14px] text-[#8A9BB5] transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
                  >
                    −
                  </button>
                  <span className="f-mono w-8 text-center text-[14px] text-[#E8EDF5]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    className="f-mono flex h-8 w-8 items-center justify-center border border-[#243347] text-[14px] text-[#8A9BB5] transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
                  >
                    +
                  </button>
                </div>
                <span className="f-syne w-24 text-right text-[15px] font-bold text-[#E8EDF5]">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="f-mono text-[10px] uppercase tracking-wider text-[#EF4444] hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border border-[#1E2D42] bg-[#111820] p-6">
              <h2 className="f-syne mb-6 text-lg font-bold text-[#E8EDF5]">
                Order Summary
              </h2>
              <div className="f-mono space-y-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#8A9BB5]">Subtotal</span>
                  <span className="text-[#E8EDF5]">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9BB5]">Tax (GST 18%)</span>
                  <span className="text-[#E8EDF5]">₹{tax.toLocaleString()}</span>
                </div>
                {discount && (
                  <div className="flex justify-between">
                    <span className="text-[#EF4444]">Discount</span>
                    <span className="text-[#EF4444]">
                      -₹{discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {discount && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="f-mono flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-[12px] text-[#10B981]">
                    {discount.code}{" "}
                    <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>
                  </span>
                  <button
                    onClick={removeDiscount}
                    className="text-xs text-[#4A5D78] hover:text-[#EF4444]"
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
                    className="f-mono flex-1 rounded-sm border border-[#1E2D42] bg-[#0D1117] px-3 py-2 text-[12px] text-[#E8EDF5] outline-none placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50"
                    placeholder="Promo code"
                  />
                  <button
                    onClick={handleApply}
                    className="f-mono rounded-sm bg-[#1A2535] px-4 text-[12px] font-bold text-[#E8EDF5] transition-colors hover:bg-[#243347]"
                  >
                    Apply
                  </button>
                </div>
              )}

              <div className="mt-6 border-t border-[#1E2D42] pt-6">
                <p className="f-mono mb-1 text-[10px] uppercase tracking-widest text-[#4A5D78]">
                  Total / Month
                </p>
                <p className="f-syne text-[32px] font-extrabold text-[#00E5FF]">
                  ₹{total.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                disabled={items.length === 0}
                className="f-syne mt-6 w-full rounded-full bg-[#00E5FF] py-4 text-[14px] font-extrabold tracking-wide text-[#080B10] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                PROCEED TO CHECKOUT →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
