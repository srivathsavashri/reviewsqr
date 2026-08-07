export type PublicReviewProvider =
  | 'google'
  | 'tripadvisor'
  | 'booking'
  | 'expedia'

export const SURESTAY_REVIEW_URLS: Record<PublicReviewProvider, string> = {
  google:
    'https://search.google.com/local/writereview?placeid=ChIJM3SVNs0pTIYRKvHq9jmzDe8',
  tripadvisor:
    'https://www.tripadvisor.com/UserReviewEdit-g56032-d109285-Surestay_By_Best_Western_Irving_Grapevine_Dfw_North-Irving_Texas.html',
  booking:
    'https://www.booking.com/hotel/us/days-inn-dallas-fort-worth-airport-north-grapevine-irving.html?chal_t=1786122085346&force_referer=https%3A%2F%2Fwww.google.com%2F#tab-reviews',
  expedia:
    'https://www.expedia.com/Dallas-Hotels-SureStay-By-Best-Western-Irving-Grapevine-DFW-North.h10007.Hotel-Information?pwaDialog=summary-reviews-10007',
}

export const REVIEW_PROVIDER_LABELS: Record<PublicReviewProvider, string> = {
  google: 'Google',
  tripadvisor: 'TripAdvisor',
  booking: 'Booking.com',
  expedia: 'Expedia',
}

export const REVIEW_PROVIDER_LOGOS: Record<PublicReviewProvider, string> = {
  google: '/google-logo.svg',
  tripadvisor: '/tripadvisor-logo.svg',
  booking: '/booking-logo.svg',
  expedia: '/expedia-logo.svg',
}
