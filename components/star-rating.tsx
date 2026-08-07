'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type StarRatingProps = {
  value: number
  onChange: (value: number) => void
  size?: number
  disabled?: boolean
}

export function StarRating({
  value,
  onChange,
  size = 44,
  disabled = false,
}: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const active = hover || value

  return (
    <div
      role="radiogroup"
      aria-label="Rate your stay from 1 to 5 stars"
      className="flex items-center justify-center gap-2"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= active
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
            disabled={disabled}
            onMouseEnter={() => !disabled && setHover(star)}
            onFocus={() => !disabled && setHover(star)}
            onClick={() => onChange(star)}
            className={cn(
              'rounded-full p-1 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              !disabled && 'hover:scale-110 active:scale-95',
              disabled && 'cursor-default',
            )}
          >
            <Star
              size={size}
              strokeWidth={1.5}
              className={cn(
                'transition-colors',
                filled
                  ? 'fill-star text-star'
                  : 'fill-transparent text-star-empty',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
