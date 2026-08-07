'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db, ensureHotelsTable } from '@/lib/db'
import { hotels } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type CreateHotelArgs = {
  name: string
  slug: string
  location: string
  googleReviewUrl: string
  tripAdvisorUrl: string
  adminUsername: string
  adminPassword: string
  adminEmail: string
}

export async function createHotel(args: CreateHotelArgs) {
  const slug = args.slug.trim().toLowerCase().replace(/\s+/g, '-')
  const name = args.name.trim()
  const location = args.location.trim()
  const googleReviewUrl = args.googleReviewUrl.trim()
  const tripAdvisorUrl = args.tripAdvisorUrl.trim()
  const adminUsername = args.adminUsername.trim()
  const adminPassword = args.adminPassword.trim()
  const adminEmail = args.adminEmail.trim()

  if (!slug || !name || !location || !googleReviewUrl || !tripAdvisorUrl || !adminUsername || !adminPassword || !adminEmail) {
    throw new Error('All hotel fields are required.')
  }

  await ensureHotelsTable()

  const existing = await db.query.hotels.findFirst({
    where: eq(hotels.slug, slug),
  })

  if (existing) {
    throw new Error('A hotel with this slug already exists.')
  }

  await db.insert(hotels).values({
    slug,
    name,
    location,
    googleReviewUrl,
    tripAdvisorUrl,
    adminUsername,
    adminPassword,
    adminEmail,
  })

  revalidatePath('/admin')
  redirect('/admin?created=1')
}

export async function getAllHotels() {
  await ensureHotelsTable()
  return db.select().from(hotels).orderBy(hotels.name)
}
