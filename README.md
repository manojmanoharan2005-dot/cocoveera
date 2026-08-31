# Cocoveera

> Production-Ready B2B E-Commerce & Global Export Logistics Platform for Premium Coconut Substrates and Coir Products.

[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2018%20%7C%20TailwindCSS-61DAFB.svg)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20MongoDB-339933.svg)](https://nodejs.org/)
[![3D Engine](https://img.shields.io/badge/3D%20Engine-Three.js%20%7C%20React%20Three%20Fiber-black.svg)](https://threejs.org/)
[![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini%20API-4285F4.svg)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🚀 Overview

**Cocoveera** is an enterprise-grade B2B e-commerce and export management platform designed to streamline global trade operations for coconut, coir, and cocopeat substrate products (e.g., 5kg blocks, grow bags, briquettes, discs, and erosion control blankets). 

The platform bridges international buyers, commercial growers, and global wholesalers with coconut product manufacturers. It replaces manual, fragmented B2B purchasing channels with automated RFQ (Request for Quotation) workflows, dynamic 3D shipping container load planning, multi-gateway international payments, automated PDF invoice generation, and AI-powered context-aware customer support.

---

## ✨ Key Features

### 👤 Customer Features
- **Account & Profile Management**: Registration, email OTP validation, secure login, profile picture upload, multiple shipping address management, and session management.
- **Product Catalog & Category Browsing**: Detailed product listings with technical specs (pH, EC, moisture content, compression ratio, expansion volume), high-resolution imagery, and category-filtered browsing.
- **Cart & Wishlist**: Interactive cart management with real-time total updates and saved items wishlist.
- **B2B RFQ & Custom Quotations**: Request custom bulk quotes for specific packaging, quantity, and freight requirements. Track quotation lifecycle (Pending → Under Review → Admin Approved → Order Converted).
- **Flexible Checkout & Orders**: Dynamic order placement with shipping rate calculations based on weight tiers and geographic zones.
- **Multi-Gateway Payment Flow**: Full order or milestone-based payment processing with instant payment verification sync.
- **Document Hub**: View, download, and track PDF invoices, order receipts, and quotation documents directly from the account dashboard.

### 🛡️ Admin Features
- **Comprehensive Admin Dashboard**: Centralized management panel for platform statistics, recent orders, revenue summaries, and system activity logs.
- **Product & Category Management**: Full CRUD operations for products, categories, stock availability, pricing, and packaging details.
- **Order Lifecycle Management**: View, filter, and update order statuses (Pending, In Production, Packaging, Loading, Shipped, Delivered) with customer notification triggers.
- **RFQ & Quotation Control**: Review buyer RFQs, set customized unit prices/freight costs, generate official PDF quotations, approve or decline quote requests.
- **User Management**: Role-based administration (User, Support, Manager, Admin, Super Admin), account verification overrides, and user session monitoring.
- **Quality Testing Management**: Manage quality inspection records, batch certifications, and lab testing orders.

### 📦 Logistics & 3D Container Simulator
- **3D Interactive Container Viewer**: Real-time 3D shipping container visualization powered by **Three.js** and **@react-three/fiber**.
- **Container Capacity Calculation**: Supports standard **20FT** and **40FT** shipping container configurations.
- **CBM & Weight Logic**: Automatic calculation of total Cubic Meters (CBM), gross weight, pallet loading capacity, and utilization percentage.
- **Visual Controls**: Toggle container transparency, open/close container doors, auto-rotate camera, inspect pallet arrangements in 3D.
- **Saved Containers**: Save container configurations to user profile for recurring bulk orders.

### 🤖 AI Support System
- **Google Gemini Integration**: Built with `@google/genai` leveraging Gemini AI models (`gemma-4-31b-it`).
- **Context-Aware Customer Assistant**: Automatically detects user status (Guest vs Logged In) and injects personalized data.
- **Real-Time Order Tracking**: Logged-in users can ask the AI assistant for instant updates on their recent orders without manual dashboard navigation.
- **Knowledge-Base Guardrails**: Built-in system instructions tuned specifically for Cocoveera product specs, shipping rules, refund policies, and quotation procedures.

### 🔍 SEO & Search Optimization
- **Dynamic Sitemap Generator**: Automated pre-build script (`generate-sitemap.js`) that queries active products and static pages to produce production `sitemap.xml`.
- **Meta Tag Management**: Page-level dynamic metadata, open-graph tags, and canonical URLs powered by `react-helmet-async`.
- **High-Intent Landing Pages**: Dedicated SEO-targeted landing pages (e.g., `/blueberry-discs-in-coimbatore`) optimized for targeted search indexation.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 | Modern component architecture with Vite build tool |
| **Styling & UI** | Tailwind CSS v3, Framer Motion | Utility-first styling with hardware-accelerated animations |
| **3D Rendering** | Three.js, `@react-three/fiber`, `@react-three/drei` | Interactive 3D container logistics simulator |
| **State & Data Fetching** | React Query (`@tanstack/react-query`), SWR, Axios | Cached API communication & server state management |
| **Icons & Maps** | Lucide React, `react-simple-maps` | Scalable vector icons and global shipment mapping |
| **Backend Runtime** | Node.js, Express.js | Modular RESTful API backend server |
| **Database** | MongoDB, Mongoose ORM | NoSQL database with schema modeling and indexing |
| **Authentication** | JWT (JSON Web Tokens), `bcryptjs` | Token authentication with multi-session control & role checks |
| **Payment Gateways** | Razorpay, Stripe, PayPal, Wire Transfer | Multi-currency domestic and international checkout |
| **Storage & Media** | Cloudinary | Cloud image upload and media transformation |
| **Email Service** | Brevo (Sendinblue API) + Nodemailer (Gmail fallback) | Transactional email notifications with HTML templates |
| **SMS / WhatsApp** | Twilio API | Real-time SMS and messaging notifications |
| **PDF Generation** | PDFKit | Server-side generation of commercial invoices & formal quotes |
| **AI Infrastructure** | `@google/genai` (Google Gemini) | Conversational support and order status assistant |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) | Production cloud deployment architecture |

---

## 🏗️ System Architecture

```
                                +-------------------+
                                |    End User /     |
                                |  B2B Wholesale    |
                                +---------+---------+
                                          |
                                          v
                               +--------------------+
                               |  Vite + React SPA  |
                               | (Vercel Frontend)  |
                               +---------+----------+
                                         |
                                         | REST APIs (HTTPS / JSON)
                                         v
                               +--------------------+
                               | Express Node.js API|
                               |  (Render Backend)  |
                               +----+---+---+---+---+
                                    |   |   |   |
         +--------------------------+   |   |   +--------------------------+
         |                              |   |                              |
         v                              v   v                              v
+------------------+         +--------------------+              +-------------------+
|  MongoDB Atlas   |         | Payment Gateways   |              | External Services |
| (Database Layer) |         | Razorpay / Stripe  |              | Cloudinary / Gemini|
+------------------+         | PayPal / Wire      |              | Brevo / Twilio    |
                             +--------------------+              +-------------------+
```

### Communication & Data Flow
1. **Client Request**: Frontend communicates with Express backend endpoints via secure Axios clients utilizing JWT Authorization headers.
2. **Security Pipeline**: Incoming requests pass through security sanitization (`helmet`, `cors`, `express-rate-limit`, `xss-clean`, `express-mongo-sanitize`).
3. **Business Logic & Controller**: Express routes delegate to specialized controllers (e.g., `quoteRequestController`, `paymentController`, `chatController`).
4. **External Services**: Payments, Cloudinary uploads, AI completion, and transactional emails execute asynchronously with error handling and fallback strategies.

---

## 📁 Project Structure

```
Cocoveera/
├── frontend/                     # React + Vite Single Page Application
│   ├── public/                   # Static assets & sitemap.xml
│   ├── scripts/                  # Pre-build scripts (generate-sitemap.js)
│   └── src/
│       ├── assets/               # Branding assets & images
│       ├── components/           # Reusable UI components
│       │   └── 3d/               # Three.js 3D container visualization components
│       ├── context/              # React Context (Auth, Cart, Wishlist)
│       ├── dashboards/           # Customer & Admin dashboard view layouts
│       ├── layouts/              # Navbar, Footer, and page wrappers
│       ├── pages/                # Page route views & SEO landing pages
│       └── utils/                # API config, payment sync hooks, helpers
├── backend/                      # Node.js + Express REST API Server
│   ├── config/                   # Database (db.js) & Cloudinary configuration
│   ├── controllers/              # Business logic for Auth, Orders, Quotes, Payments, Chat
│   ├── middleware/               # Auth protection, admin role check, rate limiters, sanitizers
│   ├── models/                   # Mongoose schemas (User, Product, Order, Quote, Payment, etc.)
│   ├── routes/                   # Express API route declarations
│   ├── scripts/                  # Database seeders & migration scripts
│   └── utils/                    # PDF Invoice generator, Brevo/Nodemailer mailers, Notifications
├── seo/                          # Dedicated SEO landing pages package
├── vercel.json                   # Vercel routing & asset cache control rules
├── package.json                  # Root workspace dependencies
└── README.md                     # Repository documentation
```

---

## 🔄 Core User Flows

### Standard Checkout (Product → Cart → Order)
```
[Browse Catalog] ➔ [View Specs & CBM] ➔ [Add to Cart] ➔ [Checkout / Shipping Address] ➔ [Select Payment Gateway] ➔ [Instant Verification & Order Created] ➔ [PDF Invoice Generated]
```

### B2B Wholesale Quote Flow (RFQ → Quotation → Order)
```
[Submit RFQ Form] ➔ [Admin Reviews RFQ] ➔ [Admin Prepares Custom Quote & PDF] ➔ [Customer Receives Email & Quotation] ➔ [Customer Accepts Quote] ➔ [Order Converted & Payment Processed]
```

---

## 🔐 Authentication & Security

- **JWT Token Authentication**: Tokens issued upon login/registration with 30-day default expiration.
- **Session Protection**: Inactivity tracking with 30-minute auto-expiry for administrative sessions.
- **Password Hashing**: Salted password hashing using `bcryptjs` before storage in MongoDB.
- **Role-Based Access Control (RBAC)**: Fine-grained access hierarchy (`user`, `support`, `manager`, `admin`, `super_admin`).
- **Security Middleware**:
  - `helmet` header security (CSP, frameguard, X-XSS-Protection).
  - Rate limiting on public and authentication routes to mitigate brute-force attempts.
  - NoSQL Injection protection via `express-mongo-sanitize`.
  - Cross-Site Scripting protection via `xss-clean`.

> ⚠️ **Note**: No API keys, passwords, connection strings, or sensitive environment variables are committed to version control.

---

## 💳 Payment Integrations

Cocoveera supports domestic and international payment flows:

1. **Razorpay**: Domestic Indian transactions (Cards, UPI, Netbanking, QR codes).
2. **Stripe**: International credit/debit card processing.
3. **PayPal**: Global PayPal wallet payments.
4. **Wire Transfer / Offline Invoice**: Direct B2B bank wire processing with payment milestone tracking (Deposit / Balance payment schedules).

---

## 📧 Email & Notification System

- **Primary Provider**: **Brevo (Sendinblue API)** via `sib-api-v3-sdk`.
- **Fallback Provider**: **Nodemailer** using Gmail SMTP.
- **PDF Generation**: **PDFKit** creates dynamic PDF invoices and quotation documents attached to transactional emails.
- **SMS Notifications**: **Twilio** integration for immediate order status SMS/WhatsApp alerts.

---

## ☁️ Deployment

- **Frontend Application**: Deployed on **Vercel** with custom routing and static cache header configuration (`vercel.json`).
- **Backend API**: Deployed on **Render** high-availability Node.js runtime.
- **Database**: **MongoDB Atlas** managed cloud cluster.

---

## ⚙️ Local Development Setup

### Prerequisites
Ensure you have the following installed on your local machine:
- **Node.js**: `v18.x` or `v20.x` recommended
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance or access to a MongoDB Atlas cluster

---

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/cocoveera.git
cd cocoveera
```

---

### Step 2: Install Dependencies

#### Install Root & Workspace Dependencies:
```bash
npm install
```

#### Install Backend Dependencies:
```bash
cd backend
npm install
```

#### Install Frontend Dependencies:
```bash
cd ../frontend
npm install
```

---

### Step 3: Environment Variables Setup

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Email
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_sender_email@domain.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Media Storage
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Payment Gateways
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
STRIPE_SECRET=your_stripe_secret_key
PAYPAL_SECRET=your_paypal_secret_key

# App Config
FRONTEND_URL=http://localhost:5173
LOGO_URL=your_logo_cdn_url
GEMINI_API_KEY=your_google_gemini_api_key
ADMIN_VERIFICATION_KEY=your_admin_verification_key
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Cocoveera Trade Platform
VITE_APP_TITLE=Cocoveera - Quality Coconut Substrates & Testing
VITE_AUTH_REDIRECT_LOGIN=/login
VITE_AUTH_REDIRECT_ADMIN=/admin/login
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_TESTING=true
VITE_ENABLE_CONTAINERS=true
```

---

### Step 4: Database Seeding (Optional)

To seed initial products and categories into your local database:

```bash
cd backend
npm run seed:products
```

---

### Step 5: Run Local Development Servers

#### Start Backend API Server:
```bash
cd backend
npm run dev
```
*Backend server will run at `http://localhost:5000`*

#### Start Frontend Vite Dev Server:
```bash
cd frontend
npm run dev
```
*Frontend application will run at `http://localhost:5173`*

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
