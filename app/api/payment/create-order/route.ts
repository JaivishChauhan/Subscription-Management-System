import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireApiRole } from "@/lib/admin"
import {
  createRazorpayOrder,
  getRazorpayPublicKey,
  isRazorpayEnabled,
} from "@/lib/razorpay"
import { roundCurrency } from "@/lib/subscriptions"

const createOrderSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required."),
})

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiRole([
    "admin",
    "internal",
    "portal",
  ])
  if (error || !session?.user?.id) {
    return (
      error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }

  if (!isRazorpayEnabled()) {
    return NextResponse.json(
      { error: "Razorpay is not configured on this environment." },
      { status: 503 }
    )
  }

  const payload = await request.json().catch(() => null)
  const parsed = createOrderSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request." },
      { status: 400 }
    )
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: parsed.data.invoiceId },
    include: {
      contact: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      payments: {
        select: {
          amount: true,
        },
      },
    },
  })

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 })
  }

  if (session.user.role === "portal" && invoice.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (invoice.status === "cancelled" || invoice.status === "paid") {
    return NextResponse.json(
      { error: `Invoice ${invoice.invoiceNumber} is not payable.` },
      { status: 400 }
    )
  }

  const totalPaid = roundCurrency(
    invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
  )
  const amountDue = roundCurrency(Math.max(invoice.total - totalPaid, 0))

  if (amountDue <= 0) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        amountDue: 0,
        status: "paid",
        paidAt: invoice.paidAt ?? new Date(),
      },
    })

    return NextResponse.json(
      { error: `Invoice ${invoice.invoiceNumber} is already settled.` },
      { status: 400 }
    )
  }

  if (invoice.status === "draft") {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "confirmed",
      },
    })
  }

  try {
    const order = await createRazorpayOrder({
      amount: Math.round(amountDue * 100),
      currency: "INR",
      receipt: `inv_${invoice.id.slice(-12)}_${Date.now()}`,
      notes: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerEmail: invoice.contact.user.email ?? "",
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: getRazorpayPublicKey(),
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amountDue,
      },
    })
  } catch (routeError) {
    const message =
      routeError instanceof Error
        ? routeError.message
        : "Unable to create Razorpay order."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
