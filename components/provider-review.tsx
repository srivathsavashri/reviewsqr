'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { BrandHeader } from '@/components/brand-header'
import { StarRating } from '@/components/star-rating'
import type { Hotel } from '@/lib/hotels'

type Props = {
  hotel: Hotel
  provider: 'google' | 'tripadvisor'
}

export function ProviderReview({ hotel, provider }: Props) {
  const [rating, setRating] = useState(0)
  const providerLabel = provider === 'google' ? 'Google' : 'TripAdvisor'
  const reviewUrl = provider === 'google' ? hotel.googleReviewUrl : hotel.tripAdvisorUrl

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <Card className="w-full p-8 shadow-lg sm:p-10">
        <BrandHeader hotel={hotel} provider={provider} />

        <div className="mt-8 space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Public review path
          </p>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Enjoyed Your Stay?
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground">
            Thank you for choosing {hotel.name}! Tap a star to let us know how we did.
          </p>
        </div>

        <div className="mt-10">
          <StarRating value={rating} onChange={setRating} size={56} />
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Continue to {providerLabel}
          </a>
          <p className="text-sm leading-6 text-muted-foreground max-w-xl text-center">
            Your rating will help us route your feedback to the right review destination.
          </p>
        </div>
      </Card>
    </main>
  )
}
