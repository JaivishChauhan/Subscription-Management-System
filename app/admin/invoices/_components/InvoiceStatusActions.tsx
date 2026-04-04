"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"
import { getNextInvoiceStatus } from "@/lib/validations/invoice"
import type { InvoiceStatus } from "@/lib/validations/invoice"

export function InvoiceStatusActions({
  invoiceId,
  status,
}: {
  invoiceId: string
  status: InvoiceStatus
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const nextStatus = getNextInvoiceStatus(status)
  const canCancel = status === "draft" || status === "confirmed"

  async function updateStatus(targetStatus: InvoiceStatus) {
    setIsPending(true)

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      })
      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error ?? "Unable to update invoice status.")
        return
      }

      toast.success(`Invoice moved to ${targetStatus}.`)
      router.refresh()
    } catch {
      toast.error("Unable to update invoice status right now.")
    } finally {
      setIsPending(false)
    }
  }

  if (status === "paid" || status === "cancelled") {
    return (
      <div className="border-border bg-muted/20 text-muted-foreground rounded-2xl border px-4 py-3 text-sm">
        This invoice is already finalized.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {nextStatus ? (
        <button
          type="button"
          onClick={() => updateStatus(nextStatus as InvoiceStatus)}
          disabled={isPending}
          className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <IconLoader2 className="h-4 w-4 animate-spin" /> : null}
          {status === "draft" ? "Confirm invoice" : "Mark as paid"}
        </button>
      ) : null}

      {canCancel ? (
        <button
          type="button"
          onClick={() => updateStatus("cancelled")}
          disabled={isPending}
          className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel invoice
        </button>
      ) : null}
    </div>
  )
}
