import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireApiRole } from "@/lib/admin"
import { settleInvoicePayment } from "@/lib/payments"
import {
  fetchRazorpayPayment,
  isRazorpayEnabled,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay"

const verifyPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required."),
  razorpay_order_id: z.string().min(1, "Order id is required."),
  razorpay_payment_id: z.string().min(1, "Payment id is required."),
  razorpay_signature: z.string().min(1, "Signature is required."),
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
  const parsed = verifyPaymentSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid request.",
      },
      { status: 400 }
    )
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: parsed.data.invoiceId },
    select: {
      id: true,
      userId: true,
      invoiceNumber: true,
      status: true,
      amountDue: true,
    },
  })

  if (!invoice) {
    return NextResponse.json(
      { success: false, error: "Invoice not found." },
      { status: 404 }
    )
  }

  if (session.user.role === "portal" && invoice.userId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    )
  }

  if (
    !verifyRazorpayPaymentSignature({
      orderId: parsed.data.razorpay_order_id,
      paymentId: parsed.data.razorpay_payment_id,
      signature: parsed.data.razorpay_signature,
    })
  ) {
    return NextResponse.json(
      { success: false, error: "Payment verification failed." },
      { status: 400 }
    )
  }

  try {
    const gatewayPayment = await fetchRazorpayPayment(
      parsed.data.razorpay_payment_id
    )
    const settled = await settleInvoicePayment({
      invoiceId: invoice.id,
      amount: gatewayPayment.amount / 100,
      paymentMethod: `razorpay_${gatewayPayment.method || "online"}`,
      createdById: session.user.id,
      gatewayOrderId: parsed.data.razorpay_order_id,
      gatewayPaymentId: parsed.data.razorpay_payment_id,
      gatewaySignature: parsed.data.razorpay_signature,
      notes: `Captured via Razorpay (${gatewayPayment.method || "online"})`,
    })

    return NextResponse.json({
      success: true,
      created: settled.created,
      invoice: settled.invoice,
      paymentId: parsed.data.razorpay_payment_id,
      orderId: parsed.data.razorpay_order_id,
    })
  } catch (routeError) {
    const message =
      routeError instanceof Error
        ? routeError.message
        : "Verification failed. Please try again."
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
