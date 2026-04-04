### Production Application Tech Stack

* **Frontend Interface:** Next.js (App Router), React, Tailwind CSS, React Hook Form, Zod.
* **Backend & Admin Control Panel:** Payload CMS (Node.js).
* **Database:** PostgreSQL (Local deployment for offline capability).
* **Payment Gateway:** Stripe Test Mode (Beta/Testing gateway).
* **Version Control:** Git monorepo via GitHub with mandatory pull request reviews and strict branch protection.

### System Requirements Specification (SRS)

**1. System Objective**
A centralized web application for managing subscription-based products, recurring billing plans, customers, quotations, invoices, taxes, discounts, payments, and reports. This is a full-scale production application, requiring real-time data coordination and offline database capabilities.

**2. User Roles & Access Control**
* **Admin:** Full system control. The exclusive authority to create Internal Users, configure discount rules, and manually generate payment records.
* **Internal User:** Limited operational and administrative access.
* **Portal/User:** Subscriber access for purchasing and managing active plans.

**3. Core Backend Modules**
* **Authentication:** Email/password login. Signups require unique emails and strong passwords (length > 8, uppercase, lowercase, special character).
* **Products & Recurring Plans:** Products support recurring pricing and variant attributes (e.g., Brand: Odoo, Extra Price: 560). Plans dictate billing periods (Daily/Weekly/Monthly/Yearly) and renewal options.
* **Subscriptions & Invoicing:** Subscriptions follow a strict lifecycle (Draft → Quotation → Confirmed → Active → Closed). Invoices auto-generate from active subscriptions.
* **Quotation Templates:** Predefined templates storing Validity Days, Recurring Plans, and Product Lines to accelerate subscription setups.
* **Taxes & Discounts:** Taxes auto-calculate during invoice generation. Discounts apply by fixed amounts or percentages against specific minimum quantities or purchases.

**4. Frontend Portal Routing & UI Workflow**
* **`/` (Home):** Landing page with primary navigation (Home, Shop, My Account) and branding.
* **`/pricing`:** Subscription tier selection featuring a toggle for Monthly/Yearly billing. Tiers include Monthly (1200/month), Yearly (12000/year), and Lifetime (60000/life).
* **`/product/[id]`:** Detailed product view displaying images, pricing, and quantity. Includes dynamic variant selection (popups/dropdowns) that auto-calculates extra price additions.
* **`/cart`:** Order review displaying line items, calculating subtotal/taxes/total, and processing discount codes.
* **`/checkout`:** Captures payment methods (Credit Card, PayPal) and billing address. The address defaults to the user's saved profile data with an override option.
* **`/thank-you`:** Final confirmation displaying the generated Order Number, a purchased items summary, and a print receipt utility.

**5. Non-Functional Requirements**
* **Performance:** System response times must remain under 2 seconds.
* **Scalability:** Architecture must support thousands of simultaneous subscriptions.
* **Reliability:** High availability required.