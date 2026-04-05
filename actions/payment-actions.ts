"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { settleInvoicePayment } from "@/lib/payments"

async function requireAdmin(): Promise<any> {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }
  return session.user
}

export async function createPaymentAction(data: {
  invoiceId: string
  amount: number
  paymentMethod: string
  paymentDate: Date
  notes?: string | null
}) {
  const user = await requireAdmin()

  // Use the existing logic to ensure invoice status is updated if it is paid in full
  const result = await settleInvoicePayment({
    invoiceId: data.invoiceId,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    createdById: user.id,
    notes: data.notes,
  })

  // If we need to backdate it or manually tweak the paymentDate
  if (result.payment) {
    await prisma.payment.update({
      where: { id: result.payment.id },
      data: { paymentDate: data.paymentDate },
    })
  }

  revalidatePath("/admin/payments")
  revalidatePath(`/admin/invoices/${data.invoiceId}`)
  return result.payment
}

export async function updatePaymentAction(
  id: string,
  data: {
    paymentMethod?: string
    notes?: string | null
    paymentDate?: Date
  }
) {
  await requireAdmin()

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      ...(data.paymentMethod !== undefined && {
        paymentMethod: data.paymentMethod,
      }),
      ...(data.paymentDate !== undefined && { paymentDate: data.paymentDate }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  })

  revalidatePath("/admin/payments")
  revalidatePath(`/admin/payments/${id}`)
  return payment
}
