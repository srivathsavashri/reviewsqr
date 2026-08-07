'use server'

import { isAdmin } from '@/lib/admin-auth'
import { db, ensureFeedbackTable } from '@/lib/db'
import { feedback, type Feedback as FeedbackRecord } from '@/lib/db/schema'
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

type FeedbackProvider =
  | 'private'
  | 'google'
  | 'tripadvisor'
  | 'booking'
  | 'expedia'

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
  provider: Exclude<FeedbackProvider, 'private'>
}

type DemoFeedbackRecord = FeedbackRecord & { kind: FeedbackProvider }

const demoFeedbackStore: DemoFeedbackRecord[] = []
let demoFeedbackCounter = 1

function shouldUseDemoFeedbackStore() {
  return !process.env.DATABASE_URL
}

function addDemoFeedback(record: DemoFeedbackRecord) {
  demoFeedbackStore.unshift(record)
}

function getDemoFeedback(hotelSlug?: string, filters?: FeedbackFilters) {
  const filtered = demoFeedbackStore.filter((item) => {
    if (hotelSlug && item.hotelSlug !== hotelSlug) return false

    if (filters?.providers?.length) {
      if (!filters.providers.includes(item.kind)) return false
    }

    if (filters?.period === 'today') {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      if (item.createdAt < start || item.createdAt >= end) return false
    }

    if (filters?.startDate) {
      const start = new Date(filters.startDate)
      if (!Number.isNaN(start.getTime()) && item.createdAt < start) return false
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate)
      end.setHours(23, 59, 59, 999)
      if (!Number.isNaN(end.getTime()) && item.createdAt > end) return false
    }

    return true
  })

  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// Public: called when a guest submits low-star (1-3) feedback.
export async function submitPrivateFeedback(args: SubmitPrivateArgs) {
  const rating = Math.round(args.rating)
  if (!Number.isFinite(args.rating) || rating < 1 || rating > 3) {
    throw new Error('Invalid rating')
  }

  const hotel = await findHotel(args.hotelSlug)
  if (!hotel) throw new Error('Invalid hotel')
  const record: DemoFeedbackRecord = {
    id: demoFeedbackCounter++,
    hotelSlug: args.hotelSlug,
    rating,
    kind: 'private',
    guestName: args.name?.trim() || null,
    guestEmail: args.email?.trim() || null,
    guestPhone: args.phone?.trim() || null,
    message: args.message?.trim() || null,
    createdAt: new Date(),
  }

  try {
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
  } catch {
    addDemoFeedback(record)
  }

  if (rating <= 3) {
    try {
      await sendLowRatingEmail({
        hotel,
        rating,
        guestName: args.name,
        guestEmail: args.email,
        guestPhone: args.phone,
        message: args.message,
      })
    } catch {
      // Keep the feedback submission successful even if email delivery is unavailable.
    }
  }

  return { ok: true }
}

// Public: called when a guest with a high rating clicks through to a public review path.
export async function logReviewClick(args: LogReviewClickArgs) {
  const r = Math.round(args.rating)
  if (!Number.isFinite(args.rating) || r < 4 || r > 5) {
    throw new Error('Invalid rating')
  }

  const hotel = await findHotel(args.hotelSlug)
  if (!hotel) throw new Error('Invalid hotel')
  const record: DemoFeedbackRecord = {
    id: demoFeedbackCounter++,
    hotelSlug: args.hotelSlug,
    rating: r,
    kind: args.provider,
    guestName: null,
    guestEmail: null,
    guestPhone: null,
    message: null,
    createdAt: new Date(),
  }

  try {
    await ensureFeedbackTable()

    await db.insert(feedback).values({
      hotelSlug: args.hotelSlug,
      rating: r,
      kind: args.provider,
    })
  } catch {
    addDemoFeedback(record)
  }

  try {
    await sendReviewClickEmail({ hotel, provider: args.provider, rating: r })
  } catch {
    // Ignore email delivery issues in demo mode while still keeping the review click record.
  }

  return { ok: true }
}

// Admin: list all feedback, newest first. Optionally filter by hotel.
export async function getAllFeedback(
  hotelSlug?: string,
  filters?: FeedbackFilters,
) {
  await requireAdmin(hotelSlug)

  if (shouldUseDemoFeedbackStore()) {
    return getDemoFeedback(hotelSlug, filters)
  }

  await ensureFeedbackTable()

  const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof inArray>> = []
  if (hotelSlug) conditions.push(eq(feedback.hotelSlug, hotelSlug))

  if (filters?.providers?.length) {
    const validProviders = filters.providers.filter((provider) =>
      ['private', 'google', 'tripadvisor', 'booking', 'expedia'].includes(
        provider,
      ),
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

  const hotel = await findHotel(hotelSlug)
  if (!hotel) throw new Error('Invalid hotel')

  if (shouldUseDemoFeedbackStore()) {
    const lowReviews = getDemoFeedback(hotelSlug).filter((item) => item.rating <= 3)
    if (lowReviews.length === 0) {
      throw new Error('No 3-or-under reviews found to send reminder.')
    }

    await sendLowRatingSummaryEmail(hotel, lowReviews)
    revalidatePath(`/admin/${hotelSlug}`)
    redirect(`/admin/${hotelSlug}?sent=1`)
  }

  await ensureFeedbackTable()

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

  if (shouldUseDemoFeedbackStore()) {
    const index = demoFeedbackStore.findIndex(
      (item) => item.id === id && item.hotelSlug === hotelSlug,
    )
    if (index >= 0) demoFeedbackStore.splice(index, 1)
    revalidatePath(`/admin/${hotelSlug}`)
    return { ok: true }
  }

  await ensureFeedbackTable()
  await db
    .delete(feedback)
    .where(and(eq(feedback.id, id), eq(feedback.hotelSlug, hotelSlug)))
  revalidatePath(`/admin/${hotelSlug}`)
  return { ok: true }
}
