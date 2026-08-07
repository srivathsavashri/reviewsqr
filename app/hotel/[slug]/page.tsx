import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findHotel } from '@/lib/hotels'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function HotelPage({ params }: Props) {
  const { slug } = await params
  const hotel = await findHotel(slug)
  if (!hotel) return notFound()

  const googleHref = `/hotel/${hotel.slug}/google`
  const tripAdvisorHref = `/hotel/${hotel.slug}/tripadvisor`

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href={googleHref}
          className="flex h-48 flex-col items-center justify-center rounded-3xl border border-border bg-card text-center text-foreground transition hover:border-primary/70 hover:shadow-lg"
        >
          <span className="text-2xl font-semibold">Google</span>
        </Link>

        <Link
          href={tripAdvisorHref}
          className="flex h-48 flex-col items-center justify-center rounded-3xl border border-border bg-card text-center text-foreground transition hover:border-primary/70 hover:shadow-lg"
        >
          <span className="text-2xl font-semibold">TripAdvisor</span>
        </Link>
      </section>

      <section className="mt-4 flex items-center justify-center">
        <Link
          href={`/hotel/${hotel.slug}/sign-in`}
          className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/70 hover:bg-primary/5"
        >
          Admin sign in
        </Link>
      </section>
    </main>
  )
}
