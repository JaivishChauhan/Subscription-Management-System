"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  company: z.string().optional(),
  phone: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  pincode: z.string().min(1, "Required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutClient() {
  const [step, setStep] = useState(2);
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const discount = useCartStore((s) => s.discount);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = discount
    ? discount.type === "percent"
      ? Math.round(subtotal * (discount.value / 100))
      : discount.value
    : 0;
  const tax = Math.round((subtotal - discountAmount) * 0.18);
  const total = subtotal - discountAmount + tax;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema) });

  const onSubmit = (data: CheckoutFormValues) => {
    if (step === 2) {
      setStep(3);
      return;
    }
    // Simulate payment submission
    toast.success("Payment confirmed! Subscription active.");
    clearCart();
    router.push("/pricing");
  };

  const steps = [
    { num: 1, label: "ORDER REVIEW" },
    { num: 2, label: "YOUR DETAILS" },
    { num: 3, label: "PAYMENT" },
  ];

  return (
    <div className="grid-bg min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#1E2D42]/40 bg-[#0D1117]/80 px-6 backdrop-blur-md">
        <Link
          href="/pricing"
          className="f-syne text-[22px] font-bold text-[#E8EDF5]"
        >
          SubMS
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="text-[#8A9BB5] transition-colors hover:text-[#00E5FF]"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
          </Link>
        </div>
      </nav>

      <div className="anim-up mx-auto max-w-5xl px-6 pb-24 pt-10">
        {/* Progress Stepper */}
        <div className="mb-12 flex items-center justify-center">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold ${
                    s.num <= step
                      ? "bg-[#00E5FF] text-[#080B10]"
                      : "border-2 border-[#243347] text-[#4A5D78]"
                  }`}
                >
                  {s.num < step ? "✓" : s.num}
                </div>
                <span
                  className={`f-mono text-[11px] uppercase tracking-widest ${
                    s.num === step
                      ? "font-bold text-[#E8EDF5]"
                      : "text-[#4A5D78]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-4 h-px w-24 ${
                    s.num < step ? "bg-[#00E5FF]" : "bg-[#243347]"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: Steps */}
          <div className="space-y-4 lg:col-span-3">
            {/* Step 1 — Order Review */}
            <div className="rounded-xl border border-[#1E2D42] bg-[#111820] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="f-mono text-[12px] text-[#4A5D78]">
                    Step 01
                  </span>
                  <h3 className="f-syne text-[16px] font-bold text-[#8A9BB5]">
                    Order Review
                  </h3>
                </div>
                <button
                  onClick={() => router.push("/cart")}
                  className="f-mono text-[11px] uppercase text-[#00E5FF] hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Step 2 — Billing Details */}
            <div
              className={`rounded-xl border border-[#1E2D42] bg-[#111820] p-6 ${
                step === 2
                  ? "border-l-2 border-l-[#00E5FF]"
                  : step > 2
                  ? ""
                  : "pointer-events-none opacity-40"
              }`}
            >
              <span className="f-mono text-[12px] text-[#4A5D78]">Step 02</span>
              <h3 className="f-syne mb-6 text-[22px] font-bold text-[#E8EDF5]">
                Billing Details
              </h3>
              {step >= 2 && (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                  id="billing-form"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        Full Name
                      </label>
                      <input
                        {...register("fullName")}
                        className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#111820] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                        placeholder="Jane Doe"
                      />
                      {errors.fullName && (
                        <span className="text-[10px] text-[#EF4444]">
                          {errors.fullName.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        Email Address
                      </label>
                      <input
                        {...register("email")}
                        className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#111820] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                        placeholder="jane@company.com"
                      />
                      {errors.email && (
                        <span className="text-[10px] text-[#EF4444]">
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        Company (Optional)
                      </label>
                      <input
                        {...register("company")}
                        className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#111820] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                        placeholder="TechCorp"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        Phone Number
                      </label>
                      <input
                        {...register("phone")}
                        className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#111820] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <span className="text-[10px] text-[#EF4444]">
                          {errors.phone.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                      Billing Address
                    </label>
                    <input
                      {...register("address")}
                      className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#111820] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                      placeholder="123 Tech Lane"
                    />
                    {errors.address && (
                      <span className="text-[10px] text-[#EF4444]">
                        {errors.address.message}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        City
                      </label>
                      <input
                        {...register("city")}
                        className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#111820] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                        placeholder="Mumbai"
                      />
                      {errors.city && (
                        <span className="text-[10px] text-[#EF4444]">
                          {errors.city.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        State / Province
                      </label>
                      <input
                        {...register("state")}
                        className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#111820] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                        placeholder="Maharashtra"
                      />
                      {errors.state && (
                        <span className="text-[10px] text-[#EF4444]">
                          {errors.state.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        Pincode / ZIP
                      </label>
                      <input
                        {...register("pincode")}
                        className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#111820] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                        placeholder="400001"
                      />
                      {errors.pincode && (
                        <span className="text-[10px] text-[#EF4444]">
                          {errors.pincode.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        Country
                      </label>
                      <select className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#111820] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors focus:border-[#00E5FF]/50 outline-none">
                        <option>India</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => router.push("/cart")}
                      className="f-mono text-[12px] text-[#8A9BB5] hover:text-[#E8EDF5]"
                    >
                      ← Back
                    </button>
                    {step === 2 && (
                      <button
                        type="submit"
                        className="f-syne font-semibold text-[#00E5FF] hover:text-[#00E5FF]/80"
                      >
                        Continue to Payment →
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Step 3 — Payment */}
            <div
              className={`rounded-xl border border-[#1E2D42] bg-[#111820] p-6 ${
                step === 3
                  ? "border-l-2 border-l-[#00E5FF]"
                  : "pointer-events-none opacity-40"
              }`}
            >
              <span className="f-mono text-[12px] text-[#4A5D78]">Step 03</span>
              <h3 className="f-syne mb-6 text-[22px] font-bold text-[#E8EDF5]">
                Payment
              </h3>
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                      Card Number
                    </label>
                    <input
                      className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#0D1117] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        Expiry
                      </label>
                      <input
                        className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#0D1117] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] uppercase tracking-widest text-[#4A5D78]">
                        CVV
                      </label>
                      <input
                        className="f-mono w-full rounded-sm border border-[#1E2D42] bg-[#0D1117] px-3 py-2.5 text-[13px] text-[#E8EDF5] transition-colors placeholder:text-[#4A5D78] focus:border-[#00E5FF]/50 outline-none"
                        placeholder="•••"
                        type="password"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="f-mono text-[12px] text-[#8A9BB5] hover:text-[#E8EDF5]"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      className="f-syne rounded-full bg-[#00E5FF] px-6 py-2.5 font-bold text-[#080B10] transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                      Confirm Payment →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border border-[#1E2D42] bg-[#111820] p-6">
              <h2 className="f-syne mb-6 text-lg font-bold text-[#E8EDF5]">
                Order Summary
              </h2>
              <div className="f-mono space-y-3 text-[12px]">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <span className="text-[#E8EDF5]">{item.name}</span>
                      <span className="ml-1 text-[10px] text-[#4A5D78]">
                        {item.plan}
                      </span>
                    </div>
                    <span className="text-[#E8EDF5]">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                {discount && (
                  <div className="flex justify-between text-[#00E5FF]">
                    <span>Discount {discount.code}</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8A9BB5]">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-6 border-t border-[#1E2D42] pt-6">
                <p className="f-mono mb-1 text-[11px] uppercase tracking-widest text-[#4A5D78]">
                  Monthly Total
                </p>
                <p className="f-syne text-[36px] font-extrabold text-[#00E5FF]">
                  ₹{total.toLocaleString()}
                </p>
              </div>
              <div className="mt-4 rounded-lg border border-[#1E2D42] bg-[#0D1117] p-3">
                <p className="f-mono text-[10px] text-[#4A5D78]">
                  Auto-renewal enabled. Cancel anytime before the next billing
                  cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
