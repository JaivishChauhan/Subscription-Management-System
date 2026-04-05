# Subscription Management System

> A full-stack B2C subscription marketplace and B2B subscription management platform built with **Next.js 16 App Router**, **Prisma ORM**, **PostgreSQL**, and a hand-rolled **JWT authentication** system.

---

## Table of Contents

1. [What Is This?](#1-what-is-this)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication & Security](#4-authentication--security)
5. [Role-Based Access Control (RBAC)](#5-role-based-access-control-rbac)
6. [Database Schema](#6-database-schema)
7. [Feature Modules](#7-feature-modules)
   - [7.1 Landing Page & Public Site](#71-landing-page--public-site)
   - [7.2 Shop & Pricing](#72-shop--pricing)
   - [7.3 Service Bundles](#73-service-bundles)
   - [7.4 Cart](#74-cart)
   - [7.5 Checkout](#75-checkout)
   - [7.6 Admin Dashboard](#76-admin-dashboard)
   - [7.7 Admin — Services Management](#77-admin--services-management)
   - [7.8 Admin — Bundles Management](#78-admin--bundles-management)
   - [7.9 Admin — Products Management](#79-admin--products-management)
   - [7.10 Admin — Recurring Plans](#710-admin--recurring-plans)
   - [7.11 Admin — Subscriptions](#711-admin--subscriptions)
   - [7.12 Admin — Invoices](#712-admin--invoices)
   - [7.13 Admin — Payments](#713-admin--payments)
   - [7.14 Admin — Discounts](#714-admin--discounts)
   - [7.15 Admin — Taxes](#715-admin--taxes)
   - [7.16 Admin — Users & Contacts](#716-admin--users--contacts)
   - [7.17 Admin — Reports](#717-admin--reports)
   - [7.18 Internal Portal](#718-internal-portal)
   - [7.19 Portal — Subscriptions & Invoices](#719-portal--subscriptions--invoices)
8. [API Routes](#8-api-routes)
9. [Server Actions](#9-server-actions)
10. [State Management](#10-state-management)
11. [Validation Layer](#11-validation-layer)
12. [Email System](#12-email-system)
13. [Payment Gateways](#13-payment-gateways)
14. [PDF Generation](#14-pdf-generation)
15. [Environment Variables](#15-environment-variables)
16. [Getting Started](#16-getting-started)
17. [Database Commands](#17-database-commands)
18. [Implementation Progress](#18-implementation-progress)

---

## 1. What Is This?

The **Subscription Management System (SMS)** is a dual-domain platform:

| Domain | Who Uses It | What It Does |
|--------|-------------|--------------|
| **B2C Marketplace** | End customers (portal role) | Browse services, build bundles, checkout, manage subscriptions |
| **B2B Operations** | Admins & internal staff | Manage products, recurring plans, subscriptions, invoices, payments, taxes, discounts |

**Why it was built:** To replace a manual Odoo-based workflow with a custom, fully-typed Next.js application that gives the business full control of the subscription lifecycle — from quotation drafts to recurring invoice generation and payment collection.

**Key design decisions:**
- Hand-rolled JWT auth (no NextAuth adapter complexity) — sessions stored in `httpOnly` cookies
- Edge-compatible middleware (pure JWT via `jose`, no Prisma in middleware)
- PostgreSQL via Prisma with connection pooling (`@prisma/adapter-pg`)
- Full RBAC at three tiers: **admin → internal → portal**

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 16.1.7 (App Router + Turbopack) | Server Components reduce client JS; App Router enables per-route caching |
| **Language** | TypeScript 5 (`strict: true`) | End-to-end type safety |
| **UI** | React 19, Tailwind CSS 4 | Concurrent rendering; utility-first atomic CSS |
| **Icons** | Tabler Icons React | Consistent open-source icon set (1600+) |
| **Charts** | Recharts | Composable chart primitives for dashboards |
| **Animation** | Framer Motion 12 | Physics-based animations for landing page |
| **Forms** | React Hook Form + Zod | Minimal re-renders; schema-driven type-safe validation |
| **State** | Zustand 4 | Lightweight client global state for cart and bundle builder |
| **Auth** | Hand-rolled JWT (`jose` + `bcryptjs`) | No NextAuth adapter overhead; works in Edge runtime |
| **ORM** | Prisma 7 | Type-safe DB queries; migration management |
| **Database** | PostgreSQL (dev: SQLite via `dev.db`) | Production-ready relational store |
| **DB Adapter** | `@prisma/adapter-pg` | Prisma's native PG driver adapter |
| **Notifications** | Sonner 2 | Non-blocking toast notifications |
| **PDF** | `@react-pdf/renderer` | React-based invoice PDF generation |
| **Email** | Nodemailer | SMTP-based transactional email |
| **Payments** | Stripe + Razorpay | Dual-gateway; Stripe Checkout + Razorpay Orders |
| **Themes** | next-themes | System-aware dark/light mode with zero flash |
| **Packages** | pnpm 10 | Fast, disk-efficient package manager |

---

## 3. Project Structure

```
subscription-management-system/
│
├── app/                         # Next.js App Router pages & route handlers
│   ├── (auth)/                  # Auth route group (login, signup, reset-password)
│   ├── admin/                   # Admin-only pages (requires role=admin)
│   │   ├── page.tsx             # Dashboard with KPIs + charts
│   │   ├── layout.tsx           # Sidebar navigation wrapper
│   │   ├── _components/         # Dashboard-specific components
│   │   ├── services/            # Service catalog management
│   │   ├── bundles/             # Bundle management
│   │   ├── products/            # Product catalog (B2B)
│   │   ├── plans/               # Recurring billing plan management
│   │   ├── subscriptions/       # Subscription lifecycle management
│   │   ├── invoices/            # Invoice management
│   │   ├── payments/            # Payment records
│   │   ├── discounts/           # Discount / promo code management
│   │   ├── taxes/               # Tax configuration
│   │   ├── users/               # User management (create internal users)
│   │   ├── contacts/            # Customer contact profiles
│   │   ├── reports/             # Revenue, subscription, and payment reports
│   │   └── settings/            # System settings
│   │
│   ├── internal/                # Internal staff portal (requires role=internal)
│   │   ├── page.tsx             # Internal dashboard
│   │   ├── layout.tsx           # Internal navigation wrapper
│   │   ├── subscriptions/       # Read-only subscription views
│   │   ├── invoices/            # Invoice views
│   │   ├── payments/            # Payment views
│   │   ├── contacts/            # Contact views
│   │   ├── plans/               # Plan views
│   │   ├── products/            # Product views
│   │   └── reports/             # Reporting views
│   │
│   ├── api/                     # REST route handlers
│   │   ├── auth/                # /register, /google/callback, [...nextauth]
│   │   ├── services/            # CRUD for marketplace services
│   │   ├── bundles/             # CRUD for bundles
│   │   ├── products/            # CRUD for B2B products
│   │   ├── plans/               # Recurring plan management
│   │   ├── subscriptions/       # Subscription lifecycle
│   │   ├── invoices/            # Invoice management
│   │   ├── payments/            # Payment recording
│   │   ├── discounts/           # Discount management
│   │   ├── taxes/               # Tax management
│   │   ├── users/               # User management
│   │   ├── quotations/          # Quotation templates
│   │   ├── checkout/            # Checkout orchestration
│   │   ├── payment/             # Payment gateway (Stripe/Razorpay)
│   │   └── webhooks/            # Stripe webhook handler
│   │
│   ├── shop/                    # B2C service marketplace
│   ├── bundles/                 # Bundle browser & builder
│   ├── pricing/                 # Pricing plan page
│   ├── cart/                    # Shopping cart
│   ├── checkout/                # Checkout flow
│   ├── dashboard/               # Portal user dashboard
│   ├── subscriptions/           # Portal: user's active subscriptions
│   ├── invoices/                # Portal: user's invoice list
│   ├── profile/                 # User profile management
│   ├── auth/                    # Auth redirect helper
│   └── page.tsx                 # Landing page (public)
│
├── actions/                     # Next.js Server Actions (mutations)
│   ├── bundle-actions.ts        # Create, update, toggle bundle
│   ├── checkout-actions.ts      # Checkout orchestration
│   ├── contact-actions.ts       # Contact updates
│   ├── discount-actions.ts      # Discount CRUD
│   ├── invoice-actions.ts       # Invoice state transitions
│   ├── payment-actions.ts       # Payment recording
│   └── service-actions.ts       # Service CRUD
│
├── components/                  # Shared UI components
│   ├── ui/                      # Primitive UI atoms (buttons, modals, inputs)
│   ├── header.tsx               # Responsive top navigation (role-aware)
│   ├── conditional-header.tsx   # Conditionally renders header
│   ├── InvoicePDF.tsx           # @react-pdf/renderer invoice template
│   ├── hero-animated-background.tsx  # Framer Motion landing hero animation
│   ├── scroll-reveal.tsx        # Intersection Observer scroll animation
│   ├── theme-provider.tsx       # next-themes provider
│   ├── theme-toggle.tsx         # Dark/light mode toggle
│   └── providers.tsx            # Root providers wrapper
│
├── lib/                         # Business logic & server utilities
│   ├── auth.ts                  # Hand-rolled JWT session management
│   ├── admin.ts                 # RBAC page/API guards
│   ├── db.ts                    # Prisma client singleton
│   ├── roles.ts                 # Role enum + redirect helpers
│   ├── email.ts                 # Nodemailer transactional email
│   ├── stripe.ts                # Stripe client + checkout session helpers
│   ├── razorpay.ts              # Razorpay client + order helpers
│   ├── invoices.ts              # Invoice generation from subscriptions
│   ├── payments.ts              # Payment recording logic
│   ├── subscriptions.ts         # Subscription helper queries
│   └── validations/             # Zod schemas per domain
│       ├── auth.ts              # Login, signup, reset password
│       ├── product.ts           # Product create/update
│       ├── plan.ts              # RecurringPlan create/update
│       ├── subscription.ts      # Subscription create/update
│       ├── invoice.ts           # Invoice state transitions
│       ├── payment.ts           # Payment recording
│       ├── discount.ts          # Discount create/update
│       ├── tax.ts               # Tax create/update
│       ├── bundle.ts            # Bundle create/update
│       ├── service.ts           # Service create/update
│       ├── contact.ts           # Contact update
│       ├── user.ts              # User invite/role update
│       └── subscription-helpers.ts  # Shared sub validation utils
│
├── store/                       # Zustand client state
│   ├── cart.ts                  # Cart items (services + bundles)
│   └── bundle.ts                # Bundle builder selected services
│
├── types/                       # Shared TypeScript types
│   ├── service.ts               # Service domain types
│   ├── bundle.ts                # Bundle domain types
│   └── next-auth.d.ts           # Session augmentation
│
├── prisma/
│   ├── schema.prisma            # Full DB schema (18 models)
│   └── seed.ts                  # Dev seed data
│
├── scripts/
│   ├── create-admin.ts          # Bootstrap first admin user
│   └── clear-sessions.ts        # Clear all auth sessions
│
├── proxy.ts                     # Edge middleware (route protection)
├── next.config.mjs              # Next.js config
├── prisma.config.ts             # Prisma config (adapter-pg setup)
└── .env.example                 # Environment variable template
```

---

## 4. Authentication & Security

### How It Works

This app uses a **fully custom JWT-based session system** — not NextAuth's default session strategy.

**Why custom?**
- NextAuth's adapter-based sessions add DB round-trips on every request.
- The Edge middleware cannot use Prisma (Node.js only) — so role checks at the middleware layer require a pure JWT approach.
- Hand-rolled auth gives full control over cookie shape, expiry, and claim content.

### Auth Flow

```
User submits login form
        ↓
POST /api/auth/register (signup) OR
lib/auth.ts → signInWithCredentials() (login)
        ↓
bcryptjs.compare(password, hash) [cost=12]
        ↓
SignJWT payload = { id, email, name, role, image }
signed with HS256 using AUTH_SECRET
        ↓
Set httpOnly cookie "sms.session" (30-day maxAge)
        ↓
Every server component/action calls auth()
→ reads cookie → jwtVerify() → returns Session | null
```

### Google OAuth Flow

```
User clicks "Sign in with Google"
        ↓
Redirect to Google OAuth consent screen
        ↓
Google redirects to /api/auth/google/callback
        ↓
lib/auth.ts → signInWithGoogle()
→ upsert User (create if first time)
→ create linked Contact if new user
→ sign JWT → set session cookie
```

### Session Object

```typescript
interface Session {
  user: {
    id: string       // Prisma cuid
    email: string
    name: string
    role: "admin" | "internal" | "portal"
    image: string | null
  }
  expires: string    // ISO-8601 UTC
}
```

### Security Properties

| Property | Value |
|----------|-------|
| Cookie name | `sms.session` |
| Cookie flags | `httpOnly`, `SameSite=lax`, `Secure` (production) |
| Algorithm | HS256 |
| Token expiry | 30 days |
| Password hashing | bcryptjs cost factor 12 |
| Secret source | `AUTH_SECRET` env var (never client-accessible) |

---

## 5. Role-Based Access Control (RBAC)

Three roles with strict hierarchical access:

| Role | Access | Created By |
|------|--------|------------|
| `admin` | Full system access — all admin pages, all API routes | Another admin (or bootstrap script) |
| `internal` | Read-only operational views — subscriptions, invoices, contacts, plans | Admin only |
| `portal` | Customer-facing pages — shop, cart, checkout, own invoices/subscriptions | Self-registration |

### Middleware Guard (`proxy.ts`)

The Next.js middleware runs on the **Edge runtime** — it reads and verifies the JWT cookie using `jose` (zero Node.js dependencies):

```
/admin/*     → requires role=admin     → else redirect to role home
/internal/*  → requires role=internal  → else redirect to role home
/dashboard, /subscriptions, /invoices, /checkout
             → requires role=portal    → else redirect to role home
/cart        → allows portal + public (anonymous cart browsing)
/login, /signup → if already logged in, redirect to role home
```

### Server-Side Guards (`lib/admin.ts`)

Pages and API routes use typed guard functions:

```typescript
// In a Page (Server Component)
await requireAdminPage()          // admin only
await requireInternalPage()       // internal only
await requirePageRole(["admin", "internal"])  // multiple roles

// In an API Route Handler
const { session, error } = await requireAdminApi()
if (error) return error           // auto-returns 401/403 NextResponse

// Role-based default redirect paths:
admin    → /admin
internal → /internal
portal   → /dashboard
```

---

## 6. Database Schema

The schema comprises **18 Prisma models** across two domains.

### Domain 1: B2B Subscription Operations

```
User ──────────────────── Contact
  │                          │
  ├── Subscription ──────────┤
  │     ├── SubscriptionLine │
  │     │     ├── Product    │
  │     │     │    ├── ProductVariant
  │     │     │    └── RecurringPrice
  │     │     └── ProductVariant
  │     ├── RecurringPlan
  │     ├── PaymentTerms
  │     └── Invoice ─────────┤
  │           ├── InvoiceLine │
  │           └── Payment     │
  │                           │
  ├── ActivityLog             │
  └── Account / Session       │
                              │
Discount ─── DiscountProduct ──┘
Tax
QuotationTemplate ── QuotationTemplateLine
Attribute ── AttributeValue
```

### Domain 2: B2C Marketplace

```
Service ─────┐
             ├── BundleService ── Bundle
             │
CartItem ────┤ (references Service OR Bundle)
             │
             └── (checkout → Subscription)
```

### Key Models Summary

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `User` | Platform identity + auth | `id`, `email`, `password`, `role`, `emailVerified` |
| `Contact` | Customer billing profile | `userId`, `firstName`, `lastName`, `company`, `address` |
| `Product` | B2B product catalog | `name`, `type` (service/goods), `salesPrice`, `costPrice`, `isActive` |
| `ProductVariant` | Attribute-based pricing | `attribute`, `value`, `extraPrice` |
| `RecurringPlan` | Billing configuration | `billingPeriod` (daily/weekly/monthly/yearly), `price`, `autoClose`, `pausable` |
| `RecurringPrice` | Product ↔ Plan price override | `productId`, `recurringPlanId`, `price` |
| `Subscription` | Core lifecycle entity | `status` (draft→quotation→confirmed→active→closed), `subscriptionNumber` |
| `SubscriptionLine` | Per-subscription products | `productId`, `quantity`, `unitPrice`, `taxAmount`, `subtotal` |
| `Invoice` | Auto-generated billing records | `status` (draft→confirmed→paid/cancelled), `subtotal`, `taxTotal`, `amountDue` |
| `InvoiceLine` | Per-invoice product rows | `name`, `quantity`, `unitPrice`, `taxAmount` |
| `Payment` | Invoice settlement records | `paymentMethod`, `amount`, `stripePaymentIntentId`, `gatewayOrderId` |
| `Discount` | Promo codes & rules | `code`, `type` (fixed/percentage), `startDate`, `endDate`, `usageLimit` |
| `Tax` | Configurable tax rates | `name` (e.g. "GST 18%"), `type`, `rate` |
| `PaymentTerms` | Invoice due date rules | `name` (e.g. "Net 30"), `dueDays` |
| `Service` | B2C marketplace service | `slug`, `category`, `monthlyPrice`, `yearlyPrice`, `logoUrl`, `isFeatured` |
| `Bundle` | Curated service collections | `type` (predefined/suggested/custom), `discountType`, `discountValue` |
| `CartItem` | Pre-checkout cart state | `userId`, `serviceId` OR `bundleId`, `quantity` |
| `ActivityLog` | System audit trail | `type`, `entityType`, `entityId`, `actorId`, `details` (JSON) |

### Subscription Lifecycle

```
draft → quotation → confirmed → active → closed
```
- `draft`: Created, not yet sent to customer
- `quotation`: Sent for customer review
- `confirmed`: Customer accepted; billing about to start
- `active`: Billing live; recurring invoices generated
- `closed`: Terminated; no further invoices

### Invoice Lifecycle

```
draft → confirmed → paid
              ↓
          cancelled
```

---

## 7. Feature Modules

### 7.1 Landing Page & Public Site

**Route:** `/` (`app/page.tsx`)  
**Access:** Public  
**Status:** ✅ Implemented

The main marketing and entry point for the platform. Fetches live data from database for display.

**What it includes:**
- Hero section with animated gradient background (`hero-animated-background.tsx`) using Framer Motion canvas animation
- Live service category showcase (fetched from `Service` table via Prisma)
- Featured bundles section (fetched from `Bundle` table)
- Feature highlights and trust indicators
- Call-to-action sections driving to `/shop` and `/pricing`
- Scroll-reveal animations (`scroll-reveal.tsx`) using Intersection Observer
- CountUp.js animated statistics
- Responsive header with role-aware navigation links

**Why:** Provides a compelling first impression for B2C customers and surfaces real marketplace data immediately.

---

### 7.2 Shop & Pricing

**Routes:** `/shop`, `/pricing`  
**Access:** Public (login required for purchase)  
**Status:** 🟡 UI implemented; DB wiring partial

**Shop (`/shop`):**
- Service catalog browser with category filtering
- Service cards with logo, description, pricing (monthly/yearly toggle)
- "Add to Cart" functionality linked to Zustand cart store
- Search and filter by category (streaming, productivity, AI, music, gaming, etc.)

**Pricing (`/pricing`):**
- Recurring plan tiles from `RecurringPlan` table
- Feature comparison by tier
- "Subscribe" CTA → routes to checkout or login prompt

**Why:** Allows customers to discover and compare services without requiring authentication first.

---

### 7.3 Service Bundles

**Route:** `/bundles`  
**Access:** Public + portal  
**Status:** 🟡 Implemented with live DB data

**What it includes:**
- Predefined bundles fetched from `Bundle` + `BundleService` + `Service` tables
- Bundle cards with included services, discount badge, and total savings
- **Custom Bundle Builder** — interactive drag-and-select UI for building custom bundles
  - Powered by `store/bundle.ts` (Zustand) for selected service state
  - "Add to Cart" adds the custom selection as a cart item
- Bundle type filter: Predefined / Suggested / Custom

**Why:** Bundles are the primary upsell mechanism — curated collections that save customers more than buying individually.

---

### 7.4 Cart

**Route:** `/cart`  
**Access:** Public (portal required for checkout)  
**Status:** 🟡 UI implemented; checkout wiring in progress

**What it includes:**
- Cart items list showing services and bundles
- Quantity controls per item
- Subtotal calculation with plan period toggle (monthly/yearly)
- Remove item functionality
- "Proceed to Checkout" CTA (requires login)
- Empty cart state with call to action

**State:** Managed by `store/cart.ts` (Zustand persist store — survives page refreshes via `localStorage`)

**Why:** Decoupled from server state to allow anonymous browsing; syncs to DB only at checkout.

---

### 7.5 Checkout

**Route:** `/checkout`  
**Access:** `portal` role required  
**Status:** 🟡 UI implemented; payment gateway wiring in progress

**What it includes:**
- Multi-step checkout form:
  1. Review cart items
  2. Billing address (pre-filled from `Contact` profile)
  3. Plan selection (monthly/yearly)
  4. Discount code validation
  5. Payment method selection (Stripe / Razorpay)
- Order summary with taxes and line-item breakdown
- On completion: creates `Subscription` + `Invoice` records via `checkout-actions.ts`
- Sends confirmation email via `lib/email.ts`

**Server Action:** `actions/checkout-actions.ts`  
**API:** `POST /api/checkout` — creates subscription and first invoice

**Why:** Checkout is the conversion point; the server action ensures atomicity — subscription and invoice are created in the same DB transaction.

---

### 7.6 Admin Dashboard

**Route:** `/admin`  
**Access:** `admin` role required  
**Status:** 🟡 UI done; some data is still mocked

**What it displays:**

| KPI Card | Query |
|----------|-------|
| Active Subscriptions | `subscriptions.count({ status: 'active' })` |
| Revenue MTD | `invoices.aggregate({ _sum: total, status: 'paid', month: now })` |
| Outstanding | `invoices.aggregate({ _sum: amountDue, status: 'confirmed' })` |
| Overdue | `invoices.count({ dueDate: { lt: now }, status: 'confirmed' })` |

**Charts (Recharts):**
- Revenue Overview — AreaChart (Actual vs Forecast, monthly)
- Plan Distribution — Donut chart by recurring plan tier

**Supporting panels:**
- Churn Risk Monitor — customers flagged by heuristics (no activity in 30 days)
- Recent Activity Timeline — last N events from `ActivityLog` table

**Navigation sidebar** links to all admin sub-modules.

---

### 7.7 Admin — Services Management

**Route:** `/admin/services`  
**Access:** `admin` only  
**API:** `GET/POST /api/services`, `PATCH/DELETE /api/services/[id]`  
**Server Action:** `actions/service-actions.ts`  
**Status:** ✅ Implemented

**What you can do:**
- List all services with search, category filter, and active/inactive toggle
- Create a new service: name, slug, description, category, logoUrl, iconKey (Tabler), color, monthlyPrice, yearlyPrice
- Edit existing services
- Toggle `isActive` and `isFeatured` flags
- Soft-delete (sets `isActive = false`)

**Service categories:** `streaming | productivity | ai | music | gaming | creative | cloud | communication | security | fitness`

**Why:** Services are the atomic unit of the B2C marketplace. Admin controls what's visible to customers.

---

### 7.8 Admin — Bundles Management

**Route:** `/admin/bundles`  
**Access:** `admin` only  
**API:** `GET/POST /api/bundles`, `PATCH /api/bundles/[id]`  
**Server Action:** `actions/bundle-actions.ts`  
**Status:** ✅ Implemented

**What you can do:**
- List all bundles (predefined, suggested, custom) with service counts
- Create bundles: name, slug, description, type, discount (fixed or percentage), included services (multi-select)
- Edit bundle details and update included services
- Toggle `isActive` and `isFeatured`
- View bundle → drill into included services

**Bundle types:**
- `predefined` — admin-curated collections
- `suggested` — system-recommended based on customer subscriptions
- `custom` — created by customers using the bundle builder

**Why:** Bundles drive LTV (lifetime value) by encouraging customers to subscribe to multiple services at a discount.

---

### 7.9 Admin — Products Management

**Route:** `/admin/products`  
**Access:** `admin` only  
**API:** `GET/POST/PATCH/DELETE /api/products`  
**Status:** ❌ Not yet implemented

**Planned features:**
- Product catalog: name, type (service/goods), sales price, cost price, description, image
- Recurring price overrides per billing plan (`RecurringPrice`)
- Product variant management (attribute + value + extra price)
- Soft-delete with `isActive` flag

**Why:** Products are the B2B catalog foundation. Subscriptions and invoices reference products.

---

### 7.10 Admin — Recurring Plans

**Route:** `/admin/plans`  
**Access:** `admin` only  
**API:** `GET/POST/PATCH/DELETE /api/plans`  
**Validation:** `lib/validations/plan.ts`  
**Status:** ❌ Not yet implemented

**Planned features:**
- Create plans with billing period (daily/weekly/monthly/yearly), price, min quantity
- Boolean plan options: auto-close, closable, pausable, renewable
- Date range (start/end) for time-limited plans
- Warning if editing a plan with active subscriptions

**Why:** Plans define how subscriptions are billed. All subscriptions must reference a `RecurringPlan`.

---

### 7.11 Admin — Subscriptions

**Route:** `/admin/subscriptions`  
**Access:** `admin` only  
**API:** `GET/POST/PATCH /api/subscriptions`  
**Validation:** `lib/validations/subscription.ts`  
**Status:** ❌ Not yet implemented (core module)

**Planned features:**
- List with status tabs: Draft / Quotation / Confirmed / Active / Closed
- Create subscription: customer selector, plan, start/expiration date, payment terms, product lines
- Subscription detail with action buttons per lifecycle stage:
  - Draft → `Confirm as Quotation`
  - Quotation → `Confirm Order`
  - Confirmed → `Activate` (triggers invoice generation)
  - Active → `Close`
- Quotation template application (pre-fills plan + product lines)
- Auto-generate subscription number: `SUB-YYYYMMDD-XXXX`

**Why:** This is the core operational module — the entire billing lifecycle flows from subscription creation.

---

### 7.12 Admin — Invoices

**Route:** `/admin/invoices`  
**Access:** `admin` only  
**API:** `GET/PATCH /api/invoices`  
**Server Action:** `actions/invoice-actions.ts`  
**Status:** ❌ Admin view not yet implemented (portal view exists)

**Planned features:**
- Invoice list with status filter (Draft/Confirmed/Paid/Cancelled) and date range filter
- Invoice detail with full line-item breakdown
- Action buttons: Confirm, Cancel, Send Email, Print PDF
- Auto-generation from subscription activation (`lib/invoices.ts`)
- Applies active taxes from `Tax` table per line
- Sets `dueDate` based on linked `PaymentTerms`
- Invoice number format: `INV-YYYYMMDD-XXXX`

**PDF:** Uses `@react-pdf/renderer` via `components/InvoicePDF.tsx`

**Why:** Invoices are the financial record of the system. Auto-generation from subscriptions eliminates manual billing work.

---

### 7.13 Admin — Payments

**Route:** `/admin/payments`  
**Access:** `admin` only  
**API:** `GET/POST /api/payments`  
**Server Action:** `actions/payment-actions.ts`  
**Status:** ❌ Not yet implemented

**Planned features:**
- Payment list: invoice number, customer, method, amount, date
- "Record Payment" modal from invoice detail page
- Validates amount ≤ `invoice.amountDue`
- On save: decrements `amountDue`; marks invoice `paid` if fully settled
- Stripe webhook handler at `POST /api/webhooks/stripe` — auto-creates payment on `payment_intent.succeeded`

**Payment methods supported:**  
`credit_card | paypal | bank_transfer | cash | stripe | razorpay`

**Why:** Payments close the billing loop — recording them updates invoice status and reconciles accounts.

---

### 7.14 Admin — Discounts

**Route:** `/admin/discounts`  
**Access:** `admin` only  
**API:** `GET/POST/PATCH /api/discounts`  
**Server Action:** `actions/discount-actions.ts`  
**Validation:** `lib/validations/discount.ts`  
**Status:** 🟡 Server action + validation implemented; admin UI not yet done

**Features:**
- Create discount codes: name, code, type (fixed/percentage), value
- Set validity period (start/end date), usage limit, min purchase/quantity
- Assign to specific products via `DiscountProduct` join table
- `POST /api/discounts/validate` — customer-facing promo code validation at checkout

**Why:** Discounts are the primary retention and acquisition tool. Time-limited codes create urgency.

---

### 7.15 Admin — Taxes

**Route:** `/admin/taxes`  
**Access:** `admin` only  
**API:** `GET/POST/PATCH /api/taxes`  
**Validation:** `lib/validations/tax.ts`  
**Status:** ❌ Not yet implemented

**Planned features:**
- Tax list: name (e.g. "GST 18%"), type (percentage/fixed), rate, active toggle
- Create/Edit tax with inline toggle
- Auto-application in invoice generation: reads active taxes, calculates `taxAmount` per line, accumulates `Invoice.taxTotal`

**Why:** Tax compliance requires configurable, auditable tax records applied consistently per invoice.

---

### 7.16 Admin — Users & Contacts

**Routes:** `/admin/users`, `/admin/contacts`  
**Access:** `admin` only  
**API:** `GET/POST/PATCH /api/users`  
**Validation:** `lib/validations/user.ts`  
**Status:** ❌ Not yet implemented

**Planned for Users:**
- User list with role filter (admin/internal/portal)
- "Invite Internal User" — creates internal user with temporary password
- Role change (admin cannot change own role)

**Planned for Contacts:**
- Contact list: name, company, email, subscription count
- Contact detail: billing address, linked subscriptions, linked invoices
- Contact auto-created when portal user registers

**Why:** Users module enables the admin to provision internal team members and manage customer identity records.

---

### 7.17 Admin — Reports

**Route:** `/admin/reports`  
**Access:** `admin` only  
**Status:** ❌ Not yet implemented (dashboard KPIs exist)

**Planned reports:**

| Report | Metric |
|--------|--------|
| Active Subscriptions | Count by status, trend line |
| Revenue | MTD, YTD, by plan, by customer |
| Payments | Collected vs overdue |
| Overdue Invoices | Aging buckets (30/60/90 days) |

**Planned features:**
- Date range picker (presets: Last 7d, 30d, 90d, custom)
- CSV export from all report tables
- Recharts bar/line charts

**Why:** Operations need trend data — not just snapshots — to make pricing and plan decisions.

---

### 7.18 Internal Portal

**Routes:** `/internal/*`  
**Access:** `internal` role only  
**Status:** 🟡 Shell + navigation implemented; some views partially done

**Internal staff get read-only operational views:**
- Active subscriptions with status breakdown
- Invoice list with payment status
- Payment history
- Contact directory
- Product and plan reference views
- Basic reporting views

**Why:** Internal users (sales ops, support) need operational visibility without admin-level mutation rights.

---

### 7.19 Portal — Subscriptions & Invoices

**Routes:** `/dashboard`, `/subscriptions`, `/invoices`  
**Access:** `portal` role only  
**Status:** 🟡 UI shells exist; DB wiring partial

**Dashboard (`/dashboard`):**
- Active subscription count and status
- Upcoming invoice due dates
- Recent activity

**Subscriptions (`/subscriptions`):**
- Customer's own subscription list with status
- Subscription detail (read-only)

**Invoices (`/invoices`):**
- Customer's invoice history
- Payment status and amount due
- PDF download per invoice

**Why:** Self-service portal reduces support burden — customers can track their own subscriptions and invoices without contacting support.

---

## 8. API Routes

All API routes are in `app/api/`. Role guards are enforced via `lib/admin.ts`.

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/auth/register` | Public | Portal user self-registration |
| `GET` | `/api/auth/google/callback` | Public | Google OAuth token exchange |
| `POST` | `/api/auth/[...nextauth]` | Public | NextAuth handler (legacy) |
| `GET` | `/api/services` | Public | List active services |
| `POST` | `/api/services` | Admin | Create service |
| `PATCH` | `/api/services/[id]` | Admin | Update service |
| `DELETE` | `/api/services/[id]` | Admin | Soft-delete service |
| `GET` | `/api/bundles` | Public | List active bundles with services |
| `POST` | `/api/bundles` | Admin | Create bundle |
| `PATCH` | `/api/bundles/[id]` | Admin | Update bundle (including services) |
| `GET` | `/api/products` | Admin | List products |
| `POST` | `/api/products` | Admin | Create product |
| `PATCH` | `/api/products/[id]` | Admin | Update product |
| `DELETE` | `/api/products/[id]` | Admin | Soft-delete product |
| `GET` | `/api/plans` | Admin | List recurring plans |
| `POST` | `/api/plans` | Admin | Create plan |
| `PATCH` | `/api/plans/[id]` | Admin | Update plan |
| `GET` | `/api/subscriptions` | Admin/Internal | List subscriptions |
| `POST` | `/api/subscriptions` | Admin | Create subscription |
| `PATCH` | `/api/subscriptions/[id]` | Admin | Update subscription |
| `PATCH` | `/api/subscriptions/[id]/status` | Admin | Transition status |
| `GET` | `/api/invoices` | Admin/Portal | List invoices (scoped by role) |
| `GET` | `/api/invoices/[id]` | Admin/Portal | Single invoice |
| `PATCH` | `/api/invoices/[id]/status` | Admin | Confirm / Cancel invoice |
| `GET` | `/api/payments` | Admin | List payment records |
| `POST` | `/api/payments` | Admin | Record a payment |
| `GET` | `/api/discounts` | Admin | List discounts |
| `POST` | `/api/discounts` | Admin | Create discount |
| `POST` | `/api/discounts/validate` | Portal | Validate promo code at checkout |
| `GET` | `/api/taxes` | Admin | List taxes |
| `POST` | `/api/taxes` | Admin | Create tax |
| `PATCH` | `/api/taxes/[id]` | Admin | Update / toggle tax |
| `GET` | `/api/users` | Admin | List users |
| `POST` | `/api/users` | Admin | Create internal user |
| `PATCH` | `/api/users/[id]` | Admin | Update user role |
| `GET` | `/api/quotations` | Admin | List quotation templates |
| `POST` | `/api/checkout` | Portal | Create subscription + invoice on checkout |
| `POST` | `/api/payment` | Portal | Initiate Stripe/Razorpay payment |
| `POST` | `/api/webhooks/stripe` | Public (signed) | Handle Stripe payment events |

---

## 9. Server Actions

Server Actions in `actions/` handle mutations directly from Client Components without exposing API endpoints:

| File | Actions | Purpose |
|------|---------|---------|
| `service-actions.ts` | `createService`, `updateService`, `deleteService` | Admin service management |
| `bundle-actions.ts` | `createBundle`, `updateBundle`, `toggleBundleStatus` | Admin bundle management |
| `checkout-actions.ts` | `processCheckout`, `validateCart` | Atomically creates Subscription + Invoice |
| `discount-actions.ts` | `createDiscount`, `updateDiscount`, `validateDiscountCode` | Admin discount management + portal validation |
| `invoice-actions.ts` | `confirmInvoice`, `cancelInvoice` | Invoice state transitions |
| `payment-actions.ts` | `recordPayment` | Admin payment recording |
| `contact-actions.ts` | `updateContact` | Portal user profile updates |

**Why Server Actions over API routes for mutations?**  
Server Actions run on the server, are automatically CSRF-protected by Next.js, and can call `revalidatePath` for cache invalidation without an extra fetch round-trip.

---

## 10. State Management

Only two pieces of global client state exist (Zustand):

### Cart Store (`store/cart.ts`)

```typescript
interface CartItem {
  id: string
  type: "service" | "bundle"
  serviceId?: string
  bundleId?: string
  name: string
  price: number
  period: "monthly" | "yearly"
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}
```

Persisted to `localStorage` so it survives page refreshes.

### Bundle Builder Store (`store/bundle.ts`)

```typescript
interface BundleStore {
  selectedServices: Service[]
  addService: (service: Service) => void
  removeService: (serviceId: string) => void
  clearSelection: () => void
  totalMonthlyPrice: number
}
```

Used only within the bundle builder UI — not persisted.

**Why Zustand over Redux / Context?**  
Zustand has minimal boilerplate, supports `persist` middleware natively, and doesn't wrap the component tree with providers, keeping the Server Component boundary clean.

---

## 11. Validation Layer

All form and API request validation uses Zod schemas in `lib/validations/`.

### Auth Validation (`auth.ts`)

```typescript
// Password rules enforced:
// - Minimum 8 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one special character
const SignUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[!@#$%^&*]/, "Must contain special character"),
})
```

### Subscription Validation (`subscription.ts`)

Validates the full subscription create/update form including order lines, ensuring quantities are positive integers, prices are non-negative, and the status transition is legal.

### Discount Validation (`discount.ts`)

Validates date ranges (end after start), correct discount type/value combination, and optional constraint fields.

All validation schemas are shared between the frontend (React Hook Form `resolver`) and the backend (API route / server action input parsing), ensuring a single source of truth.

---

## 12. Email System

**Module:** `lib/email.ts`  
**Transport:** Nodemailer  
**Config:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` env vars

**Triggered for:**
- Password reset — one-time link with `VerificationToken`
- Invoice delivery — PDF attachment of the generated invoice
- Checkout confirmation — subscription and invoice summary
- New internal user invite — temporary credential delivery

**Why Nodemailer over Resend/SendGrid?**  
Nodemailer is transport-agnostic — can point at any SMTP server (Gmail, Mailgun, AWS SES) without vendor lock-in.

---

## 13. Payment Gateways

### Stripe (`lib/stripe.ts`)

- Creates a `PaymentIntent` or `Checkout Session` on payment initiation
- Webhook at `POST /api/webhooks/stripe` handles `payment_intent.succeeded`
- On success: creates `Payment` record, decrements `invoice.amountDue`, marks invoice `paid`
- Required env vars: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

### Razorpay (`lib/razorpay.ts`)

- Creates a Razorpay Order on payment initiation
- Verifies HMAC signature of the callback before recording payment
- Required env vars: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

**Why dual gateways?**  
Stripe is the global standard; Razorpay is the preferred gateway for Indian customers. The Indian locale is the default for this deployment.

---

## 14. PDF Generation

**Package:** `@react-pdf/renderer`  
**Template:** `components/InvoicePDF.tsx`

The `InvoicePDF` component receives a typed invoice object and renders a styled PDF including:
- Company header and invoice number
- Customer billing address
- Line-item table with quantity, unit price, tax, subtotal
- Totals section: subtotal, tax, discount, total, amount due
- Payment instructions and due date

Used for:
- "Download PDF" button in portal invoice list
- Email attachment when admin sends invoice

---

## 15. Environment Variables

Copy `.env.example` to `.env` and fill in values. **Never commit `.env`.**

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/subscription_db"

# Auth — generate with: openssl rand -base64 32
AUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Razorpay
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@yourapp.com"
```

---

## 16. Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 14+ (or use the bundled `dev.db` SQLite for local dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/subscription-management-system.git
cd subscription-management-system

# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
pnpm db:push

# Seed development data
pnpm db:seed

# Create the first admin user
pnpm db:create-admin

# Start the development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

Default admin after `db:create-admin`: check your terminal output for the credentials.

---

## 17. Database Commands

| Command | What It Does |
|---------|-------------|
| `pnpm db:push` | Applies current Prisma schema to DB (no migration file created) |
| `pnpm db:generate` | Regenerates Prisma Client types from schema |
| `pnpm db:seed` | Runs `prisma/seed.ts` to populate dev data |
| `pnpm db:studio` | Opens Prisma Studio visual DB browser at `localhost:5555` |
| `pnpm db:create-admin` | Bootstraps the first admin user |
| `pnpm db:clear-sessions` | Clears all `Session` records (logout all users) |
| `pnpm typecheck` | Runs `tsc --noEmit` to type-check without building |
| `pnpm lint` | Runs ESLint across all TypeScript files |
| `pnpm format` | Runs Prettier on all `.ts`/`.tsx` files |

---

## 18. Implementation Progress

> Overall: ~30% complete. Database schema is production-ready. Auth, marketplace UI, and admin dashboard are functional. B2B operational modules (subscriptions, invoices, payments) are the major remaining work.

| Module | Progress | Status |
|--------|----------|--------|
| Database Schema (18 models) | 100% | ✅ Complete |
| Authentication (JWT, Google OAuth) | 90% | ✅ Functional |
| Edge Middleware (RBAC) | 100% | ✅ Complete |
| Landing Page | 100% | ✅ Complete |
| Shop / Service Browser | 70% | 🟡 Needs DB wiring |
| Bundle Browser + Builder | 80% | 🟡 Functional |
| Cart (Zustand) | 80% | 🟡 Needs checkout wiring |
| Checkout Flow | 50% | 🟡 Payment gateway unwired |
| Admin Dashboard (KPIs + Charts) | 60% | 🟡 Some data mocked |
| Admin — Services CRUD | 90% | ✅ Functional |
| Admin — Bundles CRUD | 90% | ✅ Functional |
| Admin — Products CRUD | 0% | ❌ Not started |
| Admin — Recurring Plans | 0% | ❌ Not started |
| Admin — Subscriptions | 0% | ❌ Core module missing |
| Admin — Quotation Templates | 0% | ❌ Not started |
| Admin — Invoices | 30% | 🟡 Portal view only |
| Admin — Payments | 5% | 🟡 Libs exist; unwired |
| Admin — Discounts | 40% | 🟡 Actions done; UI missing |
| Admin — Taxes | 0% | ❌ Not started |
| Admin — Users & Contacts | 0% | ❌ Not started |
| Admin — Reports | 10% | 🟡 Dashboard KPIs only |
| Internal Portal | 50% | 🟡 Shell + nav done |
| Portal — Subscriptions | 30% | 🟡 UI shell exists |
| Portal — Invoices | 40% | 🟡 View exists; PDF missing |
| Stripe Integration | 10% | 🟡 Lib exists; unwired |
| Razorpay Integration | 10% | 🟡 Lib exists; unwired |
| Email (Nodemailer) | 40% | 🟡 Lib exists; not all flows wired |
| Invoice PDF Generation | 50% | 🟡 Template done; download not wired |
| Activity Logging | 20% | 🟡 Model exists; writes missing |

### Build Priority Order

The modules have dependency relationships. Implement in this order:

```
1. Products & Plans       ← foundation for subscriptions
2. Subscriptions          ← core billing entity
3. Invoices (auto-gen)    ← triggered by subscription activation
4. Payments               ← settles invoices
5. Taxes                  ← needed for correct invoice totals
6. Discounts (UI)         ← checkout promotion flow
7. Users & Contacts       ← internal team provisioning
8. Reports                ← needs all of the above for real data
9. Quotation Templates    ← accelerates subscription workflow
10. Product Variants      ← attribute-based pricing refinement
```

---

## License

Private. All rights reserved.
