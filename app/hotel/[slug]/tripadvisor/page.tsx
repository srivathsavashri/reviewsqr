import { notFound } from 'next/navigation'
import { findHotel } from '@/lib/hotels'
import { FeedbackFlow } from '@/components/feedback-flow'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function HotelTripAdvisorReviewPage({ params }: Props) {
  const { slug } = await params
  const hotel = await findHotel(slug)
  if (!hotel) return notFound()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl items-center justify-center px-4 py-10">
      <FeedbackFlow hotel={hotel} initialProvider="tripadvisor" />
    </main>
  )
}
