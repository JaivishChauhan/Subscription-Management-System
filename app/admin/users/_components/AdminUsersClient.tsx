"use client"

import { useState, useTransition, useOptimistic } from "react"
import { toast } from "sonner"
import {
  IconUserPlus,
  IconTrash,
  IconPencil,
  IconSearch,
  IconX,
  IconCheck,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react"

type ManagedUser = {
  id: string
  name: string
  email: string
  role: "internal" | "portal"
  phone: string | null
  createdAt: string
}

interface AdminUsersClientProps {
  initialUsers: ManagedUser[]
  initialTotal: number
}

/**
 * Client component for the Admin User Management page.
 * Handles CRUD operations against /api/users with optimistic updates.
 * @security Renders admin-only UI — page-level guard is in the Server Component.
 */
export function AdminUsersClient({ initialUsers, initialTotal }: AdminUsersClientProps) {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers)
  const [total, setTotal] = useState(initialTotal)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "internal" | "portal">("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [isPending, startTransition] = useTransition()

  /** Fetches users from the API with current filter state. */
  async function fetchUsers(q: string, role: "all" | "internal" | "portal") {
    const params = new URLSearchParams({ q, role })
    const res = await fetch(`/api/users?${params}`)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.pagination.total)
    }
  }

  function handleSearch(value: string) {
    setSearch(value)
    startTransition(() => fetchUsers(value, roleFilter))
  }

  function handleRoleFilter(value: "all" | "internal" | "portal") {
    setRoleFilter(value)
    startTransition(() => fetchUsers(search, value))
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Delete user "${userName}"? This action cannot be undone.`)) return

    // Optimistic removal
    const previous = users
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setTotal((prev) => prev - 1)

    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" })
    if (!res.ok) {
      setUsers(previous)
      setTotal((prev) => prev + 1)
      toast.error("Failed to delete user.")
    } else {
      toast.success(`"${userName}" deleted.`)
    }
  }

  const roleLabel: Record<"internal" | "portal", string> = {
    internal: "Internal",
    portal: "Portal",
  }

  const roleColor: Record<"internal" | "portal", string> = {
    internal: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    portal: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "internal", "portal"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleFilter(r)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                roleFilter === r
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-9 rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <IconUserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <p className="text-sm text-muted-foreground">
        Showing {users.length} of {total} {roleFilter !== "all" ? roleFilter : ""} users
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${roleColor[user.role]}`}>
                        {user.role === "internal" ? (
                          <IconShieldLock className="h-3 w-3" />
                        ) : (
                          <IconUser className="h-3 w-3" />
                        )}
                        {roleLabel[user.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingUser(user)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Edit ${user.name}`}
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${user.name}`}
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

      {/* Create Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [newUser, ...prev])
            setTotal((prev) => prev + 1)
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}

/* ─── Create User Modal ────────────────────────────────────────────────────── */

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (user: ManagedUser) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      phone: (fd.get("phone") as string) || undefined,
      role: fd.get("role") as "internal" | "portal",
    }

    startTransition(async () => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error ?? "Failed to create user.")
        return
      }

      toast.success(`User "${body.name}" created.`)
      onCreated(data.user)
    })
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-6 text-xl font-bold">Create User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" name="name" type="text" required autoFocus />
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Password" name="password" type="password" required />
        <FormField label="Phone (optional)" name="phone" type="tel" />
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="create-role">
            Role
          </label>
          <select
            id="create-role"
            name="role"
            defaultValue="internal"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="internal">Internal (Operational Staff)</option>
            <option value="portal">Portal (Customer)</option>
          </select>
        </div>
        {formError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? "Creating…" : "Create User"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

/* ─── Edit User Modal ─────────────────────────────────────────────────────── */

function EditUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: ManagedUser
  onClose: () => void
  onUpdated: (user: ManagedUser) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const fd = new FormData(e.currentTarget)
    const password = fd.get("password") as string
    const body: Record<string, unknown> = {
      name: fd.get("name") as string,
      phone: (fd.get("phone") as string) || null,
      role: fd.get("role") as "internal" | "portal",
    }
    if (password) body.password = password

    startTransition(async () => {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error ?? "Failed to update user.")
        return
      }

      toast.success("User updated.")
      onUpdated({ ...user, ...data.user })
    })
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-6 text-xl font-bold">Edit User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" name="name" type="text" required defaultValue={user.name} />
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Email (read-only)</label>
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{user.email}</p>
        </div>
        <FormField label="Phone (optional)" name="phone" type="tel" defaultValue={user.phone ?? ""} />
        <FormField label="New Password (leave blank to keep)" name="password" type="password" />
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="edit-role">
            Role
          </label>
          <select
            id="edit-role"
            name="role"
            defaultValue={user.role}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="internal">Internal</option>
            <option value="portal">Portal</option>
          </select>
        </div>
        {formError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

/* ─── Shared UI helpers ───────────────────────────────────────────────────── */

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <IconX className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

function FormField({
  label,
  name,
  type,
  required,
  autoFocus,
  defaultValue,
}: {
  label: string
  name: string
  type: string
  required?: boolean
  autoFocus?: boolean
  defaultValue?: string
}) {
  return (
    <div>
      <label htmlFor={`field-${name}`} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={`field-${name}`}
        name={name}
        type={type}
        required={required}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )
}
