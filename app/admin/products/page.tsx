import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconPackage, IconPlus, IconSearch } from "@tabler/icons-react";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin";
import { productFiltersSchema } from "@/lib/validations/product";

export const metadata: Metadata = {
  title: "Products",
};

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireAdminPage();

  const rawSearchParams = await searchParams;
  const parsed = productFiltersSchema.parse({
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

  const [products, totalProducts, activeCount, inactiveCount] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        type: true,
        salesPrice: true,
        isActive: true,
        updatedAt: true,
      },
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: false } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-6 shadow-sm dark:from-card dark:via-card dark:to-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
              Product Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Catalog foundation</h1>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              Products are the base layer for recurring pricing, subscriptions, invoice lines,
              and future variant configuration. This is the first feature slice from the tracker,
              so the focus here is getting the CRUD path working end to end.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <IconPlus className="h-4 w-4" />
            New Product
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Active Products" value={activeCount} tone="indigo" />
          <SummaryCard label="Inactive Products" value={inactiveCount} tone="slate" />
          <SummaryCard label="Filtered Results" value={totalProducts} tone="emerald" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <IconSearch className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by product name"
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
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Sales Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <IconPackage className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">No products found</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Try adjusting your filters, or create the first product so plans and
                          subscriptions have something to reference.
                        </p>
                        <Link
                          href="/admin/products/new"
                          className="btn-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                        >
                          <IconPlus className="h-4 w-4" />
                          Create Product
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-muted-foreground text-sm">
                            ID: {product.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm capitalize text-muted-foreground">
                        {product.type}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium">
                        {currencyFormatter.format(product.salesPrice)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill active={product.isActive} />
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(product.updatedAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/products/${product.id}`}
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
            Showing {(page - 1) * pageSize + (products.length ? 1 : 0)}-
            {(page - 1) * pageSize + products.length} of {totalProducts} product
            {totalProducts === 1 ? "" : "s"}.
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

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
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

  return `/admin/products?${params.toString()}`;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value);
}
