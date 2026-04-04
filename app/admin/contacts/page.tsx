import type { Metadata } from "next"
import { IconUsers } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Contacts",
}

export const dynamic = "force-dynamic"

export default async function AdminContactsPage() {
  await requireAdminPage()

  const contacts = await prisma.contact.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          subscriptions: true,
          invoices: true,
        },
      },
    },
    take: 100,
  })

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-indigo-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
          Contacts
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Customer directory</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          Review subscriber profiles, roles, and downstream operational records in one place.
        </p>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Subscriptions</th>
                  <th className="px-5 py-4">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold">
                          {[contact.firstName, contact.lastName].filter(Boolean).join(" ").trim() ||
                            "Customer"}
                        </p>
                        <p className="text-muted-foreground text-sm">{contact.user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {contact.company || "Individual"}
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-muted-foreground">
                      {contact.user.role}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium">{contact._count.subscriptions}</td>
                    <td className="px-5 py-4 text-sm font-medium">{contact._count.invoices}</td>
                  </tr>
                ))}
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <IconUsers className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">No contacts found</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Contacts appear automatically when users register or are provisioned.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
