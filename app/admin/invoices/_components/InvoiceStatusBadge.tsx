import type { InvoiceStatus } from "@/lib/validations/invoice";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  confirmed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

export function InvoiceStatusBadge({
  status,
}: {
  status: InvoiceStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
