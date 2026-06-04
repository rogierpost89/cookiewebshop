import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'

const COLOR_LABELS: Record<string, string> = {
  pink: 'Roze',
  white: 'Wit',
  blue: 'Blauw',
  yellow: 'Geel',
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await db.order.findUnique({ where: { id } })

  if (!order) notFound()

  const shortId = order.id.slice(-8).toUpperCase()
  const deadline = new Date(order.deadline).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const rows: [string, string][] = [
    ['Bestelnummer', `#${shortId}`],
    ['Koekje', order.cookieName],
    ['Kleur', COLOR_LABELS[order.cookieColor] ?? order.cookieColor],
    ['Aantal', `${order.quantity} dozijn`],
    ['Gewenste datum', deadline],
    [
      'Bezorging',
      order.deliveryMethod === 'pickup'
        ? 'Afhalen in Huizen'
        : `Bezorgen naar ${order.shippingAddress}`,
    ],
  ]

  return (
    <div className="min-h-full">
      <div style={{ height: "4px", background: "linear-gradient(90deg, #C46480, #E0A0B8, #F5D8E5, #8CC4D0)" }} />
      <header className="border-b border-bisque bg-surface">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <Link
            href="/"
            className="font-serif text-xl tracking-wide"
            style={{
              background: "linear-gradient(90deg, #C46480, #b87090)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Daphne&apos;s Bakery
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center mb-7">
            <span className="text-accent font-sans text-lg">✓</span>
          </div>
          <h1 className="font-serif text-4xl text-espresso mb-3">
            Bestelling ontvangen
          </h1>
          <p className="font-sans text-taupe leading-relaxed">
            Bedankt, {order.customerName}. We nemen zo snel mogelijk contact op via e-mail.
          </p>
        </div>

        <div className="border border-bisque bg-surface p-8">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-7">
            Besteloverzicht
          </p>
          <div className="space-y-4">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between items-baseline gap-6">
                <span className="font-sans text-xs text-taupe shrink-0">{label}</span>
                <span className="font-sans text-sm text-espresso text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 px-5 py-4 bg-accent/5 border border-accent/20">
          <p className="font-sans text-sm text-taupe leading-relaxed">
            We sturen een bevestigingsmail naar{' '}
            <strong className="text-espresso font-normal">{order.customerEmail}</strong>{' '}
            zodra je bestelling is bevestigd.
          </p>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="font-sans text-sm text-primary hover:underline underline-offset-4"
          >
            ← Terug naar de winkel
          </Link>
        </div>
      </main>
    </div>
  )
}
