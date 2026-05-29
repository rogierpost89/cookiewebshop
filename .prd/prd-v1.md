---
version: 1
status: draft
date: 2026-05-29
author: Rogier
previous: null
---

# PRD v1 — Cookie Web Shop

## 1. Problem

A small custom cookie business currently has no online presence and no structured way to take orders. Customers can't browse what's available, specify what they want, or know when their cookies will be ready. The baker has no central place to track open orders, deadlines, and delivery preferences — everything is handled manually and informally.

Without a dedicated ordering system, orders get lost, deadlines are missed, and the business can't grow beyond word-of-mouth.

## 2. Solution

A simple, friendly web shop where customers can place a custom cookie order — choosing a frosting color and the name to put on the cookie, selecting pickup or delivery, and setting a deadline. Orders land in the baker's inbox and an admin dashboard, where she can manage status and notify customers when cookies are ready. Payment is handled via Tikkie (manual payment request) for now, with the architecture ready for iDEAL later.

## 3. Scope

| This PRD covers | This PRD does NOT cover |
| --- | --- |
| Customer order form (color, name, quantity, deadline, delivery method) | Automated payment processing (Tikkie is manual) |
| Order confirmation emails to customer | iDEAL / Mollie integration |
| New order notification email to baker | Multi-product catalog |
| Admin dashboard (view orders, update status, set ready date) | Discount codes or promotions |
| Ready date email notification to customer | Customer accounts / order history |
| Password-protected admin login | SMS notifications |
| Delivery method selection (pickup or send) | Shipping cost calculation |
| Shipping address capture for delivery orders | Inventory management |

## 4. Architecture

### File structure

```
app/
  page.tsx                  ← Landing page
  order/
    page.tsx                ← Order form
    confirmation/
      page.tsx              ← Order confirmation page
  admin/
    login/
      page.tsx              ← Admin login
    page.tsx                ← Order dashboard
  api/
    orders/
      route.ts              ← POST (create order), GET (list orders)
      [id]/
        route.ts            ← PATCH (update status / set ready date)
    auth/
      route.ts              ← Admin login handler

prisma/
  schema.prisma             ← Order model

emails/
  order-confirmation.tsx    ← Customer confirmation email template
  new-order.tsx             ← Baker notification email template
  ready-date.tsx            ← Ready date notification email template

lib/
  db.ts                     ← Prisma client singleton
  email.ts                  ← Resend client + send helpers
  auth.ts                   ← Admin session helpers
```

### Key components

**Order form (`/order`)**
Multi-step form collecting: frosting color (color swatches), name on cookie, quantity, customer deadline, delivery method (pickup / send), customer name and email, shipping address (shown only when "send" is selected). Submits to `POST /api/orders`.

**Confirmation page (`/order/confirmation`)**
Shown after successful submission. Displays order summary and explains the next step (Tikkie payment request will follow).

**Admin dashboard (`/admin`)**
Protected by session cookie. Lists all orders sorted by deadline. Each order shows: customer name, cookie name, color, quantity, deadline, delivery method, and current status. Actions per order: update status (confirmed / ready / delivered), set ready date (triggers customer email).

**Admin login (`/admin/login`)**
Single-password login form. Checks against `ADMIN_PASSWORD` env var. Sets a signed session cookie on success.

**API routes**
- `POST /api/orders` — validates input, writes to DB, sends two emails (baker + customer)
- `GET /api/orders` — returns all orders (admin only)
- `PATCH /api/orders/[id]` — updates status or readyDate; if readyDate is set, triggers ready-date email to customer

**Email templates (`/emails`)**
React Email components rendered server-side via Resend. Three templates: customer order confirmation, baker new-order notification, customer ready-date notification.

### Data flow

```
Customer fills order form
  → POST /api/orders
    → Validate input
    → Write Order to DB (status: pending)
    → Send "new order" email to baker
    → Send "confirmation" email to customer
  → Redirect to /order/confirmation

Baker logs into /admin
  → Views order list
  → Updates status → PATCH /api/orders/[id]
  → Sets ready date → PATCH /api/orders/[id]
    → Sends "ready date" email to customer
  → Sends Tikkie manually (outside app)
```

### Data model

```
Order {
  id            String    @id @default(cuid())
  createdAt     DateTime  @default(now())

  customerName  String
  customerEmail String

  cookieColor   String    // e.g. "pink", "white", "blue", "yellow"
  cookieName    String    // name printed on the cookie
  quantity      Int

  deadline      DateTime  // requested by customer
  deliveryMethod String   // "pickup" | "delivery"
  shippingAddress String? // required if deliveryMethod = "delivery"

  status        String    @default("pending")
                          // pending | confirmed | ready | delivered

  readyDate     DateTime? // set by baker, triggers email
  notes         String?
}
```

### Integration points

- **Neon (Postgres)** — database, provisioned via Vercel Marketplace
- **Prisma** — ORM, schema migrations
- **Resend** — transactional email (3 templates)
- **Next.js App Router** — pages, API routes, server actions
- **Tailwind v4** — styling throughout

## 5. User Flow

### Customer

```
/ (landing page)
  └─ "Order Now" CTA
       └─ /order (order form)
            ├─ Select frosting color
            ├─ Enter name for cookie
            ├─ Enter quantity
            ├─ Select delivery method (pickup / send)
            │    └─ If "send": enter shipping address
            ├─ Enter deadline
            ├─ Enter name + email
            └─ Submit
                 ├─ Email sent to baker (new order)
                 ├─ Email sent to customer (confirmation)
                 └─ /order/confirmation (thank-you page)

Later: customer receives "ready date" email from baker
```

### Baker (admin)

```
/admin/login
  └─ Enter password
       └─ /admin (order dashboard)
            └─ Per order:
                 ├─ View details (color, name, qty, deadline, delivery)
                 ├─ Update status
                 └─ Set ready date → triggers customer email
```

## 6. Success Metrics

| Metric | Target |
| --- | --- |
| Customer can place an order end-to-end | Works without errors |
| Baker receives email on new order | Within 60 seconds of submission |
| Customer receives confirmation email | Within 60 seconds of submission |
| Customer receives ready-date email when baker sets date | Within 60 seconds |
| Admin page shows all orders | Loads correctly, sorted by deadline |
| Admin page is not accessible without password | Returns 401 / redirects to login |
| Order form works on mobile | No layout breakage on 375px viewport |

## 7. Out of Scope

- Payment processing of any kind (Tikkie is sent manually by baker)
- iDEAL or Mollie integration (future cycle)
- Customer accounts, login, or order history
- Multiple cookie types or a product catalog
- Discount codes
- Shipping cost calculation or courier integration
- Baker-to-customer chat or comments
- Order cancellation by customer

## 8. Dependencies & Risks

| Dependency / Risk | Impact | Mitigation |
| --- | --- | --- |
| Neon free tier limits | DB unavailable if limits hit | Monitor usage; upgrade tier when live |
| Resend free tier (100 emails/day) | Emails fail at high volume | Acceptable for small business; upgrade if needed |
| Admin password in env var | Single point of auth failure | Use a strong password; rotate if compromised |
| No payment automation | Tikkie must be sent manually | Acceptable for Phase 1; iDEAL planned for Phase 2 |
| Shipping address is free text | Delivery errors possible | Acceptable for now; structured address form in future |

## 9. Privacy & Security

- Customer email and name are stored in the database — no third-party analytics or tracking.
- Admin route (`/admin`, `/api/orders GET/PATCH`) is protected by a signed session cookie verified server-side.
- `ADMIN_PASSWORD` and `DATABASE_URL` and `RESEND_API_KEY` are environment variables — never committed to the repo.
- No passwords stored for customers; no customer authentication.
