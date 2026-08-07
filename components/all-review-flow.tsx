'use client'

import { useState } from 'react'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { logReviewClick } from '@/app/actions/feedback'
import { BrandHeader } from '@/components/brand-header'
import { PrivateFeedbackForm } from '@/components/private-feedback-form'
import { StarRating } from '@/components/star-rating'
import { Card } from '@/components/ui/card'
import type { Hotel } from '@/lib/hotels'
import {
  REVIEW_PROVIDER_LABELS,
  SURESTAY_REVIEW_URLS,
  type PublicReviewProvider,
} from '@/lib/review-platforms'

type Step = 'rate' | 'private' | 'platforms' | 'thanks'

const platformDescriptions: Record<PublicReviewProvider, string> = {
  google: 'Share a quick public review on Google.',
  tripadvisor: 'Help future travelers on TripAdvisor.',
  booking: 'Review your stay on Booking.com.',
  expedia: 'Share your experience with Expedia travelers.',
}

export function AllReviewFlow({ hotel }: { hotel: Hotel }) {
  const [step, setStep] = useState<Step>('rate')
  const [rating, setRating] = useState(0)
  const [loadingProvider, setLoadingProvider] =
    useState<PublicReviewProvider | null>(null)

  function handleRating(value: number) {
    setRating(value)
    setStep(value <= 3 ? 'private' : 'platforms')
  }

  async function choosePlatform(provider: PublicReviewProvider) {
    setLoadingProvider(provider)
    try {
      await logReviewClick({ hotelSlug: hotel.slug, rating, provider })
    } catch {
      // Do not prevent a guest from reaching the selected review platform.
    }
    window.location.assign(SURESTAY_REVIEW_URLS[provider])
  }

  function reset() {
    setRating(0)
    setLoadingProvider(null)
    setStep('rate')
  }

  return (
    <Card className="w-full max-w-lg p-6 shadow-lg sm:p-10">
      <BrandHeader hotel={hotel} />

      {step === 'rate' ? (
        <div className="mt-8 flex flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Rate your stay
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground text-balance sm:text-4xl">
            How was your experience?
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground text-pretty">
            Tap a star below. Your feedback helps us make every stay better.
          </p>
          <div className="mt-8">
            <StarRating value={rating} onChange={handleRating} />
          </div>
          <div className="mt-3 flex w-full max-w-xs items-center justify-between px-1">
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
              TERRIBLE
            </span>
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
              EXCELLENT
            </span>
          </div>
        </div>
      ) : null}

      {step === 'platforms' ? (
        <div className="mt-8 flex flex-col gap-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Thank you for the {rating}-star rating
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-foreground text-balance">
              Where would you like to review us?
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Choose one platform to continue.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(REVIEW_PROVIDER_LABELS) as PublicReviewProvider[]).map(
              (provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => choosePlatform(provider)}
                  disabled={loadingProvider !== null}
                  className="flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4 text-left transition hover:border-primary/70 hover:bg-accent disabled:cursor-wait disabled:opacity-60"
                >
                  <span>
                    <span className="block text-lg font-semibold text-foreground">
                      {REVIEW_PROVIDER_LABELS[provider]}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                      {platformDescriptions[provider]}
                    </span>
                  </span>
                  <ExternalLink className="size-5 shrink-0 text-primary" aria-hidden="true" />
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={reset}
            className="self-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Change my rating
          </button>
        </div>
      ) : null}

      {step === 'private' ? (
        <div className="mt-8 flex flex-col gap-5">
          <PrivateFeedbackForm
            hotelSlug={hotel.slug}
            rating={rating}
            onSubmitted={() => setStep('thanks')}
          />
          <button
            type="button"
            onClick={reset}
            className="self-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Change my rating
          </button>
        </div>
      ) : null}

      {step === 'thanks' ? (
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-14 text-primary" aria-hidden="true" />
          <h1 className="font-display text-3xl font-bold text-foreground text-balance">
            Thank you for your feedback
          </h1>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground text-pretty">
            Your comments were sent privately to our management team.
          </p>
        </div>
      ) : null}
    </Card>
  )
}
