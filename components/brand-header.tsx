import Image from 'next/image'
import type { Hotel } from '@/lib/hotels'

type Props = {
  hotel?: Hotel
  provider?: 'google' | 'tripadvisor'
}

export function BrandHeader({ hotel, provider }: Props) {
  const title = hotel ? hotel.name : 'SureStay'
  const isGoogle = provider === 'google'
  const isTripadvisor = provider === 'tripadvisor'
  const showHotelLocation = hotel && !provider
  const showProviderLocation = hotel && provider
  const locationLine = hotel ? `--${hotel.location}--` : ''

  return (
    <div className="flex flex-col items-center text-center">
      <p className="font-display text-3xl font-bold tracking-tight text-primary">
        {title}
      </p>
      {showHotelLocation ? (
        <p className="mt-1 text-sm font-semibold tracking-[0.2em] text-muted-foreground">
          {hotel.location}
        </p>
      ) : null}

      <div className="mt-2 flex flex-col items-center justify-center gap-2">
        {isTripadvisor ? (
          <div className="flex items-center gap-2">
            <Image
              src="/tripadvisor-owl.svg"
              alt="TripAdvisor"
              width={26}
              height={26}
              className="size-6"
            />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              TripAdvisor
            </span>
          </div>
        ) : isGoogle ? (
          <div className="flex items-center justify-center gap-1 text-[2.4rem] font-semibold leading-none">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Image
              src="/tripadvisor-owl.svg"
              alt="TripAdvisor"
              width={26}
              height={26}
              className="size-6"
            />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              TripAdvisor
            </span>
          </div>
        )}

        {showProviderLocation ? (
          <p className="text-xs font-semibold tracking-[0.3em] text-foreground">
            {locationLine}
          </p>
        ) : null}
      </div>
    </div>
  )
}
