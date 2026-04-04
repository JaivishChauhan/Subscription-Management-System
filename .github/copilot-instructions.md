# Subscription Management System — Workspace Instructions

## Project context

- Full-stack **Next.js 16 App Router** app for subscription billing workflows.
- TypeScript is **strict** (`tsconfig.json`), package manager is **pnpm**.
- Data layer uses **Prisma 7 + PostgreSQL** (`prisma/schema.prisma`, `lib/db.ts`).
- Auth uses **NextAuth v5** with **Google OAuth** (`lib/auth.ts`).
- UI uses **Tailwind CSS 4**, `sonner` toasts, and client cart state via **Zustand** (`store/cart.ts`).

## Build and verification commands

Use these commands when validating changes:

- `pnpm dev` — run local app
- `pnpm lint` — lint checks
- `pnpm typecheck` — TypeScript checks
- `pnpm format` — format `ts/tsx`
- `pnpm db:push` — sync Prisma schema to DB
- `pnpm db:generate` — regenerate Prisma client after schema changes
- `pnpm db:seed` — load demo data

## Architecture boundaries

- `app/` — App Router pages/layouts (server components by default)
  - `app/(auth)` — auth UI
  - `app/admin` — admin surfaces
  - `app/api/**/route.ts` — HTTP API routes
- `actions/` — server actions for mutations (`"use server"`, usually with `revalidatePath`)
- `lib/` — shared business logic, auth, DB, validation, domain services
- `lib/validations/` — Zod schemas and inferred types
- `store/` — client state stores (Zustand)

## Coding conventions that matter here

- Keep **client boundaries small**; default to server components unless interactivity requires `"use client"`.
- For role checks:
  - Pages/layouts: use `requireAdminPage()` / `requirePageRole()` from `lib/admin.ts`.
  - API routes: use `requireApiRole()` and return early on `error`.
- Validate external input with Zod schemas in `lib/validations/*` before DB operations.
- For partial updates, follow the existing spread-safe pattern:
  - `...(field !== undefined && { field })`
- Use `prisma` singleton from `lib/db.ts` (do not create ad-hoc Prisma clients).
- Use transactions for multi-step writes that must be atomic.
- Prefer soft-delete conventions already in use (e.g., `isActive = false`) unless a module explicitly requires hard delete.

## Environment and integration caveats

- Copy `.env.example` to `.env`; never commit secrets.
- Required vars include: `DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`.
- Current auth implementation is Google OAuth-first; `POST /api/auth/register` is deprecated (returns 410).
- `lib/stripe.ts` and `lib/email.ts` currently include stubbed/incomplete behavior; do not assume production-ready Stripe/email flows unless explicitly implemented.

## Documentation map (link, don’t duplicate)

- `README.md` — setup and high-level architecture
- `doc/trd.md` — technical requirements
- `doc/srs.md` — software requirements
- `doc/prd.md` — product requirements
- `doc/FEATURES.md` — implementation tracker/status
- `doc/Designdoc.md` — frontend design system and UI specs
- `doc/appflowdoc.md` and `doc/subscription_system_flow.md` — end-to-end flows

## Practical guidance for changes

- Prefer small, focused edits in existing modules over introducing parallel patterns.
- Keep API responses explicit (`NextResponse.json(..., { status })`) with clear error messages.
- If docs conflict with source code, treat **source code as ground truth** and update docs in follow-up work.
