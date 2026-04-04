import Link from "next/link"
import Image from "next/image"
import { IconApps, IconSearch, IconPlus } from "@tabler/icons-react"
import { prisma as db } from "@/lib/db"
import { Service } from "@prisma/client"
import { ServiceCardClient } from "./_components/ServiceCardClient"
import { BundleBottomBar } from "./_components/BundleBottomBar"

export const revalidate = 3600

export default async function ShopPage() {
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" },
  })

  const grouped = services.reduce(
    (acc: Record<string, Service[]>, svc: Service) => {
      acc[svc.category] = acc[svc.category] || []
      acc[svc.category].push(svc)
      return acc
    },
    {} as Record<string, typeof services>
  )

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 relative px-4 pt-12 pb-12 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            App <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Browse our catalog of 50+ premium services. Add them to your custom
            bundle and unlock progressive discounts.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-md">
              <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for an app..."
                className="border-border bg-card w-full rounded-full border py-3 pr-4 pl-10 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* App Grid Grouped By Category */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {Object.entries(grouped).map(([category, svcs]) => (
            <div key={category} className="mb-16">
              <div className="border-border/50 mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-foreground text-2xl font-bold tracking-tight capitalize">
                  {category}
                </h2>
                <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-semibold">
                  {svcs.length} apps
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {svcs.map((svc) => (
                  <ServiceCardClient key={svc.id} service={svc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ShopFooter />
      <BundleBottomBar />
    </div>
  )
}

function ShopFooter() {
  return (
    <footer className="border-border/50 border-t px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} SubsMS. All prices in INR. GST applicable
          as per plan.
        </p>
      </div>
    </footer>
  )
}
