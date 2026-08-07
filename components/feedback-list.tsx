'use client'

import { useState } from 'react'
import { Star, Trash2, ExternalLink, Mail, Phone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteFeedback } from '@/app/actions/feedback'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Feedback } from '@/lib/db/schema'
import {
  REVIEW_PROVIDER_LABELS,
  type PublicReviewProvider,
} from '@/lib/review-platforms'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={16}
          className={cn(
            s <= rating ? 'fill-star text-star' : 'fill-transparent text-star-empty',
          )}
        />
      ))}
    </div>
  )
}

function formatDate(d: Date) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function FeedbackList({
  initial,
  hotelSlug,
}: {
  initial: Feedback[]
  hotelSlug: string
}) {
  const [items, setItems] = useState(initial)

  async function handleDelete(id: number) {
    const prev = items
    setItems((cur) => cur.filter((i) => i.id !== id))
    try {
      await deleteFeedback(id, hotelSlug)
      toast.success('Feedback removed')
    } catch (err) {
      console.log('[v0] deleteFeedback error:', err)
      setItems(prev)
      toast.error('Could not delete. Please try again.')
    }
  }

  if (items.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-muted-foreground">No feedback yet.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const isPublicReview = item.kind !== 'private'
        const providerLabel = isPublicReview
          ? REVIEW_PROVIDER_LABELS[item.kind as PublicReviewProvider] || item.kind
          : null
        return (
          <Card key={item.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Stars rating={item.rating} />
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      isPublicReview
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {isPublicReview ? (
                      <>
                        <ExternalLink className="size-3" />
                        Sent to {providerLabel}
                      </>
                    ) : (
                      'Private feedback'
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(item.id)}
                aria-label="Delete feedback"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {!isPublicReview && (
              <div className="mt-4 flex flex-col gap-3">
                {item.message && (
                  <p className="rounded-lg bg-muted p-3 text-sm leading-relaxed text-foreground">
                    {item.message}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  {item.guestName && <span>{item.guestName}</span>}
                  {item.guestEmail && (
                    <a
                      href={`mailto:${item.guestEmail}`}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <Mail className="size-3.5" />
                      {item.guestEmail}
                    </a>
                  )}
                  {item.guestPhone && (
                    <a
                      href={`tel:${item.guestPhone}`}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <Phone className="size-3.5" />
                      {item.guestPhone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
