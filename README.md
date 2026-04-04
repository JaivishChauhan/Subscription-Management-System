# Subscription-Management-System

A full-stack Subscription Management System designed to handle recurring billing, product management, subscriptions, invoices, payments, and reporting — built for hackathon-scale execution with real-world logic.

---

## 🚀 Features

### Core Functionality

* User authentication (Login, Signup, Password Reset)
* Product and variant management
* Recurring subscription plans (Monthly, Yearly, Lifetime)
* Subscription lifecycle management
* Invoice generation from subscriptions
* Payment tracking (Admin-controlled)
* Discount and tax calculation
* Dashboard with key metrics

---

## 🧩 System Flow

1. User selects a subscription plan
2. Adds product (with variants) to cart
3. Applies discount and reviews total (tax included)
4. Proceeds to checkout
5. Subscription is created
6. Invoice is auto-generated
7. Payment is recorded (Admin-controlled)
8. Dashboard reflects updated data

---

## 🛠️ Tech Stack

### Frontend

* React / Next.js
* Tailwind CSS

### Backend

* Node.js / Express (or Django / Spring Boot)

### Database

* PostgreSQL / MySQL / SQLite (local setup supported)

---

## 📂 Project Structure

```
/frontend       → UI components and pages
/backend        → APIs and business logic
/database       → schema and migrations
/docs           → system design and flow diagrams
```

---

## 🔐 Roles

* **Admin** → Full control (products, users, payments, discounts)
* **Internal User** → Limited operational access
* **Customer/User** → Subscription and purchase flow

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```
git clone https://github.com/your-username/subscription-flow-system.git
cd subscription-flow-system
```

### 2. Install Dependencies

```
# frontend
cd frontend
npm install

# backend
cd ../backend
npm install
```

### 3. Run Application

```
# backend
npm run dev

# frontend
npm run dev
```

---

## 🧠 Key Highlights

* Real-time dynamic data (no static JSON)
* Clean and responsive UI
* Robust input validation
* Role-based access control
* Modular and scalable architecture

---

## 🎯 Hackathon Focus

This project emphasizes:

* Real-world business logic implementation
* End-to-end subscription lifecycle
* Clean UI/UX with functional depth
* Scalable and maintainable architecture

---

## 📌 Future Enhancements

* Auto-renew subscription system
* Revenue analytics and forecasting
* Email notification system
* Plan upgrade/downgrade handling

---

## 📄 License

MIT License
