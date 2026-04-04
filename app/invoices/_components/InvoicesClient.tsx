"use client";

import Link from "next/link";
import { IconRocket, IconReceipt, IconDownload } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  date: Date;
  items: string;
}

interface InvoicesClientProps {
  invoices: Invoice[];
  totalPaid: number;
}

/**
 * InvoicesClient — displays the authenticated user's invoice history.
 * Uses design-token CSS variables throughout for full dark/light mode support.
 *
 * @client Requires client boundary for future interactivity (filter/sort).
 */
export function InvoicesClient({ invoices, totalPaid }: InvoicesClientProps) {
  /** Formats an invoice date in "Apr 04, 2026" style without date-fns. */
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(date));

  /**
   * Returns Tailwind token classes based on invoice status.
   * Using /10 + /30 opacity tokens so it works in both dark and light.
   */
  const statusClasses = (status: string): string => {
    switch (status.toLowerCase()) {
      case "paid":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
      case "pending":
        return "border-amber-500/30 bg-amber-500/10 text-amber-500";
      case "overdue":
        return "border-red-500/30 bg-red-500/10 text-red-500";
      default:
        return "border-border bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
        <Link
          href="/pricing"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] shadow-md">
            <IconRocket className="h-4 w-4 text-white" stroke={2} />
          </div>
          <span className="f-syne text-[20px] font-bold text-foreground">
            SubsMS
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/admin"
            className="f-mono text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/cart"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
          </Link>
        </div>
      </nav>

      <div className="anim-up mx-auto max-w-4xl px-6 pb-24 pt-12">
        <h1 className="f-syne mb-2 text-[32px] font-extrabold text-foreground">
          Invoice History
        </h1>
        <p className="f-mono mb-10 text-[11px] uppercase tracking-widest text-muted-foreground">
          ALL PAST TRANSACTIONS &amp; RECEIPTS
        </p>

        {/* Summary Cards */}
        <div className="mb-10 grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-border border-l-4 border-l-indigo-500 bg-card shadow-sm p-6">
            <p className="f-mono mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              Total Paid
            </p>
            <p className="f-syne text-3xl font-extrabold text-foreground">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-border border-l-4 border-l-border bg-card shadow-sm p-6">
            <p className="f-mono mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              Invoices
            </p>
            <p className="f-syne text-3xl font-extrabold text-foreground">
              {invoices.length}
            </p>
          </div>
        </div>

        {/* Invoice List */}
        <div className="space-y-3">
          {invoices.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card shadow-sm p-8 text-center text-muted-foreground">
              <IconReceipt className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" stroke={1.5} />
              <p className="f-mono text-sm">No invoices found.</p>
            </div>
          )}
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card shadow-sm p-5 transition-all hover:border-indigo-500/50 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                  <IconReceipt className="h-5 w-5 text-indigo-500" stroke={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="f-mono text-[13px] font-bold text-foreground">
                      {inv.invoiceNumber}
                    </h3>
                    <span
                      className={`f-mono rounded border px-2 py-0.5 text-[9px] font-bold uppercase ${statusClasses(inv.status)}`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <p className="f-mono mt-0.5 text-[11px] text-muted-foreground">
                    {inv.items}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="f-syne text-[15px] font-bold text-foreground">
                    ₹{inv.amount.toLocaleString()}
                  </p>
                  <p className="f-mono text-[10px] text-muted-foreground">
                    {formatDate(inv.date)}
                  </p>
                </div>
                <IconDownload
                  className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-indigo-600"
                  stroke={1.5}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
