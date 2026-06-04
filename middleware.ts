import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('admin_session')?.value

  const isAdminLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/')
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const isApiOrdersRoute = pathname.startsWith('/api/orders')

  // /admin/login always passes through (no auth required)
  if (isAdminLogin) {
    return NextResponse.next()
  }

  // Verify session
  const session = token ? await verifySession(token) : null
  const isAuthenticated = session?.authenticated === true

  if (isAdminRoute) {
    if (isAuthenticated) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isApiOrdersRoute) {
    if (isAuthenticated) {
      return NextResponse.next()
    }
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/orders/:path*',
  ],
}
