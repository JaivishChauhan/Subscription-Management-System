# Repetitive Error Fixes

This document serves as a ledger for obscure, structurally challenging, or highly repetitive errors encountered in this repository alongside their solutions.

---

## NextAuth v5 Infinite Redirect Loop (`/admin` ↔ `/dashboard`)

### Symptom
An authenticated admin logs in successfully, but upon visiting `/admin`, the browser enters an infinite redirect loop, issuing repeated `GET /admin 307` and `GET /dashboard 307` responses.

### Cause: Environment Execution Mismatch (Edge vs Node.js)
NextAuth v5 executes differently depending on the context:
1. **Edge Context (`proxy.ts` / Middleware):** Has access only to `token` when resolving the session because `PrismaAdapter` running on Node streams cannot execute dynamically in purely edge contexts.
2. **Node.js Context (`lib/auth.ts` / Server Components):** When `PrismaAdapter` is active even with `strategy: "jwt"`, the NextAuth internal pipeline might occasionally omit tokens and pass raw `user` objects.

If the `session` callback code attempts to strictly access `token.id` or `token.role`:
```typescript
// DANGEROUS: Will crash in Server Components if only `user` is passed
;(session.user as any).role = (token.role as string) ?? "portal"
```
The callback throws an internal `TypeError: Cannot read properties of undefined (reading 'role')`. NextAuth silently catches this exception and returns a **stripped-down fallback session** containing only `{ name, email, image }`.

Because the fallback session lacked `role`:
- **Node Component (`app/admin/layout.tsx`):** Reads the session, sees no `role`, evaluates the user as unauthorized, and redirects them to `/dashboard`.
- **Edge Middleware (`proxy.ts`):** Reads the raw JWT token correctly, recognizes the user is an `admin`, realizes admins don't belong on `/dashboard`, and redirects them back to `/admin`.

### The Core Fix
You must program defensively to ensure the session callback securely extracts properties regardless of whether NextAuth decides to inject `token` or `user`.

Ensure your `session` callback across both `auth.config.ts` and `lib/auth.ts` implements this pattern:

```typescript
async session({ session, token, user }: any) {
  if (session.user) {
    // 🛡️ Defensively retrieve IDs and roles from both possibilities
    const userId = token?.id || token?.sub || user?.id;
    const userRole = token?.role || user?.role || "portal";

    session.user.id = userId as string;
    (session.user as any).role = userRole;
  }
  return session;
}
```

This ensures `.role` is populated securely and safely regardless of NextAuth's underlying Node vs Edge strategy.
