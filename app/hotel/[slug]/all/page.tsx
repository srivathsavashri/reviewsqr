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
    <main className="relative flex min-h-svh w-full items-center justify-center px-4 py-6 sm:py-10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/surestay-hotel.png)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-background/65 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg">
        <AllReviewFlow hotel={hotel} />
      </div>
    </main>
  )
}
