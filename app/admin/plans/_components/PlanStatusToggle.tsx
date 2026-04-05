"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

export function PlanStatusToggle({
  planId,
  isActive,
}: {
  planId: string
  isActive: boolean
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleToggle() {
    setIsPending(true)

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error ?? "Unable to update plan status.")
        return
      }

      toast.success(!isActive ? "Plan activated." : "Plan deactivated.")
      router.refresh()
    } catch {
      toast.error("Unable to update the plan right now.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isActive
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-500/15 dark:text-slate-300"
      }`}
    >
      {isPending ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {isActive ? "Active" : "Inactive"}
    </button>
  )
}
