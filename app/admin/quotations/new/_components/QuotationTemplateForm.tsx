"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"
import type { Prisma } from "@prisma/client"

type PlanOption = { id: string; name: string }
type ProductOption = { id: string; name: string; salesPrice: number }

type LineItem = {
  id: string
  productName: string
  description: string
  quantity: number
  unitPrice: number
}

interface QuotationTemplateFormProps {
  plans: PlanOption[]
  products: ProductOption[]
}

export function QuotationTemplateForm({
  plans,
  products,
}: QuotationTemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [validityDays, setValidityDays] = useState(30)
  const [recurringPlanId, setRecurringPlanId] = useState("")

  const [lines, setLines] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      productName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ])

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const newLines = [...lines]
    newLines[index] = {
      ...newLines[index],
      productName: product.name,
      unitPrice: product.salesPrice,
    }
    setLines(newLines)
  }

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        productName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ])
  }

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || lines.length === 0 || !recurringPlanId) {
      toast.error("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/quotations/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          validityDays,
          recurringPlanId,
          lines: lines.map(({ id, ...line }) => line),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create template")
      }

      toast.success("Template created successfully!")
      router.push("/admin/quotations")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6">
      {/* Template Header */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Template Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Enterprise Startup Package"
            className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Plan</label>
          <select
            required
            value={recurringPlanId}
            onChange={(e) => setRecurringPlanId(e.target.value)}
            className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">Select a plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Validity (Days)</label>
          <input
            type="number"
            required
            min="1"
            value={validityDays}
            onChange={(e) => setValidityDays(Number(e.target.value))}
            className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>
      </div>

      {/* Template Lines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium tracking-tight">Template Lines</h3>
          <button
            type="button"
            onClick={addLine}
            className="hover:bg-muted hover:text-foreground inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
          >
            <IconPlus className="h-4 w-4" /> Add Line
          </button>
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground border-b text-left">
                <th className="p-3 font-medium">Product / Detail</th>
                <th className="p-3 font-medium">Qty</th>
                <th className="p-3 font-medium">Unit Price</th>
                <th className="w-[80px] p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={line.id} className="border-b last:border-0">
                  <td className="space-y-2 p-3">
                    <div className="flex gap-2">
                      <select
                        onChange={(e) =>
                          handleProductSelect(index, e.target.value)
                        }
                        className="border-input bg-background focus-visible:ring-ring flex h-9 w-[200px] shrink-0 rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <option value="">Choose standard product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Custom Item Name"
                        required
                        value={line.productName}
                        onChange={(e) => {
                          const newLines = [...lines]
                          newLines[index].productName = e.target.value
                          setLines(newLines)
                        }}
                        className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Description (Optional)"
                      value={line.description}
                      onChange={(e) => {
                        const newLines = [...lines]
                        newLines[index].description = e.target.value
                        setLines(newLines)
                      }}
                      className="border-input bg-background focus-visible:ring-ring text-muted-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    />
                  </td>
                  <td className="p-3 align-top">
                    <input
                      type="number"
                      required
                      min="1"
                      value={line.quantity}
                      onChange={(e) => {
                        const newLines = [...lines]
                        newLines[index].quantity = Number(e.target.value)
                        setLines(newLines)
                      }}
                      className="border-input bg-background focus-visible:ring-ring flex h-9 w-20 rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    />
                  </td>
                  <td className="p-3 align-top">
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => {
                        const newLines = [...lines]
                        newLines[index].unitPrice = Number(e.target.value)
                        setLines(newLines)
                      }}
                      className="border-input bg-background focus-visible:ring-ring flex h-9 w-28 rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    />
                  </td>
                  <td className="p-3 align-top">
                    <button
                      type="button"
                      disabled={lines.length === 1}
                      onClick={() => removeLine(index)}
                      className="text-destructive hover:bg-destructive/10 inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="hover:bg-muted inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Template"
          )}
        </button>
      </div>
    </form>
  )
}
