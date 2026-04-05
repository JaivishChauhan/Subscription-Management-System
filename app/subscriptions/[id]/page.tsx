import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconFileInvoice,
  IconReceipt2,
} from "@tabler/icons-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isRazorpayEnabled } from "@/lib/razorpay"
import { CancelSubscriptionButton } from "./_components/CancelSubscriptionButton"

type SubscriptionDetailPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Subscription Details",
  description: "View subscription details, invoices, and payment history.",
}

export const dynamic = "force-dynamic"

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

export default async function SubscriptionDetailPage({
  params,
}: SubscriptionDetailPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      contact: true,
      recurringPlan: true,
      paymentTerms: true,
      lines: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
          variant: {
            select: {
              attribute: true,
              value: true,
            },
          },
        },
        orderBy: { id: "asc" },
      },
      invoices: {
        include: {
          lines: {
            orderBy: { id: "asc" },
          },
          payments: {
            orderBy: { paymentDate: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!subscription || subscription.userId !== session.user.id) {
    notFound()
  }

  const customerName =
    [subscription.contact.firstName, subscription.contact.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    subscription.contact.company ||
    "Customer"

  const razorpayEnabled = isRazorpayEnabled()

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/subscriptions"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <IconArrowLeft className="h-4 w-4" />
            Back to subscriptions
          </Link>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-sky-600 uppercase">
                Subscription Overview
              </p>
              <h1 className="mt-2 text-3xl font-bold">
                {subscription.recurringPlan.name}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {subscription.subscriptionNumber} for {customerName}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${statusClasses(subscription.status)}`}
              >
                {statusLabel(subscription.status)}
              </span>
              {subscription.status !== "closed" && (
                <CancelSubscriptionButton subscriptionId={subscription.id} />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="border-border bg-card rounded-3xl border p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={IconCreditCard}
                  label="Billing plan"
                  value={`${INR.format(
                    subscription.lines && subscription.lines.length > 0
                      ? subscription.lines.reduce(
                          (sum, line) => sum + line.subtotal + line.taxAmount,
                          0
                        )
                      : subscription.recurringPlan.price
                  )} / ${subscription.recurringPlan.billingPeriod.charAt(0).toUpperCase() + subscription.recurringPlan.billingPeriod.slice(1)}`}
                />
                <InfoItem
                  icon={IconCalendar}
                  label="Start date"
                  value={formatDate(subscription.startDate)}
                />
                <InfoItem
                  icon={IconCalendar}
                  label="End date"
                  value={formatDate(subscription.expirationDate)}
                />
                <InfoItem
                  icon={IconClock}
                  label="Payment terms"
                  value={
                    subscription.paymentTerms
                      ? `${subscription.paymentTerms.name} (${subscription.paymentTerms.dueDays} days)`
                      : "Not set"
                  }
                />
              </div>

              {subscription.notes ? (
                <div className="bg-muted/50 mt-6 rounded-2xl p-4">
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                    Notes
                  </p>
                  <p className="text-foreground/80 mt-2 text-sm">
                    {subscription.notes}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="border-border bg-card rounded-3xl border p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                  <IconReceipt2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Subscription Items</h2>
                  <p className="text-muted-foreground text-sm">
                    Products and pricing currently attached to this subscription
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {subscription.lines.map((line) => (
                  <div
                    key={line.id}
                    className="border-border bg-background flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-4"
                  >
                    <div>
                      <p className="text-foreground font-semibold">
                        {line.variant
                          ? `${line.product.name} (${line.variant.attribute}: ${line.variant.value})`
                          : line.product.name}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Qty {line.quantity} at {INR.format(line.unitPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-sm">
                        Tax {INR.format(line.taxAmount)}
                      </p>
                      <p className="text-base font-semibold">
                        {INR.format(line.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="border-border bg-card rounded-3xl border p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <IconFileInvoice className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Invoices & Payments</h2>
                  <p className="text-muted-foreground text-sm">
                    Billing is now shown directly inside this subscription
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {subscription.invoices.length === 0 ? (
                  <div className="border-border bg-muted/40 text-muted-foreground rounded-2xl border border-dashed p-5 text-sm">
                    No invoice has been generated for this subscription yet. It
                    will appear here once the subscription reaches the billing
                    stage.
                  </div>
                ) : (
                  subscription.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="border-border bg-background rounded-3xl border p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-foreground font-semibold">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-muted-foreground mt-1 text-sm">
                            Generated on {formatDate(invoice.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${invoiceStatusClasses(invoice.status)}`}
                        >
                          {invoiceStatusLabel(invoice.status)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <MetricCard
                          label="Total"
                          value={INR.format(invoice.total)}
                        />
                        <MetricCard
                          label="Amount due"
                          value={INR.format(invoice.amountDue)}
                        />
                      </div>

                      <div className="bg-muted/40 mt-4 rounded-2xl p-4">
                        <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                          Invoice items
                        </p>
                        <div className="mt-3 space-y-2">
                          {invoice.lines.map((line) => (
                            <div
                              key={line.id}
                              className="flex items-start justify-between gap-3 text-sm"
                            >
                              <div>
                                <p className="text-foreground font-medium">
                                  {line.name}
                                </p>
                                <p className="text-muted-foreground">
                                  Qty {line.quantity} at{" "}
                                  {INR.format(line.unitPrice)}
                                </p>
                              </div>
                              <p className="text-foreground font-semibold">
                                {INR.format(line.subtotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                            Payment history
                          </p>
                          {invoice.dueDate ? (
                            <p className="text-muted-foreground text-xs">
                              Due {formatDate(invoice.dueDate)}
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-3 space-y-3">
                          {invoice.payments.length === 0 ? (
                            <div className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
                              No payments recorded yet for this invoice.
                            </div>
                          ) : (
                            invoice.payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="border-border bg-card flex items-start justify-between gap-3 rounded-2xl border p-4"
                              >
                                <div>
                                  <p className="text-foreground font-semibold">
                                    {INR.format(payment.amount)}
                                  </p>
                                  <p className="text-muted-foreground mt-1 text-sm capitalize">
                                    {payment.paymentMethod.replaceAll("_", " ")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <IconCheck className="h-3.5 w-3.5" />
                                    Recorded
                                  </div>
                                  <p className="text-muted-foreground mt-2 text-xs">
                                    {formatDate(payment.paymentDate)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="border-border hover:bg-muted inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
                        >
                          Open full invoice
                        </Link>
                        {invoice.amountDue > 0 &&
                        invoice.status !== "cancelled" ? (
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                          >
                            {razorpayEnabled
                              ? "Pay from invoice"
                              : "View payment details"}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="bg-muted/40 rounded-2xl p-4">
      <div className="text-muted-foreground flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">
          {label}
        </p>
      </div>
      <p className="text-foreground mt-2 text-sm font-semibold">{value}</p>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4">
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
        {label}
      </p>
      <p className="text-foreground mt-2 text-lg font-bold">{value}</p>
    </div>
  )
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Not set"
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function statusClasses(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    case "confirmed":
      return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
    case "quotation":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "closed":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "active":
      return "Active"
    case "confirmed":
      return "Confirmed"
    case "quotation":
      return "Quotation"
    case "closed":
      return "Closed"
    default:
      return "Draft"
  }
}

function invoiceStatusClasses(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    case "confirmed":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "cancelled":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
    default:
      return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
  }
}

function invoiceStatusLabel(status: string) {
  switch (status) {
    case "paid":
      return "Paid"
    case "confirmed":
      return "Payment pending"
    case "cancelled":
      return "Cancelled"
    default:
      return "Draft"
  }
}
