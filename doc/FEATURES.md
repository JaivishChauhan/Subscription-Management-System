# Subscription Management System — Feature Specification & Implementation Tracker

> **Stack:** Next.js 15 · Prisma ORM · NextAuth v5 · PostgreSQL (dev: SQLite) · Stripe  
> **Spec Source:** `doc/SMS.txt`  
> **Last Audited:** 2026-04-04  
> **Overall Progress:** ~25% Complete

---

## Table of Contents

1. [Authentication Module](#1-authentication-module)
2. [Dashboard & Navigation](#2-dashboard--navigation)
3. [Product Management](#3-product-management)
4. [Recurring Plan Management](#4-recurring-plan-management)
5. [Product Variants](#5-product-variants)
6. [Subscription Management](#6-subscription-management)
7. [Quotation Templates](#7-quotation-templates)
8. [Invoice Management](#8-invoice-management)
9. [Payment Management](#9-payment-management)
10. [Discount Management](#10-discount-management)
11. [Tax Management](#11-tax-management)
12. [Users & Contacts](#12-users--contacts)
13. [Reporting Module](#13-reporting-module)
14. [Portal Pages (Customer-Facing)](#14-portal-pages-customer-facing)
15. [Database & Infrastructure](#15-database--infrastructure)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented |
| 🟡 | Partially implemented |
| ❌ | Not implemented |
| 🔒 | Admin-only feature |
| 👤 | Portal user feature |
| 🔄 | Shared across roles |

---

## 1. Authentication Module

**Module Path:** `app/(auth)/`  
**API Routes:** `app/api/auth/`  
**Validation:** `lib/validations/auth.ts`  
**Service:** `lib/auth.ts`, `lib/email.ts`

### Feature Spec

The authentication module handles user identity across three roles: **Admin**, **Internal User**, and **Portal/Customer**. All sessions are JWT-based via NextAuth v5.

#### 1.1 Login
- Email + password credential authentication
- Remember me / session persistence
- Redirect to role-appropriate dashboard post-login (Admin → `/admin`, Portal → `/`)

#### 1.2 Signup
- New portal user self-registration
- Unique email enforcement
- Strong password enforcement:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one special character
- Auto-create linked `Contact` profile on registration

#### 1.3 Reset Password
- User initiates reset via email
- System sends a one-time reset link to registered email
- Link expires after a configurable time window
- On click: user sets a new password

#### 1.4 Role-Based Access
- **Admin**: Full system control, created only by another Admin
- **Internal User**: Limited operational access, created only by Admin
- **Portal User**: Customer/subscriber — self-registers

---

### ✅ Task Verification — Authentication

- [x] **1.1 Login page** — `app/(auth)/login/page.tsx` exists with credential form
- [x] **1.2 Signup page** — `app/(auth)/signup/page.tsx` exists with registration form
- [x] **1.3 Reset Password page** — `app/(auth)/reset-password/page.tsx` exists
- [x] **1.4 NextAuth v5 handler** — `app/api/auth/[...nextauth]/` exists
- [x] **1.5 Register API route** — `app/api/auth/register/` exists
- [x] **1.6 Zod validation schema** — `lib/validations/auth.ts` exists with password rules
- [x] **1.7 Auth config** — `lib/auth.ts` bootstrapped with Prisma adapter
- [🟡] **1.8 Email reset link delivery** — `lib/email.ts` exists but end-to-end flow needs verification
  - [ ] Verify reset token is stored in `VerificationToken` model
  - [ ] Verify email is sent via configured SMTP/Resend on password reset request
  - [ ] Verify link expiry is enforced
- [❌] **1.9 Admin creates Internal User** — No UI or API route exists
  - [ ] Add `/admin/users/invite` page with role selector
  - [ ] Add `POST /api/admin/users` route with Admin-only guard
  - [ ] Enforce: only role=`admin` can set role=`internal`
- [❌] **1.10 Auto-create Contact on Signup** — Register route must INSERT Contact after User
  - [ ] Verify `app/api/auth/register` creates linked `Contact` record
  - [ ] Add fallback creation if Contact is missing for existing users
- [ ] **1.11 Auth guard middleware** — Verify `middleware.ts` protects `/admin/**` routes
- [ ] **1.12 Role-based post-login redirect** — Verify Admin is sent to `/admin`, Portal to `/`

---

## 2. Dashboard & Navigation

**Module Path:** `app/admin/`  
**Component:** `app/admin/_components/DashboardClient.tsx`  
**Layout:** `app/admin/layout.tsx`

### Feature Spec

The Admin dashboard is the command center. It provides real-time operational intelligence via KPI cards, charts, churn indicators, and an activity timeline. Navigation exposes all admin sub-modules via a sidebar.

#### KPI Cards
- **Active Subscriptions** — Count of `status = 'active'` subscriptions
- **Revenue MTD** — Sum of `total` from paid invoices in the current month
- **Outstanding** — Sum of `amountDue` from confirmed (unpaid) invoices
- **Overdue** — Count of confirmed invoices where `dueDate < now()`

#### Charts
- **Revenue Overview** — Actual vs Forecast area chart (monthly)
- **Plan Distribution** — Donut chart breakdown by plan tier

#### Supporting Panels
- **Churn Risk Monitor** — Customers flagged as churn risk with reason
- **Recent Activity Timeline** — Last N system events (new subscriptions, failures, updates)

#### Navigation Sidebar
Links to: Products, Recurring Plans, Subscriptions, Templates, Invoices, Payments, Discounts, Taxes, Users, Reports.

---

### ✅ Task Verification — Dashboard

- [x] **2.1 Dashboard page** — `app/admin/page.tsx` with auth guard (admin-only)
- [x] **2.2 Active Subscriptions KPI** — Prisma query `subscription.count({ status: 'active' })` ✅
- [x] **2.3 Revenue MTD KPI** — Prisma `invoice.aggregate({ _sum: total, status: 'paid' })` ✅
- [x] **2.4 Outstanding KPI** — Prisma `invoice.aggregate({ _sum: amountDue })` ✅
- [x] **2.5 Overdue KPI** — Prisma `invoice.count({ dueDate: { lt: now } })` ✅
- [x] **2.6 Revenue chart UI** — AreaChart with Recharts, animated ✅
- [x] **2.7 Plan Distribution UI** — Donut-style breakdown ✅
- [x] **2.8 Churn Risk Monitor UI** — Card list ✅
- [x] **2.9 Activity Timeline UI** — Timeline component ✅
- [🟡] **2.10 Revenue chart data** — Currently hardcoded mock; needs real monthly aggregation
  - [ ] Build `/api/admin/reports/revenue` that groups paid invoices by month
  - [ ] Replace mock `revenueData` in `admin/page.tsx` with this API
- [🟡] **2.11 Churn data** — Hardcoded mock; needs real query logic
  - [ ] Define churn heuristic (e.g. no activity in 30d, payment failed)
  - [ ] Build query and wire to dashboard
- [🟡] **2.12 Activity timeline** — Hardcoded; needs an activity log table or event stream
  - [ ] Create `ActivityLog` model in Prisma schema
  - [ ] Write to log on key events (subscription created, payment failed, etc.)
  - [ ] Query last 10 events for timeline
- [❌] **2.13 Sidebar navigation** — Admin layout sidebar missing sub-module links
  - [ ] Add nav links to all admin sub-modules in `app/admin/layout.tsx`
  - [ ] Active link highlighting
  - [ ] Mobile-responsive collapse

---

## 3. Product Management

**Module Path:** `app/admin/products/` *(not yet created)*  
**API Route:** `app/api/products/` *(not yet created)*  
**DB Model:** `Product` in `prisma/schema.prisma`

### Feature Spec

Admins manage the product catalog. Products are the foundation of subscriptions and invoices.

#### Product Fields
| Field | Type | Required |
|-------|------|----------|
| Product Name | String | ✅ |
| Product Type | Enum: `service` / `goods` | ✅ |
| Sales Price | Float | ✅ |
| Cost Price | Float | ✅ |
| Description | Text | Optional |
| Notes | Text | Optional |
| Image | URL | Optional |

#### Business Rules
- Admins can Create, Read, Update, Delete products
- Products can have recurring price overrides per plan (via `RecurringPrice`)
- Each product can have multiple variants (handled in Module 5)
- Soft-delete via `isActive = false` (no hard deletes)

---

### ✅ Task Verification — Product Management

- [❌] **3.1 Product list page** `/admin/products`
  - [ ] Paginated data table with columns: Name, Type, Sales Price, Status
  - [ ] Search by name filter
  - [ ] Status filter (Active / Inactive)
  - [ ] "New Product" button → navigates to create form
- [❌] **3.2 Create product page** `/admin/products/new`
  - [ ] Form with all Product fields (Zod validated)
  - [ ] Image upload input (via `public/` or cloud)
  - [ ] Toast on success/failure
  - [ ] Redirect to list or detail on success
- [❌] **3.3 Edit / View product page** `/admin/products/[id]`
  - [ ] Pre-filled form from DB
  - [ ] Save / Discard changes
  - [ ] Deactivate (soft-delete) button
  - [ ] Danger zone: hard delete with confirmation dialog
- [❌] **3.4 API: GET /api/products** — list with pagination + filters
- [❌] **3.5 API: POST /api/products** — create, Admin only
- [❌] **3.6 API: PATCH /api/products/[id]** — update fields
- [❌] **3.7 API: DELETE /api/products/[id]** — soft-delete (`isActive = false`)

---

## 4. Recurring Plan Management

**Module Path:** `app/admin/plans/` *(not yet created)*  
**API Route:** `app/api/plans/` *(not yet created)*  
**DB Model:** `RecurringPlan`, `RecurringPrice`

### Feature Spec

Plans define the billing rules attached to subscriptions. A product can be linked to multiple plans with different price points.

#### Plan Fields
| Field | Type | Required |
|-------|------|----------|
| Plan Name | String | ✅ |
| Price | Float | ✅ |
| Billing Period | Enum: `daily/weekly/monthly/yearly` | ✅ |
| Minimum Quantity | Int | ✅ |
| Start Date | Date | Optional |
| End Date | Date | Optional |

#### Plan Options (Boolean flags)
| Option | Default | Description |
|--------|---------|-------------|
| Auto-close | `false` | Subscription auto-closes at `endDate` |
| Closable | `true` | Users can manually close |
| Pausable | `false` | Subscription can be paused |
| Renewable | `true` | Automatically renews |

---

### ✅ Task Verification — Recurring Plan Management

- [❌] **4.1 Plans list page** `/admin/plans`
  - [ ] Table: Name, Period, Price, Active
  - [ ] Inline toggle for `isActive`
- [❌] **4.2 Create plan page** `/admin/plans/new`
  - [ ] All fields with billing period dropdown
  - [ ] Boolean toggles for plan options
  - [ ] Date pickers for Start/End
- [❌] **4.3 Edit plan page** `/admin/plans/[id]`
  - [ ] Pre-populated form
  - [ ] Warn if plan has active subscriptions (breaking change)
- [❌] **4.4 API: GET /api/plans** — list all plans
- [❌] **4.5 API: POST /api/plans** — create plan
- [❌] **4.6 API: PATCH /api/plans/[id]** — update plan
- [❌] **4.7 API: DELETE /api/plans/[id]** — deactivate plan

---

## 5. Product Variants

**Module Path:** Sub-section of `/admin/products/[id]`  
**DB Model:** `ProductVariant`, `Attribute`, `AttributeValue`

### Feature Spec

Variants add attribute-based pricing on top of a base product.

#### Variant Fields
| Field | Example |
|-------|---------|
| Attribute | `Brand` |
| Value | `Odoo` |
| Extra Price | `₹560` |

#### Example
Product: `Enterprise License` + Attribute: `Brand` → Value: `Odoo` → Extra: `+₹560`

---

### ✅ Task Verification — Product Variants

- [❌] **5.1 Variant section in product detail page**
  - [ ] Inline table of existing variants
  - [ ] "Add Variant" mini-form: Attribute, Value, Extra Price
  - [ ] Delete variant button
- [❌] **5.2 Attribute management** `/admin/attributes`
  - [ ] Global list of defined attributes (e.g. Brand, Region, Tier)
  - [ ] Add / Remove attribute values
- [❌] **5.3 API: POST /api/products/[id]/variants** — add variant
- [❌] **5.4 API: DELETE /api/products/[id]/variants/[variantId]** — remove variant

---

## 6. Subscription Management

**Module Path:** `app/admin/subscriptions/` *(not yet created)*  
**API Route:** `app/api/subscriptions/` *(not yet created)*  
**DB Model:** `Subscription`, `SubscriptionLine`

### Feature Spec

The core module. Manages the full subscription lifecycle from creation to closure.

#### Subscription Fields
| Field | Notes |
|-------|-------|
| Subscription Number | Auto-generated, unique |
| Customer | Linked Contact |
| Plan | Linked RecurringPlan |
| Start Date | When billing begins |
| Expiration Date | When subscription ends |
| Payment Terms | Linked PaymentTerms |
| Notes | Free text |

#### Order Lines (per subscription)
| Field | Notes |
|-------|-------|
| Product | Linked Product |
| Quantity | Integer |
| Unit Price | Float |
| Taxes | Linked Tax records |
| Amount (subtotal) | Qty × Price + Tax |

#### Lifecycle / Status Flow
```
Draft → Quotation → Confirmed → Active → Closed
```
- Status transitions must be sequential — no skipping
- On move to `Active`: trigger invoice generation
- On move to `Closed`: stop recurring invoice generation

---

### ✅ Task Verification — Subscription Management

- [❌] **6.1 Subscriptions list page** `/admin/subscriptions`
  - [ ] Table: Sub# , Customer, Plan, Status, Start Date
  - [ ] Status filter tabs (Draft / Quotation / Confirmed / Active / Closed)
  - [ ] Search by customer name or sub number
  - [ ] "New Subscription" button
- [❌] **6.2 Create subscription page** `/admin/subscriptions/new`
  - [ ] Customer selector (search from Contacts)
  - [ ] Plan dropdown
  - [ ] Start/Expiration date pickers
  - [ ] Payment Terms selector
  - [ ] Dynamic order lines table (add/remove product rows)
  - [ ] Per-line tax assignment
  - [ ] Subtotal/Tax/Total summary
  - [ ] Save as Draft
  - [ ] Optional: apply Quotation Template to pre-fill
- [❌] **6.3 Subscription detail page** `/admin/subscriptions/[id]`
  - [ ] Read-only view with all fields and order lines
  - [ ] Status badge
  - [ ] Action buttons per status:
    - Draft → `Confirm as Quotation`
    - Quotation → `Confirm Order`
    - Confirmed → `Activate`
    - Active → `Close`
  - [ ] Invoice history tab
  - [ ] Payment history tab
- [❌] **6.4 API: GET /api/subscriptions** — list with filters
- [❌] **6.5 API: POST /api/subscriptions** — create subscription
- [❌] **6.6 API: PATCH /api/subscriptions/[id]/status** — transition status
- [❌] **6.7 API: PATCH /api/subscriptions/[id]** — update fields (Draft/Quotation only)
- [❌] **6.8 Auto-invoice trigger** — When status → `active`, generate first invoice
- [❌] **6.9 Subscription number generation** — `SUB-YYYYMMDD-XXXX` format

---

## 7. Quotation Templates

**Module Path:** `app/admin/templates/` *(not yet created)*  
**API Route:** `app/api/templates/` *(not yet created)*  
**DB Model:** `QuotationTemplate`, `QuotationTemplateLine`

### Feature Spec

Templates accelerate subscription creation by pre-configuring common setups.

#### Template Fields
| Field | Notes |
|-------|-------|
| Template Name | Descriptive identifier |
| Validity Days | How long a quotation based on this template is valid |
| Recurring Plan | Default plan to apply |
| Product Lines | Pre-configured order line items |

---

### ✅ Task Verification — Quotation Templates

- [❌] **7.1 Templates list page** `/admin/templates`
  - [ ] Table: Name, Plan, Validity (days), Line count
- [❌] **7.2 Create / Edit template** `/admin/templates/new` and `/admin/templates/[id]`
  - [ ] Template name + validity input
  - [ ] Plan selector
  - [ ] Product lines editor (same pattern as subscription lines)
- [❌] **7.3 Apply template to new subscription**
  - [ ] "Use Template" button on `/admin/subscriptions/new`
  - [ ] Selecting a template pre-fills Plan + Product Lines
- [❌] **7.4 API: GET /api/templates** — list templates
- [❌] **7.5 API: POST /api/templates** — create template
- [❌] **7.6 API: PATCH /api/templates/[id]** — update template
- [❌] **7.7 API: DELETE /api/templates/[id]** — delete template

---

## 8. Invoice Management

**Module Path:** `app/admin/invoices/` *(not yet created)*, `app/invoices/` (portal) *(partial)*  
**API Route:** `app/api/invoices/` *(not yet created)*  
**DB Model:** `Invoice`, `InvoiceLine`

### Feature Spec

Invoices are auto-generated from subscriptions when they are activated. They follow their own status lifecycle.

#### Invoice Fields
| Field | Notes |
|-------|-------|
| Invoice Number | Auto-generated, unique |
| Customer | Linked Contact |
| Product Lines | Per-line: product, qty, unit price, taxes, subtotal |
| Taxes | Auto-applied based on Tax rules |
| Subtotal | Sum of line subtotals |
| Tax Total | Sum of applied taxes |
| Discount Total | Applied discount amount |
| Total | Net payable amount |
| Amount Due | Remaining unpaid balance |
| Due Date | Based on PaymentTerms |

#### Actions
- **Confirm** — Move from Draft → Confirmed
- **Cancel** — Void a Draft or Confirmed invoice
- **Send** — Email invoice PDF to customer
- **Print** — Generate downloadable PDF

#### Invoice Status Flow
```
Draft → Confirmed → Paid
               ↓
           Cancelled
```

---

### ✅ Task Verification — Invoice Management

- [🟡] **8.1 Portal invoice list** `/invoices` — `InvoicesClient.tsx` exists (view-only)
  - [ ] Verify it queries real invoices from DB for the logged-in user
  - [ ] Add "Download PDF" button per invoice
  - [ ] Show payment status badge
- [❌] **8.2 Admin invoice list** `/admin/invoices`
  - [ ] Table: Invoice#, Customer, Total, Status, Due Date
  - [ ] Filter by status (Draft / Confirmed / Paid / Cancelled)
  - [ ] Date range filter
  - [ ] Overdue flag highlight
- [❌] **8.3 Invoice detail page** `/admin/invoices/[id]`
  - [ ] Full invoice view with all line items
  - [ ] Action buttons: Confirm, Cancel, Send, Print
  - [ ] Payment records section
- [❌] **8.4 Auto-generate invoice from subscription**
  - [ ] Service function `generateInvoiceFromSubscription(subscriptionId)`
  - [ ] Called when Subscription status → `active`
  - [ ] Applies taxes from linked Tax records per line
  - [ ] Sets `dueDate` based on PaymentTerms
- [❌] **8.5 Email invoice** — Wire `lib/email.ts` to send invoice on "Send" action
- [❌] **8.6 API: GET /api/invoices** — list (Admin: all, Portal: own)
- [❌] **8.7 API: GET /api/invoices/[id]** — fetch single invoice
- [❌] **8.8 API: PATCH /api/invoices/[id]/status** — Confirm / Cancel
- [❌] **8.9 Invoice PDF generation** — Use `@react-pdf/renderer` or `puppeteer`
- [❌] **8.10 Invoice number generation** — `INV-YYYYMMDD-XXXX` format

---

## 9. Payment Management

**Module Path:** `app/admin/payments/` *(not yet created)*  
**API Route:** `app/api/payments/` *(not yet created)*  
**DB Model:** `Payment`  
**Service:** `lib/stripe.ts`

### Feature Spec

Payments record the settlement of invoices. Only Admins can create payment records manually. Stripe handles automated card payments.

#### Payment Fields
| Field | Type | Notes |
|-------|------|-------|
| Invoice | FK | The invoice being paid |
| Payment Method | Enum | `credit_card / paypal / bank_transfer / cash / stripe` |
| Amount | Float | Partial payments allowed |
| Payment Date | DateTime | Defaults to now |
| Notes | Text | Optional reference |

#### Business Rules
- Payment records are **Admin-only**
- A payment updates `Invoice.amountDue` = `Invoice.total - sum(payments)`
- When `amountDue <= 0`, Invoice status → `paid`
- Track both paid and outstanding invoices

---

### ✅ Task Verification — Payment Management

- [❌] **9.1 Admin payment list** `/admin/payments`
  - [ ] Table: Invoice#, Customer, Method, Amount, Date
  - [ ] Filter by method and date range
- [❌] **9.2 Record payment** — From invoice detail page
  - [ ] "Record Payment" button on Invoice detail
  - [ ] Modal: payment method, amount, date, notes
  - [ ] Validates amount ≤ amountDue
  - [ ] On save: updates `Invoice.amountDue`, marks as `paid` if settled
- [❌] **9.3 Stripe integration**
  - [ ] Checkout session creation from `/checkout`
  - [ ] `POST /api/webhooks/stripe` — handle `payment_intent.succeeded`
  - [ ] On webhook: create Payment record, update Invoice status → `paid`
  - [ ] Verify `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env`
- [❌] **9.4 API: GET /api/payments** — list (Admin only)
- [❌] **9.5 API: POST /api/payments** — create payment record (Admin only)
- [❌] **9.6 API: POST /api/webhooks/stripe** — Stripe event handler (no JWT guard)

---

## 10. Discount Management

**Module Path:** `app/admin/discounts/` *(not yet created)*  
**API Route:** `app/api/discounts/` *(not yet created)*  
**DB Model:** `Discount`, `DiscountProduct`

### Feature Spec

Admin-only discount rules that can be applied to products or subscriptions. Supports fixed and percentage types with date and quantity constraints.

#### Discount Fields
| Field | Type | Notes |
|-------|------|-------|
| Discount Name | String | Descriptive label |
| Code | String (unique) | Promo code |
| Type | Enum: `fixed / percentage` | |
| Value | Float | Amount or % |
| Minimum Purchase | Float | Optional |
| Minimum Quantity | Int | Optional |
| Start Date | DateTime | Active from |
| End Date | DateTime | Active until |
| Usage Limit | Int | Optional cap |

#### Applies To
- Specific Products (via `DiscountProduct` join table)
- All Subscriptions (if no products specified)

---

### ✅ Task Verification — Discount Management

- [❌] **10.1 Discounts list page** `/admin/discounts`
  - [ ] Table: Name, Code, Type, Value, Active Period, Usage
  - [ ] Active / Expired badge
- [❌] **10.2 Create discount page** `/admin/discounts/new`
  - [ ] All fields with type toggle (Fixed / Percentage)
  - [ ] Product multi-select for "Applies To"
  - [ ] Date range pickers
- [❌] **10.3 Edit discount** `/admin/discounts/[id]`
  - [ ] Pre-filled form
  - [ ] Show `usageCount` vs `usageLimit`
- [❌] **10.4 Apply discount at checkout**
  - [ ] Promo code input in checkout form
  - [ ] `POST /api/discounts/validate` — returns discount or error
  - [ ] Apply discount to invoice total
  - [ ] Increment `usageCount` on successful use
- [❌] **10.5 API: GET /api/discounts** — list (Admin: all; Portal: validate by code)
- [❌] **10.6 API: POST /api/discounts** — create (Admin only)
- [❌] **10.7 API: PATCH /api/discounts/[id]** — update
- [❌] **10.8 API: POST /api/discounts/validate** — validate code + return value

---

## 11. Tax Management

**Module Path:** `app/admin/taxes/` *(not yet created)*  
**API Route:** `app/api/taxes/` *(not yet created)*  
**DB Model:** `Tax`

### Feature Spec

Admins configure tax rules (GST, VAT, etc.). Taxes are auto-applied per invoice line during invoice generation.

#### Tax Fields
| Field | Type | Notes |
|-------|------|-------|
| Name | String | e.g. `GST 18%`, `VAT 20%` |
| Type | Enum: `percentage / fixed` | |
| Rate | Float | `18.0` for 18%, or fixed ₹ amount |
| Description | Text | Optional |
| Is Active | Boolean | Toggle on/off |

---

### ✅ Task Verification — Tax Management

- [❌] **11.1 Taxes list page** `/admin/taxes`
  - [ ] Table: Name, Type, Rate, Status
  - [ ] Active/Inactive toggle inline
- [❌] **11.2 Create / Edit tax** Modal or dedicated page
  - [ ] Name, Type (percentage/fixed), Rate input
  - [ ] Active toggle
- [❌] **11.3 Auto-apply tax in invoice generation**
  - [ ] `generateInvoiceFromSubscription` must read active Tax records and apply per line
  - [ ] Store `taxAmount` per line in `InvoiceLine`
  - [ ] Accumulate `Invoice.taxTotal`
- [❌] **11.4 API: GET /api/taxes** — list active taxes
- [❌] **11.5 API: POST /api/taxes** — create (Admin only)
- [❌] **11.6 API: PATCH /api/taxes/[id]** — update / toggle active

---

## 12. Users & Contacts

**Module Path:** `app/admin/users/`, `app/admin/contacts/` *(not yet created)*  
**API Route:** `app/api/admin/users/` *(not yet created)*  
**DB Model:** `User`, `Contact`

### Feature Spec

Admins manage internal users and can view/edit all customer contact profiles.

#### Admin Rules
- Only Admins can create Internal Users
- Admin cannot downgrade another Admin
- All portal users have a corresponding `Contact` profile

---

### ✅ Task Verification — Users & Contacts

- [❌] **12.1 Users list page** `/admin/users`
  - [ ] Table: Name, Email, Role, Created At
  - [ ] Role filter (Admin / Internal / Portal)
  - [ ] "Invite Internal User" button
- [❌] **12.2 Invite / Create Internal User**
  - [ ] Form: Name, Email, Role (internal only — admins created differently)
  - [ ] Sends invite email with temporary password
- [❌] **12.3 Edit user role** (Admin only)
  - [ ] Dropdown to change role, with confirmation
  - [ ] Cannot change own role
- [❌] **12.4 Contacts list page** `/admin/contacts`
  - [ ] Table: Name, Company, Email, Subscriptions count
  - [ ] Click → view contact with linked subscriptions + invoices
- [❌] **12.5 Contact detail** `/admin/contacts/[id]`
  - [ ] All address/billing fields
  - [ ] Linked subscriptions list
  - [ ] Linked invoices list
- [❌] **12.6 API: GET /api/admin/users** — list users (Admin only)
- [❌] **12.7 API: POST /api/admin/users** — create internal user (Admin only)
- [❌] **12.8 API: PATCH /api/admin/users/[id]** — update role
- [❌] **12.9 API: GET /api/admin/contacts** — list contacts

---

## 13. Reporting Module

**Module Path:** `app/admin/reports/` *(not yet created)*  
**API Route:** `app/api/admin/reports/` *(not yet created)*

### Feature Spec

Provides analytics and summary views for operational oversight.

#### Required Reports
| Report | Metric |
|--------|--------|
| Active Subscriptions | Count by status, trend over time |
| Revenue | MTD, YTD, by plan, by customer |
| Payments | Collected, pending, overdue |
| Overdue Invoices | List + aging (30/60/90 days) |

#### Features
- Date range filtering
- Export to CSV / PDF
- Summary cards + charts

---

### ✅ Task Verification — Reporting

- [❌] **13.1 Reports page** `/admin/reports`
  - [ ] Date range picker (preset: Last 7d, 30d, 90d, custom)
  - [ ] Active Subscriptions chart (line over time)
  - [ ] Revenue breakdown bar chart by month
  - [ ] Payments collected vs overdue
  - [ ] Overdue aging table (30/60/90d buckets)
- [❌] **13.2 Real dashboard data**
  - [ ] Replace all mock data in `app/admin/page.tsx` with real Prisma queries
  - [ ] Monthly revenue aggregation query
  - [ ] Real churn candidates query (no login in 30d, failed payment)
- [❌] **13.3 API: GET /api/admin/reports/revenue** — monthly revenue aggregation
- [❌] **13.4 API: GET /api/admin/reports/subscriptions** — status breakdown
- [❌] **13.5 API: GET /api/admin/reports/payments** — payment summary
- [❌] **13.6 Export functionality** — CSV download from report tables

---

## 14. Portal Pages (Customer-Facing)

**Role:** Portal User (`role = 'portal'`)

### Feature Spec

The customer-facing side where subscribers browse plans, manage their subscriptions, and view invoices.

---

### ✅ Task Verification — Portal Pages

- [x] **14.1 Landing page** `/` — Exists, rich UI with marketing sections
- [🟡] **14.2 Pricing page** `/pricing`
  - [x] `ShopClient.tsx` UI shell exists (in `/pricing/_components/`)
  - [ ] Fetch RecurringPlans from DB and render dynamically
  - [ ] "Subscribe" CTA → navigate to checkout or login
- [🟡] **14.3 Shop / Plans page** `/shop`
  - [x] `ShopClient.tsx` (15k) exists — substantial UI
  - [ ] Wire to real product/plan data from DB
  - [ ] Add to cart functionality
- [🟡] **14.4 Cart page** `/cart`
  - [x] `CartClient.tsx` (10k) exists
  - [x] Zustand cart store (`store/cart.ts`) exists
  - [ ] Verify CartClient reads from Zustand store correctly
  - [ ] "Proceed to Checkout" flow verified
- [🟡] **14.5 Checkout page** `/checkout`
  - [x] `CheckoutClient.tsx` (23k) exists — substantial form
  - [ ] Wire Stripe payment intent creation
  - [ ] On success: create Subscription + Invoice in DB
  - [ ] Send confirmation email via `lib/email.ts`
- [🟡] **14.6 Invoices page** `/invoices`
  - [x] `InvoicesClient.tsx` exists
  - [ ] Verify real DB query for logged-in user's invoices
  - [ ] Add download PDF action
  - [ ] Show payment status + amount due

---

## 15. Database & Infrastructure

**Files:** `prisma/schema.prisma`, `lib/db.ts`, `prisma/seed.ts`

---

### ✅ Task Verification — Database & Infrastructure

- [x] **15.1 Prisma schema complete** — All 13 models defined ✅
- [x] **15.2 All relations defined** — FKs, cascades, unique constraints ✅
- [x] **15.3 DB indexes** — Critical fields indexed (`status`, `email`, `contactId`) ✅
- [x] **15.4 Prisma client singleton** — `lib/db.ts` exports singleton `prisma` ✅
- [x] **15.5 Seed file** — `prisma/seed.ts` exists for dev data
- [🟡] **15.6 Migration applied** — `dev.db` exists (SQLite dev)
  - [ ] Verify Prisma migrations are up-to-date (`prisma migrate status`)
  - [ ] Confirm PostgreSQL migration works for production
- [❌] **15.7 ActivityLog model** — Not yet in schema (needed for dashboard timeline)
- [❌] **15.8 Stripe webhook handling** — No webhook route or handler

---

## Progress Summary

```
Module                    | Done | Notes
--------------------------|------|-------------------------------------------
Database Schema           | 100% | All models complete
Authentication            |  85% | Email reset flow needs verification
Admin Dashboard           |  40% | UI done; most data is mock
Product Management        |   0% | No pages or API routes
Recurring Plans           |   0% | No pages or API routes
Product Variants          |   0% | No pages or API routes
Subscriptions             |   0% | Core module — fully missing
Quotation Templates       |   0% | No pages or API routes
Invoice Management        |  30% | Portal view only; no admin, no auto-gen
Payment Management        |   5% | lib/stripe.ts exists but unwired
Discount Management       |   0% | No pages or API routes
Tax Management            |   0% | No pages or API routes
Users & Contacts          |   0% | No admin pages
Reporting                 |   5% | Dashboard KPIs only; no report page
Portal Pages (UI)         |  50% | Shells exist; DB wiring incomplete
--------------------------|------|-------------------------------------------
OVERALL                   | ~25% | Schema solid; business logic missing
```

---

## Build Priority Order

> Build modules in dependency order — each module unblocks the next.

```
Phase 1 — Foundation (CRUD)
  [1] Product Management  →  needed by all order lines
  [2] Recurring Plans     →  needed by subscriptions
  [3] Tax Management      →  needed by invoice generation

Phase 2 — Core Business Logic
  [4] Subscriptions       →  the primary module
  [5] Invoice auto-generation  →  from subscription activation
  [6] Payment Management + Stripe webhook

Phase 3 — Supporting Modules
  [7] Quotation Templates
  [8] Discount Management
  [9] Users & Contacts admin

Phase 4 — Portal & Reporting
  [10] Wire portal pages to real DB data
  [11] Reporting page with real aggregations
  [12] Real dashboard charts (replace mock data)
```
