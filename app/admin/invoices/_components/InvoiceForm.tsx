"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createInvoiceAction } from "@/actions/invoice-actions"

interface InvoiceFormProps {
  availableSubscriptions: {
    id: string
    subscriptionNumber: string
    contact: {
      firstName: string
      lastName: string
      company: string | null
    }
  }[]
}

export function InvoiceForm({ availableSubscriptions }: InvoiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      subscriptionId: "",
    },
  })

  async function onSubmit(data: any) {
    if (!data.subscriptionId) {
      toast.error("Please select a subscription first.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createInvoiceAction(data.subscriptionId)

      if (!res.created) {
        toast.info(`Invoice already exists: ${res.invoice.invoiceNumber}`)
      } else {
        toast.success(
          `Invoice created successfully: ${res.invoice.invoiceNumber}`
        )
      }
      router.push("/admin/invoices")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : "Failed to generate invoice"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-2xl space-y-8"
    >
      <div className="space-y-2">
        <label htmlFor="subscriptionId" className="text-sm font-medium">
          Select Subscription
        </label>
        <p className="text-muted-foreground text-xs">
          Invoices are automatically populated using the items and amounts
          defined in the subscription.
        </p>
        <select
          id="subscriptionId"
          {...form.register("subscriptionId", { required: true })}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <option value="" disabled>
            Select an active or confirmed subscription...
          </option>
          {availableSubscriptions.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.subscriptionNumber} -{" "}
              {sub.contact.company ||
                `${sub.contact.firstName} ${sub.contact.lastName}`}
            </option>
          ))}
        </select>
      </div>

      <div className="border-border flex gap-4 border-t pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !form.watch("subscriptionId")}
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? "Generating..." : "Generate Invoice"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-8 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
