import { prisma } from "@/lib/db";
import { roundCurrency } from "@/lib/subscriptions";

export async function generateInvoiceNumber(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const prefix = `INV-${year}${month}${day}`;

  const existingCount = await prisma.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
  });

  return `${prefix}-${String(existingCount + 1).padStart(4, "0")}`;
}

export async function generateInvoiceFromSubscription(subscriptionId: string) {
  const existingInvoice = await prisma.invoice.findFirst({
    where: { subscriptionId },
    select: { id: true, invoiceNumber: true },
  });

  if (existingInvoice) {
    return { invoice: existingInvoice, created: false as const };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      contact: true,
      recurringPlan: true,
      paymentTerms: true,
      lines: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          variant: {
            select: {
              id: true,
              attribute: true,
              value: true,
            },
          },
        },
      },
    },
  });

  if (!subscription) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  if (subscription.lines.length === 0) {
    throw new Error("SUBSCRIPTION_HAS_NO_LINES");
  }

  const subtotal = roundCurrency(
    subscription.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
  );
  const taxTotal = roundCurrency(
    subscription.lines.reduce((sum, line) => sum + line.taxAmount, 0),
  );
  const total = roundCurrency(subtotal + taxTotal);
  const dueDate = subscription.paymentTerms
    ? new Date(Date.now() + subscription.paymentTerms.dueDays * 24 * 60 * 60 * 1000)
    : null;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: await generateInvoiceNumber(),
      status: "draft",
      subscriptionId: subscription.id,
      contactId: subscription.contactId,
      userId: subscription.userId,
      subtotal,
      taxTotal,
      discountTotal: 0,
      total,
      amountDue: total,
      dueDate,
      notes: subscription.notes,
      lines: {
        create: subscription.lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          name: line.variant
            ? `${line.product.name} (${line.variant.attribute}: ${line.variant.value})`
            : line.product.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxAmount: line.taxAmount,
          subtotal: line.subtotal,
        })),
      },
    },
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      dueDate: true,
      total: true,
      amountDue: true,
    },
  });

  return { invoice, created: true as const };
}

export function getNextInvoiceStatus(currentStatus: string) {
  switch (currentStatus) {
    case "draft":
      return "confirmed";
    case "confirmed":
      return "paid";
    default:
      return null;
  }
}

export function canTransitionInvoiceStatus({
  currentStatus,
  nextStatus,
}: {
  currentStatus: string;
  nextStatus: string;
}) {
  if (currentStatus === "cancelled" || currentStatus === "paid") {
    return {
      ok: false,
      error: `Invoices in ${currentStatus} status cannot be updated.`,
    };
  }

  if (nextStatus === "cancelled") {
    return {
      ok: currentStatus === "draft" || currentStatus === "confirmed",
      error: "Only draft or confirmed invoices can be cancelled.",
    };
  }

  const allowedNextStatus = getNextInvoiceStatus(currentStatus);
  if (!allowedNextStatus || allowedNextStatus !== nextStatus) {
    return {
      ok: false,
      error: `Invalid invoice status transition from ${currentStatus} to ${nextStatus}.`,
    };
  }

  return { ok: true as const };
}

export function formatInvoiceStatus(status: string) {
  switch (status) {
    case "confirmed":
      return "confirmed";
    case "paid":
      return "paid";
    case "cancelled":
      return "cancelled";
    default:
      return "draft";
  }
}
