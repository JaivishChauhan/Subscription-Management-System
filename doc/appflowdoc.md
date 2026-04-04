# Application Flow Document
## Subscription Management System

**Version:** 1.0  
**Last Updated:** April 2026  
**Interfaces:** Admin/Backend Panel · Customer Portal (Frontend)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles & Entry Points](#2-user-roles--entry-points)
3. [Authentication Flows](#3-authentication-flows)
   - 3.1 [Login](#31-login)
   - 3.2 [Signup](#32-signup)
   - 3.3 [Reset Password](#33-reset-password)
4. [Admin / Backend Panel](#4-admin--backend-panel)
   - 4.1 [Navigation Structure](#41-navigation-structure)
   - 4.2 [Dashboard Entry Point](#42-dashboard-entry-point)
5. [Subscriptions Module](#5-subscriptions-module)
   - 5.1 [Subscription List Page](#51-subscription-list-page)
   - 5.2 [Subscription Lifecycle & States](#52-subscription-lifecycle--states)
   - 5.3 [State: Quotation (Draft)](#53-state-quotation-draft)
   - 5.4 [State: Quotation Sent](#54-state-quotation-sent)
   - 5.5 [State: Confirmed](#55-state-confirmed)
6. [Invoice Flow](#6-invoice-flow)
   - 6.1 [Invoice — Draft](#61-invoice--draft)
   - 6.2 [Invoice — Confirmed](#62-invoice--confirmed)
   - 6.3 [Payment Popup](#63-payment-popup)
   - 6.4 [Invoice Cancellation](#64-invoice-cancellation)
7. [Products Module](#7-products-module)
   - 7.1 [Product List Page](#71-product-list-page)
   - 7.2 [Product Form View](#72-product-form-view)
8. [Configuration Module](#8-configuration-module)
   - 8.1 [Recurring Plan](#81-recurring-plan)
   - 8.2 [Quotation Template](#82-quotation-template)
   - 8.3 [Payment Term](#83-payment-term)
   - 8.4 [Discount](#84-discount)
   - 8.5 [Taxes](#85-taxes)
   - 8.6 [Attributes / Variants](#86-attributes--variants)
9. [Users & Contacts Module](#9-users--contacts-module)
10. [Reporting Module](#10-reporting-module)
11. [Customer Portal Flow](#11-customer-portal-flow)
    - 11.1 [Home Page](#111-home-page)
    - 11.2 [Shop Page](#112-shop-page)
    - 11.3 [Product Detail Page](#113-product-detail-page)
    - 11.4 [Cart Page](#114-cart-page)
    - 11.5 [Address Page](#115-address-page)
    - 11.6 [Payment Page](#116-payment-page)
    - 11.7 [Order Confirmation / Thank You Page](#117-order-confirmation--thank-you-page)
12. [My Profile — Portal Pages](#12-my-profile--portal-pages)
    - 12.1 [User Details Page](#121-user-details-page)
    - 12.2 [My Orders Page](#122-my-orders-page)
    - 12.3 [Order Detail Page](#123-order-detail-page)
    - 12.4 [Invoice Page (Portal)](#124-invoice-page-portal)
13. [General List Page Rules](#13-general-list-page-rules)
14. [Complete System Flow Diagram](#14-complete-system-flow-diagram)
15. [Key Business Rules](#15-key-business-rules)

---

## 1. System Overview

The Subscription Management System operates as **two separate interfaces** sharing a single backend:

| Interface | Audience | Purpose |
|-----------|----------|---------|
| **Admin / Backend Panel** | Admin, Internal Users | Manage subscriptions, products, invoices, users, and configuration |
| **Customer Portal** | Portal Users (subscribers) | Browse, purchase, and manage their subscriptions |

Both interfaces share the same authentication system. A user's role determines which interface they are directed to after login.

---

## 2. User Roles & Entry Points

```
                        ┌──────────────────┐
                        │   Login / Signup  │
                        └────────┬─────────┘
                                 │
              ┌──────────────────┼──────────────────────┐
              │                  │                       │
       ┌──────▼──────┐   ┌───────▼───────┐   ┌──────────▼──────────┐
       │    Admin     │   │ Internal User │   │    Portal / User     │
       └──────┬───────┘   └───────┬───────┘   └──────────┬──────────┘
              │                   │                        │
       ┌──────▼───────────────────▼──────┐    ┌───────────▼────────┐
       │      Admin / Backend Panel       │    │  Customer Portal    │
       └─────────────────────────────────┘    └────────────────────┘
```

| Role | How Created | Access |
|------|-------------|--------|
| **Admin** | Auto-created at system initialization (one default admin) | Full access to all modules + exclusive: create Internal Users, create Discounts, create Payment records |
| **Internal User** | Only created by Admin | Backend panel — limited operational access |
| **Portal User** | Auto-created on self-signup | Customer Portal only |

---

## 3. Authentication Flows

### 3.1 Login

**Route:** `/login`

```
┌────────────────────────────────────┐
│            Login Page              │
│                                    │
│  Email ID   [________________]     │
│  Password   [________________]     │
│                                    │
│  [        Sign In        ]         │
│                                    │
│  Forgot Password?   Sign Up →      │
└────────────────────────────────────┘
```

**Flow:**

```
User submits email + password
        │
        ├── Email not found ──────────────► Error: "Account does not exist"
        │
        ├── Password mismatch ───────────► Error: "Invalid password"
        │
        └── Success
                │
                ├── Admin / Internal User ─► Admin Backend Panel (Dashboard)
                │
                └── Portal User ──────────► Customer Portal (Home Page)
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| Email | Must exist in database |
| Password | Must match the stored credential for that email |

**Links on page:**
- `Forgot Password?` → navigates to Reset Password Page
- `Sign Up` → navigates to Signup Page (only Portal Users created here)

---

### 3.2 Signup

**Route:** `/signup`

```
┌────────────────────────────────────┐
│            Signup Page             │
│                                    │
│  Name           [______________]   │
│  Email ID       [______________]   │
│  Password       [______________]   │
│  Re-Enter Pwd   [______________]   │
│                                    │
│  [        Create Account      ]    │
│                                    │
│  ──── or ────                      │
│  [ Continue with Google ]          │
│                                    │
│  Already have an account? Sign In  │
└────────────────────────────────────┘
```

**Flow:**

```
User submits signup form
        │
        ├── Email already exists ──────► Error: "Email is already taken"
        ├── Password too weak ─────────► Error: show password rule violation
        ├── Passwords don't match ─────► Error: "Passwords do not match"
        │
        └── Validation passes
                │
                ├── Create Portal User record in DB
                ├── Auto-create linked Contact record
                └── Redirect → Customer Portal Home Page
```

**Password Validation Rules:**

| Rule | Requirement |
|------|-------------|
| Length | Greater than 8 characters |
| Uppercase | At least one uppercase letter |
| Lowercase | At least one lowercase letter |
| Special character | At least one special character |
| Uniqueness | Password must not match common/blacklisted passwords |

> **Note:** Signup via Google (OAuth) is also available as an option.

---

### 3.3 Reset Password

**Route:** `/reset-password`

```
┌────────────────────────────────────┐
│        Reset Password Page         │
│                                    │
│  Enter Email ID [______________]   │
│                                    │
│  [          Submit         ]       │
└────────────────────────────────────┘
```

**Flow:**

```
User enters email and submits
        │
        ├── Email not found ──────────► Error: "No account found with this email"
        │
        └── Email found
                │
                ├── System sends password reset link to the email
                └── Display message: "The password reset link has been sent to your email."
```

---

## 4. Admin / Backend Panel

### 4.1 Navigation Structure

The top navigation bar is persistent across all backend pages:

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Subscriptions | Products | Reporting | Users/Contacts |            │
│          Configuration ▾                              My Profile ▾ [Avatar] │
└────────────────────────────────────────────────────────────────────────────┘
```

**Configuration dropdown expands to:**

```
Configuration ▾
  ├── Variants (Attributes)
  ├── Recurring Plan
  ├── Quotation Template
  ├── Payment Term
  ├── Discount
  └── Taxes
```

> There is no dedicated Configuration landing page — selecting an option navigates directly to that model's list view.

---

### 4.2 Dashboard Entry Point

After login, Admin/Internal Users land on the **App Dashboard screen**.

```
[Dashboard]
      │
      └── Click Subscriptions area ──► Subscription List Page
```

---

## 5. Subscriptions Module

### 5.1 Subscription List Page

**Route:** `/admin/subscriptions`

**Columns displayed:**

| Number | Customer | Next Invoice | Recurring | Plan | Status |
|--------|----------|--------------|-----------|------|--------|
| S00001 | John Doe | 01 May 2026 | Monthly | Basic | Active |

**Status values:** `Inprogress` · `Churned` · `Quotation Sent` · `Confirmed` · `Closed`

**Page actions:**
- `New` button → opens blank Subscription Form
- Trash icon → delete record
- Archive icon → archive record
- Click any row → opens Subscription Form View for that record

---

### 5.2 Subscription Lifecycle & States

```
  ┌────────────┐    Send    ┌────────────────┐   Confirm   ┌───────────┐
  │  Quotation │──────────►│ Quotation Sent  │────────────►│ Confirmed │
  │  (Draft)   │           └────────────────┘             └─────┬─────┘
  └────────────┘                                                 │
        │                                                        │
        └── Confirm (direct) ───────────────────────────────────┘
                                                                 │
                                                    ┌────────────▼───────────┐
                                                    │  Actions available:     │
                                                    │  Create Invoice         │
                                                    │  Renew / Upsell / Close │
                                                    └────────────────────────┘
```

**Status bar shown in form view:**

```
[ Quotation ] ──► [ Quotation Sent ] ──► [ Confirmed ]
```

---

### 5.3 State: Quotation (Draft)

**Available action buttons:** `New` · `Send` · `Confirm`

**Form Fields:**

| Field | Notes |
|-------|-------|
| Subscription Number | Auto-generated |
| Customer | Linked to contact/user |
| Quotation Template | Pre-fills order lines if selected |
| Expiration | Expiry of this quotation — after this date, user cannot sign or pay |
| Recurring Plan | Links billing period and plan rules |
| Payment Term | Defines due date rules for invoices |

**Tabs:**

**Tab 1 — Order Lines:**

| Product | Quantity | Unit Price | Discount | Taxes | Amount |
|---------|----------|-----------|----------|-------|--------|

**Tab 2 — Other Info:**

| Field | Notes |
|-------|-------|
| Salesperson | Auto-assigned to the logged-in user; only Admin can change |
| Start Date | Auto-set on Confirm; editable before confirmation |
| Payment Method | Selected method for billing |
| Payment Done | Checkbox |

**Decision flow from Quotation state:**

```
[Save form]
      │
      ├── Click SEND ──────────► State: Quotation Sent
      │                          (email sent to customer; Preview button appears)
      │
      └── Click CONFIRM ───────► State: Confirmed
                                 (skips Quotation Sent entirely)
```

---

### 5.4 State: Quotation Sent

**Additional button appears:** `Preview`

- The quotation has been emailed to the customer
- Internal user can preview what was sent
- Can still be Confirmed from this state → moves to Confirmed

---

### 5.5 State: Confirmed

**Action buttons:** `Create Invoice` · `Cancel` · `Renew` · `Upsell` · `Close`

**Additional fields visible after confirmation:**

| Field | Notes |
|-------|-------|
| Order Date | Date the subscription was confirmed |
| Next Invoice | Calculated next billing date |

**Rules in Confirmed state:**

| Action | What Happens |
|--------|--------------|
| **Order Lines** | Locked — no edits allowed by anyone once confirmed |
| **Create Invoice** | Redirects to Draft Invoice Page |
| **Renew** | Creates a new subscription with same customer, order date, and next invoice; old subscription is cancelled or updated |
| **Upsell** | Creates a new subscription order; allows adding/changing products to upgrade the plan |
| **Close** | Initiates the partial closing process for the subscription |
| **History button** | Shows all linked subscriptions (renewals, upsells) with timestamps |

---

## 6. Invoice Flow

### 6.1 Invoice — Draft

**Trigger:** Clicking `Create Invoice` on a Confirmed subscription

**Route:** `/admin/invoices/[id]`

**Status bar:**

```
[ Draft ] ──► [ Confirmed ]
```

**Available buttons:** `Confirm` · `Cancel`

**Fields:**

| Field | Notes |
|-------|-------|
| Customer | Pre-filled from subscription |
| Invoice Date | Date of invoice creation |
| Due Date | Calculated from Payment Term |

**Tabs:**

**Tab — Order Lines:**

| Product | Quantity | Unit Price | Taxes | Amount |
|---------|----------|-----------|-------|--------|

**Tab — Other Info:** Additional metadata and notes

---

### 6.2 Invoice — Confirmed

**Trigger:** Clicking `Confirm` on the Draft invoice

**New buttons available:** `Send` · `Pay` · `Print` · `Subscription`

**Additional fields:**

| Field | Notes |
|-------|-------|
| Paid | Checkbox — checked when payment is recorded |

**Button behaviors:**

| Button | Action |
|--------|--------|
| `Send` | Emails the confirmed invoice to the customer |
| `Pay` | Opens Payment Popup |
| `Print` | Generates a printable PDF of the invoice |
| `Subscription` | Navigates back to the linked Subscription Form View (without triggering Create Invoice again) |

---

### 6.3 Payment Popup

**Trigger:** Clicking `Pay` on a Confirmed invoice

```
┌──────────────────────────────────────┐
│            Record Payment            │
│                                      │
│  Payment Method  [ Online ▾ / Cash ] │
│  Amount          [________________]  │
│  Payment Date    [________________]  │
│                                      │
│     [ Payment ]     [ Discard ]      │
└──────────────────────────────────────┘
```

**Flow after payment:**

```
User clicks [Payment]
      │
      └── Invoice marked as PAID
          Amount Due = 0
          Paid checkbox = ✓
```

---

### 6.4 Invoice Cancellation

```
Confirmed Invoice
      │
      └── Click CANCEL ──► State: Cancelled
                                │
                                └── Option to revert ──► State: Draft
```

> A cancelled invoice can be brought back to Draft state if needed. A cancelled invoice cannot be paid.

---

## 7. Products Module

### 7.1 Product List Page

**Route:** `/admin/products`

**Columns:** `Product Name` · `Sales Price` · `Cost`

- Search bar available
- `New` button to create a product
- Click any row → Product Form View

---

### 7.2 Product Form View

**Fields:**

| Field | Notes |
|-------|-------|
| Product Name | Required |
| Product Type | Dropdown: `Service` or `Goods` |
| Tax | Linked tax rule |
| Sales Price | Customer-facing price |
| Cost Price | Internal cost |

**Tabs:**

**Tab — Recurring Prices:**

| Recurring Plan | Price | Min Qty | Discount | End Date |
|----------------|-------|---------|----------|----------|

**Tab — Variants:**

| Attribute | Values | Extra Price |
|-----------|--------|-------------|

**Example variant:**
```
Attribute: Brand
Value:     Odoo
Extra Price: ₹20
```

When variants are enabled, selecting a variant on the product page updates the displayed price by adding the extra price to the base price.

---

## 8. Configuration Module

All configuration options live under the `Configuration` top-nav dropdown. Each option navigates directly to its model's list + form view.

---

### 8.1 Recurring Plan

**Route:** `/admin/configuration/recurring-plans`

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| Recurring Name | Text | Name of the plan |
| Billing Period | Number + Dropdown | e.g., `1 Month` — dropdown: Weeks / Month / Year |
| Automatic Close | Number (Days) | Auto-closes subscription after X days |
| Closable | Checkbox | If checked = True; subscription can be manually closed |
| Pausable | Checkbox | If checked = True; subscription can be paused |
| Renew | Checkbox | If checked = True; subscription is renewable |

**Order Lines table:**

| Product | Variant | Price | Min Qty |
|---------|---------|-------|---------|

> Active subscriptions using this plan inherit these Closable / Pausable / Renew rules.

---

### 8.2 Quotation Template

**Route:** `/admin/configuration/quotation-templates`

**Fields:**

| Field | Notes |
|-------|-------|
| Quotation Template Name | Identifier |
| Quotation Validity | Number of days — if this passes without confirmation, subscription auto-closes |
| Recurring Plan | Linked plan |
| Last Forever | Checkbox — if checked, the template has no end date |
| End After | Number + Dropdown (Week / Month / Year) — only shown if Last Forever is unchecked |

**Order Lines table:**

| Product | Description | Quantity |
|---------|-------------|----------|

---

### 8.3 Payment Term

**Route:** `/admin/configuration/payment-terms`

**Fields:**

| Field | Notes |
|-------|-------|
| Early Discount | Discount applied if paid early |

**Due Term table:**

| Due | After |
|-----|-------|
| 100% / Fixed Amount | Days after invoice / invoice month |

---

### 8.4 Discount

**Route:** `/admin/configuration/discounts`

> **Only Admin can create Discount records.**

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| Discount Name | Text | Identifier / promo code name |
| Type | Dropdown | `Fixed Price` or `Percentage` |
| Minimum Purchase | Number | Minimum cart value to apply discount |
| Minimum Quantity | Number | Minimum item quantity to apply discount |
| Products | Linked | If a product is selected → discount applies to that product only. If empty → applies to all products |
| Start Date | Date | Discount becomes active |
| End Date | Date | Discount expires |
| Limit Usage | Checkbox | If enabled → prompts for max-usage count; tracks usage counter |

**Discount applicability logic:**

```
Discount created
      │
      ├── Product field is filled ──► Applies to that specific product only
      │
      └── Product field is empty ───► Applies to all products
```

---

### 8.5 Taxes

**Route:** `/admin/configuration/taxes`

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| Tax Name | Text | e.g., GST 18% |
| Tax Computation | Dropdown | `Percentage` or `Fixed Price` |
| Amount | Number | If Percentage → e.g., 18. If Fixed → specific rupee value |

Tax is auto-calculated on all invoice lines during invoice generation.

---

### 8.6 Attributes / Variants

**Route:** `/admin/configuration/variants`

**Fields:**

| Field | Notes |
|-------|-------|
| Attribute Name | e.g., "Brand" |

**Attribute Values table:**

| Value | Default Extra Price |
|-------|---------------------|
| Odoo | ₹20 |

> Billing period input follows the pattern: first a number input, then a dropdown (Year / Monthly / Weekly) — this same pattern applies to Automatic Close field as well.

---

## 9. Users & Contacts Module

**Route:** `/admin/users` and `/admin/contacts`

### User Page (Admin Backend)

**Fields:** `Name` · `Email` · `Phone Number` · `Address (multi-line)`

**Related Contact:** By default, one contact record is auto-created and linked when a user is created.

**Button:** `Change Password` — triggers password update flow for that user.

---

### Contact Page (Admin Backend)

**Fields:** `Name` · `Email` · `Phone Number` · `Address (multi-line)`

**Button:** `Subscription` — shows count of active subscriptions; clicking redirects to the Subscription List Page filtered to this contact.

---

## 10. Reporting Module

**Route:** `/admin/reporting`

**Route:** `/admin/reports`

**Analytics displayed:**

| Metric | Description |
|--------|-------------|
| Active Subscriptions | Count of all currently active subscription records |
| Revenue | Total revenue from confirmed/paid invoices |
| Payments | Payment volume and method breakdown |
| Overdue Invoices | Invoices past due date that remain unpaid |

**Features:** Filter by date range, customer, plan, or status. Summary view and detailed list view both available.

---

## 11. Customer Portal Flow

### 11.1 Home Page

**Route:** `/`

**Navigation bar:**

```
[Company Logo]   Home  |  Shop  |  My Account            [Cart 🛒] [Avatar ▾]
                                                           Avatar dropdown:
                                                             User Details
                                                             My Orders
                                                             Sign Out
```

---

### 11.2 Shop Page

**Route:** `/shop`

```
┌─────────────────────────────────────────────────────┐
│  [Search bar]                        Sort By: Price  │
├──────────────┬──────────────────────────────────────┤
│  Filters     │  Product Grid                        │
│              │                                      │
│  Category    │  [Image] [Image] [Image]             │
│  ──────────  │  Name    Name    Name                │
│  ○ SaaS      │  Desc    Desc    Desc                │
│  ○ Tools     │  ₹1200   ₹800   ₹2000               │
│              │  /month  /month  /month              │
│  Price Range │                                      │
│  ₹ — ₹₹₹₹   │                                      │
└──────────────┴──────────────────────────────────────┘
```

**Features:**
- Left sidebar: Category filter · Price range filter
- Product grid: Image · Name · Description · Price / Billing period
- `Sort By: Price` dropdown
- Search bar

> Price and billing period are displayed according to the product's linked subscription recurring plan.

---

### 11.3 Product Detail Page

**Route:** `/product/[id]`

```
┌────────────────────────────────────────────────────────┐
│  [Main Image]     Product Name                         │
│  [Thumb 1]        Category: SaaS Tools                 │
│  [Thumb 2]                                             │
│  [Thumb 3]        Pricing by Plan:                     │
│                   Monthly       ₹1,200 / month         │
│                   6 Months      ₹1,760 (Save 17%)      │
│                   Yearly        ₹10,080 (Save 30%)     │
│                                                        │
│                   Variant:  [ Brand ▾ ]  → popup list  │
│                                                        │
│                   Quantity: [ − ] [ 1 ] [ + ]          │
│                                                        │
│                   [      Add to Cart       ]           │
│                                                        │
│                   ✓ 30-day money back guarantee        │
│                   ✓ Shipping: 2–3 Business days        │
│                   📄 Terms and Conditions               │
└────────────────────────────────────────────────────────┘
```

**Variant selection behavior:**

```
User clicks Variant selector
      │
      └── Small popup / dropdown appears with available variants
                │
                └── User selects variant
                          │
                          └── Extra price is added to base price dynamically
                              e.g., Base ₹1,200 + Extra ₹20 = ₹1,220 displayed
```

**Pricing display:** Discounts shown as percentage savings for 6-month and yearly plans.

---

### 11.4 Cart Page

**Route:** `/cart`

**Tabs at top:** `Order` · `Address` · `Payment`

**Order Tab Layout:**

```
┌──────────────────────────────────────────┬──────────────────────────┐
│  Order Items                             │  Order Summary            │
│                                          │                           │
│  [Img] Product Name      [ − 1 + ]  [🗑] │  Discount Code [ Apply ] │
│        ₹40/day                           │                           │
│  [Img] Product Name      [ − 2 + ]  [🗑] │  Subtotal:     ₹1,200    │
│        ₹30/day                           │  Discount:     -₹120     │
│                                          │  Taxes (18%):  ₹194      │
│  Discount applied: 10% on order = -₹120  │  Total:        ₹1,274    │
│                                          │                           │
│                                          │  [    Checkout    ]       │
└──────────────────────────────────────────┴──────────────────────────┘
```

**Discount code flow:**

```
User enters discount code → clicks Apply
      │
      ├── Invalid / expired ───────► Error: "Invalid or expired discount code"
      │
      └── Valid
              │
              ├── Check minimum purchase / minimum quantity rules
              ├── Check usage limit
              └── Apply discount → show "You have successfully applied"
                  Summary updates with discount line
```

> Clicking `Checkout` → navigates to **Address Page**

---

### 11.5 Address Page

**Route:** `/checkout/address`

```
┌──────────────────────────────────────┬──────────────────────────┐
│  Shipping / Billing Address          │  Order Summary (same as  │
│                                      │  cart summary panel)      │
│  [Pre-filled from user profile]      │                           │
│  Name:    John Doe                   │  Subtotal:  ₹1,200       │
│  Line 1:  123 MG Road                │  Discount:  -₹120        │
│  City:    Ahmedabad                  │  Taxes:     ₹194         │
│  State:   Gujarat                    │  Total:     ₹1,274       │
│  Zip:     380001                     │                           │
│                                      │  [ Continue to Payment ] │
│  [+ Use a different address]         │                           │
└──────────────────────────────────────┴──────────────────────────┘
```

- Default address pre-filled from user profile
- "Use a different address" toggle reveals override fields

---

### 11.6 Payment Page

**Route:** `/checkout/payment`

```
┌──────────────────────────────────────┬──────────────────────────┐
│  Payment Method                      │  Order Summary (same as  │
│                                      │  address page)            │
│  ○ Credit Card                       │                           │
│  ○ PayPal                            │  Subtotal:  ₹1,200       │
│                                      │  Discount:  -₹120        │
│  [Stripe Payment Element]            │  Taxes:     ₹194         │
│                                      │  Total:     ₹1,274       │
│                                      │                           │
│                                      │  [    Place Order    ]    │
└──────────────────────────────────────┴──────────────────────────┘
```

> **Note:** Stripe Test Mode / beta payment gateway is used. Test card credentials are used during development and demo.

---

### 11.7 Order Confirmation / Thank You Page

**Route:** `/thank-you`

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ✅                                    │
│           Thanks for your order!                        │
│                                                         │
│     Your payment has been processed successfully.       │
│                                                         │
│     Order Number:  S0001  (clickable → Order Page)      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Order Summary                                  │   │
│  │  Product Name × 1          ₹1,200               │   │
│  │  Discount                  -₹120                │   │
│  │  Taxes (18%)               ₹194                 │   │
│  │  Total                     ₹1,274               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│    [ 🖨 Print Receipt ]    [ Go to My Orders ]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Order number (e.g., `S0001`) is a clickable link → navigates to the Order Detail Page
- Print button opens browser print dialog for the receipt

---

## 12. My Profile — Portal Pages

**Dropdown from avatar (top-right of portal):**

```
[Avatar ▾]
  ├── User Details
  ├── My Orders
  └── Sign Out
```

---

### 12.1 User Details Page

**Route:** `/profile`

All fields are **editable**:

| Field | Type |
|-------|------|
| User Name | Text |
| Email | Email |
| Phone Number | Phone |
| Address | Multi-line text |

---

### 12.2 My Orders Page

**Route:** `/profile/orders`

**Table:**

| Order | Order Date | Total |
|-------|-----------|-------|
| S0001 | 01 Apr 2026 | ₹1,274 |

- Click any row → Order Detail Page
- `Download Invoice` option per order

---

### 12.3 Order Detail Page

**Route:** `/profile/orders/[id]`

```
Order / S0001
Subscription: S00022  [ Active ✓ ]

┌──────────────────────────────────────────────────────┐
│  Your Subscription                                    │
│  Plan: Yearly   Start: 01 Apr 2026   End: 31 Mar 2027 │
├──────────────────────────────────────────────────────┤
│  Invoicing & Shipping Address                         │
│  John Doe · 123 MG Road, Ahmedabad · john@email.com  │
├──────────────────────────────────────────────────────┤
│  Last Invoices                                        │
│  INV/0015   [ Paid ✓ ]    (clickable → Invoice Page) │
├──────────────────────────────────────────────────────┤
│  Products                                             │
│  Product Name  Qty  Unit Price  Taxes  Amount         │
│  ─────────────────────────────────────────────────── │
│  Discount line                    -₹120               │
│  Untaxed Amount:         ₹1,080                       │
│  Tax (18%):              ₹194                         │
│  Total:                  ₹1,274                       │
└──────────────────────────────────────────────────────┘

  [ Download ]    [ Renew ]    [ Close ]
```

**Button Rules:**

| Button | When Shown |
|--------|-----------|
| `Renew` | Only shown if payment is **NOT** already done |
| `Close` | Always shown on active subscriptions |
| `Download` | Always available |

**Renew flow:**

```
Click [Renew]
      │
      └── New subscription order is created
          Old order is cancelled / updated accordingly
          User is redirected to the new order
```

---

### 12.4 Invoice Page (Portal)

**Route:** `/profile/invoices/[id]`

```
Invoice Reference:  Order/S0001/Inv/001
Invoice Number:     INV/0015

Invoice Date: 01 Apr 2026   Due Date: 15 Apr 2026   Source: S0001

┌──────────────────────────────────────────────────────┐
│  Bill To                                              │
│  John Doe · 123 MG Road, Ahmedabad · john@email.com  │
├──────────────────────────────────────────────────────┤
│  Product    Qty  Unit Price  Taxes   Amount           │
│  ─────────────────────────────────────────────────── │
│  Discount line                    -₹120               │
│  Untaxed Amount:         ₹1,080                       │
│  Tax (18%):              ₹194                         │
│  Total:                  ₹1,274                       │
│  Paid on: 01 Apr 2026              ₹1,274             │
│  Amount Due:             ₹0                           │
└──────────────────────────────────────────────────────┘

  [ Payment ]     [ Download ]
```

**Button Rules:**

| Button | When Shown |
|--------|-----------|
| `Payment` | Only shown if invoice is **NOT** already paid |
| `Download` | Always available |

---

## 13. General List Page Rules

Every module (Subscriptions, Products, Recurring Plans, Taxes, etc.) follows the same list view pattern:

| Element | Behavior |
|---------|----------|
| **List view** | Shows all records for that model in a table |
| **New** button | Opens blank form for creating a new record |
| **Delete** (trash icon) | Permanently removes the record |
| **Archive** icon | Hides record from active views; preserves data |
| **Row click** | Opens that record's form / detail page |
| **Search bar** | Available on all list pages for filtering |

---

## 14. Complete System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION                                      │
│   [Signup] ──► Portal User created + Contact auto-linked                    │
│   [Login]  ──► Role check ──► Admin/Internal: Backend | Portal: Frontend    │
│   [Reset]  ──► Email link sent                                              │
└───────────────────────────┬─────────────────────────┬───────────────────────┘
                            │                         │
         ┌──────────────────▼──────────┐   ┌──────────▼──────────────────────┐
         │    ADMIN / BACKEND PANEL     │   │      CUSTOMER PORTAL             │
         │                             │   │                                  │
         │  ┌─────────────────────┐    │   │  Home                            │
         │  │   SUBSCRIPTIONS     │    │   │   └── Shop                       │
         │  │  List ──► Form      │    │   │         └── Product Detail        │
         │  │  Quotation          │    │   │               └── Cart            │
         │  │    │                │    │   │                     │             │
         │  │  Quotation Sent     │    │   │               [Apply Discount]   │
         │  │    │                │    │   │                     │             │
         │  │  Confirmed          │    │   │               Address Page        │
         │  │    │                │    │   │                     │             │
         │  │  Create Invoice     │    │   │               Payment Page        │
         │  │    │                │    │   │                     │             │
         │  └────┼────────────────┘    │   │               Thank You Page     │
         │       │                     │   │               (Order #S0001)     │
         │  ┌────▼────────────────┐    │   │                                  │
         │  │   INVOICES          │    │   │  My Profile                      │
         │  │  Draft              │    │   │   ├── User Details (editable)    │
         │  │    │                │    │   │   └── My Orders                  │
         │  │  Confirmed          │    │   │         └── Order Detail          │
         │  │    │  │  │          │    │   │               ├── Renew           │
         │  │  Send Pay Print     │    │   │               ├── Close           │
         │  │       │             │    │   │               ├── Download        │
         │  │  [Payment Popup]    │    │   │               └── Invoice Page    │
         │  │  Method/Amount/Date │    │   │                     ├── Pay       │
         │  │       │             │    │   │                     └── Download  │
         │  │  Invoice PAID ✓     │    │   │                                  │
         │  └─────────────────────┘    │   └──────────────────────────────────┘
         │                             │
         │  PRODUCTS                   │
         │  List ──► Form              │
         │  (Recurring Prices/Variants)│
         │                             │
         │  CONFIGURATION              │
         │  Recurring Plan             │
         │  Quotation Template         │
         │  Payment Term               │
         │  Discount (Admin only)      │
         │  Taxes                      │
         │  Attributes/Variants        │
         │                             │
         │  USERS & CONTACTS           │
         │  User list/form             │
         │  Contact list/form          │
         │                             │
         │  REPORTING                  │
         │  Active Subs / Revenue /    │
         │  Payments / Overdue         │
         └─────────────────────────────┘
```

---

## 15. Key Business Rules

| # | Rule | Detail |
|---|------|--------|
| 1 | **Default admin** | One admin user is created automatically at system initialization |
| 2 | **Portal user on signup** | Signing up from the frontend always creates a Portal User — never Admin or Internal |
| 3 | **Internal user creation** | Only an Admin can create Internal User accounts |
| 4 | **Discount creation** | Only Admin can create Discount records |
| 5 | **Order line lock** | Once a subscription is Confirmed, order lines are locked — no edits permitted by any user |
| 6 | **Quotation expiry** | After the Expiration date passes, the user cannot sign or pay the quotation |
| 7 | **Invoice Draft → Confirmed** | Invoices must go through Draft before being Confirmed |
| 8 | **Invoice cancellation revert** | A Cancelled invoice can be reverted to Draft; a Paid invoice cannot be cancelled |
| 9 | **Renew** | Creates a new subscription order; old subscription is cancelled or updated |
| 10 | **Upsell** | Creates a new order; allows changing/adding products to upgrade |
| 11 | **Portal Renew visibility** | If payment is already done on the current period → Renew button must NOT be shown |
| 12 | **Portal Invoice Payment button** | If the invoice is already paid → Payment button must NOT be shown |
| 13 | **Contact auto-creation** | On user creation, a linked contact record is automatically created and associated |
| 14 | **Salesperson auto-assign** | Salesperson field auto-fills with the logged-in user; only Admin can change it |
| 15 | **Discount applicability** | If a product is specified on the discount → applies to that product only. If no product → applies to all products |
| 16 | **Discount usage limit** | If Limit Usage is enabled, a usage counter tracks and enforces the max number of applications |
| 17 | **Price display on portal** | Price and billing period shown per the product's linked subscription recurring plan |
| 18 | **Quotation validity auto-close** | If validity days pass and subscription is not confirmed, it auto-closes |
| 19 | **Recurring plan rules** | Closable, Pausable, and Renew options on the plan directly govern what can be done on linked subscriptions |
| 20 | **History tracking** | Subscription form shows all linked renewals and upsells via the History button |

---

*This document is the single source of truth for all application flow decisions and business logic. Review with the team before implementation of any module begins.*