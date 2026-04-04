import { prisma } from "@/lib/db"
import { roundCurrency } from "@/lib/subscriptions"

type SettleInvoicePaymentInput = {
  invoiceId: string
  amount: number
  paymentMethod: string
  createdById: string
  gatewayOrderId?: string | null
  gatewayPaymentId?: string | null
  gatewaySignature?: string | null
  stripePaymentIntentId?: string | null
  notes?: string | null
}

export async function settleInvoicePayment(input: SettleInvoicePaymentInput) {
  return prisma.$transaction(async (tx) => {
    if (input.gatewayPaymentId) {
      const existingPayment = await tx.payment.findUnique({
        where: { gatewayPaymentId: input.gatewayPaymentId },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              total: true,
              amountDue: true,
              paidAt: true,
            },
          },
        },
      })

      if (existingPayment) {
        return {
          payment: existingPayment,
          invoice: existingPayment.invoice,
          created: false as const,
        }
      }
    }

    const invoice = await tx.invoice.findUnique({
      where: { id: input.invoiceId },
      include: {
        payments: {
          select: {
            amount: true,
          },
        },
      },
    })

    if (!invoice) {
      throw new Error("INVOICE_NOT_FOUND")
    }

    if (invoice.status === "cancelled") {
      throw new Error("INVOICE_NOT_PAYABLE")
    }

    const totalRecorded = roundCurrency(
      invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
    )
    const outstanding = roundCurrency(
      Math.max(invoice.total - totalRecorded, 0)
    )

    if (outstanding <= 0) {
      const normalizedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountDue: 0,
          status: "paid",
          paidAt: invoice.paidAt ?? new Date(),
        },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          total: true,
          amountDue: true,
          paidAt: true,
        },
      })

      return {
        payment: null,
        invoice: normalizedInvoice,
        created: false as const,
      }
    }

    const amount = roundCurrency(
      Math.min(Math.max(input.amount, 0), outstanding)
    )

    if (amount <= 0) {
      throw new Error("INVALID_PAYMENT_AMOUNT")
    }

    const payment = await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        createdById: input.createdById,
        paymentMethod: input.paymentMethod,
        amount,
        stripePaymentIntentId: input.stripePaymentIntentId ?? null,
        gatewayOrderId: input.gatewayOrderId ?? null,
        gatewayPaymentId: input.gatewayPaymentId ?? null,
        gatewaySignature: input.gatewaySignature ?? null,
        notes: input.notes ?? null,
      },
    })

    const nextAmountDue = roundCurrency(Math.max(outstanding - amount, 0))
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        amountDue: nextAmountDue,
        status:
          nextAmountDue <= 0
            ? "paid"
            : invoice.status === "draft"
              ? "confirmed"
              : invoice.status,
        paidAt: nextAmountDue <= 0 ? (invoice.paidAt ?? new Date()) : null,
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        total: true,
        amountDue: true,
        paidAt: true,
      },
    })

    return {
      payment,
      invoice: updatedInvoice,
      created: true as const,
    }
  })
}
