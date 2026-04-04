"use client";

import Link from "next/link";

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

export function InvoicesClient({ invoices, totalPaid }: InvoicesClientProps) {
  return (
    <div className="grid-bg min-h-screen">
      <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#1E2D42]/40 bg-[#0D1117]/80 px-6 backdrop-blur-md">
        <Link
          href="/pricing"
          className="f-syne text-[22px] font-bold text-[#E8EDF5]"
        >
          SubMS
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="f-mono text-sm text-[#8A9BB5] transition-colors hover:text-[#00E5FF]"
          >
            Account
          </Link>
          <Link
            href="/cart"
            className="text-[#8A9BB5] transition-colors hover:text-[#00E5FF]"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
          </Link>
        </div>
      </nav>

      <div className="anim-up mx-auto max-w-4xl px-6 pb-24 pt-12">
        <h1 className="f-syne mb-2 text-[32px] font-extrabold text-[#E8EDF5]">
          Invoice History
        </h1>
        <p className="f-mono mb-10 text-[11px] uppercase tracking-widest text-[#4A5D78]">
          ALL PAST TRANSACTIONS & RECEIPTS
        </p>

        {/* Summary */}
        <div className="mb-10 grid grid-cols-2 gap-6">
          <div className="rounded-xl border-l-2 border-[#00E5FF] bg-[#111820] p-6">
            <p className="f-mono mb-2 text-[10px] uppercase tracking-wider text-[#8A9BB5]">
              Total Paid
            </p>
            <p className="f-syne text-3xl font-extrabold text-[#E8EDF5]">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border-l-2 border-[#1E2D42] bg-[#111820] p-6">
            <p className="f-mono mb-2 text-[10px] uppercase tracking-wider text-[#8A9BB5]">
              Invoices
            </p>
            <p className="f-syne text-3xl font-extrabold text-[#E8EDF5]">
              {invoices.length}
            </p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {invoices.length === 0 && (
            <div className="rounded-xl border border-[#1E2D42] bg-[#111820] p-8 text-center text-[#8A9BB5]">
              <span className="material-symbols-outlined mb-2 text-4xl">
                receipt_long
              </span>
              <p className="f-mono text-sm">No invoices found.</p>
            </div>
          )}
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-[#1E2D42] bg-[#111820] p-5 transition-colors hover:border-[#00E5FF]/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1E2D42] bg-[#0D1117]">
                  <span className="material-symbols-outlined text-[20px] text-[#00E5FF]">
                    receipt_long
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="f-mono text-[13px] font-bold text-[#E8EDF5]">
                      {inv.invoiceNumber}
                    </h3>
                    <span className="f-mono rounded border border-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 text-[9px] font-bold uppercase text-[#00E5FF]">
                      {inv.status}
                    </span>
                  </div>
                  <p className="f-mono mt-0.5 text-[11px] text-[#4A5D78]">
                    {inv.items}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="f-syne text-[15px] font-bold text-[#E8EDF5]">
                    ₹{inv.amount.toLocaleString()}
                  </p>
                  <p className="f-mono text-[10px] text-[#4A5D78]">
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(inv.date))}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#4A5D78] transition-colors group-hover:text-[#00E5FF]">
                  download
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
