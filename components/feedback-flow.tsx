'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { BrandHeader } from '@/components/brand-header'
import { StarRating } from '@/components/star-rating'
import { PrivateFeedbackForm } from '@/components/private-feedback-form'
import type { Hotel } from '@/lib/hotels'
import { logReviewClick } from '@/app/actions/feedback'

type Step = 'select' | 'rate' | 'confirm' | 'private' | 'thanks'

type Props = {
  hotel: Hotel
  initialProvider?: 'google' | 'tripadvisor'
}

export function FeedbackFlow({ hotel, initialProvider }: Props) {
  const [step, setStep] = useState<Step>(initialProvider ? 'rate' : 'select')
  const [provider, setProvider] = useState<'google' | 'tripadvisor' | null>(
    initialProvider ?? null,
  )
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)

  function selectProvider(selected: 'google' | 'tripadvisor') {
    setProvider(selected)
    setRating(0)
    setStep('rate')
  }

  async function handleRating(value: number) {
    if (!provider) return

    setRating(value)

    if (value === 5) {
      setLoading(true)
      try {
        await logReviewClick({ hotelSlug: hotel.slug, rating: value, provider })
      } catch (err) {
        console.log('[v0] logReviewClick error:', err)
      }

      const redirectUrl =
        provider === 'google' ? hotel.googleReviewUrl : hotel.tripAdvisorUrl
      window.location.href = redirectUrl
      return
    }

    if (value <= 3) {
      setStep('private')
      return
    }

    setStep('confirm')
  }

  async function handleContinue() {
    if (!provider) return

    setLoading(true)
    try {
      await logReviewClick({ hotelSlug: hotel.slug, rating, provider })
    } catch (err) {
      console.log('[v0] logReviewClick error:', err)
    }

    const redirectUrl =
      provider === 'google' ? hotel.googleReviewUrl : hotel.tripAdvisorUrl
    window.location.href = redirectUrl
  }

  const providerLabel =
    provider === 'google' ? 'Google' : provider === 'tripadvisor' ? 'TripAdvisor' : ''

  return (
    <Card className="w-full max-w-md p-8 shadow-lg sm:p-10">
      <BrandHeader hotel={hotel} provider={provider ?? undefined} />

      <div className="mt-[-3]">
        {step === 'select' && (
          <div className="space-y-6 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground">
              Leave a review for {hotel.name}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Choose where you want to post your review.
            </p>

            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => selectProvider('google')}
                className="rounded-3xl border border-border bg-background p-6 text-left transition hover:border-primary/70 hover:shadow-lg"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  Public review
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">
                  Google
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Share your experience on Google with a quick rating.
                </p>
              </button>

              <button
                type="button"
                onClick={() => selectProvider('tripadvisor')}
                className="rounded-3xl border border-border bg-background p-6 text-left transition hover:border-primary/70 hover:shadow-lg"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  Public review
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">
                  TripAdvisor
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Share your stay with other travelers on TripAdvisor.
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 'rate' && provider && (
          <div className="flex flex-col items-center text-center">
            <h1 className="font-display text-4xl font-bold text-foreground">
              Enjoyed Your Stay?
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              We&apos;d love your feedback on {providerLabel}.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              Thank you for choosing {hotel.name}! Tap a star to let us know how we did.
            </p>

            <div className="mt-5">
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
        )}

        {step === 'confirm' && provider && (
          <div className="flex flex-col gap-6 text-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Ready to post on {providerLabel}?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                You rated your stay {rating} stars. Click continue to leave your review on {providerLabel}.
              </p>
            </div>

            <button
              type="button"
              className="rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
              onClick={handleContinue}
              disabled={loading}
            >
              Continue to {providerLabel}
            </button>

            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setStep('select')
                setProvider(null)
                setRating(0)
              }}
            >
              Choose a different review platform
            </button>
          </div>
        )}

        {step === 'private' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-8 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-10">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                    Private feedback
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-foreground">
                    We&apos;re sorry your stay fell short
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Please tell us what happened so our team can make it right.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/80"
                  onClick={() => {
                    setStep('select')
                    setProvider(null)
                    setRating(0)
                  }}
                >
                  Cancel
                </button>
              </div>
              <PrivateFeedbackForm
                hotelSlug={hotel.slug}
                rating={rating}
                onSubmitted={() => setStep('thanks')}
              />
            </div>
          </div>
        )}

        {step === 'thanks' && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 className="size-14 text-green-600" />
            <h2 className="font-display text-2xl font-bold text-foreground text-balance">
              Thank you for your feedback
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              We truly appreciate you taking the time. Our management team will
              review your comments and work to make your next stay exceptional.
            </p>
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setStep('select')
                setProvider(null)
                setRating(0)
              }}
            >
              Back to hotel review options
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
