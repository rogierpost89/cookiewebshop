'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { setSession } from '@/lib/auth'

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD

  if (process.env.NODE_ENV === 'production' && !adminPassword) {
    throw new Error('ADMIN_PASSWORD is not set in production')
  }

  const expected = adminPassword ?? 'dev'
  if (password !== expected) return 'Ongeldig wachtwoord'

  const cookieStore = await cookies()
  await setSession(cookieStore)
  redirect('/admin')
}
