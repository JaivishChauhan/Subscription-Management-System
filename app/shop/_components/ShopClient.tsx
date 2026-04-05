"use client"

import { useState, useMemo } from "react"
import { Service } from "@prisma/client"
import { IconSearch } from "@tabler/icons-react"
import { ServiceCardClient } from "./ServiceCardClient"

export function ShopClient({
  initialServices,
}: {
  initialServices: Service[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<
    "name_asc" | "name_desc" | "price_asc" | "price_desc" | "default"
  >("default")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const categories = useMemo(() => {
    const cats = new Set(initialServices.map((s) => s.category))
    return ["All", ...Array.from(cats)].sort()
  }, [initialServices])

  const filteredAndSorted = useMemo(() => {
    let result = [...initialServices]

    // 1. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          s.category.toLowerCase().includes(q)
      )
    }

    // 2. Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter((s) => s.category === selectedCategory)
    }

    // 3. Sort
    switch (sortOption) {
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name_desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "price_asc":
        result.sort((a, b) => Number(a.monthlyPrice) - Number(b.monthlyPrice))
        break
      case "price_desc":
        result.sort((a, b) => Number(b.monthlyPrice) - Number(a.monthlyPrice))
        break
      case "default":
        // Keep initial order (sorted by category ascending)
        break
    }

    return result
  }, [initialServices, searchQuery, sortOption, selectedCategory])

  // Group by category if we are not sorting by something else
  const grouped = useMemo(() => {
    if (sortOption !== "default" || selectedCategory !== "All") {
      return { Results: filteredAndSorted }
    }

    return filteredAndSorted.reduce(
      (acc: Record<string, Service[]>, svc: Service) => {
        acc[svc.category] = acc[svc.category] || []
        acc[svc.category].push(svc)
        return acc
      },
      {} as Record<string, Service[]>
    )
  }, [filteredAndSorted, sortOption, selectedCategory])

  return (
    <>
      <section className="bg-muted/30 relative px-4 pt-12 pb-12 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            App <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Browse our catalog of premium services. Add them to your custom
            bundle and unlock progressive discounts.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="relative w-full max-w-md">
              <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for an app..."
                className="border-border bg-card w-full rounded-full border py-3 pr-4 pl-10 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex w-full max-w-md gap-4 sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border-border bg-card w-full rounded-full border px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:w-auto"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="border-border bg-card w-full rounded-full border px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:w-auto"
              >
                <option value="default">Sort: Default</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="price_asc">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              No apps match your search or filters.
            </div>
          ) : (
            Object.entries(grouped).map(([category, svcs]) => (
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
            ))
          )}
        </div>
      </section>
    </>
  )
}
