import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  IconCalendar,
  IconCreditCard,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Subscriptions</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all your active and past subscriptions
          </p>
        </div>

        {subscriptions.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">
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
  );
}

function SubscriptionCard({
  subscription,
}: {
  subscription: {
    id: string;
    status: string;
    startDate: Date;
    endDate: Date | null;
    plan: {
      name: string;
      price: number;
      billingCycle: string;
    };
  };
}) {
  const isActive = subscription.status === "active";
  const statusColor = isActive
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : subscription.status === "pending"
    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-bold">{subscription.plan.name}</h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${statusColor}`}
        >
          {isActive ? (
            <IconCheck className="h-3 w-3" />
          ) : (
            <IconX className="h-3 w-3" />
          )}
          {subscription.status}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconCreditCard className="h-4 w-4" />
          <span>
            ₹{subscription.plan.price} / {subscription.plan.billingCycle}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconCalendar className="h-4 w-4" />
          <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
        </div>
        {subscription.endDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCalendar className="h-4 w-4" />
            <span>Ends: {new Date(subscription.endDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <Link
          href={`/subscriptions/${subscription.id}`}
          className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-center text-sm font-semibold transition-colors hover:bg-muted"
        >
          View Details
        </Link>
        {isActive && (
          <button
            type="button"
            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
