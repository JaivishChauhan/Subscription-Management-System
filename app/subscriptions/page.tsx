import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  IconCalendar,
  IconCreditCard,
  IconCheck,
  IconClock,
  IconCircleX,
  IconArrowRight,
} from "@tabler/icons-react"

export const metadata: Metadata = {
  title: "My Subscriptions",
  description: "View and manage your active subscriptions",
}

export const dynamic = "force-dynamic"

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

const STATUS_CONFIG: Record<
  string,
  { label: string; colorClass: string; icon: React.ElementType }
> = {
  active: {
    label: "Active",
    colorClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: IconCheck,
  },
  confirmed: {
    label: "Confirmed",
    colorClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    icon: IconCheck,
  },
  quotation: {
    label: "Quotation",
    colorClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: IconClock,
  },
  draft: {
    label: "Draft",
    colorClass:
      "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
    icon: IconClock,
  },
  closed: {
    label: "Closed",
    colorClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: IconCircleX,
  },
}

type Subscription = {
  id: string
  status: string
  startDate: Date | null
  expirationDate: Date | null
  recurringPlan: {
    name: string
    price: number
    billingPeriod: string
  }
  lines: {
    subtotal: number
    taxAmount: number
  }[]
}

export default async function SubscriptionsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      recurringPlan: {
        select: {
          name: true,
          price: true,
          billingPeriod: true,
        },
      },
      lines: {
        select: {
          subtotal: true,
          taxAmount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Subscriptions</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your active and past subscriptions
          </p>
        </div>

        {subscriptions.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        ) : (
          <div className="border-border bg-card rounded-2xl border p-12 text-center">
            <p className="text-muted-foreground text-lg">
              You don&apos;t have any subscriptions yet.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Browse Apps
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const config = STATUS_CONFIG[subscription.status] ?? STATUS_CONFIG["draft"]
  const StatusIcon = config.icon

  return (
    <div className="border-border bg-card flex flex-col rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h3 className="text-lg leading-snug font-bold">
          {subscription.recurringPlan.name}
        </h3>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.colorClass}`}
        >
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      <div className="text-muted-foreground space-y-2.5 text-sm">
        <div className="flex items-center gap-2">
          <IconCreditCard className="h-4 w-4 shrink-0" />
          <span>
            {INR.format(
              subscription.lines && subscription.lines.length > 0
                ? subscription.lines.reduce(
                    (sum, line) => sum + line.subtotal + line.taxAmount,
                    0
                  )
                : subscription.recurringPlan.price
            )}{" "}
            /{" "}
            {subscription.recurringPlan.billingPeriod.charAt(0).toUpperCase() +
              subscription.recurringPlan.billingPeriod.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IconCalendar className="h-4 w-4 shrink-0" />
          <span>
            Started:{" "}
            {subscription.startDate
              ? new Date(subscription.startDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Pending"}
          </span>
        </div>
        {subscription.expirationDate && (
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 shrink-0" />
            <span>
              Ends:{" "}
              {new Date(subscription.expirationDate).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </span>
          </div>
        )}
      </div>

      {/* View Details only — cancellation must be requested via contact/admin per RBAC spec */}
      <div className="mt-6 flex flex-1 items-end">
        <Link
          href={`/subscriptions/${subscription.id}`}
          className="group border-border bg-card hover:bg-muted inline-flex w-full items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
        >
          View Details
          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
