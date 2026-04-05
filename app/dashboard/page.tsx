import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getDefaultPortalPath } from "@/lib/roles"
import {
  IconRocket,
  IconShoppingCart,
  IconReceipt,
  IconUser,
} from "@tabler/icons-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "portal") {
    redirect(getDefaultPortalPath(session.user.role))
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      contact: true,
      subscriptions: {
        include: {
          recurringPlan: true,
        },
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        include: {
          subscription: {
            select: {
              id: true,
              subscriptionNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  const activeSubscriptions = user.subscriptions.filter(
    (sub) => sub.status === "active"
  )

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user.name || "User"}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscriptions and view your account details
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Subscriptions"
            value={activeSubscriptions.length}
            icon={IconShoppingCart}
          />
          <StatCard
            title="Total Invoices"
            value={user.invoices.length}
            icon={IconReceipt}
          />
          <StatCard title="Account Role" value={user.role} icon={IconUser} />
          <StatCard
            title="Member Since"
            value={new Date(user.createdAt).toLocaleDateString()}
            icon={IconRocket}
          />
        </div>

        {/* Active Subscriptions */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Active Subscriptions</h2>
          {activeSubscriptions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="border-border bg-card rounded-lg border p-6 shadow-sm"
                >
                  <h3 className="font-semibold">{sub.recurringPlan.name}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Status:{" "}
                    <span className="text-emerald-500">{sub.status}</span>
                  </p>
                  {sub.startDate && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      Started: {new Date(sub.startDate).toLocaleDateString()}
                    </p>
                  )}
                  {sub.expirationDate && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      Ends: {new Date(sub.expirationDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border-border bg-card rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">
                You don&apos;t have any active subscriptions yet.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <IconShoppingCart className="h-4 w-4" />
                Browse Apps
              </Link>
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Invoices</h2>
            <Link
              href="/subscriptions"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View All →
            </Link>
          </div>
          {user.invoices.length > 0 ? (
            <div className="border-border bg-card overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="border-border bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {user.invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/subscriptions/${invoice.subscription.id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {invoice.subscription.subscriptionNumber}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 2,
                        }).format(invoice.total)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            invoice.status === "paid"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : invoice.status === "confirmed"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border-border bg-card rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">No invoices yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
    </div>
  )
}
