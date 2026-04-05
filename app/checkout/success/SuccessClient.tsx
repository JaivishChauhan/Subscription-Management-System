"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// ── Confetti config ──────────────────────────────────────────
const CONFETTI_COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
]
const CONFETTI_COUNT = 40

function generateConfetti() {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: `${6 + Math.random() * 8}px`,
    shape: Math.random() > 0.5 ? "circle" : "rect",
  }))
}
// ──────────────────────────────────────────────────────────────

export function SuccessClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(8)
  const [confetti, setConfetti] = useState<any[]>([])
  const [checkDone, setCheckDone] = useState(false)
  const timerRef = useRef<any>(null)

  const data = {
    paymentId: searchParams.get("paymentId") || "pay_demo123",
    orderId: searchParams.get("orderId") || "order_demo456",
    invoiceId: searchParams.get("invoiceId") || "INV-0000",
    amount: Number(searchParams.get("amount")) || 0,
    currency: searchParams.get("currency") || "₹",
    customerName: searchParams.get("customerName") || "Customer",
    customerEmail: searchParams.get("customerEmail") || "",
    method: "Simulated Payment",
  }

  useEffect(() => {
    // Mount animation
    requestAnimationFrame(() => setVisible(true))
    setConfetti(generateConfetti())

    // Checkmark draw delay
    setTimeout(() => setCheckDone(true), 500)

    // Countdown
    timerRef.current = setInterval(() => {
      setCountdown((p) => Math.max(0, p - 1))
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [router])

  useEffect(() => {
    if (countdown <= 0) {
      clearInterval(timerRef.current)
      router.push("/dashboard")
    }
  }, [countdown, router])

  const handleBack = () => {
    clearInterval(timerRef.current)
    router.push("/dashboard")
  }

  const shortPaymentId = data.paymentId
    ? `${data.paymentId.slice(0, 10)}...${data.paymentId.slice(-4)}`
    : "—"

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
      {/* ── Confetti ───────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute top-0 animate-confetti-fall"
            style={{
              left: c.left,
              animationDelay: c.delay,
              animationDuration: "1.4s",
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              borderRadius: c.shape === "circle" ? "50%" : "2px",
            }}
          />
        ))}
      </div>

      {/* ── Card ───────────────────────────────────────────── */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500" />

          <div className="p-8 text-center">
            {/* ── Animated Icon ──────────────────────────── */}
            <div className="relative mx-auto mb-6 h-24 w-24">
              {/* Pulse rings */}
              <div className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-300" />
              <div
                className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-200"
                style={{ animationDelay: "0.5s" }}
              />
              <div className="relative flex h-24 w-24 animate-payment-scale-in items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                <svg
                  className="h-12 w-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    style={{
                      strokeDasharray: 30,
                      strokeDashoffset: checkDone ? 0 : 30,
                      transition: "stroke-dashoffset 0.55s ease 0.3s",
                    }}
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="animate-fade-up-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Successful!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Your payment has been received and verified
              </p>
            </div>

            {/* Amount */}
            <div className="my-6 animate-fade-up-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="mb-1 text-xs font-semibold tracking-wider text-emerald-600 uppercase">
                Amount Paid
              </p>
              <p className="text-4xl font-bold text-emerald-700">
                {data.currency}
                {Number(data.amount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Details */}
            <div className="mb-6 animate-fade-up-2 space-y-3 rounded-2xl bg-gray-50 p-5 text-left">
              <DetailRow icon="🧾" label="Invoice" value={data.invoiceId} />
              <DetailRow icon="👤" label="Customer" value={data.customerName} />
              {data.customerEmail && (
                <DetailRow icon="📧" label="Email" value={data.customerEmail} />
              )}
              <DetailRow
                icon="🔑"
                label="Payment ID"
                value={shortPaymentId}
                mono
              />
              <DetailRow
                icon="📦"
                label="Order ID"
                value={data.orderId?.slice(0, 16) + "..." || "—"}
                mono
              />
              <DetailRow
                icon="📅"
                label="Date & Time"
                value={new Date().toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
            </div>

            {/* CTA */}
            <div className="animate-fade-up-3 space-y-3">
              <button
                onClick={handleBack}
                className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]"
              >
                ← Continue to Dashboard
              </button>
              <p className="text-xs text-gray-400">
                Auto-redirecting in{" "}
                <span className="font-bold text-emerald-600">{countdown}s</span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          A receipt will be sent to{" "}
          {data.customerEmail || "your registered email"}
        </p>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: string
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex flex-shrink-0 items-center gap-1.5 text-sm text-gray-500">
        <span>{icon}</span>
        {label}
      </span>
      <span
        className={`text-right text-sm font-medium break-all text-gray-800 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}
