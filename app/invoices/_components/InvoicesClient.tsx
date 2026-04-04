"use client"

import Link from "next/link"
import { IconArrowRight, IconReceipt } from "@tabler/icons-react"

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  amountDue: number
  status: string
  date: Date
  items: string
}

interface InvoicesClientProps {
  invoices: Invoice[]
  totalPaid: number
}

export function InvoicesClient({ invoices, totalPaid }: InvoicesClientProps) {
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(date))

  const statusClasses = (status: string): string => {
    switch (status.toLowerCase()) {
      case "paid":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
      case "confirmed":
      case "pending":
        return "border-amber-500/30 bg-amber-500/10 text-amber-500"
      case "overdue":
        return "border-red-500/30 bg-red-500/10 text-red-500"
      case "cancelled":
        return "border-border bg-muted text-muted-foreground"
      default:
        return "border-sky-500/30 bg-sky-500/10 text-sky-500"
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="anim-up mx-auto max-w-4xl px-6 pt-12 pb-24">
        <h1 className="f-syne text-foreground mb-2 text-[32px] font-extrabold">
          Invoice History
        </h1>
        <p className="f-mono text-muted-foreground mb-10 text-[11px] tracking-widest uppercase">
          All past transactions and receipts
        </p>

        <div className="mb-10 grid grid-cols-2 gap-6">
          <div className="border-border bg-card rounded-xl border border-l-4 border-l-indigo-500 p-6 shadow-sm">
            <p className="f-mono text-muted-foreground mb-2 text-[10px] tracking-wider uppercase">
              Total Paid
            </p>
            <p className="f-syne text-foreground text-3xl font-extrabold">
              Rs {totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="border-border border-l-border bg-card rounded-xl border border-l-4 p-6 shadow-sm">
            <p className="f-mono text-muted-foreground mb-2 text-[10px] tracking-wider uppercase">
              Invoices
            </p>
            <p className="f-syne text-foreground text-3xl font-extrabold">
              {invoices.length}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {invoices.length === 0 && (
            <div className="border-border bg-card text-muted-foreground rounded-xl border border-dashed p-8 text-center shadow-sm">
              <IconReceipt
                className="text-muted-foreground/40 mx-auto mb-2 h-10 w-10"
                stroke={1.5}
              />
              <p className="f-mono text-sm">No invoices found.</p>
            </div>
          )}

          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="group border-border bg-card flex items-center justify-between rounded-xl border p-5 shadow-sm transition-all hover:border-indigo-500/50 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                  <IconReceipt
                    className="h-5 w-5 text-indigo-500"
                    stroke={1.5}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="f-mono text-foreground text-[13px] font-bold">
                      {inv.invoiceNumber}
                    </h3>
                    <span
                      className={`f-mono rounded border px-2 py-0.5 text-[9px] font-bold uppercase ${statusClasses(inv.status)}`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <p className="f-mono text-muted-foreground mt-0.5 text-[11px]">
                    {inv.items}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="f-syne text-foreground text-[15px] font-bold">
                    Rs {inv.amount.toLocaleString()}
                  </p>
                  {inv.amountDue > 0 ? (
                    <p className="f-mono text-[10px] text-amber-600">
                      Due Rs {inv.amountDue.toLocaleString()}
                    </p>
                  ) : null}
                  <p className="f-mono text-muted-foreground text-[10px]">
                    {formatDate(inv.date)}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-indigo-600 uppercase">
                  {inv.amountDue > 0 && inv.status !== "cancelled"
                    ? "Pay now"
                    : "View"}
                  <IconArrowRight
                    className="text-muted-foreground h-4 w-4 transition-colors group-hover:text-indigo-600"
                    stroke={1.8}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
