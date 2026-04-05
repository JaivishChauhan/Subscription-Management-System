import { UserForm } from "../_components/UserForm"
import Link from "next/link"
import { IconChevronLeft } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"

export default async function NewUserPage() {
  await requireAdminPage()

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/users"
          className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors"
        >
          <IconChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create User</h1>
          <p className="text-muted-foreground text-sm">
            Add a new user to the system.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-md border p-6">
        <UserForm mode="create" />
      </div>
    </div>
  )
}
