"use client"

import { useState } from "react"
import Link from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconCheck,
  IconClockHour4,
  IconCreditCard,
  IconReceipt2,
} from "@tabler/icons-react"
import { toast } from "sonner"

type InvoiceBillingClientProps = {
  razorpayEnabled: boolean
  invoice: {
    id: string
    invoiceNumber: string
    status: string
    createdAt: string
    dueDate: string | null
    subtotal: number
    taxTotal: number
    discountTotal: number
    total: number
    amountDue: number
    notes: string | null
    subscriptionNumber: string
    planName: string
    paymentTerms: string
    customer: {
      name: string
      email: string
      phone: string
      address: string
    }
    company: {
      name: string
      email: string
      address: string
      gstin: string | null
    }
    lineItems: Array<{
      id: string
      description: string
      quantity: number
      unitPrice: number
      taxAmount: number
      subtotal: number
    }>
    payments: Array<{
      id: string
      amount: number
      paymentMethod: string
      paymentDate: string
    }>
  }
}

type RazorpaySuccessResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type RazorpayFailureResponse = {
  error: {
    description?: string
    reason?: string
  }
}

type RazorpayInstance = {
  on: (
    event: string,
    callback: (response: RazorpayFailureResponse) => void
  ) => void
  open: () => void
}

type RazorpayConstructor = new (
  options: Record<string, unknown>
) => RazorpayInstance

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

export function InvoiceBillingClient({
  razorpayEnabled,
  invoice,
}: InvoiceBillingClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [error, setError] = useState("")

  const canPay =
    razorpayEnabled &&
    invoice.amountDue > 0 &&
    invoice.status !== "paid" &&
    invoice.status !== "cancelled"

  const handlePayNow = async () => {
    if (!canPay) {
      return
    }

    if (!scriptReady || !window.Razorpay) {
      setError(
        "The Razorpay checkout script is still loading. Please try again."
      )
      return
    }

    setLoading(true)
    setError("")

    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
        }),
      })

      const orderData = (await orderResponse.json()) as {
        error?: string
        key_id?: string
        amount?: number
        currency?: string
        orderId?: string
      }

      if (
        !orderResponse.ok ||
        !orderData.key_id ||
        !orderData.orderId ||
        !orderData.amount
      ) {
        throw new Error(
          orderData.error || "Could not initiate Razorpay checkout."
        )
      }

      const razorpay = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: invoice.company.name,
        description: `Payment for ${invoice.invoiceNumber}`,
        order_id: orderData.orderId,
        prefill: {
          name: invoice.customer.name,
          email: invoice.customer.email,
          contact: invoice.customer.phone,
        },
        notes: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerEmail: invoice.customer.email,
        },
        theme: {
          color: "#0f766e",
        },
        config: {
          display: {
            blocks: {
              primary: {
                name: "Pay with UPI, Cards, NetBanking or Wallets",
                instruments: [
                  { method: "upi" },
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                ],
              },
            },
            sequence: ["block.primary"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                invoiceId: invoice.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = (await verifyResponse.json()) as {
              success?: boolean
              error?: string
            }

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.error ||
                  "Payment was authorized but verification failed."
              )
            }

            toast.success(`Payment received for ${invoice.invoiceNumber}.`)
            router.refresh()
          } catch (verifyError) {
            const message =
              verifyError instanceof Error
                ? verifyError.message
                : "Payment verification failed. Please contact support."
            setError(message)
            toast.error(message)
          } finally {
            setLoading(false)
          }
        },
      })

      razorpay.on("payment.failed", (response: RazorpayFailureResponse) => {
        const message =
          response.error.description || "Payment failed. Please try again."
        setError(message)
        toast.error(message)
        setLoading(false)
      })

      razorpay.open()
      setLoading(false)
    } catch (paymentError) {
      const message =
        paymentError instanceof Error
          ? paymentError.message
          : "Could not initiate payment. Please try again."
      setError(message)
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecfeff_0%,#f8fafc_35%,#f8fafc_100%)]">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() =>
          setError(
            "Razorpay checkout could not be loaded. Please refresh and try again."
          )
        }
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back to invoices
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
                <IconReceipt2 className="h-6 w-6" stroke={1.8} />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-teal-700 uppercase">
                  Invoice Billing
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  {invoice.invoiceNumber}
                </h1>
              </div>
            </div>
          </div>

          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${statusClasses(invoice.status)}`}
          >
            {statusLabel(invoice.status)}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
          <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
            <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#0f766e_0%,#115e59_52%,#0f172a_100%)] px-8 py-7 text-white">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold tracking-[0.24em] text-teal-100 uppercase">
                    From
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {invoice.company.name}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-line text-teal-50/90">
                    {invoice.company.address}
                  </p>
                  <p className="text-sm text-teal-50/90">
                    {invoice.company.email}
                  </p>
                  {invoice.company.gstin ? (
                    <p className="text-sm text-teal-50/90">
                      GSTIN: {invoice.company.gstin}
                    </p>
                  ) : null}
                </div>

                <div className="min-w-[220px] rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <InfoStat
                      label="Invoice date"
                      value={formatDate(invoice.createdAt)}
                    />
                    <InfoStat
                      label="Due date"
                      value={
                        invoice.dueDate
                          ? formatDate(invoice.dueDate)
                          : "Not set"
                      }
                    />
                    <InfoStat label="Plan" value={invoice.planName} />
                    <InfoStat
                      label="Subscription"
                      value={invoice.subscriptionNumber}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 border-b border-slate-100 bg-slate-50/70 px-8 py-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                  Bill to
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {invoice.customer.name}
                </p>
                {invoice.customer.address ? (
                  <p className="mt-1 text-sm whitespace-pre-line text-slate-600">
                    {invoice.customer.address}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-slate-600">
                  {invoice.customer.email}
                </p>
                {invoice.customer.phone ? (
                  <p className="text-sm text-slate-600">
                    {invoice.customer.phone}
                  </p>
                ) : null}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                  Payment terms
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {invoice.paymentTerms}
                </p>
                {invoice.notes ? (
                  <>
                    <p className="mt-4 text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                      Notes
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {invoice.notes}
                    </p>
                  </>
                ) : null}
              </div>
            </div>

            <div className="px-8 py-8">
              <div className="overflow-hidden rounded-3xl border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                        <th className="px-5 py-4">Description</th>
                        <th className="px-5 py-4 text-center">Qty</th>
                        <th className="px-5 py-4 text-right">Rate</th>
                        <th className="px-5 py-4 text-right">Tax</th>
                        <th className="px-5 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {invoice.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {item.description}
                          </td>
                          <td className="px-5 py-4 text-center text-slate-600">
                            {item.quantity}
                          </td>
                          <td className="px-5 py-4 text-right text-slate-600">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-5 py-4 text-right text-slate-600">
                            {formatCurrency(item.taxAmount)}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-slate-950">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <TotalRow
                    label="Subtotal"
                    value={formatCurrency(invoice.subtotal)}
                  />
                  <TotalRow
                    label="Tax total"
                    value={formatCurrency(invoice.taxTotal)}
                  />
                  {invoice.discountTotal > 0 ? (
                    <TotalRow
                      label="Discount"
                      value={`- ${formatCurrency(invoice.discountTotal)}`}
                      accent="text-emerald-700"
                    />
                  ) : null}
                  <TotalRow
                    label="Total due"
                    value={formatCurrency(invoice.amountDue)}
                    accent="text-rose-700"
                    strong
                  />
                  <div className="border-t border-slate-200 pt-3">
                    <TotalRow
                      label="Grand total"
                      value={formatCurrency(invoice.total)}
                      strong
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.45)]">
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                Payment summary
              </p>
              <div className="mt-4 rounded-3xl bg-[linear-gradient(135deg,#f0fdfa_0%,#ecfeff_55%,#f8fafc_100%)] p-5">
                <p className="text-sm font-medium text-slate-600">
                  Amount due now
                </p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                  {formatCurrency(invoice.amountDue)}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <IconClockHour4
                    className="h-4 w-4 text-teal-700"
                    stroke={1.8}
                  />
                  {invoice.dueDate
                    ? `Due by ${formatDate(invoice.dueDate)}`
                    : "No due date has been assigned"}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                {!razorpayEnabled ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Razorpay keys are not configured yet in this environment.
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={!canPay || loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <IconCreditCard className="h-5 w-5" stroke={1.8} />
                  {loading
                    ? "Opening Razorpay..."
                    : `Pay ${formatCurrency(invoice.amountDue)} now`}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                  {["UPI", "Cards", "NetBanking", "Wallets"].map((method) => (
                    <span
                      key={method}
                      className="inline-flex items-center gap-1"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {method}
                    </span>
                  ))}
                </div>

                <p className="text-center text-xs text-slate-500">
                  Secure checkout powered by Razorpay.
                </p>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                Payment history
              </p>
              <div className="mt-4 space-y-3">
                {invoice.payments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No successful payments have been recorded for this invoice
                    yet.
                  </div>
                ) : (
                  invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 capitalize">
                            {payment.paymentMethod.replaceAll("_", " ")}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <IconCheck className="h-3.5 w-3.5" stroke={2} />
                          Recorded
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        {formatDate(payment.paymentDate)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.24em] text-teal-100 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  )
}

function TotalRow({
  label,
  value,
  strong = false,
  accent,
}: {
  label: string
  value: string
  strong?: boolean
  accent?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm text-slate-500 ${accent || ""}`}>{label}</span>
      <span
        className={`text-sm ${
          strong ? "font-semibold text-slate-950" : "font-medium text-slate-700"
        } ${accent || ""}`}
      >
        {value}
      </span>
    </div>
  )
}

function statusClasses(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700"
    case "cancelled":
      return "bg-slate-100 text-slate-600"
    case "confirmed":
      return "bg-amber-50 text-amber-700"
    default:
      return "bg-sky-50 text-sky-700"
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "paid":
      return "Paid"
    case "cancelled":
      return "Cancelled"
    case "confirmed":
      return "Payment pending"
    default:
      return "Ready to send"
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value))
}
