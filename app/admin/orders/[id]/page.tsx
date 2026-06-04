import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import UpdateOrderForm from './UpdateOrderForm'
import DeleteOrderButton from './DeleteOrderButton'

export const dynamic = 'force-dynamic'

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
    ['Bezorging',     order.deliveryMethod === 'pickup' ? 'Afhalen in Huizen' : `Bezorgen naar ${order.shippingAddress ?? '(geen adres)'}` ],
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

        <div className="pt-6 border-t border-bisque">
          <DeleteOrderButton orderId={order.id} />
        </div>
      </main>
    </div>
  )
}
