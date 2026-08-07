'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInAdmin } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { BrandHeader } from '@/components/brand-header'
import type { Hotel } from '@/lib/hotels'

type Props = {
  hotel: Hotel
}

export function AuthForm({ hotel }: Props) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signInAdmin(username, password, hotel.slug)

    if (!result.ok) {
      setLoading(false)
      setError(result.error)
      return
    }

    router.push(`/admin/${hotel.slug}`)
    router.refresh()
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {hotel.name} admin sign in
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your hotel credentials to view feedback
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Please wait...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </main>
  )
}
