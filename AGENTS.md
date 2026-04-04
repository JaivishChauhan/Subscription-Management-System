# AGENTS.md

## Purpose

This repository is a full-stack subscription management application built with Next.js App Router, Prisma, NextAuth/Auth.js, and Tailwind CSS. Use this file as the working agreement for coding agents operating in this codebase.

The product has two overlapping domains:

- Traditional subscription operations: products, recurring plans, subscriptions, invoices, taxes, contacts, payments.
- A marketplace layer: services, bundles, cart, shop, pricing, and checkout flows.

Prefer changes that preserve both domains rather than optimizing for only one.

## Source Of Truth

Some documentation in this repo is older than the code. When docs and code disagree, trust these in this order:

1. `package.json`
2. `prisma/schema.prisma`
3. `lib/`
4. `app/` route implementations
5. markdown docs in the repo root or `doc/`

Examples of current truth:

- The app is on Next.js `16.1.7`, React `19`, Prisma `7`, and NextAuth `5 beta`.
- Runtime database access is currently PostgreSQL via `pg` + `@prisma/adapter-pg` in `lib/db.ts`.
- Auth uses `AUTH_SECRET` in `.env.example`, even though some docs still mention older `NEXTAUTH_SECRET` wording.

## Stack

- Framework: Next.js App Router
- Language: TypeScript with `strict: true`
- UI: React 19, Tailwind CSS 4, Tabler icons, Recharts, Sonner
- Forms/validation: React Hook Form + Zod
- State: Zustand
- Auth: NextAuth/Auth.js v5 with Prisma adapter
- Data: Prisma ORM + PostgreSQL
- Package manager: `pnpm`

## Important Directories

- `app/`: pages, layouts, route handlers, and page-level UI
- `app/api/`: REST-style route handlers for CRUD/status changes
- `app/admin/`: admin-only pages for operational workflows
- `actions/`: server actions for service and bundle mutations
- `components/`: reusable UI and app shell components
- `lib/`: database, auth, admin guards, business logic, validations, helpers
- `lib/validations/`: Zod schemas for request/form validation
- `prisma/`: schema, migrations, and seed data
- `store/`: Zustand state, currently cart-related
- `types/`: shared TypeScript types
- `doc/`: product and system docs, helpful for intent but not always current
- `scripts/`: utility scripts such as admin bootstrap

## Commands

Install and run:

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm lint
pnpm typecheck
```

Database:

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm db:studio
pnpm db:create-admin
```

Build:

```bash
pnpm build
pnpm start
```

## Environment

Expected variables are defined in `.env.example`. The most important are:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Stripe and SMTP are stubbed or deferred in the example env. Do not assume they are configured unless the code or environment proves it.

Never commit secrets or overwrite the user's local `.env` values.

## Coding Conventions

- Prefer `@/` imports over deep relative imports.
- Match the local file's style before "cleaning up" formatting. This repo currently mixes semicolon and no-semicolon styles.
- Keep TypeScript types explicit at boundaries: route handlers, actions, validation outputs, and helper return values.
- Reuse existing Zod schemas from `lib/validations/` when adding or changing request/form logic.
- Default to server components. Add `"use client"` only when hooks, browser APIs, or client state are actually required.
- For server actions, keep `"use server"` at the top and revalidate affected paths with `revalidatePath`.
- For data fetching pages that must stay live or session-aware, follow existing patterns such as `export const dynamic = "force-dynamic"` where needed.
- Use `prisma` from `@/lib/db`; do not create ad hoc Prisma clients.
- Use auth helpers from `@/lib/auth` and role guards from `@/lib/admin`.

## Auth And Access Rules

Current user roles in the schema:

- `admin`
- `internal`
- `portal`

Common patterns:

- Page protection: `requirePageRole()` or `requireAdminPage()`
- API protection: `requireApiRole()` or `requireAdminApi()`
- Session access in server code: `auth()`
- middleware is replaced with proxy use the proxy.

Do not bypass role checks when adding admin pages, admin APIs, or privileged actions.

## Data And Domain Rules

Use the Prisma schema as the canonical model reference. Important business rules already encoded in the codebase include:

- Subscription lifecycle: `draft -> quotation -> confirmed -> active -> closed`
- Invoice lifecycle: `draft -> confirmed -> paid | cancelled`
- Product types: `service | goods`
- Recurring plan billing periods: `daily | weekly | monthly | yearly`
- Marketplace bundle types: `predefined | suggested | custom`

Prefer soft-delete or deactivation when a model already has an `isActive` flag. Existing service and bundle flows already follow this rule.

The UI and seed data currently assume Indian locale defaults in several places:

- Currency formatting often uses `en-IN`
- Prices are generally INR-oriented

Avoid changing locale/currency behavior incidentally.

## Implementation Patterns To Follow

- Keep validation close to inputs and business logic close to `lib/`.
- Use Prisma transactions for related multi-query reads/writes when consistency matters.
- After mutations, revalidate the concrete admin/public routes that surface the changed data.
- For admin list/detail pages, preserve the current pattern of searchable/filterable server-rendered tables.
- When adding new domain entities, update:
  - Prisma schema or query layer as needed
  - validation schema(s)
  - API route and/or server action
  - relevant admin UI
  - seed data if the feature depends on discoverable demo content

## Safe Change Guidelines

- Make focused changes. This repo is actively being edited and may be in a dirty worktree.
- Do not revert unrelated user changes.
- Avoid broad formatting-only rewrites unless explicitly requested.
- Do not rename routes, schema fields, or status strings casually; many pages and handlers are wired directly to them.
- Treat root docs like `README.md`, `QUICK_START.md`, and `AUTH_SETUP.md` as secondary references unless you are explicitly updating documentation.

## Recommended Verification

After code changes, run the narrowest useful checks first, then broader ones if the surface area justifies it:

```bash
pnpm typecheck
pnpm lint
```

When touching database or auth flows, also consider:

- `pnpm db:generate`
- `pnpm db:push` if schema changed
- manual sign-in and protected-route checks
- manual admin CRUD flow for the affected module

If you cannot run a verification step, say so clearly in your handoff.

## Useful Files For Orientation

- `package.json`
- `prisma/schema.prisma`
- `lib/db.ts`
- `lib/auth.ts`
- `lib/admin.ts`
- `prisma/seed.ts`
- `README.md`
- `doc/FEATURES.md`

## Handoff Expectations

When finishing work, report:

- what changed
- whether schema/env assumptions were made
- which checks were run
- any follow-up risk, especially around auth, status transitions, or revalidation

## Rules