'use server'

import {
  createAdminSession,
  destroyAdminSession,
  verifyCredentials,
} from '@/lib/admin-auth'

export async function signInAdmin(
  username: string,
  password: string,
  hotelSlug: string,
) {
  if (!verifyCredentials(username, password, hotelSlug)) {
    return { ok: false as const, error: 'Invalid username or password' }
  }
  await createAdminSession(hotelSlug)
  return { ok: true as const }
}

export async function signOutAdmin() {
  await destroyAdminSession()
  return { ok: true as const }
}
