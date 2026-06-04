'use client'

import { useState } from 'react'
import Link from 'next/link'

function getBasePrice(qty: number): number {
  if (qty >= 100) return 2.00
  if (qty >= 50)  return 2.25
  return 2.75
}

function getTier(qty: number): string {
  if (qty >= 100) return '100+'
  if (qty >= 50)  return '50–99'
  return '20–49'
}

const MAX = 150

export default function PriceCalculator() {
  const [qty, setQty] = useState(20)
  const [personalization, setPersonalization] = useState<'single' | 'multiple'>('single')
  const [names, setNames] = useState('')
  const [decos, setDecos] = useState<Set<string>>(new Set())
  const [customDecoNote, setCustomDecoNote] = useState('')

  const toggleDeco = (key: string) => setDecos(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  const basePrice  = getBasePrice(qty)
  const nameAdd    = personalization === 'multiple' ? 0.50 : 0
  const decoAdd    = decos.size > 0 ? 0.25 : 0
  const perCookie  = basePrice + nameAdd + decoAdd
  const total      = qty * perCookie
  const fillPct    = ((qty - 20) / (MAX - 20)) * 100

  const nameCount = names.split('\n').filter(n => n.trim()).length

  return (
    <section className="max-w-2xl mx-auto px-8 pb-32">
      <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#8A7A82] mb-12">
        Bereken je bestelling
      </p>

      <div className="space-y-10">

        {/* Quantity slider */}
        <div>
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <span className="font-serif text-6xl text-[#2A1E22]">{qty}</span>
              <span className="font-sans text-sm text-[#8A7A82] ml-2">koekjes</span>
            </div>
            <div className="text-right">
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#C46480]">
                {getTier(qty)} koekjes
              </p>
              <p className="font-serif text-2xl text-[#C46480]">
                €{basePrice.toFixed(2)}
                <span className="font-sans text-xs text-[#8A7A82] ml-1">/ stuk</span>
              </p>
            </div>
          </div>

          <input
            type="range"
            min={20}
            max={MAX}
            step={1}
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            className="w-full slider-pink"
            style={{
              background: `linear-gradient(to right, #C46480 ${fillPct}%, #F0DDE5 ${fillPct}%)`,
            }}
          />
          <div className="relative font-sans text-[10px] text-[#8A7A82] mt-2 h-4">
            {([20, 50, 100, 150] as const).map((v) => (
              <span
                key={v}
                className="absolute -translate-x-1/2"
                style={{ left: `${((v - 20) / (MAX - 20)) * 100}%` }}
              >
                {v}
              </span>
            ))}
          </div>

          {qty === MAX && (
            <p className="font-sans text-xs text-[#C46480] mt-4">
              Meer dan 150 koekjes nodig?{' '}
              <a
                href="mailto:info@daphnesbakery.nl"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Stuur ons een e-mail!
              </a>
            </p>
          )}
        </div>

        {/* Personalization */}
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C46480] mb-4">
            Personalisatie
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPersonalization('single')}
              className="px-5 py-2.5 rounded-full font-sans text-[11px] uppercase tracking-[0.14em] transition-all"
              style={personalization === 'single'
                ? { backgroundColor: '#E0A0B8', color: 'white' }
                : { border: '1px solid #E0A0B8', color: '#C46480', backgroundColor: 'transparent' }
              }
            >
              Één naam (inbegrepen)
            </button>
            <button
              type="button"
              onClick={() => setPersonalization('multiple')}
              className="px-5 py-2.5 rounded-full font-sans text-[11px] uppercase tracking-[0.14em] transition-all"
              style={personalization === 'multiple'
                ? { backgroundColor: '#E0A0B8', color: 'white' }
                : { border: '1px solid #E0A0B8', color: '#C46480', backgroundColor: 'transparent' }
              }
            >
              Verschillende namen &nbsp;+€0,50
            </button>
          </div>

          {personalization === 'multiple' && (
            <div className="mt-5">
              <textarea
                value={names}
                onChange={e => setNames(e.target.value)}
                rows={5}
                placeholder={"Voer namen in, één per regel\nbv. Emma\nbv. Lotte\nbv. Sophie"}
                className="w-full border border-[#F0DDE5] bg-transparent px-4 py-3 font-sans text-sm text-[#2A1E22] focus:outline-none focus:border-[#E0A0B8] resize-none"
                style={{ color: '#2A1E22' }}
              />
              <p className="font-sans text-[10px] text-[#8A7A82] mt-1.5">
                {nameCount > 0 ? `${nameCount} naam${nameCount !== 1 ? 'men' : ''} ingevoerd` : 'Nog geen namen ingevoerd'}
              </p>
            </div>
          )}
        </div>

        {/* Decoration themes */}
        <div>
          <div className="flex items-baseline gap-3 mb-4">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C46480]">
              Thema decoratie
            </p>
            <span className="font-sans text-[10px] text-[#8A7A82]">+€0,25 / stuk</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'baby',    label: '🍼 Babythema' },
              { key: 'animals', label: '🐾 Diertjes'  },
              { key: 'custom',  label: '✏️ Anders'     },
            ].map(({ key, label }) => (
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
                value={customDecoNote}
                onChange={e => setCustomDecoNote(e.target.value)}
                placeholder="Omschrijf je gewenste decoratie…"
                className="w-full border border-[#F0DDE5] bg-transparent px-4 py-3 font-sans text-sm text-[#2A1E22] focus:outline-none focus:border-[#E0A0B8]"
              />
            </div>
          )}
        </div>

        {/* Total */}
        <div className="pt-8" style={{ borderTop: '1px solid #F0DDE5' }}>
          {/* Breakdown */}
          <div className="space-y-1.5 mb-6">
            <div className="flex justify-between font-sans text-xs text-[#8A7A82]">
              <span>{qty} × €{basePrice.toFixed(2)} (basisprijs)</span>
              <span>€{(qty * basePrice).toFixed(2)}</span>
            </div>
            {nameAdd > 0 && (
              <div className="flex justify-between font-sans text-xs text-[#8A7A82]">
                <span>{qty} × €0,50 (personalisatie)</span>
                <span>€{(qty * nameAdd).toFixed(2)}</span>
              </div>
            )}
            {decoAdd > 0 && (
              <div className="flex justify-between font-sans text-xs text-[#8A7A82]">
                <span>{qty} × €0,25 (thema decoratie)</span>
                <span>€{(qty * decoAdd).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#8A7A82]">
                Indicatieve prijs
              </p>
            </div>
            <span className="font-serif italic text-5xl" style={{ color: '#C46480' }}>
              €{total.toFixed(2)}
            </span>
          </div>

          <p className="font-sans text-[10px] text-[#8A7A82] mt-3">
            Indicatief · excl. bezorgkosten · definitieve bevestiging via e-mail
          </p>

          <Link
            href="/order"
            className="inline-flex items-center gap-4 mt-8 px-8 py-4 rounded-full font-sans text-[11px] uppercase tracking-[0.18em] text-white hover:opacity-85 transition-opacity"
            style={{ backgroundColor: '#E0A0B8' }}
          >
            Ga naar bestelling
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
