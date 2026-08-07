import { notFound } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { findHotel } from '@/lib/hotels'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function HotelSignInPage({ params }: Props) {
  const { slug } = await params
  const hotel = findHotel(slug)
  if (!hotel) return notFound()

  return <AuthForm hotel={hotel} />
}
