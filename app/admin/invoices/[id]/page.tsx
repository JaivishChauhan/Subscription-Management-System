import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconMail, IconPrinter } from "@tabler/icons-react";
import { InvoiceStatusActions } from "../_components/InvoiceStatusActions";
import { InvoiceStatusBadge } from "../_components/InvoiceStatusBadge";
import { prisma } from "@/lib/db";
import { requirePageRole } from "@/lib/admin";
import type { InvoiceStatus } from "@/lib/validations/invoice";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Invoice Details",
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  await requirePageRole(["admin", "internal"]);

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      contact: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      subscription: {
        include: {
          recurringPlan: {
            select: {
              name: true,
            },
          },
          paymentTerms: {
            select: {
              name: true,
              dueDays: true,
            },
          },
        },
      },
      lines: {
        orderBy: { id: "asc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const status = normalizeInvoiceStatus(invoice.status);
  const customerName =
    [invoice.contact.firstName, invoice.contact.lastName].filter(Boolean).join(" ").trim() ||
    invoice.contact.company ||
    "Customer";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/admin/invoices"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back to invoices
            </Link>
            <p className="mt-4 text-xs font-semibold tracking-[0.24em] text-indigo-600 uppercase">
              Invoice Detail
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <InvoiceStatusBadge status={status} />
              <p className="text-sm text-muted-foreground">{customerName}</p>
              <p className="text-sm text-muted-foreground">{invoice.contact.user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <InvoiceStatusActions invoiceId={invoice.id} status={status} />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground"
                disabled
              >
                <IconMail className="h-4 w-4" />
                Send invoice
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground"
                disabled
              >
                <IconPrinter className="h-4 w-4" />
                Print PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Line Items</h2>
          <div className="mt-5 overflow-hidden rounded-3xl border border-border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    <th className="px-5 py-4">Item</th>
                    <th className="px-5 py-4">Qty</th>
                    <th className="px-5 py-4">Unit Price</th>
                    <th className="px-5 py-4">Tax</th>
                    <th className="px-5 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {invoice.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium">{line.name}</p>
                          <p className="text-muted-foreground text-sm">{line.productId}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{line.quantity}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatCurrency(line.unitPrice)}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatCurrency(line.taxAmount)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium">
                        {formatCurrency(line.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Totals</h2>
            <div className="mt-5 space-y-4">
              <SummaryRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
              <SummaryRow label="Tax total" value={formatCurrency(invoice.taxTotal)} />
              <SummaryRow label="Discount total" value={formatCurrency(invoice.discountTotal)} />
              <SummaryRow label="Amount due" value={formatCurrency(invoice.amountDue)} />
              <SummaryRow label="Grand total" value={formatCurrency(invoice.total)} strong />
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Reference</h2>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p>Subscription: {invoice.subscription.subscriptionNumber}</p>
              <p>Plan: {invoice.subscription.recurringPlan.name}</p>
              <p>
                Payment terms:{" "}
                {invoice.subscription.paymentTerms
                  ? `${invoice.subscription.paymentTerms.name} (${invoice.subscription.paymentTerms.dueDays} days)`
                  : "Not set"}
              </p>
              <p>Created: {formatDate(invoice.createdAt)}</p>
              <p>Due date: {invoice.dueDate ? formatDate(invoice.dueDate) : "Not set"}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Payments</h2>
            {invoice.payments.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No payment records yet. Payment recording is the next module in the flow.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-border bg-muted/20 p-4 text-sm"
                  >
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-muted-foreground mt-1 capitalize">
                      {payment.paymentMethod.replaceAll("_", " ")} on {formatDate(payment.paymentDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

function normalizeInvoiceStatus(value: string): InvoiceStatus {
  switch (value) {
    case "confirmed":
    case "paid":
    case "cancelled":
      return value;
    default:
      return "draft";
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value);
}
