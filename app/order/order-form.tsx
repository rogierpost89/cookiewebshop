'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createOrder } from '@/app/actions'
import CookiePreview from './CookiePreview'

const COOKIE_TYPES = [
  { id: 'butter', name: 'Classic Butter', price: 18 },
  { id: 'chocolate', name: 'Chocolate Dip', price: 22 },
  { id: 'royal', name: 'Royal Iced', price: 28 },
]

const COLOR_SWATCHES = [
  { value: 'white', label: 'Wit', bg: '#F5F0E8', ring: '#C0B4B4' },
  { value: 'yellow', label: 'Geel', bg: '#F5E080', ring: '#C0A840' },
  { value: 'pink', label: 'Roze', bg: '#FFAEC0', ring: '#A8606E' },
  { value: 'blue', label: 'Blauw', bg: '#A8C8E0', ring: '#7D8FA1' },
]

const COLOR_HEX: Record<string, string> = {
  white: '#F5F0E8',
  yellow: '#F5E080',
  pink: '#FFAEC0',
  blue: '#A8C8E0',
}

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
  const [color, setColor] = useState('white')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')

  const defaultName =
    COOKIE_TYPES.find((c) => c.id === initialType)?.name ?? COOKIE_TYPES[0].name

  return (
    <div className="min-h-full">
      <header className="border-b border-bisque">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/" className="font-sans text-sm text-taupe hover:text-primary transition-colors">
            ← Terug
          </Link>
          <span className="text-bisque">|</span>
          <span className="font-serif text-xl text-primary">Cookie Atelier</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl text-espresso mb-2">Jouw bestelling</h1>
        <p className="font-sans text-sm text-taupe mb-12">
          Bestellingen voor vrijdag worden de volgende maandag bezorgd.
        </p>

        {error && (
          <div className="mb-8 px-5 py-4 border border-red-200 bg-red-50 font-sans text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={formAction} className="space-y-10">
          {/* Cookie type */}
          <fieldset>
            <legend className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
              Soort koekje
            </legend>
            <div className="grid grid-cols-3 gap-px bg-bisque border border-bisque">
              {COOKIE_TYPES.map((c) => (
                <label key={c.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="cookieName"
                    value={c.name}
                    defaultChecked={c.name === defaultName}
                    className="sr-only peer"
                  />
                  <div className="bg-parchment px-4 py-4 peer-checked:bg-surface peer-checked:shadow-[inset_0_0_0_1px_#A8606E] text-center transition-colors">
                    <p className="font-serif text-lg text-espresso">{c.name}</p>
                    <p className="font-sans text-xs text-taupe mt-1">€{c.price}/dozijn</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Color — controlled for live preview */}
          <fieldset>
            <legend className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
              Kleur glazuur
            </legend>
            <div className="flex gap-5">
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
            </div>
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
                    Regel 1 — kleine tekst
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="personalizationLine1"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      maxLength={22}
                      placeholder="Bv. Mr &amp; Mrs"
                      className="w-full border border-bisque bg-surface px-4 py-3 font-mono text-sm text-espresso focus:outline-none focus:border-primary"
                      style={{ fontFamily: 'var(--font-cutive-mono), monospace' }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[10px] text-taupe">
                      {line1.length}/22
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-xs text-taupe mb-2">
                    Regel 2 — grote tekst
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="personalizationLine2"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      maxLength={14}
                      placeholder="Bv. Dawson"
                      className="w-full border border-bisque bg-surface px-4 py-3 font-mono text-sm text-espresso focus:outline-none focus:border-primary"
                      style={{ fontFamily: 'var(--font-cutive-mono), monospace' }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[10px] text-taupe">
                      {line2.length}/14
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-accent">
                  Preview
                </span>
                <CookiePreview
                  color={COLOR_HEX[color] ?? '#F5F0E8'}
                  line1={line1}
                  line2={line2}
                />
              </div>
            </div>
          </div>

          {/* Quantity + deadline */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
                Aantal dozijn
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                max="500"
                defaultValue="1"
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
                      {method === 'pickup' ? 'Gratis · Amsterdam' : '€4,50 bezorgkosten'}
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
            <div className="grid grid-cols-2 gap-6">
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
            className="w-full py-4 bg-primary text-surface font-sans text-sm tracking-wide hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {pending ? 'Bestelling verwerken…' : 'Bestelling plaatsen'}
          </button>
        </form>
      </main>
    </div>
  )
}
