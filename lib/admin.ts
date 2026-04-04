import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDefaultPortalPath, type UserRole } from "@/lib/roles";

type AllowedRole = UserRole;

export async function requirePageRole(allowedRoles: AllowedRole[]) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role as AllowedRole)) {
    redirect(getDefaultPortalPath(session.user.role));
  }

  return session;
}

export async function requireAdminPage() {
  return requirePageRole(["admin"]);
}

export async function requireInternalPage() {
  return requirePageRole(["internal"]);
}

export async function requireApiRole(allowedRoles: AllowedRole[]) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  if (!allowedRoles.includes(session.user.role as AllowedRole)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }

  return { error: null, session };
}

export async function requireAdminApi() {
  return requireApiRole(["admin"]);
}
