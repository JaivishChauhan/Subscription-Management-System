"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconSearch,
  IconX,
  IconTag,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react"

type Discount = {
  id: string
  name: string
  code: string
  type: "fixed" | "percentage"
  value: number
  minPurchase: number | null
  usageLimit: number | null
  usageCount: number
  startDate: string
  endDate: string
  isActive: boolean
  applicableProducts: Array<{ product: { id: string; name: string } }>
}

interface AdminDiscountsClientProps {
  initialDiscounts: Discount[]
  initialTotal: number
}

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })

/**
 * Admin Discounts management client component.
 * Handles full CRUD with optimistic toggle and deletion.
 * @security Admin-only — server component enforces role.
 */
export function AdminDiscountsClient({ initialDiscounts, initialTotal }: AdminDiscountsClientProps) {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts)
  const [total, setTotal] = useState(initialTotal)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "fixed" | "percentage">("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [isPending, startTransition] = useTransition()

  async function fetchDiscounts(q: string, type: "all" | "fixed" | "percentage") {
    const params = new URLSearchParams({ q, type })
    const res = await fetch(`/api/discounts?${params}`)
    if (res.ok) {
      const data = await res.json()
      setDiscounts(data.discounts)
      setTotal(data.pagination.total)
    }
  }

  function handleSearch(value: string) {
    setSearch(value)
    startTransition(() => fetchDiscounts(value, typeFilter))
  }

  async function handleToggleActive(discount: Discount) {
    const previous = discounts
    setDiscounts((prev) =>
      prev.map((d) => (d.id === discount.id ? { ...d, isActive: !d.isActive } : d))
    )

    const res = await fetch(`/api/discounts/${discount.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !discount.isActive }),
    })
    if (!res.ok) {
      setDiscounts(previous)
      toast.error("Failed to update discount status.")
    } else {
      toast.success(`Discount ${discount.isActive ? "deactivated" : "activated"}.`)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete discount "${name}"? This cannot be undone.`)) return

    const previous = discounts
    setDiscounts((prev) => prev.filter((d) => d.id !== id))
    setTotal((prev) => prev - 1)

    const res = await fetch(`/api/discounts/${id}`, { method: "DELETE" })
    if (!res.ok) {
      setDiscounts(previous)
      setTotal((prev) => prev + 1)
      toast.error("Failed to delete discount.")
    } else {
      toast.success(`"${name}" deleted.`)
    }
  }

  const isExpired = (d: Discount) => new Date(d.endDate) < new Date()

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "fixed", "percentage"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTypeFilter(t)
                startTransition(() => fetchDiscounts(search, t))
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                typeFilter === t
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search code or name…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-9 rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <IconPlus className="h-4 w-4" />
            New Discount
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Type / Value</th>
                <th className="px-5 py-4">Usage</th>
                <th className="px-5 py-4">Validity</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-muted-foreground">
                    No discounts found.
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <IconTag className="h-4 w-4 shrink-0 text-indigo-500" />
                        <div>
                          <p className="font-semibold font-mono">{d.code}</p>
                          <p className="text-xs text-muted-foreground">{d.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-indigo-600">
                        {d.type === "percentage" ? `${d.value}%` : INR.format(d.value)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground capitalize">{d.type}</span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {d.usageCount} / {d.usageLimit ?? "∞"}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      <p>{new Date(d.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      <p>→ {new Date(d.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      {isExpired(d) && (
                        <span className="mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(d)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                          d.isActive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        aria-label={d.isActive ? "Deactivate" : "Activate"}
                      >
                        {d.isActive ? (
                          <IconToggleRight className="h-3.5 w-3.5" />
                        ) : (
                          <IconToggleLeft className="h-3.5 w-3.5" />
                        )}
                        {d.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingDiscount(d)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Edit ${d.code}`}
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id, d.name)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${d.code}`}
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <DiscountFormModal
          title="Create Discount"
          onClose={() => setShowCreateModal(false)}
          onSaved={(newD) => {
            setDiscounts((prev) => [newD, ...prev])
            setTotal((prev) => prev + 1)
            setShowCreateModal(false)
          }}
        />
      )}

      {editingDiscount && (
        <DiscountFormModal
          title="Edit Discount"
          initial={editingDiscount}
          onClose={() => setEditingDiscount(null)}
          onSaved={(updated) => {
            setDiscounts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
            setEditingDiscount(null)
          }}
        />
      )}
    </div>
  )
}

/* ─── Discount Form Modal ─────────────────────────────────────────────────── */

function DiscountFormModal({
  title,
  initial,
  onClose,
  onSaved,
}: {
  title: string
  initial?: Discount
  onClose: () => void
  onSaved: (d: Discount) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const isEditing = !!initial

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const fd = new FormData(e.currentTarget)

    const body = {
      name: fd.get("name") as string,
      code: (fd.get("code") as string).toUpperCase(),
      type: fd.get("type") as "fixed" | "percentage",
      value: parseFloat(fd.get("value") as string),
      minPurchase: fd.get("minPurchase") ? parseFloat(fd.get("minPurchase") as string) : null,
      usageLimit: fd.get("usageLimit") ? parseInt(fd.get("usageLimit") as string, 10) : null,
      startDate: fd.get("startDate") as string,
      endDate: fd.get("endDate") as string,
      isActive: fd.get("isActive") === "true",
    }

    const url = isEditing ? `/api/discounts/${initial!.id}` : "/api/discounts"
    const method = isEditing ? "PATCH" : "POST"

    startTransition(async () => {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error ?? "Failed to save discount.")
        return
      }
      toast.success(isEditing ? "Discount updated." : "Discount created.")
      onSaved(data.discount)
    })
  }

  const fmt = (d: string) => d?.split("T")[0] ?? ""

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
          <IconX className="h-4 w-4" />
        </button>
        <h2 className="mb-6 text-xl font-bold">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount-name" className="mb-1.5 block text-sm font-medium">Name</label>
              <input id="discount-name" name="name" type="text" required defaultValue={initial?.name}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="discount-code" className="mb-1.5 block text-sm font-medium">Code</label>
              <input id="discount-code" name="code" type="text" required defaultValue={initial?.code} placeholder="SUMMER20"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount-type" className="mb-1.5 block text-sm font-medium">Type</label>
              <select id="discount-type" name="type" defaultValue={initial?.type ?? "percentage"}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label htmlFor="discount-value" className="mb-1.5 block text-sm font-medium">Value</label>
              <input id="discount-value" name="value" type="number" step="0.01" min="0" required defaultValue={initial?.value}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount-start" className="mb-1.5 block text-sm font-medium">Start Date</label>
              <input id="discount-start" name="startDate" type="date" required defaultValue={fmt(initial?.startDate ?? "")}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="discount-end" className="mb-1.5 block text-sm font-medium">End Date</label>
              <input id="discount-end" name="endDate" type="date" required defaultValue={fmt(initial?.endDate ?? "")}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount-minpurchase" className="mb-1.5 block text-sm font-medium">Min Purchase (₹)</label>
              <input id="discount-minpurchase" name="minPurchase" type="number" step="0.01" min="0" defaultValue={initial?.minPurchase ?? ""}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="discount-usagelimit" className="mb-1.5 block text-sm font-medium">Usage Limit</label>
              <input id="discount-usagelimit" name="usageLimit" type="number" min="1" defaultValue={initial?.usageLimit ?? ""}
                placeholder="Unlimited"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label htmlFor="discount-status" className="mb-1.5 block text-sm font-medium">Status</label>
            <select id="discount-status" name="isActive" defaultValue={initial?.isActive !== false ? "true" : "false"}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          {formError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Discount"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
