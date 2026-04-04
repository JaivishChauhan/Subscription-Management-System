# Tech Stack Document
## Subscription Management System

**Version:** 1.0  
**Last Updated:** April 2026  
**Architecture:** Monorepo · Full-Stack · Local-First

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Frontend Stack](#3-frontend-stack)
   - 3.1 [Next.js App Router](#31-nextjs-app-router)
   - 3.2 [React](#32-react)
   - 3.3 [Tailwind CSS](#33-tailwind-css)
   - 3.4 [Form Handling — React Hook Form + Zod](#34-form-handling--react-hook-form--zod)
   - 3.5 [Theme System — next-themes](#35-theme-system--next-themes)
4. [Backend Stack](#4-backend-stack)
   - 4.1 [Node.js API / CMS Overview](#41-backend-cms-overview)
   - 4.2 [Why Node.js API / CMS](#42-why-backend-cms)
   - 4.3 [backend Collections Architecture](#43-backend-collections-architecture)
   - 4.4 [Access Control in backend](#44-access-control-in-backend)
   - 4.5 [backend REST & Local API](#45-backend-rest--local-api)
   - 4.6 [backend Hooks — Business Logic Layer](#46-backend-hooks--business-logic-layer)
   - 4.7 [Admin Panel — backend UI](#47-admin-panel--backend-ui)
5. [Database — PostgreSQL](#5-database--postgresql)
   - 5.1 [Why PostgreSQL](#51-why-postgresql)
   - 5.2 [local environment Setup](#52-local environment-setup)
   - 5.3 [Database Schema — Collections & Tables](#53-database-schema--collections--tables)
   - 5.4 [Entity Relationship Overview](#54-entity-relationship-overview)
   - 5.5 [Indexes & Performance](#55-indexes--performance)
6. [Payment Gateway — Stripe](#6-payment-gateway--stripe)
7. [Version Control & Git Workflow](#7-version-control--git-workflow)
8. [Environment Configuration](#8-environment-configuration)
9. [Data Flow Architecture](#9-data-flow-architecture)
10. [Security Architecture](#10-security-architecture)
11. [Development Setup Guide](#11-development-setup-guide)
12. [Dependency Reference](#12-dependency-reference)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│   ┌──────────────────────────┐    ┌──────────────────────────────┐  │
│   │   Customer Portal         │    │   Admin / Backend Panel       │  │
│   │   Next.js App Router      │    │   Node.js API / CMS Admin UI        │  │
│   │   React · Tailwind CSS    │    │   (built-in, auto-generated)  │  │
│   └──────────────┬───────────┘    └──────────────┬───────────────┘  │
└──────────────────┼──────────────────────────────────┼───────────────┘
                   │                                  │
                   │        HTTP / REST / Local API    │
                   ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                                │
│                                                                     │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                    Node.js API / CMS (Node.js)                    │    │
│   │                                                            │    │
│   │   Collections · Access Control · Hooks · REST API          │    │
│   │   Local API (server-side) · Admin Panel                    │    │
│   └─────────────────────────────┬──────────────────────────────┘    │
│                                 │                                   │
│   ┌─────────────────────────────┼───────────────────────────────┐   │
│   │          Stripe SDK         │          Email / SMTP          │   │
│   │       (Payment Gateway)     │       (Transactional mail)     │   │
│   └─────────────────────────────┴───────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                   Drizzle ORM / backend DB Adapter
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │              PostgreSQL (local environment — Local)                      │  │
│   │                                                              │  │
│   │   users · contacts · products · plans · subscriptions        │  │
│   │   invoices · payments · discounts · taxes · attributes       │  │
│   └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Monorepo Structure

The project lives in a single Git repository managed as a **monorepo**.

```
subscription-management/
│
├── apps/
│   ├── web/                        # Next.js Customer Portal (App Router)
│   │   ├── app/
│   │   │   ├── (portal)/           # Portal route group
│   │   │   │   ├── page.tsx        # / Home
│   │   │   │   ├── shop/
│   │   │   │   ├── product/[id]/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   │   ├── address/
│   │   │   │   │   └── payment/
│   │   │   │   ├── thank-you/
│   │   │   │   └── profile/
│   │   │   │       ├── orders/
│   │   │   │       └── invoices/
│   │   │   ├── api/                # Next.js API routes (thin proxy layer)
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                 # Base design system components
│   │   │   ├── portal/             # Portal-specific components
│   │   │   └── shared/             # Shared across portal and admin
│   │   ├── lib/
│   │   │   ├── backend.ts          # backend Local API client (server-side)
│   │   │   ├── stripe.ts           # Stripe client setup
│   │   │   └── validations/        # Zod schemas
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── cms/                        # Node.js API / CMS — Backend + Admin Panel
│       ├── src/
│       │   ├── collections/        # All backend collection definitions
│       │   │   ├── Users.ts
│       │   │   ├── Contacts.ts
│       │   │   ├── Products.ts
│       │   │   ├── RecurringPlans.ts
│       │   │   ├── Subscriptions.ts
│       │   │   ├── QuotationTemplates.ts
│       │   │   ├── Invoices.ts
│       │   │   ├── Payments.ts
│       │   │   ├── Discounts.ts
│       │   │   ├── Taxes.ts
│       │   │   └── Attributes.ts
│       │   ├── hooks/              # backend lifecycle hooks (business logic)
│       │   │   ├── subscriptions/
│       │   │   ├── invoices/
│       │   │   └── discounts/
│       │   ├── access/             # RBAC access control functions
│       │   ├── backend.config.ts   # Main backend configuration
│       │   └── server.ts           # Express/Node server entry
│       └── package.json
│
├── packages/
│   └── types/                      # Shared TypeScript types (generated by backend)
│       └── schema-types.ts
│
├── .github/
│   └── workflows/                  # CI/CD pipelines
├── database-config.yml              # PostgreSQL local setup
├── .env.example
├── .gitignore
├── turbo.json                      # Turborepo build config (optional)
└── package.json                    # Root workspace config
```

---

## 3. Frontend Stack

### 3.1 Next.js App Router

| Property | Value |
|----------|-------|
| Version | Next.js 14+ |
| Router | App Router (not Pages Router) |
| Rendering | RSC (React Server Components) by default; `'use client'` where interactivity needed |
| Data Fetching | Server Components fetch directly via backend Local API; Client Components use SWR or fetch |

**Route groups used:**

| Group | Path | Purpose |
|-------|------|---------|
| `(portal)` | `/`, `/shop`, `/product/[id]`, `/cart`, `/checkout/**`, `/thank-you`, `/profile/**` | Customer-facing portal |
| `(auth)` | `/login`, `/signup`, `/reset-password` | Authentication pages |

**Why App Router:**
- Server Components eliminate unnecessary client-side JS for static or data-heavy pages
- Nested layouts allow the portal nav and admin sidebar to be defined once
- Route groups cleanly separate auth, portal, and any future feature areas
- Built-in support for loading states, error boundaries, and metadata

---

### 3.2 React

| Property | Value |
|----------|-------|
| Version | React 18+ |
| Pattern | Server Components first; `'use client'` only for interactive UI (forms, toggles, cart state) |
| State Management | React `useState` / `useReducer` for local state; no global state library needed at v1 |

**Client component candidates:** Theme toggle, cart quantity stepper, variant selector, discount code input, billing toggle on pricing page.

---

### 3.3 Tailwind CSS

| Property | Value |
|----------|-------|
| Version | Tailwind CSS v3 |
| Dark Mode | `class` strategy — toggled via `<html class="dark">` |
| Config | `tailwind.config.ts` with extended tokens (brand colors, custom shadows, `Plus Jakarta Sans`) |

**Custom tokens defined in config:**

```ts
theme: {
  extend: {
    fontFamily: { sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'] },
    colors: {
      brand: { primary: '#4F46E5', secondary: '#7C3AED' }
    },
    boxShadow: {
      card: '0 4px 20px -2px rgba(79, 70, 229, 0.10)',
      'card-hover': '0 10px 25px -5px rgba(79, 70, 229, 0.15)',
      btn: '0 4px 14px 0 rgba(79, 70, 229, 0.30)',
    }
  }
}
```

---

### 3.4 Form Handling — React Hook Form + Zod

| Library | Role |
|---------|------|
| `react-hook-form` | Form state management, field registration, submission handling |
| `zod` | Schema declaration and validation (client + server) |
| `@hookform/resolvers` | Bridge between Zod schemas and React Hook Form |

**Validation schemas are defined once in `packages/types` or `lib/validations/` and shared across client and server** — no duplication of rules.

**Example — Signup schema:**

```ts
// lib/validations/auth.ts
import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(9, 'Password must be longer than 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type SignupInput = z.infer<typeof signupSchema>
```

---

### 3.5 Theme System — next-themes

| Property | Value |
|----------|-------|
| Package | `next-themes` |
| Default | `system` (respects OS preference) |
| Storage | `localStorage` |
| Attribute | `class` on `<html>` |

```tsx
// app/layout.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

---

## 4. Backend Stack

### 4.1 Node.js API / CMS Overview

| Property | Value |
|----------|-------|
| Version | Node.js API / CMS 2.x |
| Runtime | Node.js |
| Framework | Express.js (backend wraps it internally) |
| ORM / DB Adapter | `Postgres Adapter` (Drizzle under the hood) |
| Language | TypeScript |

Node.js API / CMS serves as the **entire backend** for this project:
- Defines the data models (called **Collections**)
- Provides a **REST API** and **Local API** automatically
- Handles **authentication, sessions, and access control**
- Generates the **Admin Panel UI** from collection configs
- Runs **lifecycle hooks** for business logic (e.g., auto-generate invoice on subscription confirm)

---

### 4.2 Why Node.js API / CMS

| Requirement | How backend Solves It |
|-------------|-----------------------|
| Admin panel for Internal Users | Auto-generated, zero-cost admin UI from collection definitions |
| RBAC — 3 roles with different permissions | Native `access` functions per collection and per operation |
| Complex data models with relationships | `relationship` field type with full join support |
| Business logic hooks (auto-invoice, lifecycle) | `beforeChange`, `afterChange`, `beforeOperation` hooks |
| REST API for frontend | Auto-generated REST endpoints for every collection |
| TypeScript types shared with frontend | `backend generate:types` outputs `schema-types.ts` |
| Self-hosted, local/offline capability | Runs as Node.js process; pairs with local PostgreSQL via local environment |
| No vendor lock-in | Open source, deployable anywhere Node.js runs |

---

### 4.3 backend Collections Architecture

Every data model in the system maps to a **backend Collection**. Each collection auto-generates:
- A database table in PostgreSQL
- REST API endpoints (`GET /api/[collection]`, `POST`, `PATCH`, `DELETE`)
- Local API methods (`backend.find()`, `backend.create()`, etc.)
- Admin UI pages (list view + form view)

**Full collection list:**

| Collection Slug | Maps To | Key Fields |
|-----------------|---------|------------|
| `users` | System users (all roles) | name, email, password, role (`admin` / `internal` / `portal`) |
| `contacts` | Customer contact records | name, email, phone, address, linkedUser |
| `products` | Product catalog | name, type, salesPrice, costPrice, tax, recurringPrices, variants |
| `recurring-plans` | Billing plan configs | name, billingPeriod, billingUnit, autoClose, closable, pausable, renewable |
| `attributes` | Product variant attributes | name, values (array: value + extraPrice) |
| `quotation-templates` | Reusable quotation setups | name, validityDays, recurringPlan, orderLines, lastForever, endAfter |
| `subscriptions` | Subscription records | number, customer, plan, status, orderLines, startDate, expiryDate, paymentTerm |
| `invoices` | Invoice records | subscriptionRef, customer, status, orderLines, invoiceDate, dueDate, paid |
| `payments` | Payment records | invoice, method, amount, date, notes |
| `discounts` | Discount/promo rules | name, type, minPurchase, minQty, products, startDate, endDate, limitUsage, usageCount |
| `taxes` | Tax configurations | name, computation, amount |
| `payment-terms` | Invoice due term rules | earlyDiscount, dueTerm |

---

### 4.4 Access Control in backend

backend uses **per-collection, per-operation** access functions written in TypeScript.

**Role resolution pattern:**

```ts
// access/isAdmin.ts
import { Access } from 'backend/types'

export const isAdmin: Access = ({ req: { user } }) =>
  user?.role === 'admin'

export const isAdminOrInternal: Access = ({ req: { user } }) =>
  user?.role === 'admin' || user?.role === 'internal'

export const isPortalUser: Access = ({ req: { user } }) =>
  user?.role === 'portal'

export const isSelf: Access = ({ req: { user }, id }) =>
  user?.id === id
```

**Access matrix applied per collection:**

| Collection | create | read | update | delete |
|------------|--------|------|--------|--------|
| `users` | Admin only | Admin (all) / Self | Admin (all) / Self | Admin only |
| `contacts` | Admin / Internal | Admin / Internal | Admin / Internal | Admin only |
| `products` | Admin / Internal | All (public for portal) | Admin / Internal | Admin only |
| `recurring-plans` | Admin / Internal | All | Admin / Internal | Admin only |
| `subscriptions` | Admin / Internal | Admin/Internal (all) / Portal (own) | Admin / Internal | Admin only |
| `invoices` | System (hook) | Admin/Internal (all) / Portal (own) | Admin / Internal | Admin only |
| `payments` | **Admin only** | Admin / Internal | Admin only | Admin only |
| `discounts` | **Admin only** | Admin / Internal | Admin only | Admin only |
| `taxes` | Admin / Internal | All | Admin / Internal | Admin only |

---

### 4.5 backend REST & Local API

**REST API** (used by Next.js Client Components and external calls):

```
GET    /api/subscriptions              List all (filtered by role)
POST   /api/subscriptions              Create new subscription
GET    /api/subscriptions/:id          Get single record
PATCH  /api/subscriptions/:id          Update record
DELETE /api/subscriptions/:id          Delete record

GET    /api/invoices?where[subscription][equals]=:id    Filter invoices by subscription
```

**Local API** (used by Next.js Server Components — no HTTP overhead):

```ts
// lib/backend.ts — Server-side only
import backend from 'backend'

// Fetch subscriptions for a portal user
const { docs } = await backend.find({
  collection: 'subscriptions',
  where: { customer: { equals: userId } },
  user: currentUser,   // access control enforced automatically
})

// Create an invoice
const invoice = await backend.create({
  collection: 'invoices',
  data: { subscription: subId, customer: customerId, ... },
  user: adminUser,
})
```

The **Local API is preferred in Server Components** because:
- No HTTP round-trip latency
- Access control still enforced (pass `user` to every call)
- TypeScript types are fully available

---

### 4.6 backend Hooks — Business Logic Layer

Hooks are TypeScript functions that run at specific points in a collection's lifecycle. All core business rules are implemented as hooks — not scattered across frontend code.

**Hook execution points used:**

| Hook | Trigger | Used For |
|------|---------|---------|
| `afterChange` | After a record is saved | Auto-generate invoice when subscription status → Confirmed |
| `beforeChange` | Before saving | Lock order lines if subscription is Confirmed; auto-set subscription number |
| `afterChange` | After payment created | Mark linked invoice as Paid, set Amount Due = 0 |
| `beforeChange` | Before discount created | Verify user is Admin (extra guard) |
| `afterChange` | After user created | Auto-create linked Contact record |
| `beforeChange` | Before subscription confirm | Set Start Date if not manually entered |

**Example — Auto-create invoice on subscription confirm:**

```ts
// collections/Subscriptions.ts (hooks section)
hooks: {
  afterChange: [
    async ({ doc, previousDoc, operation, req }) => {
      // Trigger only when status changes TO 'confirmed'
      if (
        operation === 'update' &&
        doc.status === 'confirmed' &&
        previousDoc.status !== 'confirmed'
      ) {
        await req.backend.create({
          collection: 'invoices',
          data: {
            subscription: doc.id,
            customer: doc.customer,
            status: 'draft',
            orderLines: doc.orderLines,
            invoiceDate: new Date().toISOString(),
            dueDate: calculateDueDate(doc.paymentTerm),
          },
          user: req.user,
        })
      }
    }
  ]
}
```

**Example — Lock order lines after confirmation:**

```ts
// collections/Subscriptions.ts
hooks: {
  beforeChange: [
    ({ data, originalDoc, req }) => {
      if (originalDoc?.status === 'confirmed' && data.orderLines) {
        throw new Error('Order lines cannot be modified after confirmation.')
      }
      return data
    }
  ]
}
```

---

### 4.7 Admin Panel — backend UI

backend auto-generates a full admin UI at `/admin` from the collection configuration. No separate admin frontend needs to be built.

**Customizations applied to the backend Admin Panel:**

| Customization | Implementation |
|---------------|----------------|
| Brand colors | `backend.config.ts` → `admin.css` override with indigo/violet tokens |
| Custom logo | `admin.components.graphics.Logo` |
| Grouped navigation | Collections organized under `Subscriptions`, `Configuration`, `Users` nav groups |
| Status bar on Subscriptions | Custom `Cell` component showing lifecycle step badges |
| Locked fields after confirm | `admin.readOnly: true` applied conditionally via `admin.condition` |

---

## 5. Database — PostgreSQL

### 5.1 Why PostgreSQL

| Requirement | PostgreSQL Advantage |
|-------------|---------------------|
| Complex relational data | Native foreign keys, JOINs, referential integrity |
| Offline / local capability | Runs fully in local environment with zero cloud dependency |
| JSON support | `jsonb` columns for flexible order line structures |
| Transactions | ACID-compliant; critical for invoice + payment atomicity |
| backend compatibility | First-class support via `Postgres Adapter` |
| Performance at scale | Battle-tested for thousands of concurrent records |
| Type safety | Drizzle ORM (used by backend) provides typed query results |

---

### 5.2 local environment Setup

```yaml
# database-config.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sms_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Start database:**
```bash
npm run start:db
```

**Connection string:**
```
DATABASE_URI=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
```

---

### 5.3 Database Schema — Collections & Tables

backend auto-generates and manages the PostgreSQL schema from collection definitions. Below is the logical schema for each table.

---

#### Table: `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default gen_random_uuid() | |
| `name` | `varchar(255)` | NOT NULL | |
| `email` | `varchar(255)` | NOT NULL, UNIQUE | |
| `password` | `text` | NOT NULL | bcrypt hashed |
| `role` | `enum('admin','internal','portal')` | NOT NULL, DEFAULT 'portal' | |
| `phone` | `varchar(30)` | | |
| `address` | `text` | | |
| `linked_contact_id` | `uuid` | FK → contacts.id | Auto-created on user creation |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

---

#### Table: `contacts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `name` | `varchar(255)` | NOT NULL | |
| `email` | `varchar(255)` | | |
| `phone` | `varchar(30)` | | |
| `address` | `text` | | |
| `linked_user_id` | `uuid` | FK → users.id | Optional link to a system user |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

---

#### Table: `taxes`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `name` | `varchar(100)` | NOT NULL | e.g., "GST 18%" |
| `computation` | `enum('percentage','fixed')` | NOT NULL | |
| `amount` | `numeric(10,2)` | NOT NULL | e.g., 18.00 or fixed ₹50 |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

---

#### Table: `attributes`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `name` | `varchar(100)` | NOT NULL | e.g., "Brand" |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

#### Table: `attribute_values`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `attribute_id` | `uuid` | FK → attributes.id, NOT NULL | |
| `value` | `varchar(100)` | NOT NULL | e.g., "Odoo" |
| `extra_price` | `numeric(10,2)` | DEFAULT 0 | Added to base product price |

---

#### Table: `products`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `name` | `varchar(255)` | NOT NULL | |
| `type` | `enum('service','goods')` | NOT NULL | |
| `sales_price` | `numeric(10,2)` | NOT NULL | |
| `cost_price` | `numeric(10,2)` | | |
| `tax_id` | `uuid` | FK → taxes.id | |
| `notes` | `text` | | |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

#### Table: `product_recurring_prices`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `product_id` | `uuid` | FK → products.id, NOT NULL | |
| `plan_id` | `uuid` | FK → recurring_plans.id | |
| `price` | `numeric(10,2)` | NOT NULL | |
| `min_qty` | `integer` | DEFAULT 1 | |
| `discount` | `numeric(5,2)` | DEFAULT 0 | Percentage |
| `end_date` | `date` | | |

#### Table: `product_variants`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `product_id` | `uuid` | FK → products.id, NOT NULL | |
| `attribute_id` | `uuid` | FK → attributes.id, NOT NULL | |
| `attribute_value_id` | `uuid` | FK → attribute_values.id, NOT NULL | |
| `extra_price` | `numeric(10,2)` | DEFAULT 0 | |

---

#### Table: `recurring_plans`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `name` | `varchar(100)` | NOT NULL | |
| `billing_period` | `integer` | NOT NULL | Numeric part e.g., 1 |
| `billing_unit` | `enum('day','week','month','year')` | NOT NULL | |
| `auto_close_days` | `integer` | | NULL = no auto-close |
| `closable` | `boolean` | DEFAULT false | |
| `pausable` | `boolean` | DEFAULT false | |
| `renewable` | `boolean` | DEFAULT true | |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

---

#### Table: `payment_terms`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `name` | `varchar(100)` | NOT NULL | |
| `early_discount` | `numeric(5,2)` | DEFAULT 0 | |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

#### Table: `payment_term_lines`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `payment_term_id` | `uuid` | FK → payment_terms.id, NOT NULL | |
| `type` | `enum('percentage','fixed')` | NOT NULL | |
| `value` | `numeric(10,2)` | NOT NULL | e.g., 100 (%) or fixed amount |
| `days_after` | `integer` | NOT NULL | Days after invoice date |

---

#### Table: `quotation_templates`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `name` | `varchar(255)` | NOT NULL | |
| `validity_days` | `integer` | | NULL = last forever |
| `last_forever` | `boolean` | DEFAULT false | |
| `end_after_value` | `integer` | | |
| `end_after_unit` | `enum('week','month','year')` | | |
| `plan_id` | `uuid` | FK → recurring_plans.id | |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

#### Table: `quotation_template_lines`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `template_id` | `uuid` | FK → quotation_templates.id, NOT NULL | |
| `product_id` | `uuid` | FK → products.id | |
| `description` | `text` | | |
| `quantity` | `integer` | DEFAULT 1 | |

---

#### Table: `discounts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `name` | `varchar(100)` | NOT NULL | Also used as promo code |
| `type` | `enum('fixed','percentage')` | NOT NULL | |
| `value` | `numeric(10,2)` | NOT NULL | Amount or percentage |
| `min_purchase` | `numeric(10,2)` | DEFAULT 0 | |
| `min_qty` | `integer` | DEFAULT 0 | |
| `start_date` | `date` | | |
| `end_date` | `date` | | |
| `limit_usage` | `boolean` | DEFAULT false | |
| `usage_limit` | `integer` | | NULL if unlimited |
| `usage_count` | `integer` | DEFAULT 0 | Incremented on each apply |
| `created_by` | `uuid` | FK → users.id, NOT NULL | Must be Admin |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

#### Table: `discount_products` *(junction — discount ↔ products)*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `discount_id` | `uuid` | FK → discounts.id | Composite PK |
| `product_id` | `uuid` | FK → products.id | Composite PK |

> If no rows exist for a discount in this table → discount applies to all products.

---

#### Table: `subscriptions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `number` | `varchar(20)` | NOT NULL, UNIQUE | Auto-generated e.g., S00001 |
| `customer_id` | `uuid` | FK → contacts.id, NOT NULL | |
| `plan_id` | `uuid` | FK → recurring_plans.id | |
| `template_id` | `uuid` | FK → quotation_templates.id | Optional, used if template applied |
| `payment_term_id` | `uuid` | FK → payment_terms.id | |
| `salesperson_id` | `uuid` | FK → users.id | Auto-set to creating user |
| `status` | `enum('quotation','quotation_sent','confirmed','closed')` | NOT NULL, DEFAULT 'quotation' | |
| `expiration_date` | `date` | | Quotation expiry |
| `start_date` | `date` | | Set on confirm |
| `order_date` | `date` | | Set on confirm |
| `next_invoice_date` | `date` | | Calculated from plan |
| `payment_method` | `varchar(50)` | | |
| `payment_done` | `boolean` | DEFAULT false | |
| `parent_id` | `uuid` | FK → subscriptions.id (self-ref) | Used for Renew / Upsell chains |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

#### Table: `subscription_order_lines`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `subscription_id` | `uuid` | FK → subscriptions.id, NOT NULL | |
| `product_id` | `uuid` | FK → products.id | |
| `quantity` | `integer` | NOT NULL, DEFAULT 1 | |
| `unit_price` | `numeric(10,2)` | NOT NULL | |
| `discount` | `numeric(5,2)` | DEFAULT 0 | Line-level discount % |
| `tax_id` | `uuid` | FK → taxes.id | |
| `amount` | `numeric(10,2)` | NOT NULL | Computed: qty × unit_price (after discount) |
| `sort_order` | `integer` | DEFAULT 0 | For ordering lines in UI |

---

#### Table: `invoices`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `number` | `varchar(30)` | NOT NULL, UNIQUE | e.g., INV/0015 |
| `subscription_id` | `uuid` | FK → subscriptions.id | |
| `customer_id` | `uuid` | FK → contacts.id, NOT NULL | |
| `status` | `enum('draft','confirmed','paid','cancelled')` | NOT NULL, DEFAULT 'draft' | |
| `invoice_date` | `date` | NOT NULL | |
| `due_date` | `date` | | |
| `paid` | `boolean` | DEFAULT false | |
| `paid_on` | `date` | | |
| `amount_due` | `numeric(10,2)` | DEFAULT 0 | Recalculated after payment |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

#### Table: `invoice_order_lines`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `invoice_id` | `uuid` | FK → invoices.id, NOT NULL | |
| `product_id` | `uuid` | FK → products.id | |
| `quantity` | `integer` | NOT NULL | |
| `unit_price` | `numeric(10,2)` | NOT NULL | |
| `tax_id` | `uuid` | FK → taxes.id | |
| `amount` | `numeric(10,2)` | NOT NULL | |
| `sort_order` | `integer` | DEFAULT 0 | |

---

#### Table: `payments`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `invoice_id` | `uuid` | FK → invoices.id, NOT NULL | |
| `method` | `enum('online','cash')` | NOT NULL | |
| `amount` | `numeric(10,2)` | NOT NULL | |
| `payment_date` | `date` | NOT NULL | |
| `notes` | `text` | | |
| `stripe_payment_intent_id` | `varchar(100)` | | Populated for online payments |
| `created_by` | `uuid` | FK → users.id, NOT NULL | Must be Admin |
| `created_at` | `timestamptz` | DEFAULT now() | |

---

### 5.4 Entity Relationship Overview

```
users ──────────────────────────────────────────── contacts
  │  1:1 auto-linked on creation                      │
  │                                                    │ 1:N
  │                                            subscriptions
  │                                                    │
  │                                         ┌──────────┼──────────┐
  │                                         │          │          │
  │                                  order_lines   invoices   (parent)
  │                                                    │       self-ref
  │                                            invoice_lines  (Renew/Upsell)
  │                                                    │
  │                                               payments
  │
products ──────────── product_recurring_prices ── recurring_plans
    │
    └──── product_variants ──── attribute_values ──── attributes

quotation_templates ── quotation_template_lines ── products
        │
        └── recurring_plans

discounts ──── discount_products ──── products

taxes ──── products (via tax_id)
      ──── subscription_order_lines (via tax_id)
      ──── invoice_order_lines (via tax_id)

payment_terms ──── payment_term_lines
           └────── subscriptions (via payment_term_id)
```

---

### 5.5 Indexes & Performance

```sql
-- Authentication
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Subscription lookups
CREATE UNIQUE INDEX idx_subscriptions_number ON subscriptions(number);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_invoice ON subscriptions(next_invoice_date);

-- Invoice lookups
CREATE UNIQUE INDEX idx_invoices_number ON invoices(number);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Payment lookups
CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- Product variants
CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- Discount validation
CREATE INDEX idx_discounts_dates ON discounts(start_date, end_date);

-- Order lines
CREATE INDEX idx_sub_order_lines_subscription ON subscription_order_lines(subscription_id);
CREATE INDEX idx_inv_order_lines_invoice ON invoice_order_lines(invoice_id);
```

---

## 6. Payment Gateway — Stripe

| Property | Value |
|----------|-------|
| Mode | **Test / Beta mode only** — no real transactions processed |
| SDK | `stripe` (Node.js server SDK) + `@stripe/stripe-js` + `@stripe/react-stripe-js` (frontend) |
| Integration | Stripe Elements embedded on `/checkout/payment` |
| Methods | Credit Card · PayPal (via Stripe) |

**Flow:**

```
Frontend (Stripe Elements)
      │
      └── User enters card / selects PayPal
              │
              └── POST /api/create-payment-intent (Next.js API Route)
                        │
                        └── stripe.paymentIntents.create({ amount, currency })
                                  │
                                  └── Returns client_secret to frontend
                                            │
                                            └── stripe.confirmPayment(client_secret)
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   │ Success                              │ Failure
                                   ▼                                      ▼
                      POST /api/payments (record in DB)            Show error to user
                      Mark Invoice as Paid
                      Redirect to /thank-you
```

**Environment variables needed:**

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 7. Version Control & Git Workflow

| Property | Value |
|----------|-------|
| Platform | GitHub |
| Structure | Monorepo (single repository) |
| Branch protection | Enabled on `main` — direct pushes blocked |
| PR reviews | Minimum 1 approval required before merge |
| Commit style | Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) |

**Branch naming convention:**

```
feature/[ticket-id]-short-description    e.g., feature/SMS-12-subscription-form
fix/[ticket-id]-short-description        e.g., fix/SMS-34-invoice-amount-calc
chore/[description]                      e.g., chore/update-tailwind-config
docs/[description]                       e.g., docs/add-api-flow-doc
```

**Core branches:**

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only; protected |
| `develop` | Integration branch; all feature PRs merge here first |
| `feature/*` | Individual feature development |
| `fix/*` | Bug fixes |

> Every team member must have at least one merged PR. Managing the repository from a single account violates the version control requirement.

---

## 8. Environment Configuration

```env
# ── Database ───────────────────────────────────────────
DATABASE_URI=postgresql://sms_user:sms_pass@localhost:5432/sms_db
DB_USER=sms_user
DB_PASSWORD=sms_pass
DB_NAME=sms_db

# ── Node.js API / CMS ────────────────────────────────────────
BACKEND_SECRET=your-super-secret-backend-key-min-32-chars
BACKEND_PUBLIC_SERVER_URL=http://localhost:3001

# ── Next.js Frontend ───────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ── Stripe ─────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── Email / SMTP ───────────────────────────────────────
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
EMAIL_FROM=noreply@subsms.local

# ── App ────────────────────────────────────────────────
NODE_ENV=development
```

> Never commit `.env` to Git. Commit `.env.example` with placeholder values only.

---

## 9. Data Flow Architecture

### Portal User Purchases a Plan

```
1. Browser → GET /shop
      backend Local API: backend.find({ collection: 'products' })
      → Products fetched from PostgreSQL

2. Browser → Product Detail Page
      backend Local API: backend.findByID({ collection: 'products', id })
      → Variants, prices loaded

3. User adds to cart → Cart state held in React state / localStorage

4. Discount code entered → POST /api/discounts/validate
      Checks: exists? active? within dates? usage < limit? min qty/purchase met?
      → Returns discount object or error

5. Checkout → POST /api/create-payment-intent
      Stripe SDK: stripe.paymentIntents.create(...)
      → client_secret returned to browser

6. Payment confirmed → Stripe Elements → stripe.confirmPayment()
      → Success webhook received by /api/stripe/webhook

7. Webhook handler:
      a. backend.create({ collection: 'subscriptions', data: {...} })
      b. afterChange hook fires → backend.create({ collection: 'invoices' })
      c. backend.create({ collection: 'payments', data: { invoice, amount, method } })
      d. afterChange hook fires → invoice.status = 'paid', amount_due = 0

8. Browser → Redirect to /thank-you with order number
```

### Admin Creates Subscription Manually

```
1. Admin logs in → /admin (backend Admin UI)

2. Admin opens Subscriptions → New
      Fills: Customer, Template, Plan, Payment Term, Order Lines

3. Admin clicks Send → subscription.status = 'quotation_sent'
      Email hook triggers: send quotation email to customer

4. Admin clicks Confirm → subscription.status = 'confirmed'
      beforeChange hook: lock order lines
      afterChange hook: auto-create Draft Invoice

5. Admin opens auto-created Invoice → clicks Confirm
      invoice.status = 'confirmed'

6. Admin clicks Pay → Payment popup
      backend.create({ collection: 'payments', ... })
      afterChange hook: invoice.paid = true, amount_due = 0
```

---

## 10. Security Architecture

| Layer | Mechanism |
|-------|-----------|
| **Authentication** | Node.js API / CMS built-in — JWT + HTTP-only cookies |
| **Password hashing** | bcrypt (handled by backend automatically) |
| **Role enforcement** | backend `access` functions per collection and operation |
| **Order line lock** | `beforeChange` hook throws error if modification attempted post-confirm |
| **Admin-only operations** | `isAdmin` access function on Discounts, Payments, User creation |
| **CSRF protection** | backend handles CSRF token for admin panel; API routes use SameSite cookies |
| **Input validation** | Zod schemas validated on client (React Hook Form) and server (backend field validation + API route handlers) |
| **Environment secrets** | All keys in `.env`; never committed to Git |
| **Stripe** | Webhook signature verified via `stripe.webhooks.constructEvent(rawBody, sig, secret)` |
| **SQL injection** | Not possible — Drizzle ORM uses parameterized queries exclusively |

---

## 11. Development Setup Guide

```bash
# 1. Clone the repository
git clone https://github.com/your-org/subscription-management.git
cd subscription-management

# 2. Install all workspace dependencies
npm install

# 3. Copy environment file and fill in values
cp .env.example .env

# 4. Start PostgreSQL via local environment
npm run start:db

# 5. Start Node.js API / CMS (backend + admin panel)
cd apps/cms
npm run dev        # Starts on http://localhost:3001
                   # Admin panel at http://localhost:3001/admin

# 6. In a new terminal, start the Next.js portal
cd apps/web
npm run dev        # Starts on http://localhost:3000

# 7. backend auto-runs migrations on first start.
#    Seed the default Admin user if not already present:
cd apps/cms
npm run seed
```

**Default admin credentials (local dev only):**

```
Email:    admin@subsms.local
Password: Admin@1234!
```

---

## 12. Dependency Reference

### Frontend (`apps/web`)

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.x | App Router framework |
| `react` | 18.x | UI component library |
| `react-dom` | 18.x | DOM rendering |
| `tailwindcss` | 3.x | Utility-first CSS |
| `next-themes` | latest | Light/dark mode management |
| `react-hook-form` | 7.x | Form state management |
| `zod` | 3.x | Schema validation |
| `@hookform/resolvers` | latest | Zod ↔ RHF bridge |
| `lucide-react` | latest | Icon library |
| `@stripe/stripe-js` | latest | Stripe browser SDK |
| `@stripe/react-stripe-js` | latest | Stripe React components |
| `stripe` | latest | Stripe Node SDK (API routes) |
| `typescript` | 5.x | Type safety |

### Backend (`apps/cms`)

| Package | Version | Purpose |
|---------|---------|---------|
| `backend` | 2.x | CMS framework + API + admin |
| `Postgres Adapter` | latest | PostgreSQL adapter for backend |
| `Admin Bundler` | latest | Admin UI bundler |
| `Rich Text Support` | latest | Rich text support |
| `express` | 4.x | HTTP server (wrapped by backend) |
| `stripe` | latest | Payment processing |
| `nodemailer` | latest | Transactional email sending |
| `typescript` | 5.x | Type safety |
| `dotenv` | latest | Environment variable loading |

### Shared (`packages/types`)

| Package | Purpose |
|---------|---------|
| `backend` | Type generation source (`backend generate:types`) |
| `typescript` | Shared type compilation |

---

*This document reflects the complete technical architecture of v1. All library versions should be pinned in `package.json` before shipping to production.*
