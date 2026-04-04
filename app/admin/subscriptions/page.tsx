import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconPlus,
  IconRepeat,
  IconSearch,
} from "@tabler/icons-react";
import { prisma } from "@/lib/db";
import { requirePageRole } from "@/lib/admin";
import { roundCurrency } from "@/lib/subscriptions";
import {
  subscriptionFiltersSchema,
  type SubscriptionStatus,
} from "@/lib/validations/subscription";
import { SubscriptionStatusBadge } from "./_components/SubscriptionStatusBadge";

export const metadata: Metadata = {
  title: "Subscriptions",
};

export const dynamic = "force-dynamic";

type SubscriptionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_TABS: Array<{ label: string; value: "all" | SubscriptionStatus }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Quotation", value: "quotation" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Active", value: "active" },
  { label: "Closed", value: "closed" },
];

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  await requirePageRole(["admin", "internal"]);

  const rawSearchParams = await searchParams;
  const parsed = subscriptionFiltersSchema.parse({
    q: firstValue(rawSearchParams.q),
    status: firstValue(rawSearchParams.status),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
  });

  const { q, status, page, pageSize } = parsed;
  const where = buildSubscriptionWhereClause({ q, status });

  const [
    subscriptions,
    totalSubscriptions,
    draftCount,
    quotationCount,
    confirmedCount,
    activeCount,
    closedCount,
  ] = await prisma.$transaction([
    prisma.subscription.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
        recurringPlan: {
          select: {
            name: true,
          },
        },
        lines: {
          select: {
            subtotal: true,
          },
        },
      },
    }),
    prisma.subscription.count({ where }),
    prisma.subscription.count({ where: { status: "draft" } }),
    prisma.subscription.count({ where: { status: "quotation" } }),
    prisma.subscription.count({ where: { status: "confirmed" } }),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.subscription.count({ where: { status: "closed" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalSubscriptions / pageSize));
  const statusCounts: Record<string, number> = {
    all: draftCount + quotationCount + confirmedCount + activeCount + closedCount,
    draft: draftCount,
    quotation: quotationCount,
    confirmed: confirmedCount,
    active: activeCount,
    closed: closedCount,
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-6 shadow-sm dark:from-card dark:via-card dark:to-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
              Subscription Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Lifecycle command center</h1>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              Draft records can be shaped here before they move through quotation, confirmation,
              activation, and closure.
            </p>
          </div>

          <Link
            href="/admin/subscriptions/new"
            className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <IconPlus className="h-4 w-4" />
            New Subscription
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildStatusHref(rawSearchParams, tab.value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                status === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  status === tab.value ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {statusCounts[tab.value]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Search subscriptions</span>
            <IconSearch className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by customer name, email, company, or subscription number"
              className="w-full rounded-2xl border border-input bg-background py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <button
            type="submit"
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Apply search
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <th className="px-5 py-4">Subscription</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Start Date</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <IconRepeat className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">No subscriptions found</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Create the first draft subscription to begin the lifecycle flow.
                        </p>
                        <Link
                          href="/admin/subscriptions/new"
                          className="btn-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                        >
                          <IconPlus className="h-4 w-4" />
                          Create Subscription
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((subscription) => {
                    const displayName =
                      [subscription.contact.firstName, subscription.contact.lastName]
                        .filter(Boolean)
                        .join(" ")
                        .trim() ||
                      subscription.contact.company ||
                      "Customer";

                    return (
                      <tr key={subscription.id} className="hover:bg-muted/20">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold">{subscription.subscriptionNumber}</p>
                            <p className="text-muted-foreground text-sm">
                              Updated {formatDate(subscription.updatedAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium">{displayName}</p>
                            <p className="text-muted-foreground text-sm">
                              {subscription.contact.user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {subscription.recurringPlan.name}
                        </td>
                        <td className="px-5 py-4">
                          <SubscriptionStatusBadge
                            status={normalizeSubscriptionStatus(subscription.status)}
                          />
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {subscription.startDate ? formatDate(subscription.startDate) : "Not set"}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium">
                          {formatCurrency(
                            roundCurrency(
                              subscription.lines.reduce((sum, line) => sum + line.subtotal, 0),
                            ),
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/subscriptions/${subscription.id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
                          >
                            Open
                            <IconArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + (subscriptions.length ? 1 : 0)}-
            {(page - 1) * pageSize + subscriptions.length} of {totalSubscriptions} subscription
            {totalSubscriptions === 1 ? "" : "s"}.
          </p>

          <div className="flex items-center gap-2">
            <PaginationLink
              href={buildPageHref(rawSearchParams, Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </PaginationLink>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <PaginationLink
              href={buildPageHref(rawSearchParams, Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
            </PaginationLink>
          </div>
        </div>
      </section>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground/60">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
    >
      {children}
    </Link>
  );
}

function buildSubscriptionWhereClause({
  q,
  status,
}: {
  q?: string;
  status: "all" | SubscriptionStatus;
}) {
  return {
    ...(status === "all" ? {} : { status }),
    ...(q
      ? {
          OR: [
            { subscriptionNumber: { contains: q, mode: "insensitive" as const } },
            { contact: { firstName: { contains: q, mode: "insensitive" as const } } },
            { contact: { lastName: { contains: q, mode: "insensitive" as const } } },
            { contact: { company: { contains: q, mode: "insensitive" as const } } },
            { contact: { user: { email: { contains: q, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };
}

function buildStatusHref(
  searchParams: Record<string, string | string[] | undefined>,
  nextStatus: "all" | SubscriptionStatus,
) {
  const params = new URLSearchParams();
  const q = firstValue(searchParams.q);
  const pageSize = firstValue(searchParams.pageSize);

  if (q) {
    params.set("q", q);
  }

  if (pageSize) {
    params.set("pageSize", pageSize);
  }

  params.set("status", nextStatus);

  return `/admin/subscriptions?${params.toString()}`;
}

function buildPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  nextPage: number,
) {
  const params = new URLSearchParams();
  const q = firstValue(searchParams.q);
  const status = firstValue(searchParams.status);
  const pageSize = firstValue(searchParams.pageSize);

  if (q) {
    params.set("q", q);
  }

  if (status) {
    params.set("status", status);
  }

  if (pageSize) {
    params.set("pageSize", pageSize);
  }

  params.set("page", String(nextPage));

  return `/admin/subscriptions?${params.toString()}`;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value);
}

function normalizeSubscriptionStatus(value: string): SubscriptionStatus {
  switch (value) {
    case "quotation":
    case "confirmed":
    case "active":
    case "closed":
      return value;
    default:
      return "draft";
  }
}
