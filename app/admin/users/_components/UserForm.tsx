"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
} from "@/lib/validations/user"

interface UserFormProps {
  mode: "create" | "edit"
  initialData?: any
}

export function UserForm({ mode, initialData }: UserFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "user",
    phone: initialData?.phone || "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: [] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setErrors({})

    const schema =
      mode === "create" ? adminCreateUserSchema : adminUpdateUserSchema

    const payload =
      mode === "edit" && !formData.password
        ? { ...formData, password: undefined }
        : formData

    const result = schema.safeParse(payload)

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors
      setErrors(formattedErrors as Record<string, string[]>)
      setIsPending(false)
      return
    }

    try {
      const url =
        mode === "create" ? `/api/users` : `/api/users/${initialData?.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Something went wrong.")
      }

      toast.success(
        mode === "create"
          ? "User created successfully"
          : "User updated successfully"
      )
      router.push("/admin/users")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to save user.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm leading-none font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            disabled={isPending}
            value={formData.name}
            onChange={handleChange}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-destructive text-[0.8rem]">{errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm leading-none font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            disabled={mode === "edit" || isPending}
            value={formData.email}
            onChange={handleChange}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-destructive text-[0.8rem]">{errors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm leading-none font-medium"
          >
            Password{" "}
            {mode === "edit" && (
              <span className="text-muted-foreground text-xs font-normal">
                (Leave blank to keep current)
              </span>
            )}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            disabled={isPending}
            value={formData.password}
            onChange={handleChange}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-destructive text-[0.8rem]">
              {errors.password[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm leading-none font-medium">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            disabled={isPending}
            value={formData.phone}
            onChange={handleChange}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="+1 234 567 890"
          />
          {errors.phone && (
            <p className="text-destructive text-[0.8rem]">{errors.phone[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm leading-none font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            disabled={isPending}
            value={formData.role}
            onChange={handleChange}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="admin">Admin</option>
            <option value="internal">Internal</option>
            <option value="portal">Portal</option>
          </select>
          {errors.role && (
            <p className="text-destructive text-[0.8rem]">{errors.role[0]}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t pt-4">
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          disabled={isPending}
          className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {isPending ? "Saving..." : "Save User"}
        </button>
      </div>
    </form>
  )
}
