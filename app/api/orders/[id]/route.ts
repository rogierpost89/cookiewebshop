import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UpdateOrderSchema } from '@/lib/types'
import { sendReadyDateEmail } from '@/lib/email'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const result = UpdateOrderSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const data = result.data

  const existing = await db.order.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  try {
    const order = await db.order.update({
      where: { id },
      data: {
        ...(data.status    !== undefined && { status: data.status }),
        ...(data.readyDate !== undefined && { readyDate: data.readyDate }),
        ...(data.notes     !== undefined && { notes: data.notes }),
      },
    })

    if (data.status === 'ready' && order.readyDate !== null) {
      try {
        await sendReadyDateEmail(order as typeof order & { readyDate: Date })
      } catch (err) {
        console.error('[email] ready-date email failed:', err)
      }
    }

    return NextResponse.json({ success: true, order })
  } catch (err) {
    console.error('[orders] update failed:', err)
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
  }
}
