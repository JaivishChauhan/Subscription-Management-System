import { InvoicesClient } from "./_components/InvoicesClient"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Invoices | SubMS",
  description: "View your subscription invoices and payment history.",
}

export const dynamic = "force-dynamic"

export default async function InvoicesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch invoices for the logged-in user
  const dbInvoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      lines: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const invoices = dbInvoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    amount: inv.total,
    amountDue: inv.amountDue,
    status: inv.status,
    date: inv.createdAt,
    items: inv.lines.map((l) => l.name).join(", ") || "Subscription Item",
  }))

  const totalPaid = dbInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0)

  return <InvoicesClient invoices={invoices} totalPaid={totalPaid} />
}
