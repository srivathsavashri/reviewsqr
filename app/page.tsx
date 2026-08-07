import Link from 'next/link'
import { HOTELS } from '@/lib/hotels'

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-10 px-4 py-10">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Choose a hotel
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
          Share your review
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
          Select the hotel where you stayed and leave feedback. Low ratings are sent privately to the hotel admin, while 4-5 star guests can choose a public review path.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {HOTELS.map((hotel) => (
          <Link
            key={hotel.slug}
            href={`/hotel/${hotel.slug}`}
            className="rounded-3xl border border-border bg-card p-6 text-left transition hover:border-primary/70 hover:shadow-lg"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-[0.24em]">
              Hotel
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              {hotel.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {hotel.location}
            </p>
            <p className="mt-6 text-sm font-medium text-primary">Leave feedback</p>
          </Link>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Need admin access? Use the admin login link from the hotel dashboard after signing in.
        </p>
      </div>
    </main>
  )
}
