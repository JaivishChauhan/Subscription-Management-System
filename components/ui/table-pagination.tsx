"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

export function TablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
}: {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("pageSize", newSize.toString())
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-muted-foreground text-sm">
          Showing {(page - 1) * pageSize + (totalItems > 0 ? 1 : 0)}-
          {Math.min(page * pageSize, totalItems)} of {totalItems} item
          {totalItems === 1 ? "" : "s"}.
        </p>

        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="pageSize" className="text-muted-foreground">
            View:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border-border bg-background focus:ring-primary/20 rounded-md border px-2 py-1 text-sm outline-none focus:ring-2"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="border-border hover:bg-muted/50 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-muted-foreground text-sm">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="border-border hover:bg-muted/50 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
