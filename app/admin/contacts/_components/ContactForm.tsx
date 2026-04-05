"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { updateContactAction } from "@/actions/contact-actions"

interface ContactFormProps {
  id: string
  initialData: {
    firstName: string
    lastName: string
    company: string | null
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    zip: string | null
    country: string | null
    notes: string | null
  }
}

export function ContactForm({ id, initialData }: ContactFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: initialData,
  })

  async function onSubmit(data: any) {
    setIsSubmitting(true)
    try {
      await updateContactAction(id, data)
      toast.success("Contact updated successfully")
      router.push("/admin/contacts")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : "Failed to update contact"
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
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </label>
          <input
            id="firstName"
            {...form.register("firstName", { required: "Required" })}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </label>
          <input
            id="lastName"
            {...form.register("lastName", { required: "Required" })}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium">
            Company
          </label>
          <input
            id="company"
            {...form.register("company")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone
          </label>
          <input
            id="phone"
            {...form.register("phone")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Address
        </label>
        <input
          id="address"
          {...form.register("address")}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <input
            id="city"
            {...form.register("city")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="state" className="text-sm font-medium">
            State / Province
          </label>
          <input
            id="state"
            {...form.register("state")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="zip" className="text-sm font-medium">
            ZIP / Postal Code
          </label>
          <input
            id="zip"
            {...form.register("zip")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="country" className="text-sm font-medium">
          Country
        </label>
        <input
          id="country"
          {...form.register("country")}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Admin Notes
        </label>
        <textarea
          id="notes"
          {...form.register("notes")}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
      </div>

      <div className="border-border flex gap-4 border-t pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Update Contact"}
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
