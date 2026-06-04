# Admin Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete admin section — login, order list, order detail with status/readyDate updates, logout, and a PATCH API route — on top of the already-implemented auth library, middleware, and email infrastructure.

**Architecture:** Pure Server Components for data display, Client Components only where form state is needed (login, order update). Server Actions handle all mutations. The PATCH API route exists alongside the UI but is not called by it.

**Tech Stack:** Next.js 15 App Router, Prisma, jose (JWT), Zod, Resend/react-email, Tailwind CSS v4

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `lib/auth.ts:34` | Fix `secure` flag for dev |
| Create | `app/admin/login/actions.ts` | `loginAction` server action |
| Create | `app/admin/login/page.tsx` | Login form (Client Component) |
| Create | `app/admin/logout/actions.ts` | `logoutAction` server action |
| Create | `app/admin/page.tsx` | Order list (Server Component) |
| Create | `app/admin/orders/[id]/actions.ts` | `updateOrderAction` server action |
| Create | `app/admin/orders/[id]/UpdateOrderForm.tsx` | Update form (Client Component) |
| Create | `app/admin/orders/[id]/page.tsx` | Order detail (Server Component) |
| Create | `app/api/orders/[id]/route.ts` | PATCH handler |

---

## Task 1: Fix session cookie for local development

**Files:**
- Modify: `lib/auth.ts:34`

- [ ] **Step 1: Change the `secure` flag**

In `lib/auth.ts`, line 34, replace:
```ts
    secure: true,
```
with:
```ts
    secure: process.env.NODE_ENV === 'production',
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/auth.ts
git commit -m "fix: allow session cookie over HTTP in development"
```

---

## Task 2: Login server action

**Files:**
- Create: `app/admin/login/actions.ts`

- [ ] **Step 1: Create the file**

```ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { setSession } from '@/lib/auth'

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD

  if (process.env.NODE_ENV === 'production' && !adminPassword) {
    throw new Error('ADMIN_PASSWORD is not set in production')
  }

  const expected = adminPassword ?? 'dev'
  if (password !== expected) return 'Ongeldig wachtwoord'

  const cookieStore = await cookies()
  await setSession(cookieStore)
  redirect('/admin')
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/login/actions.ts
git commit -m "feat: add admin login server action"
```

---

## Task 3: Login page

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="min-h-full">
      <div style={{ height: '4px', background: 'var(--gradient-h)' }} />
      <header className="border-b border-bisque bg-surface">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <span
            className="font-serif text-xl tracking-wide"
            style={{
              background: 'linear-gradient(90deg, #C46480, #b87090)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Daphne&apos;s Bakery
          </span>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-6 py-20">
        <h1 className="font-serif text-3xl text-espresso mb-8">Inloggen</h1>

        {error && (
          <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 font-sans text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label className="block font-sans text-xs text-taupe mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full py-4 text-white font-sans text-sm tracking-wide hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            style={{
              background: 'var(--gradient)',
              boxShadow: '0 2px 16px rgba(196,100,128,0.2)',
            }}
          >
            {pending ? 'Inloggen…' : 'Inloggen'}
          </button>
        </form>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Start dev server (`npm run dev`). Visit `http://localhost:3000/admin` — should redirect to `/admin/login`. Submit wrong password — should show "Ongeldig wachtwoord". Submit correct password (env var `ADMIN_PASSWORD`, or `dev` if unset) — should redirect to `/admin` (currently 404, that's fine for now).

- [ ] **Step 4: Commit**

```bash
git add app/admin/login/page.tsx
git commit -m "feat: add admin login page"
```

---

## Task 4: Logout server action

**Files:**
- Create: `app/admin/logout/actions.ts`

- [ ] **Step 1: Create the file**

```ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { clearSession } from '@/lib/auth'

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  await clearSession(cookieStore)
  redirect('/admin/login')
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/logout/actions.ts
git commit -m "feat: add admin logout server action"
```

---

## Task 5: Order list page

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Link from 'next/link'
import { db } from '@/lib/db'
import { logoutAction } from './logout/actions'

const STATUS_LABELS: Record<string, string> = {
  pending:   'In afwachting',
  confirmed: 'Bevestigd',
  ready:     'Klaar',
  delivered: 'Bezorgd',
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-gray-100 text-gray-500',
  confirmed: 'bg-[#E8F4F8] text-[#5A9AAE]',
  ready:     'bg-green-50 text-green-700',
  delivered: 'bg-[#F5F0E8] text-[#8A7A82]',
}

export default async function AdminPage() {
  const orders = await db.order.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="min-h-full">
      <div style={{ height: '4px', background: 'var(--gradient-h)' }} />
      <header className="border-b border-bisque bg-surface">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <span
            className="font-serif text-xl tracking-wide"
            style={{
              background: 'linear-gradient(90deg, #C46480, #b87090)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Daphne&apos;s Bakery
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="font-sans text-xs text-taupe hover:text-primary transition-colors cursor-pointer"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl text-espresso mb-8">Bestellingen</h1>

        {orders.length === 0 ? (
          <p className="font-sans text-sm text-taupe">Nog geen bestellingen.</p>
        ) : (
          <div className="divide-y divide-bisque border border-bisque">
            {orders.map(order => {
              const shortId = order.id.slice(-8).toUpperCase()
              const deadline = new Date(order.deadline).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
              const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
              const statusLabel = STATUS_LABELS[order.status] ?? order.status

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-4 bg-surface hover:bg-parchment transition-colors"
                >
                  <span className="font-mono text-xs text-taupe w-24 shrink-0">
                    #{shortId}
                  </span>
                  <span className="font-sans text-sm text-espresso flex-1 min-w-0 truncate">
                    {order.customerName}
                  </span>
                  <span className="font-sans text-xs text-taupe w-16 shrink-0 text-right">
                    {order.quantity}×
                  </span>
                  <span className="font-sans text-xs text-taupe w-32 shrink-0 text-right">
                    {deadline}
                  </span>
                  <span
                    className={`font-sans text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 shrink-0 ${statusStyle}`}
                  >
                    {statusLabel}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Visit `http://localhost:3000/admin` while logged in. Should show a list of orders (or "Nog geen bestellingen" if DB is empty). Logout button should redirect to `/admin/login`.

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: add admin order list page"
```

---

## Task 6: Update order server action

**Files:**
- Create: `app/admin/orders/[id]/actions.ts`

- [ ] **Step 1: Create the file**

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { UpdateOrderSchema } from '@/lib/types'
import { sendReadyDateEmail } from '@/lib/email'

export async function updateOrderAction(
  orderId: string,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const raw = {
    status:    (formData.get('status') as string)    || undefined,
    readyDate: (formData.get('readyDate') as string) || undefined,
  }

  const result = UpdateOrderSchema.safeParse(raw)
  if (!result.success) return result.error.issues[0].message

  const data = result.data

  const order = await db.order.update({
    where: { id: orderId },
    data: {
      ...(data.status    !== undefined && { status: data.status }),
      ...(data.readyDate !== undefined && { readyDate: data.readyDate }),
    },
  })

  if (data.status === 'ready' && order.readyDate !== null) {
    try {
      await sendReadyDateEmail(order as typeof order & { readyDate: Date })
    } catch (err) {
      console.error('[email] ready-date email failed:', err)
    }
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin')
  redirect(`/admin/orders/${orderId}`)
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/orders/[id]/actions.ts
git commit -m "feat: add update order server action"
```

---

## Task 7: Update order form (Client Component)

**Files:**
- Create: `app/admin/orders/[id]/UpdateOrderForm.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useActionState } from 'react'
import { updateOrderAction } from './actions'
import type { ORDER_STATUSES } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = {
  pending:   'In afwachting',
  confirmed: 'Bevestigd',
  ready:     'Klaar',
  delivered: 'Bezorgd',
}

interface UpdateOrderFormProps {
  orderId: string
  currentStatus: string
  currentReadyDate: string | null
}

export default function UpdateOrderForm({
  orderId,
  currentStatus,
  currentReadyDate,
}: UpdateOrderFormProps) {
  const boundAction = updateOrderAction.bind(null, orderId)
  const [error, formAction, pending] = useActionState(boundAction, null)

  return (
    <form action={formAction} className="space-y-6">
      {error && (
        <div className="px-4 py-3 border border-red-200 bg-red-50 font-sans text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block font-sans text-xs text-taupe mb-2">Status</label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
        >
          {(['pending', 'confirmed', 'ready', 'delivered'] as const).map(s => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-sans text-xs text-taupe mb-2">
          Klaardatum{' '}
          <span className="normal-case font-sans text-xs text-taupe">(optioneel)</span>
        </label>
        <input
          type="date"
          name="readyDate"
          defaultValue={currentReadyDate ?? ''}
          className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
        />
        <p className="font-sans text-[10px] text-taupe mt-1.5">
          Stel een klaardatum in en zet de status op &ldquo;Klaar&rdquo; om de klant een e-mail te sturen.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-4 text-white font-sans text-sm tracking-wide hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
        style={{
          background: 'var(--gradient)',
          boxShadow: '0 2px 16px rgba(196,100,128,0.2)',
        }}
      >
        {pending ? 'Opslaan…' : 'Opslaan'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/orders/[id]/UpdateOrderForm.tsx
git commit -m "feat: add update order form component"
```

---

## Task 8: Order detail page

**Files:**
- Create: `app/admin/orders/[id]/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import UpdateOrderForm from './UpdateOrderForm'

const COLOR_LABELS: Record<string, string> = {
  pink:   'Roze',
  white:  'Wit',
  blue:   'Blauw',
  yellow: 'Geel',
  custom: 'Op aanvraag',
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'In afwachting',
  confirmed: 'Bevestigd',
  ready:     'Klaar',
  delivered: 'Bezorgd',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await db.order.findUnique({ where: { id } })
  if (!order) notFound()

  const shortId = order.id.slice(-8).toUpperCase()
  const deadline = new Date(order.deadline).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const createdAt = new Date(order.createdAt).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const readyDateValue = order.readyDate
    ? new Date(order.readyDate).toISOString().split('T')[0]
    : null

  const infoRows: [string, string][] = [
    ['Bestelnummer',  `#${shortId}`],
    ['Geplaatst op',  createdAt],
    ['Klant',         order.customerName],
    ['E-mail',        order.customerEmail],
    ['Koekje',        order.cookieName],
    ['Kleur',         COLOR_LABELS[order.cookieColor] ?? order.cookieColor],
    ['Aantal',        `${order.quantity} stuks`],
    ['Gewenste datum', deadline],
    ['Bezorging',     order.deliveryMethod === 'pickup' ? 'Afhalen in Huizen' : `Bezorgen naar ${order.shippingAddress}`],
    ['Status',        STATUS_LABELS[order.status] ?? order.status],
    ...(order.personalizationLine1 ? [['Regel 1', order.personalizationLine1] as [string, string]] : []),
    ...(order.personalizationLine2 ? [['Regel 2', order.personalizationLine2] as [string, string]] : []),
    ...(order.notes ? [['Opmerkingen', order.notes] as [string, string]] : []),
  ]

  return (
    <div className="min-h-full">
      <div style={{ height: '4px', background: 'var(--gradient-h)' }} />
      <header className="border-b border-bisque bg-surface">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/admin" className="font-sans text-sm text-taupe hover:text-primary transition-colors">
            ← Bestellingen
          </Link>
          <span className="text-bisque">|</span>
          <span
            className="font-serif text-xl tracking-wide"
            style={{
              background: 'linear-gradient(90deg, #C46480, #b87090)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Daphne&apos;s Bakery
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-6">
            Besteloverzicht
          </p>
          <div className="border border-bisque bg-surface p-8 space-y-4">
            {infoRows.map(([label, value]) => (
              <div key={label} className="flex justify-between items-baseline gap-6">
                <span className="font-sans text-xs text-taupe shrink-0">{label}</span>
                <span className="font-sans text-sm text-espresso text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-6">
            Bijwerken
          </p>
          <UpdateOrderForm
            orderId={order.id}
            currentStatus={order.status}
            currentReadyDate={readyDateValue}
          />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

With dev server running and logged in as admin:
1. Visit `/admin` — should show order list
2. Click an order — should show full detail with info rows and update form
3. Change status to "Bevestigd", click Opslaan — should redirect back to the same page with updated status shown in info rows
4. Set a klaardatum and status to "Klaar", click Opslaan — should redirect back; if `RESEND_API_KEY` is set, the ready-date email fires (check console for errors if not)

- [ ] **Step 4: Commit**

```bash
git add app/admin/orders/[id]/page.tsx
git commit -m "feat: add admin order detail page"
```

---

## Task 9: PATCH API route

**Files:**
- Create: `app/api/orders/[id]/route.ts`

- [ ] **Step 1: Create the file**

```ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UpdateOrderSchema } from '@/lib/types'
import { sendReadyDateEmail } from '@/lib/email'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const result = UpdateOrderSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const data = result.data

  const existing = await db.order.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ success: false }, { status: 404 })
  }

  try {
    const order = await db.order.update({
      where: { id },
      data: {
        ...(data.status    !== undefined && { status: data.status }),
        ...(data.readyDate !== undefined && { readyDate: data.readyDate }),
        ...(data.notes     !== undefined && { notes: data.notes }),
      },
    })

    if (data.status === 'ready' && order.readyDate !== null) {
      try {
        await sendReadyDateEmail(order as typeof order & { readyDate: Date })
      } catch (err) {
        console.error('[email] ready-date email failed:', err)
      }
    }

    return NextResponse.json({ success: true, order })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

With dev server running and a valid session cookie (log in via `/admin/login` first):

```bash
# Get an order ID from /admin first, then:
curl -X PATCH http://localhost:3000/api/orders/<ORDER_ID> \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=<TOKEN_FROM_BROWSER>" \
  -d '{"status":"confirmed"}'
```

Expected: `{"success":true,"order":{...}}` with updated status.

Without a session cookie, expected: `{"success":false,"message":"Unauthorized"}` with status 401 (enforced by middleware).

- [ ] **Step 4: Commit**

```bash
git add app/api/orders/[id]/route.ts
git commit -m "feat: add PATCH /api/orders/[id] route"
```

---

## Self-Review

- **Spec coverage:** All 7 items from the spec are implemented: auth fix (Task 1), login action + page (Tasks 2–3), logout (Task 4), order list (Task 5), update action + form + detail page (Tasks 6–8), PATCH route (Task 9). ✓
- **`ADMIN_PASSWORD` production guard:** included in `loginAction` (Task 2). ✓
- **`sendReadyDateEmail` null guard:** action only fires when `order.readyDate !== null`, matching the function's contract. ✓
- **`redirect()` placement:** always the last statement, never inside `try/catch`. ✓
- **Type consistency:** `updateOrderAction(orderId, _prevState, formData)` in Task 6 matches the `.bind(null, orderId)` usage in Task 7. ✓
