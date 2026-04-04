# Subscription Management System

A full-stack production-ready Subscription Management System designed to handle recurring billing, product management, subscriptions, invoices, payments, and reporting — built with real-world business logic and enterprise-grade architecture.

---

## Features

### Core Functionality

* **Authentication & Authorization**
  - Email/password authentication with NextAuth v5
  - Role-based access control (Admin, Internal User, Portal User)
  - Password reset via email verification
  - Strong password validation (8+ chars, uppercase, lowercase, special characters)

* **Product Management**
  - Product catalog with variants and attributes
  - Dynamic pricing based on recurring plans
  - Support for both services and goods
  - Cost and sales price tracking

* **Subscription Lifecycle**
  - Complete lifecycle: Draft → Quotation → Confirmed → Active → Closed
  - Recurring plans (Daily, Weekly, Monthly, Yearly)
  - Auto-close, pausable, and renewable options
  - Quotation templates for rapid setup
  - Subscription renewal and upsell workflows

* **Invoice & Payment Management**
  - Auto-generated invoices from active subscriptions
  - Invoice lifecycle: Draft → Confirmed → Paid
  - Multiple payment methods (Credit Card, PayPal, Bank Transfer, Cash)
  - Stripe integration (Test Mode)
  - Payment tracking and outstanding balance management

* **Discount & Tax Engine**
  - Flexible discount rules (Fixed/Percentage)
  - Product-specific or global discounts
  - Usage limits and date-based validity
  - Automatic tax calculation per invoice line
  - Support for GST, VAT, and custom tax rules

* **Reporting & Analytics**
  - Real-time dashboard with KPIs
  - Active subscriptions tracking
  - Revenue metrics (MTD, YTD)
  - Overdue invoice monitoring
  - Payment summaries and trends

---

## System Architecture

### Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- React Hook Form + Zod validation
- Zustand (state management)

**Backend**
- Next.js API Routes
- NextAuth v5 (authentication)
- Prisma ORM
- PostgreSQL (production) / SQLite (development)

**Payment Processing**
- Stripe (Test Mode integration)

**Development Tools**
- ESLint + Prettier
- TypeScript strict mode
- Prisma Studio (database GUI)

---

## Project Structure

```
/app                    → Next.js app router pages
  /(auth)              → Authentication pages (login, signup, reset)
  /admin               → Admin panel (dashboard, management)
  /api                 → API routes (REST endpoints)
  /pricing             → Customer-facing pricing page
  /cart                → Shopping cart
  /checkout            → Checkout flow
  /invoices            → Invoice portal
/components            → Reusable UI components
  /ui                  → Base UI components (buttons, etc.)
/lib                   → Utility functions and services
  /validations         → Zod schemas
/prisma                → Database schema and migrations
/doc                   → System documentation
  - FEATURES.md        → Feature specification & tracker
  - prd.md             → Product requirements document
  - appflowdoc.md      → Application flow documentation
  - srs.md             → Software requirements specification
  - trd.md             → Technical requirements document
```

---

## User Roles & Permissions

| Role | Access Level | Key Capabilities |
|------|-------------|------------------|
| **Admin** | Full system control | Create internal users, manage discounts, record payments, full CRUD on all modules |
| **Internal User** | Operational access | Manage products, plans, subscriptions, invoices, quotations |
| **Portal User** | Customer access | Browse shop, purchase plans, view own subscriptions and invoices |

---

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL (or use SQLite for local development)
- Stripe account (for payment integration)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/subscription-management-system.git
cd subscription-management-system
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Application URL
- `STRIPE_SECRET_KEY` - Stripe test secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### 4. Database Setup

```bash
# Push schema to database
pnpm db:push

# Seed with demo data (optional)
pnpm db:seed

# Open Prisma Studio to view data
pnpm db:studio
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Key Workflows

### Subscription Creation Flow

1. Admin/Internal User creates subscription (Draft state)
2. Selects customer, recurring plan, and products
3. Applies taxes and discounts
4. Sends quotation to customer (Quotation Sent state)
5. Customer confirms → Subscription moves to Confirmed state
6. Admin activates subscription → Auto-generates first invoice
7. Payment recorded → Invoice marked as Paid

### Customer Purchase Flow

1. Customer browses pricing page
2. Selects plan and adds to cart
3. Applies discount code (optional)
4. Proceeds to checkout
5. Enters/confirms billing address
6. Completes payment via Stripe
7. Subscription and invoice auto-created
8. Confirmation email sent

---

## Key Highlights

* **Real-time Dynamic Data** - No static JSON; all data from PostgreSQL
* **Type-Safe** - Full TypeScript coverage with strict mode
* **Validated Inputs** - Zod schemas on both client and server
* **Role-Based Security** - NextAuth v5 with Prisma adapter
* **Responsive Design** - Mobile-first Tailwind CSS
* **Production-Ready** - Error handling, loading states, optimistic updates
* **Scalable Architecture** - Modular structure, separation of concerns

---

## Development Progress

Current implementation status: ~25% complete

**Completed:**
- [x] Database schema (all 13 models)
- [x] Authentication system (login, signup, password reset)
- [x] Admin dashboard UI with KPIs
- [x] Basic API routes structure
- [x] Cart and checkout UI shells

**In Progress:**
- [ ] Product management CRUD
- [ ] Recurring plan management
- [ ] Subscription lifecycle implementation
- [ ] Invoice auto-generation
- [ ] Payment integration (Stripe webhooks)
- [ ] Discount and tax application logic

See `doc/FEATURES.md` for detailed feature tracking.

---

## Documentation

Comprehensive documentation is available in the `/doc` folder:

- **FEATURES.md** - Complete feature specification with implementation checklist
- **prd.md** - Product Requirements Document
- **appflowdoc.md** - Detailed application flow and user journeys
- **srs.md** - Software Requirements Specification
- **trd.md** - Technical Requirements Document

---

## Future Enhancements

* Auto-renewal system with retry logic
* Advanced revenue analytics and forecasting
* Email notification system (invoice delivery, payment reminders)
* Plan upgrade/downgrade with prorated billing
* Multi-currency support
* Dunning management for failed payments
* Customer self-service portal enhancements
* Webhook integrations for third-party systems

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see LICENSE file for details

---

## Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.
