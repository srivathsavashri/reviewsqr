'use client'

import { useRouter } from 'next/navigation'
import { signOutAdmin } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await signOutAdmin()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      <LogOut className="mr-1 size-4" />
      Sign out
    </Button>
  )
}
