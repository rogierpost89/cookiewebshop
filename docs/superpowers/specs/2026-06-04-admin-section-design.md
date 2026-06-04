# Admin Section Design

**Date:** 2026-06-04  
**Status:** Approved

## Overview

Build the missing admin section for Daphne's Bakery. The auth library, middleware, `UpdateOrderSchema`, and `sendReadyDateEmail` are all implemented — this spec covers the UI pages, server actions, and API route that complete the flow.

Single user (Daphne). Password stored in `ADMIN_PASSWORD` env var. No user management needed.

---

## Architecture

### New files

| Path | Purpose |
|---|---|
| `app/admin/login/page.tsx` | Login form |
| `app/admin/login/actions.ts` | Server action: verify password, set session, redirect |
| `app/admin/page.tsx` | Order list (Server Component) |
| `app/admin/orders/[id]/page.tsx` | Order detail + update form (Server Component) |
| `app/admin/orders/[id]/actions.ts` | Server action: update status/readyDate, trigger email |
| `app/admin/logout/actions.ts` | Server action: clear session, redirect to login |
| `app/api/orders/[id]/route.ts` | PATCH handler using UpdateOrderSchema |

### Modified files

| Path | Change |
|---|---|
| `lib/auth.ts` | `secure: process.env.NODE_ENV === 'production'` (fixes dev cookie) |

---

## Pages

### `/admin/login`

- Bakery-styled page: gradient top bar, serif logo, centered form
- Single `<input type="password" name="password">` field and submit button
- Server action (`loginAction`):
  1. Read `password` from FormData
  2. Compare with `process.env.ADMIN_PASSWORD` (exact match; throws in production if env var missing)
  3. On match: call `setSession(await cookies())`, redirect to `/admin`
  4. On mismatch: return error string `"Ongeldig wachtwoord"`
- Error displayed inline below the form using `useActionState`

### `/admin` — Order list

- Server Component, protected by middleware (unauthenticated → redirect to `/admin/login`)
- Reads all orders from DB, ordered by `createdAt DESC`
- Header: bakery logo + "Bestellingen" title + logout button (posts to logout action)
- Table/list rows, each showing:
  - Short order ID (`order.id.slice(-8).toUpperCase()`)
  - Customer name
  - Quantity + delivery method
  - Deadline (formatted `nl-NL`)
  - Status badge
- Status badge colours: `pending` = gray, `confirmed` = blue (`accent`), `ready` = green, `delivered` = taupe
- Each row is a link to `/admin/orders/[id]`

### `/admin/orders/[id]` — Order detail

- Server Component, reads order from DB; `notFound()` if missing
- Top section: full order summary (same fields as customer confirmation page)
- Bottom section: update form with:
  - `<select name="status">` — all four statuses, current value pre-selected
  - `<input type="date" name="readyDate">` — pre-filled if `order.readyDate` is set
  - Submit button "Opslaan"
- Server action (`updateOrderAction`):
  1. Parse FormData through `UpdateOrderSchema`
  2. `db.order.update()`
  3. If new status is `"ready"` and `readyDate` is set → `sendReadyDateEmail(updatedOrder)`
  4. Revalidate path and redirect back to `/admin/orders/[id]` (shows updated state)
- Back link to `/admin`

---

## API Route — `PATCH /api/orders/[id]`

Protected by middleware (401 if unauthenticated).

Request body (JSON): any subset of `{ status, readyDate, notes }` — validated by `UpdateOrderSchema`.

Response:
- `200 { success: true, order }` on success
- `400 { success: false, error }` on validation failure
- `404 { success: false }` if order not found
- `500 { success: false }` on DB error

Triggers `sendReadyDateEmail` under the same condition as the server action.

The admin UI does not call this route directly — it exists to close the gap the middleware protects and for potential future use.

---

## Auth Fix

`lib/auth.ts:34` — change `secure: true` to `secure: process.env.NODE_ENV === 'production'`.

This allows the session cookie to be set over HTTP in local development.

---

## Styling

Matches the public-facing bakery aesthetic:
- Gradient top bar (`var(--gradient-h)`)
- Serif (`font-serif`) headings, sans (`font-sans`) body
- `espresso` / `taupe` / `bisque` / `surface` colour tokens
- `primary` (`#C46480`) for interactive elements

---

## Environment Variables

| Variable | Purpose | Required in prod |
|---|---|---|
| `ADMIN_PASSWORD` | Admin login password | Yes — throws on startup if missing |
| `SESSION_SECRET` | JWT signing secret | Yes — already guarded in `lib/auth.ts` |
