"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateSubscriptionNumber } from "@/lib/subscriptions"
import { generateInvoiceFromSubscription } from "@/lib/invoices"
import { revalidatePath } from "next/cache"
import type { CartItem } from "@/store/cart"

export async function processCheckout(items: CartItem[]) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be logged in to checkout." }
  }

  let contact = await prisma.contact.findUnique({
    where: { userId: session.user.id },
  })

  if (!contact) {
    // fallback creation
    contact = await prisma.contact.create({
      data: {
        userId: session.user.id,
        firstName: session.user.name || "Customer",
        lastName: "Details",
      },
    })
  }

  const fallbackPlan = await prisma.recurringPlan.findFirst()
  if (!fallbackPlan) return { error: "System missing plans." }

  const today = new Date()

  for (const item of items) {
    const rawId = item.id.split("-")[0]

    let product = await prisma.product.findUnique({ where: { id: rawId } })
    if (!product) {
      product = await prisma.product.findFirst()
    }

    if (!product) continue

    const bp = item.plan.toLowerCase()
    const period = bp === "one-time" || bp === "lifetime" ? "yearly" : bp

    let resolvedPlan = await prisma.recurringPlan.findFirst({
      where: { billingPeriod: period },
    })

    if (!resolvedPlan) {
      resolvedPlan = fallbackPlan
    }

    const expDate = new Date(today)
    if (period === "yearly") {
      expDate.setFullYear(expDate.getFullYear() + 1)
    } else if (period === "quarterly") {
      expDate.setMonth(expDate.getMonth() + 3)
    } else if (period === "weekly") {
      expDate.setDate(expDate.getDate() + 7)
    } else if (period === "daily") {
      expDate.setDate(expDate.getDate() + 1)
    } else {
      expDate.setMonth(expDate.getMonth() + 1)
    }

    const sub = await prisma.subscription.create({
      data: {
        subscriptionNumber: await generateSubscriptionNumber(),
        status: "active",
        userId: session.user.id,
        contactId: contact.id,
        recurringPlanId: resolvedPlan.id,
        startDate: today,
        expirationDate: expDate,
        notes:
          "Automatically generated via checkout for cart item: " + item.name,
        lines: {
          create: [
            {
              productId: product.id,
              quantity: item.quantity,
              unitPrice: item.price,
              subtotal: item.price * item.quantity,
              taxAmount: Math.round(item.price * item.quantity * 0.18),
            },
          ],
        },
      },
    })

    // Generate matching invoice & mark paid
    const { invoice } = await generateInvoiceFromSubscription(sub.id)

    // We need to get the total from the database because the generated invoice might not include it depending on the branch it took
    // inside generateInvoiceFromSubscription
    const dbInvoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: invoice.id },
    })

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "paid",
        paidAt: new Date(),
        amountDue: 0,
      },
    })

    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        createdById: session.user.id,
        paymentMethod: "credit_card",
        amount: dbInvoice.total,
        notes: "Automated payment via external checkout flow",
        gatewayOrderId: "order_mock_" + crypto.randomUUID().substring(0, 8),
        gatewayPaymentId: "pay_mock_" + crypto.randomUUID().substring(0, 8),
      },
    })
  }

  revalidatePath("/subscriptions")
  revalidatePath("/admin/subscriptions")

  return { success: true }
}
