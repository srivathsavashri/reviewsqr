'use server'

import { isAdmin } from '@/lib/admin-auth'
import { db, ensureFeedbackTable } from '@/lib/db'
import { feedback } from '@/lib/db/schema'
import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  sendLowRatingEmail,
  sendLowRatingSummaryEmail,
  sendReviewClickEmail,
} from '@/lib/email'
import { findHotel } from '@/lib/hotels'

async function requireAdmin(slug?: string) {
  if (!(await isAdmin(slug))) throw new Error('Unauthorized')
}

type FeedbackProvider = 'private' | 'google' | 'tripadvisor'

type FeedbackFilters = {
  providers?: FeedbackProvider[]
  period?: 'today'
  startDate?: string
  endDate?: string
}

type SubmitPrivateArgs = {
  hotelSlug: string
  rating: number
  name?: string
  email?: string
  phone?: string
  message?: string
}

type LogReviewClickArgs = {
  hotelSlug: string
  rating: number
  provider: 'google' | 'tripadvisor'
}

// Public: called when a guest submits low-star (1-3) feedback.
export async function submitPrivateFeedback(args: SubmitPrivateArgs) {
  const rating = Math.round(args.rating)
  if (!Number.isFinite(args.rating) || rating < 1 || rating > 3) {
    throw new Error('Invalid rating')
  }

  const hotel = findHotel(args.hotelSlug)
  if (!hotel) throw new Error('Invalid hotel')
  await ensureFeedbackTable()

  await db.insert(feedback).values({
    hotelSlug: args.hotelSlug,
    rating,
    kind: 'private',
    guestName: args.name?.trim() || null,
    guestEmail: args.email?.trim() || null,
    guestPhone: args.phone?.trim() || null,
    message: args.message?.trim() || null,
  })

  if (rating <= 3) {
    await sendLowRatingEmail({
      hotel,
      rating,
      guestName: args.name,
      guestEmail: args.email,
      guestPhone: args.phone,
      message: args.message,
    })
  }

  return { ok: true }
}

// Public: called when a guest with a high rating clicks through to a public review path.
export async function logReviewClick(args: LogReviewClickArgs) {
  const r = Math.round(args.rating)
  if (!Number.isFinite(args.rating) || r < 4 || r > 5) {
    throw new Error('Invalid rating')
  }

  const hotel = findHotel(args.hotelSlug)
  if (!hotel) throw new Error('Invalid hotel')
  await ensureFeedbackTable()

  await db.insert(feedback).values({
    hotelSlug: args.hotelSlug,
    rating: r,
    kind: args.provider,
  })

  await sendReviewClickEmail({ hotel, provider: args.provider, rating: r })

  return { ok: true }
}

// Admin: list all feedback, newest first. Optionally filter by hotel.
export async function getAllFeedback(
  hotelSlug?: string,
  filters?: FeedbackFilters,
) {
  await requireAdmin(hotelSlug)
  await ensureFeedbackTable()

  const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof inArray>> = []
  if (hotelSlug) conditions.push(eq(feedback.hotelSlug, hotelSlug))

  if (filters?.providers?.length) {
    const validProviders = filters.providers.filter((provider) =>
      ['private', 'google', 'tripadvisor'].includes(provider),
    ) as FeedbackProvider[]

    if (validProviders.length) {
      conditions.push(inArray(feedback.kind, validProviders))
    }
  }

  if (filters?.period === 'today') {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    conditions.push(gte(feedback.createdAt, start))
    conditions.push(lte(feedback.createdAt, end))
  } else {
    if (filters?.startDate) {
      const start = new Date(filters.startDate)
      if (!Number.isNaN(start.getTime())) {
        conditions.push(gte(feedback.createdAt, start))
      }
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate)
      if (!Number.isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999)
        conditions.push(lte(feedback.createdAt, end))
      }
    }
  }

  const query = db.select().from(feedback)
  if (conditions.length === 1) query.where(conditions[0])
  else if (conditions.length > 1) query.where(and(...conditions))

  return query.orderBy(desc(feedback.createdAt))
}

export async function sendLowRatingReminder(hotelSlug: string) {
  await requireAdmin(hotelSlug)
  await ensureFeedbackTable()

  const hotel = findHotel(hotelSlug)
  if (!hotel) throw new Error('Invalid hotel')

  const lowReviews = await db
    .select()
    .from(feedback)
    .where(and(eq(feedback.hotelSlug, hotelSlug), lte(feedback.rating, 3)))
    .orderBy(desc(feedback.createdAt))

  if (lowReviews.length === 0) {
    throw new Error('No 3-or-under reviews found to send reminder.')
  }

  await sendLowRatingSummaryEmail(hotel, lowReviews)
  revalidatePath(`/admin/${hotelSlug}`)
  redirect(`/admin/${hotelSlug}?sent=1`)
}

// Admin: delete a feedback entry.
export async function deleteFeedback(id: number, hotelSlug: string) {
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid feedback')
  await requireAdmin(hotelSlug)
  await ensureFeedbackTable()
  await db
    .delete(feedback)
    .where(and(eq(feedback.id, id), eq(feedback.hotelSlug, hotelSlug)))
  revalidatePath(`/admin/${hotelSlug}`)
  return { ok: true }
}
