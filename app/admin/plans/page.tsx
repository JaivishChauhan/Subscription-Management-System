import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconPlus,
  IconRepeat,
  IconSearch,
} from "@tabler/icons-react";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin";
import { recurringPlanFiltersSchema } from "@/lib/validations/plan";
import { PlanStatusToggle } from "./_components/PlanStatusToggle";

export const metadata: Metadata = {
  title: "Plans",
};

export const dynamic = "force-dynamic";

type PlansPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default async function PlansPage({ searchParams }: PlansPageProps) {
  await requireAdminPage();

  const rawSearchParams = await searchParams;
  const parsed = recurringPlanFiltersSchema.parse({
    q: firstValue(rawSearchParams.q),
    status: firstValue(rawSearchParams.status),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
  });

  const { q, status, page, pageSize } = parsed;
  const where = {
    ...(q
      ? {
          name: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(status === "all" ? {} : { isActive: status === "active" }),
  };

  const [plans, totalPlans, activeCount, inactiveCount] = await prisma.$transaction([
    prisma.recurringPlan.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        billingPeriod: true,
        price: true,
        minQuantity: true,
        isActive: true,
        updatedAt: true,
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    }),
    prisma.recurringPlan.count({ where }),
    prisma.recurringPlan.count({ where: { isActive: true } }),
    prisma.recurringPlan.count({ where: { isActive: false } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalPlans / pageSize));

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-6 shadow-sm dark:from-card dark:via-card dark:to-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
              Recurring Plans
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Billing engine controls</h1>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              Plans define cadence, price, quantity constraints, and lifecycle rules before
              subscriptions are created. This is the next foundation module in the tracker.
            </p>
          </div>

          <Link
            href="/admin/plans/new"
            className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <IconPlus className="h-4 w-4" />
            New Plan
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Active Plans" value={activeCount} tone="indigo" />
          <SummaryCard label="Inactive Plans" value={inactiveCount} tone="slate" />
          <SummaryCard label="Filtered Results" value={totalPlans} tone="emerald" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Search plans</span>
            <IconSearch className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by plan name"
              className="w-full rounded-2xl border border-input bg-background py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <select
            name="status"
            defaultValue={status}
            className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          <button
            type="submit"
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Apply filters
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Period</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Min Qty</th>
                  <th className="px-5 py-4">Subscriptions</th>
                  <th className="px-5 py-4">Active</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <IconRepeat className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">No plans found</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Create your first recurring plan so subscriptions have pricing and
                          cadence rules to depend on.
                        </p>
                        <Link
                          href="/admin/plans/new"
                          className="btn-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                        >
                          <IconPlus className="h-4 w-4" />
                          Create Plan
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold">{plan.name}</p>
                          <p className="text-muted-foreground text-sm">
                            ID: {plan.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm capitalize text-muted-foreground">
                        {plan.billingPeriod}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium">
                        {currencyFormatter.format(plan.price)}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {plan.minQuantity}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {plan._count.subscriptions}
                      </td>
                      <td className="px-5 py-4">
                        <PlanStatusToggle planId={plan.id} isActive={plan.isActive} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/plans/${plan.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
                        >
                          Open
                          <IconArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + (plans.length ? 1 : 0)}-
            {(page - 1) * pageSize + plans.length} of {totalPlans} plan
            {totalPlans === 1 ? "" : "s"}.
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

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "indigo" | "slate" | "emerald";
}) {
  const toneClassName = {
    indigo: "from-indigo-500/10 to-violet-500/10 text-indigo-700 dark:text-indigo-300",
    slate: "from-slate-500/10 to-slate-400/10 text-slate-700 dark:text-slate-300",
    emerald: "from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300",
  }[tone];

  return (
    <div className={`rounded-3xl border border-border bg-gradient-to-br p-5 ${toneClassName}`}>
      <p className="text-xs font-semibold tracking-[0.2em] uppercase">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
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

  return `/admin/plans?${params.toString()}`;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
