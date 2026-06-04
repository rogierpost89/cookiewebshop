'use client'

import { deleteOrderAction } from './actions'

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  return (
    <form action={deleteOrderAction.bind(null, orderId)}>
      <button
        type="submit"
        className="font-sans text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
        onClick={(e) => {
          if (!confirm('Bestelling verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
            e.preventDefault()
          }
        }}
      >
        Bestelling verwijderen
      </button>
    </form>
  )
}
