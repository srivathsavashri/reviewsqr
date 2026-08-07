import { notFound } from 'next/navigation'
import { AllReviewFlow } from '@/components/all-review-flow'
import { findHotel } from '@/lib/hotels'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function AllReviewOptionsPage({ params }: Props) {
  const { slug } = await params
  if (slug !== 'surestay') return notFound()

  const hotel = await findHotel(slug)
  if (!hotel) return notFound()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl items-center justify-center px-4 py-6 sm:py-10">
      <AllReviewFlow hotel={hotel} />
    </main>
  )
}
