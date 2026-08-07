import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL || null

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : new Pool()

export const db = drizzle(pool, { schema })

function ensureDbConfigured() {
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured. Set DATABASE_URL in your environment or .env file.',
    )
  }
}

export async function ensureFeedbackTable() {
  ensureDbConfigured()

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        hotel_slug TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        kind TEXT NOT NULL DEFAULT 'private' CHECK (
          kind IN ('private', 'google', 'tripadvisor', 'booking', 'expedia')
        ),
        guest_name TEXT,
        guest_email TEXT,
        guest_phone TEXT,
        message TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `)
  } catch (error) {
    throw new Error(
      `Unable to initialize feedback table: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function ensureHotelsTable() {
  ensureDbConfigured()

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        google_review_url TEXT NOT NULL,
        tripadvisor_url TEXT NOT NULL,
        admin_username TEXT NOT NULL,
        admin_password TEXT NOT NULL,
        admin_email TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `)
  } catch (error) {
    throw new Error(
      `Unable to initialize hotels table: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
