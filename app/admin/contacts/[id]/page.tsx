import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { ContactForm } from "../_components/ContactForm"

export const metadata: Metadata = {
  title: "View Contact",
}

export const dynamic = "force-dynamic"

export default async function ViewContactPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdminPage()

  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { email: true, role: true },
      },
    },
  })

  if (!contact) {
    notFound()
  }

  const initialData = {
    firstName: contact.firstName,
    lastName: contact.lastName,
    company: contact.company,
    phone: contact.phone,
    address: contact.address,
    city: contact.city,
    state: contact.state,
    zip: contact.zip,
    country: contact.country,
    notes: contact.notes,
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/contacts"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
        >
          <IconArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Edit Contact: {contact.firstName} {contact.lastName}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {contact.user.email} (Role: {contact.user.role})
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <ContactForm id={contact.id} initialData={initialData} />
      </div>
    </div>
  )
}
