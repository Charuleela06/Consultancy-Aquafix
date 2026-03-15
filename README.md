# Consultancy-Aquafix

Aquafix is a full‑stack web application to manage:

- Customer **service requests** (optionally with an uploaded image)
- **Staff assignment** and request lifecycle tracking
- **Billing / invoices** for service requests
- **Stripe payments** for approved bills and payment verification
- **Government projects** management + project billing (tax invoice)
- Admin **dashboards, analytics, transactions, and revenue reporting**

It is designed as an end-to-end operations system for a small service/contracting business: customers raise service requests, admins triage and assign them to staff, the work progresses through status updates, and once the job is completed the admin generates an itemized tax invoice (CGST/SGST). Approved invoices can be paid online using Stripe, and payment status is tracked back against the request. In parallel, the same application supports managing government projects (project metadata, budgets, and project-specific invoices) with downloadable PDF invoices and admin reporting/analytics.

This repository contains two apps:

- `Backend/` = Node.js + Express + MongoDB (Mongoose)
- `Frontend/` = React (Vite) + Bootstrap

---

## Table of contents

- Report-style summary
- Overview
- Tech stack
- Repository structure
- Roles & access control
- Features (module-wise)
- Environment variables
- Local setup (Windows)
- Running the application
- Stripe setup notes
- API overview
- Data model overview
- Common troubleshooting

---

## Overview

Aquafix supports a **3-role** workflow:

- **Admin** manages staff, views all requests/projects, assigns staff, generates bills, approves/rejects bills, and monitors analytics.
- **Staff** can access the user-facing area, view assigned work (via request access rules), and see billing/payment status.
- **User** can create service requests, view their requests, pay invoices, and see payment completion.

The backend exposes REST APIs under `http://localhost:5000/api`.
The frontend runs at `http://localhost:5173`.

---

## Report-style summary

### Description

Consultancy-Aquafix is a full-stack application that digitizes the operational workflow of a service/maintenance consultancy. It centralizes customer service requests, staff allocation, status tracking, itemized GST billing, and online payments into a single system. It also includes a parallel workflow for managing government projects, budgets, and project-based invoicing.

### Objective

- Provide a single platform to manage service requests from creation to closure.
- Assign and track staff responsibilities for each job.
- Generate standardized tax invoices with CGST/SGST and downloadable PDFs.
- Support secure online payments and payment verification using Stripe.
- Maintain government project records and generate project-specific bills.
- Offer admin dashboards and analytics for monitoring performance and revenue.

### Problem statement

Service organizations often manage requests, staff allocation, billing, and payment reconciliation using disconnected tools (spreadsheets, messaging apps, manual invoices). This causes:

- Delays in assigning work and tracking completion
- Errors in invoice preparation and tax calculations
- Poor visibility into outstanding payments and revenue
- Difficulty generating reports for business decisions

### Proposed solution / approach

Aquafix solves the above problems by:

- Capturing service requests (with optional images) in a structured database
- Enabling admins to assign staff and update job status centrally
- Generating itemized invoices with auto-calculated CGST/SGST totals
- Persisting bills with approval workflow (Pending/Approved/Rejected)
- Supporting Stripe-based online payment and verification
- Providing government-project tracking and billing in the same system

### Modules (high level)

- Authentication & authorization (JWT + role-based access)
- Staff management and availability tracking
- Service request management (create/view/update/assign)
- Service request billing and invoice PDF generation
- Staff salary calculation on bills (40% of grand total)
- Government projects management + project billing
- Transactions, dashboards, analytics, and stats

### Explanation (workflow)

1. User registers/logs in and submits a service request (optionally uploading an image).
2. Admin reviews incoming requests, assigns an available staff member, and updates request status as work progresses.
3. After work completion, admin generates a bill by adding line items; the system computes subtotal, CGST/SGST and grand total.
4. Admin can calculate staff salary for the job as **40% of the grand total** and save it with the bill.
5. Bills can be approved/rejected; approved bills become payable and can be downloaded as PDF invoices.
6. User pays via Stripe checkout; payment is verified and stored against the request/transactions.
7. Admin can also manage government projects and generate similar invoices for them.

---

## Tech stack

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer (image upload)
- Stripe (checkout + webhook)

### Frontend

- React (Vite)
- React Router
- Axios
- Bootstrap
- jsPDF + jspdf-autotable (invoice PDF generation)
- Recharts (analytics charts)

---

## Repository structure

```
Consultancy-Aquafix/
  Backend/
    controllers/
    middleware/
    models/
    routes/
    server.js
    .env
  Frontend/
    src/
      api/
      components/
      pages/
      utils/
```

---

## Roles & access control

Frontend routes are protected using `Frontend/src/components/ProtectedRoute`.

- Admin-only pages:
  - `/dashboard`
  - `/staff-management`
  - `/projects` (service requests admin view + billing management)
  - `/government` and `/government/:id`
  - `/revenue-analytics`

- User/Staff pages:
  - `/home`
  - `/request` (create service request)
  - `/my-requests`
  - `/transactions`
  - `/payment-complete`

Backend authorization uses JWT and role checks in controllers (for example in billing controllers).

---

## Features (module-wise)

### 1) Authentication

- Register (`/api/auth/register`)
- Login (`/api/auth/login`)
- JWT stored in `localStorage` (frontend) and attached as `Authorization` header for API calls.

### 2) Staff management (Admin)

- View staff list
- View "available staff" (not assigned to any non-completed request)

APIs:

- `GET /api/auth/staff`
- `GET /api/auth/staff/available`

### 3) Service requests (User/Staff/Admin)

Users can create service requests including optional image.
Admins can:

- view all requests
- assign staff
- update status
- update bill amount field (summary field)

Key behaviors:

- Image upload stored in MongoDB (based on current implementation using `multer.memoryStorage()`).
- Access rules for viewing request bills:
  - Admin OR request owner OR assigned staff

APIs:

- `POST /api/requests` (multipart form-data with `image`)
- `GET /api/requests`
- `GET /api/requests/:id/image`
- `PUT /api/requests/assign`
- `PUT /api/requests/status`
- `PUT /api/requests/bill`
- `PUT /api/requests/payment-status`

### 4) Service request billing / invoicing (Admin)

Admin can generate tax invoices for a service request:

- Create bill with line items
- Edit bill
- Approve/Reject bill
- Download bill as PDF

Totals:

- Subtotal = sum of item totals
- CGST = `subtotal * cgstRate / 100`
- SGST = `subtotal * sgstRate / 100`
- Grand total = subtotal + taxes

#### Staff salary (40% of bill amount)

Billing UI contains a **Calculate Staff Salary** button.

- Staff Salary Amount = `grandTotal * 40 / 100`
- Saved with the bill and included in the invoice PDF.

APIs:

- `POST /api/request-billing`
- `GET /api/request-billing/request/:requestId`
- `PUT /api/request-billing/:id`
- `DELETE /api/request-billing/:id`

PDF:

- Generated in `Frontend/src/utils/pdfGenerator.js`.

### 5) Payments (Stripe)

- Checkout session creation
- Verify session after redirect
- Webhook endpoint for Stripe events

Backend endpoints:

- `POST /api/stripe/checkout-session`
- `GET /api/stripe/verify`
- `POST /api/stripe/webhook` (raw body)

Frontend pages:

- `Transactions.jsx` (payment initiation / status)
- `PaymentComplete.jsx` (post-payment UI)

### 6) Government projects (Admin)

Admin can:

- Create government projects
- View projects and open a project details page
- Generate bills for projects
- Approve/Reject project bills
- Download project bills as PDF

Project billing uses:

- `Backend/models/Billing.js`
- `Backend/controllers/billingController.js`
- `Backend/routes/billingRoutes.js`

APIs:

- `GET /api/government`
- `POST /api/government`
- (More project-detail endpoints exist under `governmentRoutes.js`)
- `POST /api/billing`
- `GET /api/billing/project/:projectId`
- `PUT /api/billing/:id`
- `DELETE /api/billing/:id`

### 7) Dashboards, stats, analytics (Admin)

- Summary statistics
- Revenue analytics and charts
- Analytics endpoints

APIs:

- `GET /api/stats`
- `GET /api/analytics/*` (see `Backend/routes/analyticsRoutes.js`)

---

## Environment variables

Backend environment variables are loaded from `Backend/.env`.

Required variables:

- `MONGO_URI` = Mongo connection string
- `PORT` = backend port (default `5000`)
- `JWT_SECRET` = JWT signing secret
- `STRIPE_SECRET_KEY` = Stripe secret key
- `STRIPE_WEBHOOK_SECRET` = Stripe webhook signing secret
- `FRONTEND_URL` = frontend base URL (for redirects/CORS if used)

Security note:

- Do not commit real Stripe keys to a public repository.

---

## Local setup (Windows)

### Prerequisites

- Node.js (LTS recommended)
- MongoDB running locally OR a MongoDB Atlas connection string

### Install dependencies

Backend:

1. Open terminal in `Backend/`
2. Run:

```bash
npm install
```

Frontend:

1. Open terminal in `Frontend/`
2. Run:

```bash
npm install
```

---

## Running the application

### 1) Start MongoDB

Make sure MongoDB is reachable at `MONGO_URI`.

### 2) Start backend

From `Backend/`:

```bash
npm run dev
```

Backend runs at:

- `http://localhost:5000`

### 3) Start frontend

From `Frontend/`:

```bash
npm run dev
```

Frontend runs at:

- `http://localhost:5173`

---

## Stripe setup notes

To fully test Stripe:

- Use Stripe test keys.
- Configure webhook endpoint in Stripe Dashboard:
  - URL: `http://localhost:5000/api/stripe/webhook`
- Copy webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

If webhook fails:

- Ensure webhook route uses `express.raw()` (already implemented at `/api/stripe/webhook`).
- Ensure no other JSON body parser runs before this webhook route.

---

## API overview

Base URL:

- `http://localhost:5000/api`

Authentication:

- Include token in `Authorization` header.

Main route groups:

- `/auth/*`
- `/requests/*`
- `/request-billing/*`
- `/government/*`
- `/billing/*`
- `/stripe/*`
- `/stats`
- `/analytics/*`

---

## Data model overview (high level)

- `User`
  - `role`: `admin | staff | user`

- `ServiceRequest`
  - created by a user
  - can have `assignedStaff`
  - status tracking
  - `billAmount` summary + payment status

- `ServiceRequestBilling`
  - multiple bills per request
  - invoice number, items, totals
  - approval status
  - staff salary percent/amount

- `GovernmentProject`
  - project metadata (title, panchayat, dates, budget)
  - billing summary fields (`totalBilledAmount`, `lastBillId`)

- `Billing`
  - bills linked to `GovernmentProject`
  - items/totals
  - staff salary percent/amount

---

## Common troubleshooting

- **401 / Forbidden**
  - Ensure you are logged in and a valid token exists in `localStorage`.
  - Admin-only endpoints require role `admin`.

- **MongoDB connection error**
  - Confirm MongoDB service is running.
  - Verify `MONGO_URI` in `Backend/.env`.

- **Stripe checkout works but payment status not updated**
  - Verify webhook is configured and reachable.
  - Confirm `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard.

---

## Status

README created/updated with full project overview, setup steps, features, and API details.
