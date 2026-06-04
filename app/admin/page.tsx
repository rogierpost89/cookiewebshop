import Link from 'next/link'
import { db } from '@/lib/db'
import { logoutAction } from './logout/actions'

export const dynamic = 'force-dynamic'

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

function OrderRow({ order }: { order: { id: string; customerName: string; quantity: number; deadline: Date; status: string } }) {
  const shortId = order.id.slice(-8).toUpperCase()
  const deadline = new Date(order.deadline).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
  const statusLabel = STATUS_LABELS[order.status] ?? order.status

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="flex items-center gap-4 px-5 py-4 bg-surface hover:bg-parchment transition-colors"
    >
      <span className="font-mono text-xs text-taupe w-24 shrink-0">#{shortId}</span>
      <span className="font-sans text-sm text-espresso flex-1 min-w-0 truncate">{order.customerName}</span>
      <span className="font-sans text-xs text-taupe w-16 shrink-0 text-right">{order.quantity}×</span>
      <span className="font-sans text-xs text-taupe w-32 shrink-0 text-right">{deadline}</span>
      <span className={`font-sans text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 shrink-0 ${statusStyle}`}>
        {statusLabel}
      </span>
    </Link>
  )
}

export default async function AdminPage() {
  const orders = await db.order.findMany({ orderBy: { createdAt: 'desc' } })

  const active = orders.filter(o => o.status !== 'delivered')
  const completed = orders.filter(o => o.status === 'delivered')

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
            <button type="submit" className="font-sans text-xs text-taupe hover:text-primary transition-colors cursor-pointer">
              Uitloggen
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="font-serif text-3xl text-espresso mb-8">Bestellingen</h1>
          {active.length === 0 ? (
            <p className="font-sans text-sm text-taupe">Geen actieve bestellingen.</p>
          ) : (
            <div className="divide-y divide-bisque border border-bisque">
              {active.map(order => <OrderRow key={order.id} order={order} />)}
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-6">
              Afgerond
            </p>
            <div className="divide-y divide-bisque border border-bisque opacity-60">
              {completed.map(order => <OrderRow key={order.id} order={order} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
