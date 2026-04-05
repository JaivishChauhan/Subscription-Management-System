import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { PaymentForm } from "../_components/PaymentForm"

export const metadata: Metadata = {
  title: "Edit Payment",
}

export const dynamic = "force-dynamic"

export default async function EditPaymentPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdminPage()

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          amountDue: true,
        },
      },
    },
  })

  if (!payment) {
    notFound()
  }

  const initialData = {
    invoiceId: payment.invoiceId,
    paymentMethod: payment.paymentMethod,
    amount: payment.amount,
    paymentDate: payment.paymentDate.toISOString().substring(0, 10),
    notes: payment.notes || "",
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/payments"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
        >
          <IconArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Edit Payment
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Refine details for payment on {payment.invoice.invoiceNumber}.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <PaymentForm
          id={payment.id}
          initialData={initialData}
          availableInvoices={[payment.invoice]}
        />
      </div>
    </div>
  )
}
