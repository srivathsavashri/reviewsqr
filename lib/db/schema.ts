import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core'

// ---------- App tables ----------
// kind: 'private' = low-star feedback submitted to admin
//       'google' = high-star guest clicked through to Google review
//       'tripadvisor' = high-star guest clicked through to TripAdvisor review
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

export type Feedback = typeof feedback.$inferSelect
