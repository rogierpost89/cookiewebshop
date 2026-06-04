'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { UpdateOrderSchema } from '@/lib/types'
import { sendReadyDateEmail } from '@/lib/email'

export async function updateOrderAction(
  orderId: string,
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const raw = {
    status:    (formData.get('status') as string)    || undefined,
    readyDate: (formData.get('readyDate') as string) || undefined,
  }

  const result = UpdateOrderSchema.safeParse(raw)
  if (!result.success) return result.error.issues[0].message

  const data = result.data

  const order = await db.order.update({
    where: { id: orderId },
    data: {
      ...(data.status    !== undefined && { status: data.status }),
      ...(data.readyDate !== undefined && { readyDate: data.readyDate }),
    },
  })

  if (data.status === 'ready' && order.readyDate !== null) {
    try {
      await sendReadyDateEmail(order as typeof order & { readyDate: Date })
    } catch (err) {
      console.error('[email] ready-date email failed:', err)
    }
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin')
  redirect(`/admin/orders/${orderId}`)
}
