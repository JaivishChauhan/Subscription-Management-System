import type { Metadata } from "next"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { InvoiceForm } from "../_components/InvoiceForm"

export const metadata: Metadata = {
  title: "Generate Invoice",
}

export const dynamic = "force-dynamic"

export default async function NewInvoicePage() {
  await requireAdminPage()

  const pendingSubscriptions = await prisma.subscription.findMany({
    where: {
      status: { in: ["confirmed", "active"] },
      invoices: { none: {} },
    },
    select: {
      id: true,
      subscriptionNumber: true,
      contact: {
        select: {
          firstName: true,
          lastName: true,
          company: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/invoices"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
        >
          <IconArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Generate Invoice
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create an invoice for subscriptions pending payment.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <InvoiceForm availableSubscriptions={pendingSubscriptions} />
      </div>
    </div>
  )
}
