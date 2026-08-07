import { eq } from 'drizzle-orm'
import { db, ensureHotelsTable } from '@/lib/db'
import { hotels } from '@/lib/db/schema'
import type { HotelRecord } from '@/lib/db/schema'

export type Hotel = {
  slug: string
  name: string
  location: string
  googleReviewUrl: string
  tripAdvisorUrl: string
  adminUsername: string
  adminPassword: string
  adminEmail: string
}

export const HOTELS: Hotel[] = [
  {
    slug: 'hamptoninn',
    name: 'Hampton Inn',
    location: 'Houston-Willowbrook Mall',
    googleReviewUrl:
      'https://search.google.com/local/writereview?placeid=ChIJ3QVQWOjNQIYRkRe6juuZ7ZI',
    tripAdvisorUrl:
      'https://www.tripadvisor.com/UserReviewEdit-g56003-d223152-Hampton_Inn_Houston_willowbrook_Mall-Houston_Texas.html',
    adminUsername: 'admin',
    adminPassword: 'admin',
    adminEmail: 'yourreviews@gmail.com',
  },
  {
    slug: 'homewood-suites-houston-willowbrook-mall',
    name: 'Homewood Suites by Hilton Houston-Willowbrook Mall',
    location: '7655 FM 1960, Houston, TX 77070',
    googleReviewUrl:
      'https://search.google.com/local/writereview?placeid=ChIJ3Z_wkuXNQIYR3Lm1D-REXs0',
    tripAdvisorUrl:
      'https://www.tripadvisor.com/UserReviewEdit-g56003-d223166-Homewood_Suites_By_Hilton_Houston_willowbrook_Mall-Houston_Texas.html',
    adminUsername: 'admin',
    adminPassword: 'admin',
    adminEmail: 'yourreviews@gmail.com',
  },
  {
    slug: 'laquinta-wichita-falls',
    name: 'La Quinta Inn & Suites by Wyndham',
    location: 'Wichita Falls, Texas',
    googleReviewUrl:
      'https://search.google.com/local/writereview?placeid=ChIJNyog-dMhU4YRVPcqlh9gt24',
    tripAdvisorUrl:
      'https://www.tripadvisor.com/UserReviewEdit-g56891-d6499801-La_Quinta_Wichita_Falls_Texas-Wichita_Falls_Texas.html',
    adminUsername: 'admin',
    adminPassword: 'admin',
    adminEmail: 'yourreviews@gmail.com',
  },
  {
    slug: 'surestay',
    name: 'SureStay by Best Western Irving Grapevine DFW North',
    location: 'Irving Grapevine DFW North',
    googleReviewUrl:
      'https://search.google.com/local/writereview?placeid=ChIJM3SVNs0pTIYRKvHq9jmzDe8',
    tripAdvisorUrl:
      'https://www.tripadvisor.com/UserReviewEdit-g56032-d109285-Surestay_By_Best_Western_Irving_Grapevine_Dfw_North-Irving_Texas.html',
    adminUsername: 'admin',
    adminPassword: 'admin',
    adminEmail: 'yourreviews@gmail.com',
  },
]

function mapHotelRecord(record: HotelRecord): Hotel {
  return {
    slug: record.slug,
    name: record.name,
    location: record.location,
    googleReviewUrl: record.googleReviewUrl,
    tripAdvisorUrl: record.tripAdvisorUrl,
    adminUsername: record.adminUsername,
    adminPassword: record.adminPassword,
    adminEmail: record.adminEmail,
  }
}

export async function getAllHotels() {
  try {
    await ensureHotelsTable()
    const rows = await db.select().from(hotels).orderBy(hotels.name)
    if (rows.length > 0) return rows.map(mapHotelRecord)
  } catch {
    // Fall back to the static seed list when the database is not configured yet.
  }

  return HOTELS
}

export async function findHotel(slug: string) {
  try {
    await ensureHotelsTable()
    const rows = await db.select().from(hotels).where(eq(hotels.slug, slug))
    if (rows[0]) return mapHotelRecord(rows[0])
  } catch {
    // Fall back to the static seed list when the database is not configured yet.
  }

  return HOTELS.find((hotel) => hotel.slug === slug) || null
}
