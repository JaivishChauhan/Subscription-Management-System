# Detailed Description of the Excalidraw Diagram

This document provides a detailed breakdown of the components, text, and flows depicted in the "Subscription Management System 24 hours" Excalidraw diagram.

## Top-Left Section: Core Subscription and Payment Flow

This section outlines the initial user journey, from selecting a pricing plan to completing the payment.

### 1. Pricing Plan Page

This page presents the available subscription options to the user.

- **Title:** Pricing Plan
- **Tabs:** The user can toggle between "Monthly" and "Yearly" billing cycles. The "Yearly" tab is shown as selected.
- **Subscription Tiers:**
    - **Monthly:** 1200 / month
    - **Yearly:** 12000 / year
    - **Lifetime:** 60000 / life
- **Action:** Each tier has an "Add to cart" button.
- **Annotation:** An arrow points from the pricing table to the cart, with the note: "This should be connected to the cart and should be shown according to the selection."

### 2. Quotation Template Page

This page appears to be for creating or viewing a price quote.

- **Title:** Quotation Template
- **Fields:** Includes inputs for "Quotation Title," "Customer Name," and "Valid Until."
- **Line Items:** A table is provided for adding products with columns for "Product," "Description," "Qty," "Price," and "Total."
- **Actions:** Buttons for "Add Line Item," "Save," "Send," and "Preview" are available.
- **Annotation:** A note indicates a flow for when a "quotation is taken from the existing one."

### 3. Payment Page

This page handles the final payment process.

- **Title:** Payment Page
- **Sections:** Divided into "Payment Method" and "Billing Address."
- **Payment Options:** The user can select between "Credit Card" and "Paypal."
- **Billing Information:** Standard fields for "Name," "Address," "City," "State," and "Zip" are included.
- **Security Note:** A critical annotation states: "Payment record should be created by admin only, other user should not create this."

### 4. Home Page

A simple placeholder for the main landing page.

- **Title:** Home Page
- **Navigation:** Includes links for "Home," "Shop," and "My Account."
- **Branding:** A placeholder for the "company logo" is present.
## Bottom-Right Section: Product, Cart, and Order Confirmation

This section details the e-commerce functionality, from product selection to the final thank you page.

### 5. Product Page

The product detail page where users can customize their selection.

- **Title:** Product Page
- **Visuals:** A large placeholder for the "product image" is shown.
- **Details:** Includes "Product Name," "Price," and a "Quantity" selector.
- **Action:** An "Add to cart" button is prominent.
- **Annotation:** A note explains that "a small pop up or list of variant should come to select and accordingly price should vary (extra price)."

### 6. Cart Page

The shopping cart where users review their items and apply discounts.

- **Title:** Cart Page
- **Line Items:** Displays "Product name," "Quantity," and "Price."
- **Summary:** Shows "Subtotal," "Taxes," and "Total."
- **Discount:** A "Discount code" field with an "Apply" button is included.
- **Annotations:**
    - "For payment any demo or testing beta version payment gate will work and accordingly page should be implemented."
    - "For address page by default User address should come and later on if they want to add different that option should also be given."
    - "This box should be there on address and payment page both."

### 7. Thank You Page

The final confirmation page after a successful order.

- **Title:** Thank You Page
- **Message:** "Thanks you for your order" is displayed.
- **Order Details:** Shows "Order 50001" and a summary of the items purchased.
- **Action:** A "Print" button is available for the user to save their receipt.
- **Annotation:** A note specifies that "this box should be there on order page as well."

## Overall Flow and Logic

The diagram illustrates a logical progression through the subscription and purchasing process:

1.  **Plan Selection:** The user starts on the **Pricing Plan Page** to choose a subscription tier.
2.  **Customization:** The user can then view specific products on the **Product Page**, where they can select variants that affect the price.
3.  **Review:** Items are added to the **Cart Page**, where the user can apply discounts and review the total cost, including taxes.
4.  **Payment:** The user proceeds to the **Payment Page** to enter their billing address and select a payment method (Credit Card or Paypal).
5.  **Confirmation:** Upon successful payment, the user is directed to the **Thank You Page**, which displays their order number and provides a print option.
6.  **Administrative Note:** A separate **Quotation Template Page** is available for generating formal quotes, and a security note emphasizes that payment records are strictly an administrative function.
