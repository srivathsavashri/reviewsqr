import type { Hotel } from '@/lib/hotels'
import {
  REVIEW_PROVIDER_LABELS,
  type PublicReviewProvider,
} from '@/lib/review-platforms'

type LowRatingArgs = {
  hotel: Hotel
  rating: number
  guestName?: string | null
  guestEmail?: string | null
  guestPhone?: string | null
  message?: string | null
}

type ReviewClickArgs = {
  hotel: Hotel
  provider: PublicReviewProvider
  rating: number
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com'
const SENDGRID_ENDPOINT = 'https://api.sendgrid.com/v3/mail/send'

function stars(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

async function sendGridEmail(message: { to: string; subject: string; html: string }) {
  if (!SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY is not configured')

  const response = await fetch(SENDGRID_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: message.to }],
          subject: message.subject,
        },
      ],
      from: { email: FROM },
      content: [{ type: 'text/html', value: message.html }],
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`SendGrid rejected the email (${response.status}): ${details}`)
  }
}

export async function sendLowRatingEmail(args: LowRatingArgs) {
  const { hotel, rating, guestName, guestEmail, guestPhone, message } = args

  await sendGridEmail({
    to: hotel.adminEmail,
    subject: `New ${rating}-star feedback needs attention — ${hotel.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #1e293b;">New guest feedback (${rating}/5)</h2>
        <p style="font-size: 20px; color: #d97706; margin: 4px 0;">${stars(rating)}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 6px 0; color: #64748b;">Name</td><td style="padding: 6px 0;">${guestName || '—'}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;">${guestEmail || '—'}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0;">${guestPhone || '—'}</td></tr>
        </table>
        <p style="color: #64748b; margin-top: 16px;">Message</p>
        <p style="background: #f8fafc; padding: 12px; border-radius: 8px; white-space: pre-wrap;">${message || '—'}</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">${hotel.name} — ${hotel.location}</p>
      </div>
    `,
  })
}

export async function sendLowRatingSummaryEmail(hotel: Hotel, reviews: Array<{
  rating: number
  kind: string
  guestName?: string | null
  guestEmail?: string | null
  guestPhone?: string | null
  message?: string | null
  createdAt: Date
}>) {
  const reviewRows = reviews
    .map((review) => {
      const starsText = stars(review.rating)
      const type =
        review.kind === 'private'
          ? 'Private'
          : REVIEW_PROVIDER_LABELS[review.kind as PublicReviewProvider] ||
            review.kind
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top;">
            <strong>${starsText}</strong><br /><span style="color:#64748b;">${type}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top;">
            ${review.message ? `<p>${review.message}</p>` : '<p><em>No message</em></p>'}
            <p style="font-size: 12px; color: #64748b; margin: 0;">${review.guestName || 'Guest'} • ${review.guestEmail || 'No email'}${review.guestPhone ? ` • ${review.guestPhone}` : ''}</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">${new Date(review.createdAt).toLocaleString()}</p>
          </td>
        </tr>
      `
    })
    .join('')

  await sendGridEmail({
    to: hotel.adminEmail,
    subject: `Low-rating reminder — ${reviews.length} feedback item${reviews.length === 1 ? '' : 's'} for ${hotel.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Low-rating review reminder</h2>
        <p style="color: #334155;">There are ${reviews.length} recent review${reviews.length === 1 ? '' : 's'} with a rating of 3 or below for ${hotel.name}.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          ${reviewRows}
        </table>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">${hotel.name} — ${hotel.location}</p>
      </div>
    `,
  })
}

export async function sendReviewClickEmail(args: ReviewClickArgs) {
  const { hotel, provider, rating } = args
  const providerName = REVIEW_PROVIDER_LABELS[provider]

  await sendGridEmail({
    to: hotel.adminEmail,
    subject: `Guest gave ${rating} stars and was sent to ${providerName} — ${hotel.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #1e293b;">A happy guest is heading to ${providerName}</h2>
        <p style="font-size: 20px; color: #d97706; margin: 4px 0;">${stars(rating)}</p>
        <p style="color: #334155;">A guest rated their stay <strong>${rating}/5</strong> and clicked through to leave a public ${providerName} review.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">${hotel.name} — ${hotel.location}</p>
      </div>
    `,
  })
}
