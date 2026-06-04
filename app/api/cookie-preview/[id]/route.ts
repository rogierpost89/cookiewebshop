import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateCookiePngBuffer } from '@/lib/cookie-image'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = await db.order.findUnique({ where: { id } })
  if (!order) return new NextResponse(null, { status: 404 })

  const color = order.cookieColor === 'pink'  ? '#E0A0B8'
              : order.cookieColor === 'blue'  ? '#8CC4D0'
              : '#F5F0E8'

  const buf = await generateCookiePngBuffer({
    color,
    line1: order.personalizationLine1 ?? '',
    line2: order.personalizationLine2 ?? '',
  })

  if (!buf) return new NextResponse(null, { status: 500 })

  return new NextResponse(buf.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
