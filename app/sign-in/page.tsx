import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'

export default async function SignInPage() {
  if (await isAdmin()) redirect('/')
  return redirect('/')
}
