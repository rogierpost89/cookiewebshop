'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createOrder } from '@/app/actions'
import CookiePreview from './CookiePreview'

const TYPE_TO_COLOR: Record<string, string> = {
  roze:  'pink',
  blauw: 'blue',
  ivoor: 'white',
}

const COLOR_SWATCHES = [
  { value: 'pink',  label: 'Roze',  bg: '#E0A0B8', ring: '#C46480' },
  { value: 'blue',  label: 'Blauw', bg: '#8CC4D0', ring: '#5A9AAE' },
  { value: 'white', label: 'Ivoor', bg: '#F5F0E8', ring: '#C0B4B4' },
]

function minDeadlineDate() {
  const d = new Date()
  d.setDate(d.getDate() + 3)
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

          {/* Color — controlled for live preview */}
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
              {/* Custom colour option */}
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

          {/* Personalisation + live preview */}
          <div className="pt-2">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-6">
              Tekst op het koekje{' '}
              <span className="normal-case text-taupe font-sans text-xs">(optioneel)</span>
            </p>
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
                      placeholder="Bv. Dawson"
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
                      placeholder="Bv. Mr &amp; Mrs"
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
                <CookiePreview
                  colorKey={color}
                  line1={line1}
                  line2={line2}
                />
              </div>
            </div>
          </div>

          {/* Quantity + deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
                Aantal koekjes
              </label>
              <input
                type="number"
                name="quantity"
                min="20"
                max="500"
                defaultValue="20"
                className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
                Gewenste datum
              </label>
              <input
                type="date"
                name="deadline"
                min={minDeadlineDate()}
                className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
              />
            </div>
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
