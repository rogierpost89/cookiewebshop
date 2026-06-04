'use client'

import { useActionState } from 'react'
import { updateOrderAction } from './actions'

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
