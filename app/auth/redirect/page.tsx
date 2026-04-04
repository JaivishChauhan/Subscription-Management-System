import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDefaultPortalPath } from "@/lib/roles"

export default async function AuthRedirectPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  redirect(getDefaultPortalPath(session.user.role))
}
