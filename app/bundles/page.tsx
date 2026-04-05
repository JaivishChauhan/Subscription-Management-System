import Link from "next/link"
import { IconShoppingCart, IconPuzzle, IconApps } from "@tabler/icons-react"
import { prisma as db } from "@/lib/db"
import { Bundle, BundleService, Service } from "@prisma/client"
import { computeBundleFinalPrice } from "@/types/bundle"
import { BundleCardClient } from "./_components/BundleCardClient"

export const revalidate = 3600

export default async function BundlesPage() {
  const bundles = await db.bundle.findMany({
    where: { isActive: true, type: "predefined" },
    include: {
      services: {
        include: { service: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="bg-background min-h-screen">
      <section className="bg-muted/30 relative px-4 pt-12 pb-12 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Predefined <span className="text-gradient">Bundles</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Get the best deals on curated app collections, or build your own
            custom bundle to maximize savings.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/bundles/builder"
              className="btn-gradient inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <IconPuzzle className="h-5 w-5" />
              Build a Custom Bundle
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {bundles.map((bundle) => {
              const originalPrice = bundle.services.reduce(
                (acc: number, bs: any) => acc + bs.service.monthlyPrice,
                0
              )
              const finalPrice = computeBundleFinalPrice(
                originalPrice,
                bundle.discountType as any,
                bundle.discountValue
              )
              return (
                <BundleCardClient
                  key={bundle.id}
                  bundle={bundle as any}
                  originalPrice={originalPrice}
                  finalPrice={finalPrice}
                />
              )
            })}
          </div>
        </div>
      </section>

      <BundlesFooter />
    </div>
  )
}

function BundlesFooter() {
  return (
    <footer className="border-border/50 border-t px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} SubsMS. All prices in INR.
        </p>
      </div>
    </footer>
  )
}
