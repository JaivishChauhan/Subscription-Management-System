"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { getNextAllowedStatus } from "@/lib/validations/subscription-helpers";
import type { SubscriptionStatus } from "@/lib/validations/subscription";

const STATUS_ACTION_LABELS: Record<SubscriptionStatus, string> = {
  draft: "Confirm as quotation",
  quotation: "Confirm order",
  confirmed: "Activate subscription",
  active: "Close subscription",
  closed: "Closed",
};

export function SubscriptionStatusActions({
  subscriptionId,
  status,
  closable,
}: {
  subscriptionId: string;
  status: SubscriptionStatus;
  closable: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const nextStatus = getNextAllowedStatus(status);
  const isBlockedClose = status === "active" && !closable;

  async function handleTransition() {
    if (!nextStatus) {
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to update subscription status.");
        return;
      }

      toast.success(
        nextStatus === "active"
          ? "Subscription activated. Invoice generation is the next implementation step."
          : `Subscription moved to ${nextStatus}.`,
      );
      router.refresh();
    } catch {
      toast.error("Unable to update subscription status right now.");
    } finally {
      setIsPending(false);
    }
  }

  if (!nextStatus) {
    return (
      <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        This subscription is already at the final lifecycle state.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleTransition}
        disabled={isPending || isBlockedClose}
        className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <IconLoader2 className="h-4 w-4 animate-spin" /> : null}
        {STATUS_ACTION_LABELS[status]}
      </button>
      {isBlockedClose ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          This plan does not allow manual closure of active subscriptions.
        </p>
      ) : null}
    </div>
  );
}
