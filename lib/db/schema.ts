import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core'

// ---------- App tables ----------
// kind: 'private' = low-star feedback submitted to admin
//       'google' = high-star guest clicked through to Google review
//       'tripadvisor' = high-star guest clicked through to TripAdvisor review
//       'booking' = high-star guest clicked through to Booking.com review
//       'expedia' = high-star guest clicked through to Expedia review
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  hotelSlug: text('hotel_slug').notNull(),
  rating: integer('rating').notNull(),
  kind: text('kind').notNull().default('private'),
  guestName: text('guest_name'),
  guestEmail: text('guest_email'),
  guestPhone: text('guest_phone'),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const hotels = pgTable('hotels', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  googleReviewUrl: text('google_review_url').notNull(),
  tripAdvisorUrl: text('tripadvisor_url').notNull(),
  adminUsername: text('admin_username').notNull(),
  adminPassword: text('admin_password').notNull(),
  adminEmail: text('admin_email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Feedback = typeof feedback.$inferSelect
export type HotelRecord = typeof hotels.$inferSelect
