# Decoratie-opties & Meerdere Namen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Voeg personalisatie-type toggle (één / verschillende namen) en decoratie-thema's toe aan het bestelformulier, sla ze op in de database en stuur ze mee in de baker-e-mail.

**Architecture:** DB-migratie voegt 3 nullable kolommen toe; het formulier krijgt nieuwe state en UI-secties die de stijl van PriceCalculator volgen; de server action extraheert de nieuwe velden en slaat ze op; de baker-e-mail toont de nieuwe velden.

**Tech Stack:** Next.js App Router, Prisma (PostgreSQL), Zod, React `useState`, `@react-email/components`, Resend

---

## Bestanden

| Actie | Pad |
|-------|-----|
| Wijzigen | `prisma/schema.prisma` |
| Wijzigen | `lib/types.ts` |
| Wijzigen | `app/order/order-form.tsx` |
| Wijzigen | `app/actions.ts` |
| Wijzigen | `emails/new-order.tsx` |

---

### Task 1: DB-migratie — nieuwe velden toevoegen

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Stap 1: Voeg de drie nieuwe velden toe aan het Order-model**

Open `prisma/schema.prisma` en voeg deze drie regels toe ná `personalizationLine2 String?`:

```prisma
  personalizationType  String?
  namesInput           String?
  decorationThemes     String?
```

Het volledige model ziet er dan zo uit:

```prisma
model Order {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  customerName    String
  customerEmail   String
  cookieColor     String
  cookieName      String
  quantity        Int
  deadline        DateTime
  deliveryMethod  String
  shippingAddress String?
  status          String    @default("pending")
  readyDate       DateTime?
  notes                String?
  personalizationLine1 String?
  personalizationLine2 String?
  personalizationType  String?
  namesInput           String?
  decorationThemes     String?
}
```

- [ ] **Stap 2: Pas de migratie toe en regenereer de Prisma client**

```bash
npx prisma db push
```

Verwacht output: `Your database is now in sync with your Prisma schema.`

- [ ] **Stap 3: Verifieer dat de nieuwe kolommen bestaan**

```bash
npx prisma studio
```

Open `Order` tabel — de kolommen `personalizationType`, `namesInput`, `decorationThemes` staan er nu in (leeg voor bestaande rijen). Sluit Prisma Studio weer.

- [ ] **Stap 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add personalizationType, namesInput, decorationThemes to Order schema"
```

---

### Task 2: Zod-schema updaten

**Files:**
- Modify: `lib/types.ts`

- [ ] **Stap 1: Voeg de nieuwe velden toe aan CreateOrderSchema**

In `lib/types.ts`, voeg drie regels toe in het `CreateOrderSchema`-object, ná `personalizationLine2`:

```typescript
export const CreateOrderSchema = z
  .object({
    customerName: z.string().min(1).max(100),
    customerEmail: z.string().email(),
    cookieName: z.string().min(1).max(50),
    cookieColor: z.enum(["pink", "white", "blue", "yellow", "custom"]),
    quantity: z.number().int().min(20).max(500),
    deliveryMethod: z.enum(["pickup", "delivery"]),
    deadline: z.coerce.date(),
    shippingAddress: z.string().min(1).optional(),
    notes: z.string().optional(),
    personalizationLine1: z.string().max(14).optional(),
    personalizationLine2: z.string().max(22).optional(),
    personalizationType: z.enum(["single", "multiple"]).optional().default("single"),
    namesInput: z.string().optional(),
    decorationThemes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "delivery" && !data.shippingAddress) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingAddress"],
        message: "shippingAddress is required when deliveryMethod is 'delivery'",
      });
    }
  });
```

- [ ] **Stap 2: Controleer dat TypeScript geen fouten meldt**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Stap 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add personalizationType, namesInput, decorationThemes to CreateOrderSchema"
```

---

### Task 3: Bestelformulier UI

**Files:**
- Modify: `app/order/order-form.tsx`

Dit is de grootste wijziging. Vervang de volledige inhoud van `app/order/order-form.tsx` door onderstaande versie. Wijzigingen t.o.v. het origineel zijn:
1. Nieuwe state-variabelen: `personalizationType`, `namesInput`, `decos`, `customDecoNote`
2. `toggleDeco` helperfunctie
3. Bijgewerkte prijsberekening (nameAdd, decoAdd, perCookie)
4. Personalisatie-toggle boven de tekstvelden
5. Conditionele weergave: single → line1/line2 + preview; multiple → namen-textarea
6. Nieuwe decoratie-sectie na personalisatie
7. Hidden inputs voor `personalizationType` en `decorationThemes`
8. Totaalprijs gebruikt nu `perCookie`

- [ ] **Stap 1: Vervang de inhoud van `app/order/order-form.tsx`**

```tsx
'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createOrder } from '@/app/actions'
import CookiePreview from './CookiePreview'
import { getBasePrice } from '@/lib/pricing'

const TYPE_TO_COLOR: Record<string, string> = {
  roze:   'pink',
  blauw:  'blue',
  ivoor:  'white',
  custom: 'custom',
}

const COLOR_SWATCHES = [
  { value: 'pink',  label: 'Roze',  bg: '#E0A0B8', ring: '#C46480' },
  { value: 'blue',  label: 'Blauw', bg: '#8CC4D0', ring: '#5A9AAE' },
  { value: 'white', label: 'Ivoor', bg: '#F5F0E8', ring: '#C0B4B4' },
]

const DECO_OPTIONS = [
  { key: 'baby',    label: '🍼 Babythema' },
  { key: 'animals', label: '🐾 Diertjes'  },
  { key: 'custom',  label: '✏️ Anders'     },
]

function computeMinDeadlineDate() {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toISOString().split('T')[0]
}

function computeDefaultDeadlineDate() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().split('T')[0]
}

interface OrderFormProps {
  initialType?: string
}

export default function OrderForm({ initialType = '' }: OrderFormProps) {
  const [error, formAction, pending] = useActionState(createOrder, null)
  const [delivery, setDelivery] = useState<'pickup' | 'delivery'>('pickup')
  const [color, setColor] = useState(TYPE_TO_COLOR[initialType] ?? 'pink')
  const [customColorNote, setCustomColorNote] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [qty, setQty] = useState(20)
  const [minDate] = useState(computeMinDeadlineDate)
  const [deadline, setDeadline] = useState(computeDefaultDeadlineDate)
  const [personalizationType, setPersonalizationType] = useState<'single' | 'multiple'>('single')
  const [namesInput, setNamesInput] = useState('')
  const [decos, setDecos] = useState<Set<string>>(new Set())
  const [customDecoNote, setCustomDecoNote] = useState('')

  const toggleDeco = (key: string) => setDecos(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  const MAX_QTY = 150
  const fillPct = ((qty - 20) / (MAX_QTY - 20)) * 100
  const nameAdd = personalizationType === 'multiple' ? 0.50 : 0
  const decoAdd = decos.size > 0 ? 0.25 : 0
  const perCookie = getBasePrice(qty) + nameAdd + decoAdd

  const nameCount = namesInput.split('\n').filter(n => n.trim()).length

  return (
    <div className="min-h-full">
      <div style={{ height: "4px", background: "var(--gradient-h)" }} />
      <header className="border-b border-bisque bg-surface">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/" className="font-sans text-sm text-taupe hover:text-primary transition-colors">
            ← Terug
          </Link>
          <span className="text-bisque">|</span>
          <span
            className="font-serif text-xl tracking-wide"
            style={{
              background: "linear-gradient(90deg, #C46480, #b87090)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Daphne&apos;s Bakery
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl text-espresso mb-2">Jouw bestelling</h1>
        <p className="font-sans text-sm text-taupe mb-12">
          Neem gerust contact op bij vragen.
        </p>

        {error && (
          <div className="mb-8 px-5 py-4 border border-red-200 bg-red-50 font-sans text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={formAction} className="space-y-10">
          <input type="hidden" name="cookieName" value="Fondantkoekje" />

          {/* Color */}
          <fieldset>
            <legend className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
              Kleur glazuur
            </legend>
            <div className="flex gap-5 flex-wrap">
              {COLOR_SWATCHES.map((swatch) => (
                <label key={swatch.value} className="cursor-pointer flex flex-col items-center gap-1.5">
                  <input
                    type="radio"
                    name="cookieColor"
                    value={swatch.value}
                    checked={color === swatch.value}
                    onChange={() => setColor(swatch.value)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-9 h-9 rounded-full border-2 peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary transition-all"
                    style={{ backgroundColor: swatch.bg, borderColor: swatch.ring }}
                  />
                  <span className="font-sans text-[10px] text-taupe">{swatch.label}</span>
                </label>
              ))}
              <label className="cursor-pointer flex flex-col items-center gap-1.5">
                <input
                  type="radio"
                  name="cookieColor"
                  value="custom"
                  checked={color === 'custom'}
                  onChange={() => setColor('custom')}
                  className="sr-only peer"
                />
                <div className="w-9 h-9 rounded-full border-2 border-dashed peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary transition-all flex items-center justify-center"
                  style={{ borderColor: '#C46480', backgroundColor: 'transparent' }}>
                  <span style={{ color: '#C46480', fontSize: '1.1rem', lineHeight: 1 }}>+</span>
                </div>
                <span className="font-sans text-[10px] text-taupe">Anders</span>
              </label>
            </div>
            {color === 'custom' && (
              <div className="mt-4">
                <input
                  type="text"
                  name="customColorNote"
                  value={customColorNote}
                  onChange={(e) => setCustomColorNote(e.target.value)}
                  placeholder="Beschrijf je kleur, bv. mint groen, zalm roze…"
                  className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-[#E0A0B8]"
                />
                <p className="font-sans text-[10px] text-taupe mt-1.5">
                  Op aanvraag — we bevestigen beschikbaarheid via e-mail.
                </p>
              </div>
            )}
          </fieldset>

          {/* Personalisation */}
          <div className="pt-2">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
              Tekst op het koekje{' '}
              <span className="normal-case text-taupe font-sans text-xs">(optioneel)</span>
            </p>

            {/* Personalization type toggle */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                type="button"
                onClick={() => setPersonalizationType('single')}
                className="px-5 py-2.5 rounded-full font-sans text-[11px] uppercase tracking-[0.14em] transition-all"
                style={personalizationType === 'single'
                  ? { backgroundColor: '#E0A0B8', color: 'white' }
                  : { border: '1px solid #E0A0B8', color: '#C46480', backgroundColor: 'transparent' }
                }
              >
                Één naam (inbegrepen)
              </button>
              <button
                type="button"
                onClick={() => setPersonalizationType('multiple')}
                className="px-5 py-2.5 rounded-full font-sans text-[11px] uppercase tracking-[0.14em] transition-all"
                style={personalizationType === 'multiple'
                  ? { backgroundColor: '#E0A0B8', color: 'white' }
                  : { border: '1px solid #E0A0B8', color: '#C46480', backgroundColor: 'transparent' }
                }
              >
                Verschillende namen &nbsp;+€0,50
              </button>
            </div>
            <input type="hidden" name="personalizationType" value={personalizationType} />

            {personalizationType === 'single' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-5">
                  <div>
                    <label className="block font-sans text-xs text-taupe mb-2">
                      Regel 1 — grote tekst
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="personalizationLine1"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        maxLength={14}
                        placeholder="Bv. Emma"
                        className="w-full border border-bisque bg-surface px-4 py-3 font-mono text-sm text-espresso focus:outline-none focus:border-primary"
                        style={{ fontFamily: 'var(--font-cutive-mono), monospace' }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[10px] text-taupe">
                        {line1.length}/14
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-sans text-xs text-taupe mb-2">
                      Regel 2 — kleine tekst
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="personalizationLine2"
                        value={line2}
                        onChange={(e) => setLine2(e.target.value)}
                        maxLength={22}
                        placeholder="Bv. 4 jaar"
                        className="w-full border border-bisque bg-surface px-4 py-3 font-mono text-sm text-espresso focus:outline-none focus:border-primary"
                        style={{ fontFamily: 'var(--font-cutive-mono), monospace' }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[10px] text-taupe">
                        {line2.length}/22
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-accent">
                    Preview
                  </span>
                  <CookiePreview colorKey={color} line1={line1} line2={line2} />
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-sans text-xs text-taupe mb-2">
                  Namen (één per regel)
                </label>
                <textarea
                  name="namesInput"
                  value={namesInput}
                  onChange={e => setNamesInput(e.target.value)}
                  rows={5}
                  placeholder={"Voer namen in, één per regel\nbv. Emma\nbv. Lotte\nbv. Sophie"}
                  className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary resize-none"
                />
                <p className="font-sans text-[10px] text-taupe mt-1.5">
                  {nameCount > 0 ? `${nameCount} naam${nameCount !== 1 ? 'men' : ''} ingevoerd` : 'Nog geen namen ingevoerd'}
                </p>
              </div>
            )}
          </div>

          {/* Decoration themes */}
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent">
                Thema decoratie
              </p>
              <span className="font-sans text-[10px] text-taupe">(optioneel) +€0,25 / stuk</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {DECO_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDeco(key)}
                  className="px-5 py-2.5 rounded-full font-sans text-[11px] uppercase tracking-[0.14em] transition-all"
                  style={decos.has(key)
                    ? { backgroundColor: '#E0A0B8', color: 'white' }
                    : { border: '1px solid #E0A0B8', color: '#C46480', backgroundColor: 'transparent' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            {decos.has('custom') && (
              <div className="mt-4">
                <input
                  type="text"
                  name="customDecoNote"
                  value={customDecoNote}
                  onChange={e => setCustomDecoNote(e.target.value)}
                  placeholder="Omschrijf je gewenste decoratie…"
                  className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
                />
              </div>
            )}
            <input type="hidden" name="decorationThemes" value={[...decos].join(',')} />
          </div>

          {/* Quantity slider */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <label className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent">
                Aantal koekjes
              </label>
              <div className="text-right">
                <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-[#C46480]">
                  €{perCookie.toFixed(2)} / stuk
                </span>
                <p className="font-sans text-sm font-medium text-espresso mt-0.5">
                  Totaal: €{(qty * perCookie + (delivery === 'delivery' ? 4.5 : 0)).toFixed(2)}
                  {delivery === 'delivery' && (
                    <span className="font-sans text-[10px] text-taupe font-normal ml-1">(incl. bezorging)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <input
                type="range"
                min={20}
                max={MAX_QTY}
                step={1}
                value={qty}
                onChange={e => setQty(Number(e.target.value))}
                className="flex-1 slider-pink"
                style={{ background: `linear-gradient(to right, #C46480 ${fillPct}%, #F0DDE5 ${fillPct}%)` }}
              />
              <input
                type="number"
                name="quantity"
                min="20"
                max={MAX_QTY}
                value={qty}
                onChange={e => {
                  const v = Math.min(MAX_QTY, Math.max(20, Number(e.target.value)))
                  setQty(v)
                }}
                className="w-20 border border-bisque bg-surface px-3 py-2 font-sans text-sm text-espresso text-center focus:outline-none focus:border-primary"
              />
            </div>

            <div className="relative font-sans text-[10px] text-[#8A7A82] h-4 mb-1">
              {([20, 50, 100, 150] as const).map(v => (
                <span key={v} className="absolute -translate-x-1/2" style={{ left: `${((v - 20) / (MAX_QTY - 20)) * 100}%` }}>
                  {v}
                </span>
              ))}
            </div>

            {qty >= MAX_QTY && (
              <p className="font-sans text-xs text-[#C46480] mt-2">
                Meer dan 150 koekjes nodig?{' '}
                <a href="mailto:info@daphnesbakery.nl" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
                  Stuur ons een e-mail!
                </a>
              </p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
              Gewenste datum
            </label>
            <input
              type="date"
              name="deadline"
              min={minDate}
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
            />
          </div>

          {/* Delivery method */}
          <fieldset>
            <legend className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
              Bezorging
            </legend>
            <div className="grid grid-cols-2 gap-px bg-bisque border border-bisque">
              {(['pickup', 'delivery'] as const).map((method) => (
                <label key={method} className="cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={method}
                    checked={delivery === method}
                    onChange={() => setDelivery(method)}
                    className="sr-only peer"
                  />
                  <div className="bg-parchment px-4 py-4 peer-checked:bg-surface peer-checked:shadow-[inset_0_0_0_1px_#A8606E] text-center transition-colors">
                    <p className="font-serif text-lg text-espresso">
                      {method === 'pickup' ? 'Afhalen' : 'Bezorgen'}
                    </p>
                    <p className="font-sans text-xs text-taupe mt-1">
                      {method === 'pickup' ? 'Gratis · Huizen' : '€4,50 bezorgkosten'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {delivery === 'delivery' && (
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
                Bezorgadres
              </label>
              <textarea
                name="shippingAddress"
                rows={3}
                placeholder="Straat + huisnummer, postcode, stad"
                className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary resize-none"
              />
            </div>
          )}

          {/* Customer details */}
          <div className="space-y-5 pt-6 border-t border-bisque">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent">
              Jouw gegevens
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-xs text-taupe mb-2">Naam</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-taupe mb-2">E-mailadres</label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
              Opmerkingen{' '}
              <span className="normal-case text-taupe font-sans text-xs">(optioneel)</span>
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Speciale wensen, allergieën, decoratie..."
              className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-4 text-white font-sans text-sm tracking-wide hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            style={{ background: "var(--gradient)", boxShadow: "0 2px 16px rgba(196,100,128,0.2)" }}
          >
            {pending ? 'Bestelling verwerken…' : 'Bestelling plaatsen'}
          </button>
        </form>
      </main>
    </div>
  )
}
```

- [ ] **Stap 2: Controleer dat TypeScript geen fouten meldt**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Stap 3: Commit**

```bash
git add app/order/order-form.tsx
git commit -m "feat: add personalization type toggle and decoration themes to order form"
```

---

### Task 4: Server Action updaten

**Files:**
- Modify: `app/actions.ts`

- [ ] **Stap 1: Vervang de inhoud van `app/actions.ts`**

```typescript
'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { CreateOrderSchema } from '@/lib/types'
import { sendNewOrderEmail, sendOrderConfirmationEmail } from '@/lib/email'

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function createOrder(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const customColorNote = (formData.get('customColorNote') as string) || ''
  const customDecoNote  = (formData.get('customDecoNote')  as string) || ''
  const notesRaw        = (formData.get('notes')           as string) || ''

  let notes = notesRaw
  if (customColorNote) notes = `Kleur aanvraag: ${customColorNote}${notes ? '\n' + notes : ''}`
  if (customDecoNote)  notes = `${notes ? notes + '\n' : ''}Decoratie aanvraag: ${customDecoNote}`

  const raw = {
    customerName:         formData.get('customerName')         as string,
    customerEmail:        formData.get('customerEmail')        as string,
    cookieName:           formData.get('cookieName')           as string,
    cookieColor:          formData.get('cookieColor')          as string,
    quantity:             Number(formData.get('quantity')),
    deliveryMethod:       formData.get('deliveryMethod')       as string,
    deadline:             formData.get('deadline')             as string,
    shippingAddress:      (formData.get('shippingAddress')     as string) || undefined,
    notes:                notes || undefined,
    personalizationLine1: (formData.get('personalizationLine1') as string) || undefined,
    personalizationLine2: (formData.get('personalizationLine2') as string) || undefined,
    personalizationType:  (formData.get('personalizationType')  as string) || 'single',
    namesInput:           (formData.get('namesInput')           as string) || undefined,
    decorationThemes:     (formData.get('decorationThemes')     as string) || undefined,
  }

  const result = CreateOrderSchema.safeParse(raw)
  if (!result.success) {
    return result.error.issues[0].message
  }

  const data = result.data
  const order = await db.order.create({
    data: {
      customerName:         data.customerName,
      customerEmail:        data.customerEmail,
      cookieName:           data.cookieName,
      cookieColor:          data.cookieColor,
      quantity:             data.quantity,
      deadline:             data.deadline,
      deliveryMethod:       data.deliveryMethod,
      shippingAddress:      data.shippingAddress      ?? null,
      notes:                data.notes                ?? null,
      personalizationLine1: data.personalizationLine1 ?? null,
      personalizationLine2: data.personalizationLine2 ?? null,
      personalizationType:  data.personalizationType  ?? null,
      namesInput:           data.namesInput            ?? null,
      decorationThemes:     data.decorationThemes      ?? null,
    },
  })

  const hasPersonalization = !!(
    data.personalizationLine1 || data.personalizationLine2 || data.namesInput
  )
  const previewUrl = hasPersonalization
    ? `${getBaseUrl()}/api/cookie-preview/${order.id}`
    : null

  const [bakerResult, confirmResult] = await Promise.allSettled([
    sendNewOrderEmail(order),
    sendOrderConfirmationEmail(order, previewUrl),
  ])
  if (bakerResult.status === 'rejected') {
    console.error('[email] baker notification failed:', bakerResult.reason)
  }
  if (confirmResult.status === 'rejected') {
    console.error('[email] customer confirmation failed:', confirmResult.reason)
  }

  redirect(`/confirmation/${order.id}`)
}
```

- [ ] **Stap 2: Controleer dat TypeScript geen fouten meldt**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Stap 3: Commit**

```bash
git add app/actions.ts
git commit -m "feat: extract and save personalizationType, namesInput, decorationThemes in createOrder"
```

---

### Task 5: Baker-e-mail updaten

**Files:**
- Modify: `emails/new-order.tsx`

- [ ] **Stap 1: Vervang de inhoud van `emails/new-order.tsx`**

Voeg een nieuwe sectie toe tussen "Besteldetails" en "Bezorgadres" voor personalisatie en decoratie. Vervang de volledige inhoud:

```tsx
import { Html, Head, Body, Section, Text, Heading, Hr } from "@react-email/components";
import { Order } from "@prisma/client";

interface NewOrderEmailProps {
  order: Order;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(date);

const deliveryMethodLabel = (method: string) =>
  method === "delivery" ? "Bezorging" : "Afhalen";

const decoThemeLabel = (key: string) => {
  switch (key) {
    case 'baby':    return '🍼 Babythema'
    case 'animals': return '🐾 Diertjes'
    case 'custom':  return '✏️ Anders'
    default:        return key
  }
}

export const newOrderSubject = "Nieuwe bestelling ontvangen";

export default function NewOrderEmail({ order }: NewOrderEmailProps) {
  const decoThemes = order.decorationThemes
    ? order.decorationThemes.split(',').filter(Boolean).map(decoThemeLabel).join(', ')
    : null

  return (
    <Html lang="nl">
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", margin: 0, padding: 0 }}>
        <Section style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
          <Heading as="h1" style={{ color: "#333333", fontSize: "24px", marginBottom: "8px" }}>
            Nieuwe bestelling
          </Heading>
          <Text style={{ color: "#666666", fontSize: "14px", marginTop: 0 }}>
            Er is een nieuwe bestelling binnengekomen.
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />

          <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
            Klantgegevens
          </Heading>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Naam:</strong> {order.customerName}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>E-mail:</strong> {order.customerEmail}
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />

          <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
            Besteldetails
          </Heading>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Koekje:</strong> {order.cookieName}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Kleur:</strong> {order.cookieColor}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Aantal:</strong> {order.quantity}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Deadline:</strong> {formatDate(order.deadline)}
          </Text>
          <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
            <strong>Leveringsmethode:</strong> {deliveryMethodLabel(order.deliveryMethod)}
          </Text>

          {/* Personalisatie & decoratie */}
          {(order.personalizationType === 'multiple' || order.personalizationLine1 || order.personalizationLine2 || decoThemes) && (
            <>
              <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
              <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
                Personalisatie &amp; Decoratie
              </Heading>
              {order.personalizationType === 'multiple' ? (
                <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0", whiteSpace: "pre-line" }}>
                  <strong>Namen (verschillende):</strong>{"\n"}{order.namesInput}
                </Text>
              ) : (
                <>
                  {order.personalizationLine1 && (
                    <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                      <strong>Tekst regel 1:</strong> {order.personalizationLine1}
                    </Text>
                  )}
                  {order.personalizationLine2 && (
                    <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                      <strong>Tekst regel 2:</strong> {order.personalizationLine2}
                    </Text>
                  )}
                </>
              )}
              {decoThemes && (
                <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                  <strong>Decoratie-thema:</strong> {decoThemes}
                </Text>
              )}
            </>
          )}

          {order.deliveryMethod === "delivery" && order.shippingAddress && (
            <>
              <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
              <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
                Bezorgadres
              </Heading>
              <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                {order.shippingAddress}
              </Text>
            </>
          )}

          {order.notes && (
            <>
              <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
              <Heading as="h2" style={{ color: "#333333", fontSize: "18px", marginBottom: "16px" }}>
                Opmerkingen
              </Heading>
              <Text style={{ color: "#333333", fontSize: "15px", margin: "4px 0" }}>
                {order.notes}
              </Text>
            </>
          )}

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0" }} />
          <Text style={{ color: "#999999", fontSize: "12px" }}>
            Bestelling ID: {order.id} — Ontvangen op {formatDate(order.createdAt)}
          </Text>
        </Section>
      </Body>
    </Html>
  );
}
```

- [ ] **Stap 2: Controleer dat TypeScript geen fouten meldt**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Stap 3: Commit**

```bash
git add emails/new-order.tsx
git commit -m "feat: show personalization type, names, and decoration themes in baker email"
```

---

## Verificatie

Na alle taken:

1. Open `http://localhost:3000/order`
2. Klik op "Verschillende namen" → line1/line2 verdwijnen, namen-textarea verschijnt. Counter toont aantal ingevoerde namen. Totaalprijs stijgt met €0,50/stuk.
3. Klik terug op "Één naam" → line1/line2 + preview verschijnen weer.
4. Klik "🍼 Babythema" → knop kleurt roze, totaalprijs stijgt met €0,25/stuk.
5. Klik "✏️ Anders" → tekstveld voor decoratie-omschrijving verschijnt.
6. Vul het formulier in en verstuur → controleer in de DB (Prisma Studio) dat `personalizationType`, `namesInput`, `decorationThemes` correct zijn opgeslagen.
