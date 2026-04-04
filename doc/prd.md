This document is the comprehensive System Requirements and Architecture Specification for the Subscription Management System. 

### 1. System Overview
* [cite_start]**Purpose:** A centralized web application to manage subscription-based products, recurring billing, customers, quotations, invoices, taxes, discounts, payments, and reports[cite: 4].
* [cite_start]**Target Audience:** SaaS and other recurring revenue businesses[cite: 5].

### 2. Role-Based Access Control (RBAC)
* [cite_start]**Admin:** Full system control and configuration capabilities[cite: 14]. [cite_start]Only Admins can create Internal Users[cite: 17]. [cite_start]Only Admins can create Discount rules[cite: 133]. Only Admins can create Payment records.
* [cite_start]**Internal User:** Limited operational access[cite: 15].
* [cite_start]**Portal/User:** Customer/subscriber access[cite: 16].

### 3. Core Modules & Data Models

**3.1. Authentication**
* [cite_start]**Login:** Email and password-based[cite: 35].
* [cite_start]**Signup Validations:** Unique email required[cite: 39, 45]. [cite_start]Password must be > 8 characters, containing uppercase, lowercase, and special characters[cite: 40, 48, 49, 50, 51].
* [cite_start]**Password Reset:** Triggered via email verification link sent to registered email[cite: 42, 43].

**3.2. Product Management**
* [cite_start]**Fields:** Product Name, Product Type, Sales Price, Cost Price, Notes[cite: 55, 56, 57, 58, 59].
* [cite_start]**Features:** Supports recurring pricing and variants[cite: 60].
* [cite_start]**Variants:** Enable attribute-based pricing customization (e.g., Attribute: Brand, Value: Odoo, Extra Price: 560)[cite: 76, 78, 79, 80, 82, 83, 84].

**3.3. Recurring Plans**
* [cite_start]**Fields:** Plan Name, Price, Minimum Quantity, Start Date, End Date[cite: 64, 65, 67, 68, 69].
* [cite_start]**Billing Periods:** Daily, Weekly, Monthly, Yearly[cite: 66].
* [cite_start]**Options:** Auto-close, Closable, Pausable, Renewable[cite: 71, 72, 73, 74].

**3.4. Subscriptions**
* [cite_start]**Fields:** Subscription Number, Customer, Plan, Start Date, Expiration Date, Payment Terms[cite: 88, 89, 90, 91, 92, 93].
* [cite_start]**Order Lines:** Product, Quantity, Unit Price, Taxes, Amount[cite: 94, 95, 96, 97, 98, 99].
* [cite_start]**Lifecycle Status Flow:** Draft → Quotation → Confirmed → Active → Closed[cite: 101].

**3.5. Quotation Templates**
* [cite_start]**Purpose:** Predefined setups to accelerate subscription creation[cite: 103].
* [cite_start]**Fields:** Template Name, Validity Days, Recurring Plan, Product Lines[cite: 105, 106, 107, 108].

**3.6. Invoices & Payments**
* [cite_start]**Invoices:** Automatically generated from subscriptions, detailing customer info, product lines, taxes, and totals[cite: 110, 112, 113, 114, 115].
* [cite_start]**Invoice Actions:** Confirm, Cancel, Send, Print[cite: 117, 118, 119, 120].
* [cite_start]**Invoice Flow:** Draft → Confirmed → Paid[cite: 122].
* [cite_start]**Payments:** Record invoice settlement, tracking paid and outstanding invoices[cite: 124, 130]. [cite_start]Fields include Payment Method, Amount, Date, and Notes[cite: 126, 127, 128, 129].

**3.7. Discounts & Taxes**
* [cite_start]**Discounts:** Configurable by Admin, applying to Products or Subscriptions[cite: 133, 143, 144]. [cite_start]Fields include Name, Type (Fixed/Percentage), Min Purchase, Min Quantity, Start/End Date, and Usage Limits[cite: 135, 136, 137, 138, 139, 140, 141].
* [cite_start]**Taxes:** Configurable percentages and types, automatically calculated during invoice generation[cite: 148, 149].

**3.8. Reporting**
* [cite_start]**Analytics:** Tracks active subscriptions, revenue, payments, and overdue invoices, supporting filtering and summary views[cite: 151, 152, 153, 154, 155, 156].

### 4. Frontend UI Mapping & User Flows

**4.1. Navigation & Layout**
* **Home Page (`/`):** Displays Home, Shop, and My Account links, along with the company logo.

**4.2. Purchasing Funnel**
* **Pricing Plan Page (`/pricing`):** Contains toggles for Monthly and Yearly billing cycles. Tiers display as Monthly (1200/month), Yearly (12000/year), and Lifetime (60000/life) with "Add to cart" buttons linked to cart state.
* **Product Page (`/product/[id]`):** Displays product image, Name, Price, and Quantity selector. Includes a popup or list for variant selection that dynamically updates the extra price.
* **Cart Page (`/cart`):** Displays line items (Product name, Quantity, Price) and a summary (Subtotal, Taxes, Total). Includes an input field for a Discount code with an "Apply" button.

**4.3. Checkout & Confirmation**
* **Payment Page (`/checkout`):** Captures Payment Method (Credit Card/PayPal) and Billing Address (Name, Address, City, State, Zip). The address defaults to the User's saved address with an option to override. Integrates a beta/testing payment gateway.
* **Thank You Page (`/thank-you`):** Displays "Thanks you for your order," the Order Number (e.g., 50001), order summary details, and a "Print" button.

**4.4. Internal Tools**
* **Quotation Template Page (`/admin/quotations`):** Inputs for Quotation Title, Customer Name, and Valid Until. Includes a line-item table (Product, Description, Qty, Price, Total) with buttons to Add Line Item, Save, Send, and Preview.

### 5. Non-Functional Requirements (NFRs)
* [cite_start]**Performance:** System response time must be under 2 seconds[cite: 164].
* [cite_start]**Scalability:** Must support thousands of simultaneous subscriptions[cite: 165].
* [cite_start]**Security:** Enforces strict role-based permissions and secure authentication[cite: 166].
* [cite_start]**Usability:** Requires a simple, intuitive, and consistent UI[cite: 167].
* [cite_start]**Reliability:** High availability architecture is mandatory[cite: 168].

Must have
Use real-time or dynamic data sources, and avoid relying on static JSON unless it’s for initial prototyping.
Create a responsive and clean UI (Consistent color scheme and layout).
Validate user input robustly.
Use intuitive navigation with proper menu placement and spacing.
Use version control (Git) properly; one member managing the repo is not enough.

Nice to have
Ability to design backend APIs, model data, and set up a local database.
Understand AI/code snippets thoroughly before using them; don't blindly copy-paste without adapting them to your project.
Plan for offline or local solutions and don’t rely entirely on internet connectivity or cloud-based tools.
Use trendy technologies only if they add real value to your project.

# Product Requirements Document (PRD)
## Subscription Management System

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** April 2026  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Audience & User Personas](#3-target-audience--user-personas)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Feature Requirements](#5-feature-requirements)
   - 5.1 [Authentication](#51-authentication)
   - 5.2 [Product Management](#52-product-management)
   - 5.3 [Recurring Plans](#53-recurring-plans)
   - 5.4 [Subscription Management](#54-subscription-management)
   - 5.5 [Quotation Templates](#55-quotation-templates)
   - 5.6 [Invoice Management](#56-invoice-management)
   - 5.7 [Payment Management](#57-payment-management)
   - 5.8 [Discount Management](#58-discount-management)
   - 5.9 [Tax Management](#59-tax-management)
   - 5.10 [Reporting & Analytics](#510-reporting--analytics)
6. [Frontend Routes & UI Requirements](#6-frontend-routes--ui-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Tech Stack](#8-tech-stack)
9. [Constraints & Assumptions](#9-constraints--assumptions)
10. [Out of Scope](#10-out-of-scope)

---

## 1. Executive Summary

The **Subscription Management System (SMS)** is a centralized, full-scale production web application designed to manage subscription-based products, recurring billing plans, customers, quotations, invoices, taxes, discounts, payments, and reporting. It is purpose-built for SaaS and other recurring-revenue businesses that need real-time data coordination with offline database capabilities.

The system streamlines the complete subscription lifecycle — from product configuration and plan selection, through invoicing and payment collection, to reporting and analytics.

---

## 2. Product Vision & Goals

### Vision
To provide a single, reliable platform that gives subscription businesses complete operational control over their billing lifecycle — eliminating manual processes, reducing errors, and delivering actionable financial insights.

### Goals

| # | Goal | Success Metric |
|---|------|----------------|
| G1 | Centralize subscription and billing management | All subscription operations handled within one platform |
| G2 | Support recurring pricing and flexible billing plans | Daily, Weekly, Monthly, and Yearly billing periods supported |
| G3 | Automate invoicing and payment tracking | Invoices auto-generated from active subscriptions |
| G4 | Manage taxes and discounts with precision | Taxes auto-calculated; discounts applied per configured rules |
| G5 | Improve operational efficiency and accuracy | Reduction in manual billing errors; faster subscription setup via templates |
| G6 | Provide real-time reporting and analytics | Dashboards reflect live subscription, revenue, and payment data |

---

## 3. Target Audience & User Personas

### Primary Market
SaaS companies and recurring-revenue businesses of any size that require structured subscription billing and lifecycle management.

### Personas

**Persona 1 — The Platform Admin (Alex)**
- Role: System administrator
- Needs: Full control over users, discounts, payment records, and system configuration
- Pain Points: Managing multiple billing cycles manually, tracking overdue invoices, onboarding new internal staff

**Persona 2 — The Internal Operator (Jordan)**
- Role: Operations / billing team member
- Needs: Ability to create and manage subscriptions, generate quotations, and confirm invoices
- Pain Points: Slow quotation creation, switching between disconnected tools

**Persona 3 — The Subscriber (Sam)**
- Role: End customer / portal user
- Needs: Easy plan discovery, checkout, and access to their account and subscription status
- Pain Points: Confusing pricing pages, lack of transparency on billing dates and invoice history

---

## 4. User Roles & Permissions

The system enforces **Role-Based Access Control (RBAC)** across all modules.

| Capability | Admin | Internal User | Portal/User |
|---|:---:|:---:|:---:|
| Create / manage Internal Users | ✅ | ❌ | ❌ |
| Create / manage discount rules | ✅ | ❌ | ❌ |
| Manually create payment records | ✅ | ❌ | ❌ |
| Create / manage products & plans | ✅ | ✅ | ❌ |
| Create / manage subscriptions | ✅ | ✅ | ❌ |
| Generate & confirm invoices | ✅ | ✅ | ❌ |
| Create quotation templates | ✅ | ✅ | ❌ |
| View reports & analytics | ✅ | ✅ | ❌ |
| Browse shop & pricing | ✅ | ✅ | ✅ |
| Purchase plans / checkout | ✅ | ✅ | ✅ |
| View own account & subscriptions | ✅ | ✅ | ✅ |

---

## 5. Feature Requirements

### 5.1 Authentication

**Description:** Secure identity management for all user types.

#### User Stories
- As a new user, I want to register with my email so that I can access the platform.
- As a returning user, I want to log in with my email and password so that I can manage my account.
- As a user who forgot my password, I want to receive a reset link via email so that I can regain access.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| AUTH-01 | Login must use email and password authentication |
| AUTH-02 | Registration must reject duplicate email addresses |
| AUTH-03 | Password must be longer than 8 characters |
| AUTH-04 | Password must contain at least one uppercase letter |
| AUTH-05 | Password must contain at least one lowercase letter |
| AUTH-06 | Password must contain at least one special character |
| AUTH-07 | Password reset must be triggered via a verification link sent to the registered email |
| AUTH-08 | Sessions must be managed securely with appropriate expiry |

---

### 5.2 Product Management

**Description:** Admins manage the product catalog, including pricing and variants.

#### User Stories
- As an Admin, I want to create products with pricing and type details so that they can be added to subscription plans.
- As an Admin, I want to configure product variants so that customers can choose attribute-based options with dynamic pricing.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| PROD-01 | Product must have: Name, Type, Sales Price, Cost Price, and Notes |
| PROD-02 | Each product must support recurring pricing configuration |
| PROD-03 | Products must support variants via attribute-value pairs (e.g., Attribute: Brand, Value: Odoo) |
| PROD-04 | Each variant must define an Extra Price added to the base product price |
| PROD-05 | Admins must be able to create, update, delete, and view products |

#### Example Variant
```
Attribute : Brand
Value     : Odoo
Extra Price: ₹560
```

---

### 5.3 Recurring Plans

**Description:** Plans define the billing rules that govern subscription products.

#### User Stories
- As an Admin/Internal User, I want to configure billing plans so that subscriptions are charged on the correct schedule.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| PLAN-01 | Plan must have: Name, Price, Minimum Quantity, Start Date, End Date |
| PLAN-02 | Billing Period must support: Daily, Weekly, Monthly, Yearly |
| PLAN-03 | Plan must support options: Auto-close, Closable, Pausable, Renewable |
| PLAN-04 | Plans must be assignable to products and quotation templates |

---

### 5.4 Subscription Management

**Description:** Core lifecycle management for customer subscriptions.

#### User Stories
- As an Internal User, I want to create subscriptions linked to a customer and plan so that billing is automated.
- As an Admin, I want to monitor subscription status so that I can act on expired or overdue accounts.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| SUB-01 | Subscription must have: Subscription Number, Customer, Plan, Start Date, Expiration Date, Payment Terms |
| SUB-02 | Each subscription must support order lines with: Product, Quantity, Unit Price, Taxes, Amount |
| SUB-03 | Subscription must follow a strict status lifecycle: **Draft → Quotation → Confirmed → Active → Closed** |
| SUB-04 | Status transitions must be enforced — no skipping stages |
| SUB-05 | Active subscriptions must auto-trigger invoice generation |

#### Status Lifecycle

```
Draft ──► Quotation ──► Confirmed ──► Active ──► Closed
```

---

### 5.5 Quotation Templates

**Description:** Predefined templates that speed up subscription setup for Internal Users.

#### User Stories
- As an Internal User, I want to use a quotation template so that I can quickly set up a new subscription without entering repetitive data.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| QT-01 | Template must have: Template Name, Validity Days, Recurring Plan, Product Lines |
| QT-02 | Templates must be selectable during new subscription creation |
| QT-03 | Applying a template must pre-fill subscription fields accordingly |
| QT-04 | Templates must be creatable and editable by Admin and Internal Users |

---

### 5.6 Invoice Management

**Description:** Automated invoice generation and lifecycle management.

#### User Stories
- As an Internal User, I want invoices to be generated automatically from active subscriptions so that I don't have to create them manually.
- As an Admin, I want to confirm, send, or cancel invoices so that billing is accurate.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| INV-01 | Invoices must auto-generate from active subscriptions |
| INV-02 | Invoice must include: Customer details, Product lines, Applied taxes, Subtotal, and Total |
| INV-03 | Invoice must support actions: Confirm, Cancel, Send, Print |
| INV-04 | Invoice must follow the status lifecycle: **Draft → Confirmed → Paid** |
| INV-05 | Cancelled invoices must not be payable |

#### Invoice Status Lifecycle

```
Draft ──► Confirmed ──► Paid
              │
              ▼
           Cancelled
```

---

### 5.7 Payment Management

**Description:** Recording and tracking of invoice settlements.

#### User Stories
- As an Admin, I want to record payments against invoices so that outstanding balances are tracked accurately.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| PAY-01 | Only Admins may create payment records |
| PAY-02 | Payment must capture: Payment Method, Amount, Payment Date, and Notes |
| PAY-03 | Payment must be linked to a specific invoice |
| PAY-04 | System must track both paid and outstanding invoice states |
| PAY-05 | Payment gateway integration must use **Stripe in Test/Beta mode** |

---

### 5.8 Discount Management

**Description:** Configurable discount rules for products and subscriptions.

#### User Stories
- As an Admin, I want to create discount rules so that promotional pricing is applied consistently.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| DISC-01 | Only Admins may create discount rules |
| DISC-02 | Discount must have: Name, Type (Fixed / Percentage), Minimum Purchase, Minimum Quantity, Start Date, End Date, Usage Limit |
| DISC-03 | Discounts must be applicable to: Products and/or Subscriptions |
| DISC-04 | Discount codes must be applicable at the cart stage |
| DISC-05 | System must validate discount eligibility against minimum purchase and quantity thresholds |
| DISC-06 | Expired or usage-exceeded discounts must be rejected |

---

### 5.9 Tax Management

**Description:** Configurable tax rules applied automatically during invoicing.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| TAX-01 | Tax rules must support configurable percentages and types |
| TAX-02 | Taxes must be automatically calculated during invoice generation |
| TAX-03 | Tax amounts must be displayed as a separate line item on invoices and cart summaries |

---

### 5.10 Reporting & Analytics

**Description:** Dashboards and analytics to monitor business health.

#### User Stories
- As an Admin or Internal User, I want to view reports on subscriptions, revenue, and payments so that I can make informed business decisions.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| RPT-01 | Reports must display: Active subscriptions count, Revenue totals, Payment summaries, Overdue invoices |
| RPT-02 | Reports must support filtering by date range, customer, plan, or status |
| RPT-03 | Dashboard must provide summary views with key metrics |
| RPT-04 | Data displayed must be real-time or near real-time (no static JSON in production) |

---

## 6. Frontend Routes & UI Requirements

### Route Map

| Route | Page | Key UI Elements |
|-------|------|-----------------|
| `/` | Home / Landing | Logo, navigation links (Home, Shop, My Account) |
| `/pricing` | Pricing Plans | Monthly/Yearly toggle; tier cards — Monthly (₹1,200/mo), Yearly (₹12,000/yr), Lifetime (₹60,000); "Add to Cart" buttons |
| `/product/[id]` | Product Detail | Product image, name, price, quantity selector, variant selection popup/dropdown with dynamic extra price calculation |
| `/cart` | Cart | Line items (Product, Quantity, Price), Subtotal / Taxes / Total summary, Discount code input with "Apply" button |
| `/checkout` | Checkout | Payment method selector (Credit Card / PayPal), Billing Address form (Name, Address, City, State, Zip), defaults to saved profile with override option |
| `/thank-you` | Order Confirmation | "Thank you for your order" message, generated Order Number (e.g., #50001), order summary, Print button |
| `/admin/quotations` | Quotation Template Tool | Quotation Title, Customer Name, Valid Until inputs; line-item table (Product, Description, Qty, Price, Total); Add Line Item / Save / Send / Preview actions |

### General UI Standards

- Consistent color scheme and layout across all pages
- Responsive design for mobile, tablet, and desktop viewports
- Intuitive navigation with proper menu placement and spacing
- All user inputs must be validated client-side (via Zod) before submission
- Loading and error states must be handled gracefully on all data-fetching pages
- Avoid static JSON for production data — all pages must consume real API data

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | System response time must be under 2 seconds for all operations |
| **Scalability** | Architecture must support thousands of simultaneous active subscriptions |
| **Security** | Role-based permissions enforced on all routes and API endpoints; secure authentication required |
| **Usability** | UI must be simple, intuitive, and consistent across all pages |
| **Reliability** | High availability architecture is mandatory; no single point of failure |
| **Offline Capability** | Database must be locally deployable  for offline development and demo scenarios |
| **Version Control** | Git monorepo via GitHub; mandatory pull request reviews; strict branch protection enforced |

---

## 8. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js (App Router), React, Tailwind CSS |
| **Form Handling** | React Hook Form, Zod (validation) |
| **Backend / Admin CMS** | Node.js API |
| **Database** | PostgreSQL (local deployment) |
| **Payment Gateway** | Stripe (Test / Beta Mode) |
| **Version Control** | Git monorepo via GitHub |

### Key Tech Decisions

- **Next.js App Router** is used for server-side rendering, nested layouts, and route-based code splitting.
- **Node.js API** serves as the backend admin control panel and API layer — managing collections, access control, and content.
- **PostgreSQL** enables offline capability without reliance on cloud-hosted databases.
- **Stripe Test Mode** is integrated for payment gateway simulation without processing real transactions.
- **Zod** is used for both client-side and server-side schema validation to ensure robust input handling.

---

## 9. Constraints & Assumptions

### Constraints
- Payment gateway is limited to **Stripe Test Mode** — no real transactions are processed.
- PostgreSQL must run locally; no external database cloud services are required for core functionality.
- All AI-generated or third-party code snippets must be understood and adapted — no blind copy-paste.
- Trendy technologies should only be adopted if they add genuine, demonstrable value.

### Assumptions
- All users have a stable local development environment with Node.js, and Git installed.
- Stripe test keys will be provided to all team members for local integration testing.
- The platform is not multi-tenant in v1 — all data exists within a single organizational context.
- Email notifications (password reset, invoice delivery) assume an SMTP or transactional email provider is configured.

---

## 10. Out of Scope

The following features are explicitly excluded from v1 of this system:

- Multi-tenant / multi-organization architecture
- Native mobile applications (iOS / Android)
- Live payment processing (Stripe is in Test Mode only)
- Third-party CRM or ERP integrations (e.g., Salesforce, HubSpot)
- AI-powered subscription recommendations or churn prediction
- Multi-currency or multi-language support
- Automated dunning / retry logic for failed payments

---

*This document is a living specification. All changes must be reviewed, approved, and versioned before implementation begins.*
