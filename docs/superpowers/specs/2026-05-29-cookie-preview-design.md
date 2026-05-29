# Cookie Preview Feature — Design Spec
_2026-05-29_

## Overview

Customers can personalise their cookie by typing two lines of text and picking an icing colour. A live SVG preview (scalloped-edge royal-iced cookie, Cutive Mono typewriter font, debossed text) updates in real time on the order form. At submission, the preview is rasterised server-side to a PNG and embedded in the order confirmation email.

---

## Confirmed design decisions

| Decision | Choice |
|---|---|
| Cookie shape | Scalloped edge (22 bumps, algorithmically generated SVG path) |
| Icing | Flat flood fill, slight radial gradient + gloss highlight |
| Font | Cutive Mono (Google Fonts) |
| Text lines | 2: Line 1 small caps (max 22 chars), Line 2 large (max 14 chars) |
| Text effect | Debossed — same hue as icing but ~35% darker, SVG feDropShadow filter |
| Colours | 4 predefined: white (#F5F0E8), yellow (#F5E080), pink (#FFAEC0), blue (#A8C8E0) |
| Personalisation | Optional — orders without text are valid |
| Email format | PNG rasterised server-side, embedded as base64 data URL |
| Rasterisation | `satori` + `@resvg/resvg-js` — no HTTP round-trip needed |

---

## Data model changes

### `prisma/schema.prisma` — two new optional fields on `Order`

```prisma
personalizationLine1  String?
personalizationLine2  String?
```

A migration is required. Both fields are nullable so existing orders are unaffected.

### `lib/types.ts` — extend `CreateOrderSchema`

```ts
personalizationLine1: z.string().max(22).optional(),
personalizationLine2: z.string().max(14).optional(),
```

---

## Components and files

### 1. `app/order/CookiePreview.tsx` — client component

- Accepts: `color: string`, `line1: string`, `line2: string`
- Renders the scalloped SVG cookie as described above
- `scallopPath(cx, cy, R, r, N)` helper computes the valley points and returns an SVG path `d` string — runs on mount via `useEffect` to avoid SSR mismatch
- Text colour derived from icing colour: `deriveTextColor(hex)` — darkens by ~35% using HSL manipulation
- Google Font loaded via `<link>` in `app/layout.tsx` (Cutive Mono)
- No external state — purely presentational; parent controls values

### 2. `lib/cookie-image.ts` — server-only rasteriser

```ts
export async function generateCookiePreviewPng(params: {
  color: string
  line1: string
  line2: string
}): Promise<string | null> // base64 data URL on success, null on failure
```

- Uses `satori` to render a React-compatible JSX element (the cookie design) to SVG
- Passes Cutive Mono font data loaded from `public/fonts/CutiveMono-Regular.ttf`
- Converts SVG → PNG buffer via `@resvg/resvg-js`
- Returns `data:image/png;base64,...`
- Wrapped in try/catch — on failure returns `null`; email sends without image rather than failing

### 3. `app/order/order-form.tsx` — updated

New controlled state added:
- `personalizationLine1` (string, default `''`)
- `personalizationLine2` (string, default `''`)
- `color` (string, default `'white'`) — `cookieColor` radio buttons converted from uncontrolled (`defaultChecked`) to controlled so the preview can react to colour changes; the hidden input value is kept in sync

Layout change: after the colour swatch row, add a "Personalisatie" section containing:
- Input for Line 1 with char counter (22 max)
- Input for Line 2 with char counter (14 max)  
- `<CookiePreview>` rendered below the inputs, updating live

Both fields are optional — form submits normally if left empty.

### 4. `app/actions.ts` — updated `createOrder`

- Read `personalizationLine1` and `personalizationLine2` from `formData`
- Include them in the `CreateOrderSchema.safeParse()` call
- Pass to `db.order.create()`
- After creating the order, if either personalisation field is non-empty, call `generateCookiePreviewPng` and store the result as a local variable
- Pass the preview PNG data URL into `sendOrderConfirmationEmail(order, previewPng)`

### 5. `emails/order-confirmation.tsx` — updated

- Accept optional `previewPng: string | null` as a second argument (or extend the function signature)
- If `previewPng` is present, render an `<Img>` block above the order details:
  ```tsx
  <Img src={previewPng} width={200} height={200} alt="Jouw koekje preview" />
  ```
- If absent, render nothing (graceful fallback)

---

## Data flow

```
Customer fills form
  └─ line1 / line2 / color change
       └─ CookiePreview.tsx re-renders live SVG

Customer submits
  └─ createOrder Server Action
       ├─ validates with CreateOrderSchema
       ├─ db.order.create(...)
       ├─ generateCookiePreviewPng({ color, line1, line2 })  ← satori + resvg
       │    └─ returns base64 PNG or null on error
       └─ Promise.allSettled([
              sendNewOrderEmail(order),
              sendOrderConfirmationEmail(order, previewPng)
          ])
```

---

## Error handling

- `generateCookiePreviewPng` failure → log error, `previewPng = null` → email sends without image, order is not affected
- `satori` font load failure → same fallback
- Form fields empty → both personalisation fields omitted from DB record; preview section simply stays empty in email

---

## New dependencies

| Package | Purpose |
|---|---|
| `satori` | JSX → SVG rasteriser |
| `@resvg/resvg-js` | SVG → PNG conversion |

Font file: `public/fonts/CutiveMono-Regular.ttf` (downloaded from Google Fonts, committed to repo).

---

## Out of scope

- Multiple font choices (Cutive Mono only)
- Cookie shape other than scalloped round
- More than 2 text lines
- Custom colours beyond the 4 predefined options
- Storing the generated PNG (generated fresh per email send, not persisted)
