import type { SubscriptionStatus } from "@/lib/validations/subscription"

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  draft: "bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  quotation:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  confirmed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  active:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  closed: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
}

export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  )
}
