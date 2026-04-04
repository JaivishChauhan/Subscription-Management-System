import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { settleInvoicePayment } from "@/lib/payments"
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay"

type RazorpayWebhookEvent = {
  event: string
  payload?: {
    payment?: {
      entity?: {
        id: string
        amount: number
        method?: string
        order_id?: string
        notes?: {
          invoiceId?: string
          invoiceNumber?: string
        }
      }
    }
    order?: {
      entity?: {
        id: string
        receipt?: string
        notes?: {
          invoiceId?: string
          invoiceNumber?: string
        }
      }
    }
  }
}

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature")

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "RAZORPAY_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    )
  }

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    )
  }

  let event: RazorpayWebhookEvent

  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook payload." },
      { status: 400 }
    )
  }

  const paymentEntity = event.payload?.payment?.entity
  const invoiceId =
    paymentEntity?.notes?.invoiceId ||
    event.payload?.order?.entity?.notes?.invoiceId ||
    null

  if (event.event === "payment.captured" && paymentEntity?.id && invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        userId: true,
      },
    })

    if (invoice) {
      await settleInvoicePayment({
        invoiceId: invoice.id,
        amount: paymentEntity.amount / 100,
        paymentMethod: `razorpay_${paymentEntity.method || "online"}`,
        createdById: invoice.userId,
        gatewayOrderId: paymentEntity.order_id ?? null,
        gatewayPaymentId: paymentEntity.id,
        gatewaySignature: signature,
        notes: `Captured via Razorpay webhook (${paymentEntity.method || "online"})`,
      })
    }
  }

  return NextResponse.json({
    received: true,
    event: event.event,
  })
}
