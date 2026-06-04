'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { CreateOrderSchema } from '@/lib/types'
import { sendNewOrderEmail, sendOrderConfirmationEmail } from '@/lib/email'

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function createOrder(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const customColorNote = (formData.get('customColorNote') as string) || ''
  const notesRaw = (formData.get('notes') as string) || ''
  const notesWithColor = customColorNote
    ? `Kleur aanvraag: ${customColorNote}${notesRaw ? '\n' + notesRaw : ''}`
    : notesRaw

  const raw = {
    customerName: formData.get('customerName') as string,
    customerEmail: formData.get('customerEmail') as string,
    cookieName: formData.get('cookieName') as string,
    cookieColor: formData.get('cookieColor') as string,
    quantity: Number(formData.get('quantity')),
    deliveryMethod: formData.get('deliveryMethod') as string,
    deadline: formData.get('deadline') as string,
    shippingAddress: (formData.get('shippingAddress') as string) || undefined,
    notes: notesWithColor || undefined,
    personalizationLine1: (formData.get('personalizationLine1') as string) || undefined,
    personalizationLine2: (formData.get('personalizationLine2') as string) || undefined,
  }

  const result = CreateOrderSchema.safeParse(raw)
  if (!result.success) {
    return result.error.issues[0].message
  }

  const data = result.data
  const order = await db.order.create({
    data: {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      cookieName: data.cookieName,
      cookieColor: data.cookieColor,
      quantity: data.quantity,
      deadline: data.deadline,
      deliveryMethod: data.deliveryMethod,
      shippingAddress: data.shippingAddress ?? null,
      notes: data.notes ?? null,
      personalizationLine1: data.personalizationLine1 ?? null,
      personalizationLine2: data.personalizationLine2 ?? null,
    },
  })

  const hasPersonalization = !!(data.personalizationLine1 || data.personalizationLine2)
  const previewUrl = hasPersonalization
    ? `${getBaseUrl()}/api/cookie-preview/${order.id}`
    : null

  const [bakerResult, confirmResult] = await Promise.allSettled([
    sendNewOrderEmail(order),
    sendOrderConfirmationEmail(order, previewUrl),
  ])
  if (bakerResult.status === 'rejected') {
    console.error('[email] baker notification failed:', bakerResult.reason)
  }
  if (confirmResult.status === 'rejected') {
    console.error('[email] customer confirmation failed:', confirmResult.reason)
  }

  redirect(`/confirmation/${order.id}`)
}
