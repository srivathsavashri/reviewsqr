export type Hotel = {
  slug: string
  name: string
  location: string
  googleReviewUrl: string
  tripAdvisorUrl: string
  adminUsername: string
  adminPassword: string
  adminEmail: string
}

export const HOTELS: Hotel[] = [
  {
    slug: 'hamptoninn',
    name: 'Hampton Inn',
    location: 'Houston-Willowbrook Mall',
    googleReviewUrl:
      'https://search.google.com/local/writereview?placeid=ChIJ3QVQWOjNQIYRkRe6juuZ7ZI',
    tripAdvisorUrl:
      'https://www.tripadvisor.com/UserReviewEdit-g56003-d223152-Hampton_Inn_Houston_willowbrook_Mall-Houston_Texas.html',
    adminUsername: 'admin',
    adminPassword: 'admin',
    adminEmail: 'hamptoninn-admin@example.com',
  },
  {
    slug: 'laquinta-wichita-falls',
    name: 'La Quinta Inn & Suites by Wyndham',
    location: 'Wichita Falls, Texas',
    googleReviewUrl:
      'https://search.google.com/local/writereview?placeid=ChIJNyog-dMhU4YRVPcqlh9gt24',
    tripAdvisorUrl:
      'https://www.tripadvisor.com/UserReviewEdit-g56891-d6499801-La_Quinta_Wichita_Falls_Texas-Wichita_Falls_Texas.html',
    adminUsername: 'admin',
    adminPassword: 'admin',
    adminEmail: 'laquinta-admin@example.com',
  },
  {
    slug: 'surestay',
    name: 'SureStay by Best Western Irving Grapevine DFW North',
    location: 'Irving Grapevine DFW North',
    googleReviewUrl:
      'https://surestay-livid.vercel.app/',
    tripAdvisorUrl:
      'https://v0-tripadvisor.vercel.app/',
    adminUsername: 'admin',
    adminPassword: 'admin',
    adminEmail: 'surestay-admin@example.com',
  },
]


export function findHotel(slug: string) {
  return HOTELS.find((hotel) => hotel.slug === slug) || null
}
