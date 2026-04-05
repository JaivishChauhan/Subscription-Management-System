"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DEMO_CHECKOUT_DETAILS, DEMO_PAYMENT_DETAILS } from "@/lib/demo-data"
import { useCartStore } from "@/store/cart"
import { toast } from "sonner"
import { IconRocket, IconShoppingCart } from "@tabler/icons-react"
import { processCheckout } from "@/actions/checkout-actions"

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  company: z.string().optional(),
  phone: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  pincode: z.string().min(1, "Required"),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export function CheckoutClient() {
  const [step, setStep] = useState(2)
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  })
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const discount = useCartStore((s) => s.discount)
  const clearCart = useCartStore((s) => s.clearCart)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discountAmount = discount
    ? discount.type === "percent"
      ? Math.round(subtotal * (discount.value / 100))
      : discount.value
    : 0
  const tax = Math.round((subtotal - discountAmount) * 0.18)
  const total = subtotal - discountAmount + tax

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  })

  const onSubmit = async () => {
    if (step === 2) {
      setStep(3)
      return
    }
    // Get form values for the success page
    const values = getValues()
    const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 11)}`
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 11)}`
    const mockInvoiceId = `INV-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`

    const res = await processCheckout(items)
    if (res.error) {
      toast.error(res.error)
      return
    }

    const params = new URLSearchParams({
      amount: total.toString(),
      currency: "₹",
      customerName: values.fullName || "Customer",
      customerEmail: values.email || "",
      orderId: mockOrderId,
      paymentId: mockPaymentId,
      invoiceId: mockInvoiceId,
    })

    // Simulate payment submission but actually save the subscription
    toast.success("Payment confirmed! Subscription active.")
    clearCart()
    router.push(`/checkout/success?${params.toString()}`)
  }

  const handleAutofillBilling = () => {
    reset(DEMO_CHECKOUT_DETAILS)
    toast.success("Demo billing details added.")
  }

  const handleAutofillPayment = () => {
    setPaymentDetails(DEMO_PAYMENT_DETAILS)
    toast.success("Demo card details added.")
  }

  const steps = [
    { num: 1, label: "ORDER REVIEW" },
    { num: 2, label: "YOUR DETAILS" },
    { num: 3, label: "PAYMENT" },
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Navbar */}
      <nav className="border-border sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md">
        <Link
          href="/pricing"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] shadow-md">
            <IconRocket className="h-4 w-4 text-white" stroke={2} />
          </div>
          <span className="f-syne text-foreground text-[20px] font-bold">
            SubsMS
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="text-muted-foreground transition-colors hover:text-indigo-600"
          >
            <IconShoppingCart className="h-5 w-5" />
          </Link>
        </div>
      </nav>

      <div className="anim-up mx-auto max-w-5xl px-6 pt-10 pb-24">
        {/* Progress Stepper */}
        <div className="mb-12 flex items-center justify-center">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold shadow-sm transition-all ${
                    s.num <= step
                      ? "bg-indigo-600 text-white"
                      : "border-2 border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {s.num < step ? "✓" : s.num}
                </div>
                <span
                  className={`f-mono text-[11px] tracking-widest uppercase ${
                    s.num === step
                      ? "text-foreground font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-4 h-px w-24 ${
                    s.num < step ? "bg-indigo-600" : "bg-slate-200"
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
            <div className="border-border rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="f-mono text-muted-foreground text-[12px] font-medium">
                    Step 01
                  </span>
                  <h3 className="f-syne text-[16px] font-bold text-slate-700">
                    Order Review
                  </h3>
                </div>
                <button
                  onClick={() => router.push("/cart")}
                  className="f-mono text-[11px] font-bold text-indigo-600 uppercase hover:text-indigo-700 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Step 2 — Billing Details */}
            <div
              className={`border-border rounded-2xl border bg-white p-6 shadow-sm transition-opacity ${
                step === 2
                  ? "border-l-4 border-l-indigo-500"
                  : step > 2
                    ? ""
                    : "pointer-events-none opacity-50"
              }`}
            >
              <span className="f-mono text-muted-foreground text-[12px] font-medium">
                Step 02
              </span>
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="f-syne text-foreground text-[22px] font-bold">
                  Billing Details
                </h3>
                <button
                  type="button"
                  onClick={handleAutofillBilling}
                  className="f-mono rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-indigo-700 uppercase transition-colors hover:bg-indigo-100"
                >
                  Autofill demo data
                </button>
              </div>
              {step >= 2 && (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                  id="billing-form"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Full Name
                      </label>
                      <input
                        {...register("fullName")}
                        className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Jane Doe"
                      />
                      {errors.fullName && (
                        <span className="text-destructive text-[10px] font-medium">
                          {errors.fullName.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Email Address
                      </label>
                      <input
                        {...register("email")}
                        className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="jane@company.com"
                      />
                      {errors.email && (
                        <span className="text-destructive text-[10px] font-medium">
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Company (Optional)
                      </label>
                      <input
                        {...register("company")}
                        className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="TechCorp"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Phone Number
                      </label>
                      <input
                        {...register("phone")}
                        className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <span className="text-destructive text-[10px] font-medium">
                          {errors.phone.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                      Billing Address
                    </label>
                    <input
                      {...register("address")}
                      className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      placeholder="123 Tech Lane"
                    />
                    {errors.address && (
                      <span className="text-destructive text-[10px] font-medium">
                        {errors.address.message}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        City
                      </label>
                      <input
                        {...register("city")}
                        className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Mumbai"
                      />
                      {errors.city && (
                        <span className="text-destructive text-[10px] font-medium">
                          {errors.city.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        State / Province
                      </label>
                      <input
                        {...register("state")}
                        className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Maharashtra"
                      />
                      {errors.state && (
                        <span className="text-destructive text-[10px] font-medium">
                          {errors.state.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Pincode / ZIP
                      </label>
                      <input
                        {...register("pincode")}
                        className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="400001"
                      />
                      {errors.pincode && (
                        <span className="text-destructive text-[10px] font-medium">
                          {errors.pincode.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Country
                      </label>
                      <select className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500">
                        <option>India</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => router.push("/cart")}
                      className="f-mono text-muted-foreground hover:text-foreground text-[12px] font-bold"
                    >
                      ← Back
                    </button>
                    {step === 2 && (
                      <button
                        type="submit"
                        className="f-syne rounded-full bg-indigo-50 px-6 py-2.5 font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
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
              className={`border-border rounded-2xl border bg-white p-6 shadow-sm transition-opacity ${
                step === 3
                  ? "border-l-4 border-l-indigo-500"
                  : "pointer-events-none opacity-50"
              }`}
            >
              <span className="f-mono text-muted-foreground text-[12px] font-medium">
                Step 03
              </span>
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="f-syne text-foreground text-[22px] font-bold">
                  Payment
                </h3>
                <button
                  type="button"
                  onClick={handleAutofillPayment}
                  className="f-mono rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-indigo-700 uppercase transition-colors hover:bg-indigo-100"
                >
                  Use demo card
                </button>
              </div>
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                      Card Number
                    </label>
                    <input
                      value={paymentDetails.cardNumber}
                      onChange={(event) =>
                        setPaymentDetails((current) => ({
                          ...current,
                          cardNumber: event.target.value,
                        }))
                      }
                      className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Expiry
                      </label>
                      <input
                        value={paymentDetails.expiry}
                        onChange={(event) =>
                          setPaymentDetails((current) => ({
                            ...current,
                            expiry: event.target.value,
                          }))
                        }
                        className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="f-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        CVV
                      </label>
                      <input
                        value={paymentDetails.cvv}
                        onChange={(event) =>
                          setPaymentDetails((current) => ({
                            ...current,
                            cvv: event.target.value,
                          }))
                        }
                        className="f-mono border-border text-foreground w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-[13px] transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="•••"
                        type="password"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="f-mono text-muted-foreground hover:text-foreground text-[12px] font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      className="f-syne rounded-full bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-[0.98]"
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
            <div className="border-border sticky top-24 rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="f-syne text-foreground mb-6 text-lg font-bold">
                Order Summary
              </h2>
              <div className="f-mono space-y-3 text-[12px]">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <span className="text-foreground font-medium">
                        {item.name}
                      </span>
                      <span className="text-muted-foreground ml-1 text-[10px]">
                        {item.plan}
                      </span>
                    </div>
                    <span className="text-foreground font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                {discount && (
                  <div className="flex justify-between font-bold text-indigo-600">
                    <span>Discount {discount.code}</span>
                    <span>
                      -
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="text-muted-foreground flex justify-between">
                  <span>GST (18%)</span>
                  <span>
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(tax)}
                  </span>
                </div>
              </div>
              <div className="border-border mt-6 border-t pt-6">
                <p className="f-mono mb-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  Monthly Total
                </p>
                <p className="f-syne text-[36px] font-extrabold tracking-tight text-indigo-600">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(total)}
                </p>
              </div>
              <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                <p className="f-mono text-[10px] font-medium text-indigo-700">
                  Auto-renewal enabled. Cancel anytime before the next billing
                  cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
