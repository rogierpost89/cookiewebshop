'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { clearSession } from '@/lib/auth'

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  await clearSession(cookieStore)
  redirect('/admin/login')
}
