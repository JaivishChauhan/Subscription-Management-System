import { prisma } from "@/lib/db";
import type { SubscriptionStatus } from "@/lib/validations/subscription";

const STATUS_ORDER: SubscriptionStatus[] = [
  "draft",
  "quotation",
  "confirmed",
  "active",
  "closed",
];

export async function generateSubscriptionNumber(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const prefix = `SUB-${year}${month}${day}`;

  const existingCount = await prisma.subscription.count({
    where: {
      subscriptionNumber: {
        startsWith: prefix,
      },
    },
  });

  return `${prefix}-${String(existingCount + 1).padStart(4, "0")}`;
}

export function calculateLineSubtotal({
  quantity,
  unitPrice,
  taxAmount,
}: {
  quantity: number;
  unitPrice: number;
  taxAmount: number;
}) {
  return roundCurrency(quantity * unitPrice + taxAmount);
}

export function calculateTaxAmount({
  quantity,
  unitPrice,
  taxType,
  taxRate,
}: {
  quantity: number;
  unitPrice: number;
  taxType: string;
  taxRate: number;
}) {
  if (taxType === "fixed") {
    return roundCurrency(taxRate * quantity);
  }

  return roundCurrency(quantity * unitPrice * (taxRate / 100));
}

export function getNextAllowedStatus(currentStatus: SubscriptionStatus) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  return STATUS_ORDER[currentIndex + 1] ?? null;
}

export function canTransitionSubscriptionStatus({
  currentStatus,
  nextStatus,
  closable,
}: {
  currentStatus: SubscriptionStatus;
  nextStatus: SubscriptionStatus;
  closable: boolean;
}) {
  const allowedNextStatus = getNextAllowedStatus(currentStatus);

  if (!allowedNextStatus || allowedNextStatus !== nextStatus) {
    return {
      ok: false,
      error: `Invalid status transition from ${currentStatus} to ${nextStatus}.`,
    };
  }

  if (currentStatus === "active" && nextStatus === "closed" && !closable) {
    return {
      ok: false,
      error: "This plan does not allow manual closure of active subscriptions.",
    };
  }

  return { ok: true as const };
}

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
