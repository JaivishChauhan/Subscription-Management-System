import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isRazorpayEnabled } from "@/lib/razorpay"
import { InvoiceBillingClient } from "../_components/InvoiceBillingClient"

type InvoiceBillingPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Invoice Billing | SubMS",
  description: "Review your invoice and pay securely with Razorpay.",
}

export const dynamic = "force-dynamic"

export default async function InvoiceBillingPage({
  params,
}: InvoiceBillingPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params
  const invoice = await prisma.invoice.findUnique({
    where: { id },
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
      subscription: {
        include: {
          recurringPlan: {
            select: {
              name: true,
            },
          },
          paymentTerms: {
            select: {
              name: true,
              dueDays: true,
            },
          },
        },
      },
      lines: {
        orderBy: { id: "asc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  })

  if (!invoice || invoice.userId !== session.user.id) {
    notFound()
  }

  const customerName =
    [invoice.contact.firstName, invoice.contact.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    invoice.contact.company ||
    "Customer"

  const customerAddress = [
    invoice.contact.address,
    [invoice.contact.city, invoice.contact.state].filter(Boolean).join(", "),
    [invoice.contact.zip, invoice.contact.country].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join("\n")

  return (
    <InvoiceBillingClient
      razorpayEnabled={isRazorpayEnabled()}
      invoice={{
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        createdAt: invoice.createdAt.toISOString(),
        dueDate: invoice.dueDate?.toISOString() ?? null,
        subtotal: invoice.subtotal,
        taxTotal: invoice.taxTotal,
        discountTotal: invoice.discountTotal,
        total: invoice.total,
        amountDue: invoice.amountDue,
        notes: invoice.notes,
        subscriptionNumber: invoice.subscription.subscriptionNumber,
        planName: invoice.subscription.recurringPlan.name,
        paymentTerms: invoice.subscription.paymentTerms
          ? `${invoice.subscription.paymentTerms.name} (${invoice.subscription.paymentTerms.dueDays} days)`
          : "Not set",
        customer: {
          name: customerName,
          email: invoice.contact.user.email || "",
          phone: invoice.contact.phone || "",
          address: customerAddress,
        },
        company: {
          name: "SubsMS",
          email: "billing@subsms.local",
          address: "Subscription Management System",
          gstin: null,
        },
        lineItems: invoice.lines.map((line) => ({
          id: line.id,
          description: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxAmount: line.taxAmount,
          subtotal: line.subtotal,
        })),
        payments: invoice.payments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          paymentDate: payment.paymentDate.toISOString(),
        })),
      }}
    />
  )
}
