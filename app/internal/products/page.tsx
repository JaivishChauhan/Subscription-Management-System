import type { Metadata } from "next"
import { IconPackage } from "@tabler/icons-react"
import { prisma } from "@/lib/db"
import { requireInternalPage } from "@/lib/admin"

export const metadata: Metadata = {
  title: "Products | Internal",
}

export const dynamic = "force-dynamic"

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })

/**
 * Internal Products page — read-only product catalog.
 * Internal users can view products and variants but cannot create or delete.
 * @security Requires internal role.
 */
export default async function InternalProductsPage() {
  await requireInternalPage()

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: {
      variants: true,
    },
  })

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-sky-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-sky-600 uppercase">Catalog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Products</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          View the product catalog and available variants. Contact an admin to create or modify products.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20">
            <IconPackage className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-semibold">No products yet</p>
          </div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground capitalize">{p.type}</p>
                </div>
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                  {p.variants.length} variant{p.variants.length === 1 ? "" : "s"}
                </span>
              </div>
              {p.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              )}
              {p.variants.length > 0 && (
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Variants</p>
                  {p.variants.slice(0, 5).map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-sm">
                      <span>{v.name}</span>
                      <span className="font-semibold">{INR.format(v.price)}</span>
                    </div>
                  ))}
                  {p.variants.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{p.variants.length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
