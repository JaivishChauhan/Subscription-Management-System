export const USER_ROLES = ["admin", "internal", "portal"] as const

export type UserRole = (typeof USER_ROLES)[number]

export function normalizeUserRole(role?: string | null): UserRole {
  if (role === "admin" || role === "internal") {
    return role
  }

  return "portal"
}

export function getDefaultPortalPath(role?: string | null) {
  switch (normalizeUserRole(role)) {
    case "admin":
      return "/admin"
    case "internal":
      return "/internal"
    default:
      return "/dashboard"
  }
}

export function getPortalLabel(role?: string | null) {
  switch (normalizeUserRole(role)) {
    case "admin":
      return "Admin Portal"
    case "internal":
      return "Internal Portal"
    default:
      return "Dashboard"
  }
}
