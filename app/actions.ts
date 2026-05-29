'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { CreateOrderSchema } from '@/lib/types'
import { sendNewOrderEmail, sendOrderConfirmationEmail } from '@/lib/email'
import { generateCookiePreviewPng } from '@/lib/cookie-image'

export async function createOrder(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const raw = {
    customerName: formData.get('customerName') as string,
    customerEmail: formData.get('customerEmail') as string,
    cookieName: formData.get('cookieName') as string,
    cookieColor: formData.get('cookieColor') as string,
    quantity: Number(formData.get('quantity')),
    deliveryMethod: formData.get('deliveryMethod') as string,
    deadline: formData.get('deadline') as string,
    shippingAddress: (formData.get('shippingAddress') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
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
  const previewPng = hasPersonalization
    ? await generateCookiePreviewPng({
        color: data.cookieColor === 'pink'   ? '#FFAEC0'
             : data.cookieColor === 'yellow' ? '#F5E080'
             : data.cookieColor === 'blue'   ? '#A8C8E0'
             : '#F5F0E8',
        line1: data.personalizationLine1 ?? '',
        line2: data.personalizationLine2 ?? '',
      })
    : null

  await Promise.allSettled([
    sendNewOrderEmail(order),
    sendOrderConfirmationEmail(order, previewPng),
  ])

  redirect(`/confirmation/${order.id}`)
}
