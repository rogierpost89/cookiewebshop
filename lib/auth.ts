import 'server-only'
import { SignJWT, jwtVerify } from 'jose'

const COOKIE_NAME = 'admin_session'
const ALG = 'HS256'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function setSession(
  cookieStore: { set: (name: string, value: string, options: object) => void }
): Promise<void> {
  const secret = getSecret()
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
}

export async function getSession(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): Promise<{ authenticated: boolean } | null> {
  const cookie = cookieStore.get(COOKIE_NAME)
  if (!cookie?.value) return null

  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(cookie.value, secret)
    return payload as { authenticated: boolean }
  } catch {
    return null
  }
}

export async function clearSession(
  cookieStore: { delete: (name: string) => void }
): Promise<void> {
  cookieStore.delete(COOKIE_NAME)
}

export async function verifySession(token: string): Promise<{ authenticated: boolean } | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as { authenticated: boolean }
  } catch {
    return null
  }
}
