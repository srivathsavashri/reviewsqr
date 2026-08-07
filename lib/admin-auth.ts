import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { findHotel } from '@/lib/hotels'

const COOKIE_NAME = 'admin_session'
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SENDGRID_API_KEY ||
  process.env.DATABASE_URL ||
  'development-admin-session-secret'

function signHotelSlug(hotelSlug: string) {
  return createHmac('sha256', SESSION_SECRET).update(hotelSlug).digest('hex')
}

export async function verifyCredentials(
  username: string,
  password: string,
  hotelSlug: string,
) {
  const hotel = await findHotel(hotelSlug)
  if (!hotel) return false
  return username === hotel.adminUsername && password === hotel.adminPassword
}

export async function createAdminSession(hotelSlug: string) {
  if (!(await findHotel(hotelSlug))) throw new Error('Invalid hotel')
  const store = await cookies()
  store.set(COOKIE_NAME, `${hotelSlug}:${signHotelSlug(hotelSlug)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function destroyAdminSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function isAdmin(hotelSlug?: string) {
  const store = await cookies()
  const value = store.get(COOKIE_NAME)?.value
  if (!value) return false

  const separator = value.indexOf(':')
  if (separator < 1) return false
  const slug = value.slice(0, separator)
  const signature = value.slice(separator + 1)
  if (!(await findHotel(slug)) || !signature) return false

  const expected = signHotelSlug(slug)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return false
  }

  return hotelSlug ? slug === hotelSlug : true
}
