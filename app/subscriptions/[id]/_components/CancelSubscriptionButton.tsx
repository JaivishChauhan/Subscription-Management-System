"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconCircleX } from "@tabler/icons-react"

export function CancelSubscriptionButton({
  subscriptionId,
}: {
  subscriptionId: string
}) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this subscription? This action cannot be undone."
      )
    )
      return

    setIsPending(true)
    try {
      const res = await fetch(
        "/api/subscriptions/" + subscriptionId + "/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "closed" }),
        }
      )
      const data = await res.json()

      if (!res.ok)
        throw new Error(data.error || "Failed to cancel subscription")

      toast.success("Subscription cancelled successfully.")
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 lg:w-auto"
    >
      <IconCircleX className="h-4 w-4" />
      {isPending ? "Canceling..." : "Cancel Subscription"}
    </button>
  )
}
