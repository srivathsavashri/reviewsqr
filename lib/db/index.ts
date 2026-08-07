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
        rating INTEGER NOT NULL,
        kind TEXT NOT NULL DEFAULT 'private',
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
