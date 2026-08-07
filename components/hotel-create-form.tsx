'use client'

import { useState } from 'react'
import { createHotel } from '@/app/actions/hotels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

const initial = {
  name: '',
  slug: '',
  location: '',
  googleReviewUrl: '',
  tripAdvisorUrl: '',
  adminUsername: '',
  adminPassword: '',
  adminEmail: '',
}

export function HotelCreateForm() {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onChange = (field: keyof typeof initial, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await createHotel(form)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create hotel.')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Add new hotel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a hotel profile and its review URLs in one place.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Hotel name</Label>
          <Input id="name" value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={form.slug} onChange={(e) => onChange('slug', e.target.value)} placeholder="hamptoninn" required />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={form.location} onChange={(e) => onChange('location', e.target.value)} required />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="googleReviewUrl">Google review URL</Label>
          <Input id="googleReviewUrl" value={form.googleReviewUrl} onChange={(e) => onChange('googleReviewUrl', e.target.value)} required />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="tripAdvisorUrl">TripAdvisor review URL</Label>
          <Input id="tripAdvisorUrl" value={form.tripAdvisorUrl} onChange={(e) => onChange('tripAdvisorUrl', e.target.value)} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="adminUsername">Admin username</Label>
          <Input id="adminUsername" value={form.adminUsername} onChange={(e) => onChange('adminUsername', e.target.value)} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="adminPassword">Admin password</Label>
          <Input id="adminPassword" type="password" value={form.adminPassword} onChange={(e) => onChange('adminPassword', e.target.value)} required />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="adminEmail">Admin email</Label>
          <Input id="adminEmail" type="email" value={form.adminEmail} onChange={(e) => onChange('adminEmail', e.target.value)} required />
        </div>

        {error ? (
          <p className="md:col-span-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Create hotel'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
