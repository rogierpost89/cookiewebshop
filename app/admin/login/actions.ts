'use server'

import { timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { setSession } from '@/lib/auth'

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const raw = formData.get('password')
  if (typeof raw !== 'string' || raw.length === 0) return 'Ongeldig wachtwoord'

  const adminPassword = process.env.ADMIN_PASSWORD

  if (process.env.NODE_ENV === 'production' && !adminPassword) {
    throw new Error('ADMIN_PASSWORD is not set in production')
  }

  const expected = adminPassword ?? 'dev'
  if (!safeCompare(raw, expected)) return 'Ongeldig wachtwoord'

  const cookieStore = await cookies()
  await setSession(cookieStore)
  redirect('/admin')
}
