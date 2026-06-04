'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="min-h-full">
      <div style={{ height: '4px', background: 'var(--gradient-h)' }} />
      <header className="border-b border-bisque bg-surface">
        <div className="max-w-2xl mx-auto px-6 py-5">
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

      <main className="max-w-sm mx-auto px-6 py-20">
        <h1 className="font-serif text-3xl text-espresso mb-8">Inloggen</h1>

        {error && (
          <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 font-sans text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label className="block font-sans text-xs text-taupe mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full border border-bisque bg-surface px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus:border-primary"
            />
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
            {pending ? 'Inloggen…' : 'Inloggen'}
          </button>
        </form>
      </main>
    </div>
  )
}
