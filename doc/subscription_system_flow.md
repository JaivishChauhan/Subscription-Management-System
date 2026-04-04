# Subscription Management System — Complete Flow Analysis

---

## 1. System Overview

This is a **Subscription Management Web Application** with two distinct interfaces:
- **Admin/Backend Panel** — for managing subscriptions, products, users, invoices, and configuration
- **Customer Portal (Frontend)** — for customers to browse, purchase, and manage their subscriptions

---

## 2. User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all modules; can create internal users; only role that can create Discount records |
| **Portal User** (normal user) | Standard access; created automatically on signup |
| **Internal User** | Limited rights; can only be created by Admin |

> By default, one Admin user is created when the system is initialized.

---

## 3. Authentication Flow

### 3.1 Login Page
- Fields: **Email ID**, **Password**
- Validations:
  - If email not found → error: `"Account not exist"`
  - If password doesn't match → error: `"Invalid password"`
- Links:
  - **Forgot Password** → navigates to Reset Password Page
  - **Sign Up** → navigates to Signup Page (only Portal users can be created here)

### 3.2 Signup Page
- Fields: **Name**, **Email ID**, **Password**, **Re-Enter Password**
- On signup, a `portal user` record is created in the database
- Validations:
  - Email ID must not be duplicate in database
  - Password must be unique, contain at least one lowercase, one uppercase, one special character, and be longer than 8 characters
- Option: **Sign up with Google or another provider**

### 3.3 Reset Password Page
- Field: **Enter Email ID**
- System verifies whether the entered email exists
- On clicking Submit → displays message: `"The password reset link has been sent to your email."`

---

## 4. Admin/Backend Panel Flow

### 4.1 Main Navigation
Top-level menu tabs available across all backend pages:

```
Subscriptions | Products | Reporting | Users/Contacts | Configuration | My Profile
```

### 4.2 App Entry Point
- After login, the user lands on the **App Icon / Dashboard screen**
- From here, clicking on the Subscriptions area opens the **Subscription List Page**

---

## 5. Subscriptions Module

### 5.1 Subscription List Page
- Columns: **Number**, **Customer**, **Next Invoice**, **Recurring**, **Plan**, **Status**
- Example statuses: `Inprogress`, `Churned`, `Quotation Sent`
- Action buttons: **New** (create), delete icon, archive icon
- Clicking any record navigates to the Subscription Form View

### 5.2 Subscription Form View — States & Lifecycle

The subscription progresses through the following states shown as a status bar:

```
Quotation → Quotation Sent → Confirmed
```

#### State: Quotation (New/Draft)
**Available buttons:** New | Send | Confirm

**Form fields:**
- Subscription Number (auto-generated)
- Customer
- Quotation Template
- Expiration *(expiry of quotation — after this date, the user cannot sign or pay)*
- Recurring Plan
- Payment Term

**Tabs:**
- **Order Lines** — table with: Product | Quantity | Unit Price | Discount | Taxes | Amount
- **Other Info** — includes Salesperson (auto-assigned to login person; only admin can change), Start Date (auto-set on confirm; editable), Payment Method, Payment Done checkbox

**Notes:**
- Once all details are saved, user can either **Send** the quotation to the client or **directly Confirm** it
- If **Send** is clicked → state changes to `Quotation Sent`; Preview button appears
- If **Confirm** is clicked → state changes to `Confirmed`

#### State: Quotation Sent
**Additional buttons appear:** Preview

#### State: Confirmed
**Additional buttons appear:** Create Invoice | Cancel | Renew | Upsell | Close

**Additional fields visible after confirm:**
- Order Date
- Next Invoice

**Rules:**
- Once confirmed, **no one can make changes to the order line**
- **Renew** → creates a new subscription order with the same user, order date, and next invoice; the old one is cancelled or updated
- **Upsell** → creates a new order and allows changing/upgrading the subscription with other products
- **Close** → initiates closing the partial process of the order

**History button:** Shows all following subscriptions created; shows the times or upsell of quotation with start

---

## 6. Invoice Flow

### 6.1 Creating an Invoice
- Clicking **Create Invoice** on a confirmed subscription → redirects to the **Draft Invoice Page**

### 6.2 Invoice — Draft State
**Available buttons:** Confirm | Cancel | (state bar: Draft → Confirmed)

**Fields:** Customer | Invoice Date | Due Date

**Tabs:** Order Lines | Other Info

**Order Lines table:** Product | Quantity | Unit Price | Taxes | Amount

### 6.3 Invoice — After Confirm
**New buttons appear:** Send | Pay | Print | Subscription (links back to subscription form)

**Additional fields:** Paid checkbox

**Notes:**
- If **Cancelled** → state shows as `Cancelled`; option to bring it back to Draft state must exist
- The **Subscription** button on the invoice → redirects back to the Subscription Form View without hitting Create Invoice again

### 6.4 Payment
Clicking **Pay** opens a payment popup/form:
- **Payment Method:** Online or Cash
- **Amount**
- **Payment Date**
- Buttons: **Payment** | **Discard**

After payment, the invoice is marked as paid with Amount Due = 0.

---

## 7. Products Module

### 7.1 Product List Page
- Columns: **Product Name**, **Sales Price**, **Cost**
- Search bar available
- Clicking a product → Product Form View Page

### 7.2 Product Form View Page
**Fields:**
- Product Name
- Product Type *(dropdown: Service or Goods)*
- Tax (linked)
- Sales Price
- Cost Price

**Tabs:**
- **Recurring Prices** — table: Recurring Plan | Price | Min Qty | Discount | End Date
- **Variants** — table: Attribute | Values | Extra Price

### 7.3 Product Page (with Variants active)
- Same fields as above
- Variants tab shows: Attribute | Values | Extra Price

---

## 8. Configuration Module

Clicking **Configuration** in the top nav opens a dropdown with:

```
Variants
Recurring Plan
Quotation Template
Payment Term
Discount
Taxes
```

> Note: There is no dedicated Configuration page — selecting an option navigates directly to that model's list view.

---

## 9. Recurring Plan Page

**Fields:**
- Recurring Name
- Billing Period: `[number] [Month ▼]` — dropdown: Weeks / Month / Year
- Automatic Close: `___ Days`
- Closable ☐ *(if checked = True; unchecked = False)*
- Pausable ☐
- Renew ☐

**Order Lines table:** Product | Variant | Price | Min Qty

**Notes:**
- Active subscriptions using this recurring plan are linked
- If subscription uses this plan, closable/pausable/renew rules apply accordingly

---

## 10. Quotation Template Page

**Fields:**
- Quotation Template Name
- Quotation Validity: `___ days` *(if validity days pass and subscription is not confirmed, it will auto-close)*
- Recurring Plan
- Last Forever ☐
- End After: `___ Month ▼` *(dropdown: Week / Month / Year)*

**Order Lines table:** Product | Description | Quantity

---

## 11. Payment Term Page

**Fields:**
- Early Discount
- Due Term table:
  - Due | After
  - 100 percent / Fixed | days after invoice month

---

## 12. Discount Page

> **Only Admin can create Discount records. Other users cannot.**

**Fields:**
- Discount Name
- Fixed Price / Percentage *(dropdown)*
- Minimum Purchase
- Minimum Quantity
- Products *(if product is selected → discount applies to that product only; if no product → applies to all products)*
- Start Date
- End Date
- Limit Usage ☐ *(if limit is set, it will be limited usage after clicking; should ask how many times counter according to limit; for that only this discount should be applicable)*

---

## 13. Taxes Page

**Fields:**
- Tax Name
- Tax Computation: Percentage / Fixed Price *(dropdown)*
- Amount *(if amount → specific value; otherwise defaults like 12%)*

---

## 14. Attribute Page

*(Accessible via Configuration → Variants)*

**Fields:**
- Attribute Name

**Attribute Values table:** Value | Default Extra Price

*Example: Attribute name = "Brand", value = "Odoo", extra price = 20 Rs*

**Billing Period note:** First number input, then dropdown for Year/Monthly; same applies to automatic close.

---

## 15. Users / Contacts Module

### 15.1 User Page (Admin Backend)
**Fields:** Name | Email | Phone Number | Address (multi-line)

**Additional:** Related Contact field *(by default one contact record is created for the user and linked here; later a user can create multiple contacts for that contact model, which is different)*

**Button:** Change Password

### 15.2 Contact Page (Admin Backend)
**Fields:** Name | Email | Phone Number | Address (multi-line)

**Button:** Subscription *(shows number of active subscriptions; clicking redirects to subscription page)*

---

## 16. General List Page Rules (All Modules)

Every module page (Subscriptions, Products, Recurring Plan, Taxes, etc.) has:
- A **list view** showing records for that model
- **New** button to create
- **Delete** button (trash icon)
- **Archive** button
- On clicking a record → opens that record's form/detail page

---

## 17. Customer Portal (Frontend) Flow

### 17.1 Home Page
- Navigation: **Company Logo | Home | Shop | My Account**
- Top-right: **Cart | My Profile**
- My Profile dropdown: **Sign Out**

### 17.2 Shop Page
- Left sidebar: **Category** | **Price Range** filters
- Product grid with: Image | Name | Description | Price / Billing period
- **Sort By: Price** option
- Search bar

*Price and billing shown according to subscription recurring plan*

### 17.3 Product Detail Page
- Product images (multiple, selectable in large view)
- Product Name
- Pricing by plan:
  - Monthly: ₹1200 / 1200/month
  - 6 Months: ₹1760 / 1460/month (% discount shown)
  - Yearly: ₹10080 / 840/month (% discount shown)
- Product Category
- Variants available: quantity selector `[ - 1 + ]` + **Add to Cart**
- Terms and conditions
- 30-day money back guarantee
- Shipping: 2–3 Business days

*Small popup/list of variants comes to select; price varies accordingly with extra price*

### 17.4 Cart Page
Tabs: **Order | Address | Payment**

**Order tab:**
- Product name | recurring price per day | quantity selector | Remove button
- Discount line (e.g., 10% on your order = -120)

**Right panel:**
- Subtotal
- Taxes
- Total
- Discount Code field + Apply button
- Success message: "You have successfully applied"
- **Checkout** button

*On clicking Checkout → goes directly to payment*

### 17.5 Address Page
- Default user address is pre-filled
- Option to add a different address
- Order summary box shown on both Address and Payment pages

### 17.6 Payment Page
- Payment method selection
- Order summary box (same as cart)
- Checkout button

*For testing/beta: test payment gateway will work accordingly*

### 17.7 Order Confirmation / Thank You Page
- Message: **"Thanks for your order"**
- Order number: e.g., `S0001`
- Payment status box: `"Your payment has been processed"`
- Print button
- Order summary panel (right): product, discount, subtotal, taxes, total
- Clicking the order number → navigates to the Order Page

---

## 18. My Profile — Portal Pages

### 18.1 My Profile Dropdown Options
- **User Details**
- **My Orders**

### 18.2 User Details Page
- Editable fields: **User Name | Email | Phone Number | Address**
- Other user-related details
- All information is editable

### 18.3 My Orders Page (Order List)
Table: **Order | Order Date | Total**

- Clicking an order → navigates to the Order Detail Page
- **Download invoice** option available

### 18.4 Order Page (Order Detail — Portal)
- Order number: e.g., `Order/S0001`
- Subscription number: e.g., `S00022` with state badge
- **Your Subscription** section: Plan | Start Date | End Date
- **Invoicing and Shipping Address**: name, address lines, email, phone
- **Last Invoices**: Invoice Number | Payment Status *(clicking redirects to Invoice Page)*
- **Products table**: Product Name | Quantity | Unit Price | Taxes | Amount | Discount line
- Totals: Untaxed Amount | Tax % | Total
- Buttons: **Download** | **Renew** | **Close**

**Rules:**
- On clicking **Renew** → new order is created and shown accordingly
- On clicking **Close** → option should redirect accordingly
- **If payment is already done, the Renew button should not show**

### 18.5 Invoice Page (Portal)
- Invoice reference: `Order/S0001/Inv/001`
- Invoice number: `INV/0015`
- Invoice Date | Due Date | Source
- **Address section**: Customer name, address, email
- **Products table**: Product | Quantity | Unit Price | Taxes | Amount | Discount line
- Totals: Untaxed Amount | Tax % | Total | Paid on [date] | Amount Due
- Buttons: **Payment** | **Download**

**Note:** If payment is already done, the **Payment button should NOT show**.

---

## 19. Complete System Flow Summary

```
[Signup / Login]
      │
      ├── Portal User ──────────────────────────────────────────────────────────────────┐
      │                                                                                  │
      └── Admin / Internal User                                                          │
              │                                                                          │
              ▼                                                                          │
    [Admin Backend Panel]                                                                │
              │                                                                          │
    ┌─────────┴──────────────────────────────────────────┐                              │
    │                                                     │                              │
[Subscriptions]                                  [Configuration]                        │
    │                                                     │                              │
    ├── List View                              Recurring Plan / Quotation Template /     │
    └── Form View                             Payment Term / Discount / Taxes /         │
          │                                   Attribute / Variants                      │
          ├── Quotation                                                                  │
          ├── Send → Quotation Sent                                                      │
          └── Confirm → Confirmed                                                        │
                    │                                                                    │
                    └── Create Invoice                                                   │
                              │                                                          │
                         [Invoice - Draft]                                               │
                              │                                                          │
                         Confirm Invoice                                                 │
                              │                                                          │
                    [Invoice - Confirmed]                                                │
                              │                                                          │
                           Pay → [Payment Popup] → Invoice Paid                         │
                                                                                        │
─────────────────────────────────────────────────────────────────────────────────────── │
                                                                                        │
    [Customer Portal] ◄─────────────────────────────────────────────────────────────────┘
              │
    ┌─────────┴──────────────────┐
    │                            │
 [Home]                   [My Profile]
    │                       │        │
 [Shop]             [User Details] [My Orders]
    │                                │
 [Product Page]               [Order Detail]
    │                                │
 [Cart]                       [Invoice Page]
    │                                │
 [Address]                   [Payment / Download]
    │
 [Payment]
    │
 [Order Confirmation]
    │
 [Order Page (Portal)]
```

---

## 20. Key Business Rules Summary

| Rule | Detail |
|------|--------|
| Default admin | One admin user created at system initialization |
| Portal user on signup | Created automatically on signup from frontend |
| Internal user | Only Admin can create internal users |
| Discount creation | Only Admin can create discount records |
| Order line lock | Once subscription is confirmed, no one can edit the order lines |
| Quotation expiry | After expiry date, user cannot sign or pay the quotation |
| Invoice states | Draft → Confirmed; if cancelled → option to revert to Draft |
| Renew | Creates a new subscription order; old one cancelled/updated |
| Upsell | Creates a new order with option to add/change products |
| Portal Renew | If payment already done → Renew button must not be shown |
| Portal Invoice Payment | If already paid → Payment button must not be shown |
| Contact auto-creation | On user creation, a linked contact record is auto-created |
| Price display (portal) | Price and billing shown per subscription recurring plan |
| Discount applicability | If product specified → product-level; if none → all products |
