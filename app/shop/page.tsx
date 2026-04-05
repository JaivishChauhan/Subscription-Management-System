import Link from "next/link"
import Image from "next/image"
import { IconApps, IconSearch, IconPlus } from "@tabler/icons-react"
import { prisma as db } from "@/lib/db"
import { Service } from "@prisma/client"
import { BundleBottomBar } from "./_components/BundleBottomBar"
import { ShopClient } from "./_components/ShopClient"

export const revalidate = 3600

export default async function ShopPage() {
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" },
  })

  return (
    <div className="bg-background min-h-screen">
      <ShopClient initialServices={services} />
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
