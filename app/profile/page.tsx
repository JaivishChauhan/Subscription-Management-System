import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBuilding,
} from "@tabler/icons-react"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      contact: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <IconUser className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Full Name</p>
                  <p className="font-semibold">{user.name || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <IconMail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <IconPhone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Phone</p>
                  <p className="font-semibold">{user.phone || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          {user.contact && (
            <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Contact Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <IconBuilding className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Company</p>
                    <p className="font-semibold">
                      {user.contact.company || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <IconMapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Address</p>
                    <p className="font-semibold">
                      {user.contact.address
                        ? `${user.contact.address}, ${user.contact.city || ""}`
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Stats */}
          <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Account Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Account Role</p>
                <p className="mt-1 font-semibold capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Member Since</p>
                <p className="mt-1 font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Email Verified</p>
                <p className="mt-1 font-semibold">
                  {user.emailVerified ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Last Updated</p>
                <p className="mt-1 font-semibold">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              className="border-border bg-card hover:bg-muted rounded-full border px-6 py-2 text-sm font-semibold transition-colors"
            >
              Edit Profile
            </button>
            <Link
              href="/api/auth/signout"
              className="rounded-full border border-red-200 bg-red-50 px-6 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
