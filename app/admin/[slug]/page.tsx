import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, MessageSquare, Star } from 'lucide-react'
import { isAdmin } from '@/lib/admin-auth'
import { getAllFeedback, sendLowRatingReminder } from '@/app/actions/feedback'
import { FeedbackList } from '@/components/feedback-list'
import { SignOutButton } from '@/components/sign-out-button'
import { Card } from '@/components/ui/card'
import { findHotel } from '@/lib/hotels'
import {
  REVIEW_PROVIDER_LABELS,
  type PublicReviewProvider,
} from '@/lib/review-platforms'

export const dynamic = 'force-dynamic'

type FeedbackProvider =
  | 'private'
  | 'google'
  | 'tripadvisor'
  | 'booking'
  | 'expedia'

type Props = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    providers?: string | string[]
    period?: string
    startDate?: string
    endDate?: string
    sent?: string
  }>
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none text-foreground">
          {value}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">{label}</span>
      </div>
    </Card>
  )
}

export default async function HotelAdminPage({ params, searchParams }: Props) {
  const { slug } = await params
  const hotel = await findHotel(slug)
  if (!hotel) return notFound()

  if (!(await isAdmin(slug))) redirect(`/hotel/${slug}/sign-in`)

  const resolvedSearchParams = await searchParams
  const providerParams = Array.isArray(resolvedSearchParams.providers)
    ? resolvedSearchParams.providers
    : resolvedSearchParams.providers
    ? [resolvedSearchParams.providers]
    : []
  const selectedProviders = providerParams.filter((provider) =>
    ['private', 'google', 'tripadvisor', 'booking', 'expedia'].includes(provider),
  ) as FeedbackProvider[]

  const filters = {
    providers: selectedProviders,
    period: resolvedSearchParams.period === 'today' ? 'today' : undefined,
    startDate: resolvedSearchParams.startDate,
    endDate: resolvedSearchParams.endDate,
  }

  let feedback = []
  let loadError: string | null = null
  let sentMessage: string | null = null

  try {
    feedback = await getAllFeedback(slug, filters)
    if (resolvedSearchParams.sent === '1') {
      sentMessage = 'Low-rating reminder email sent successfully.'
    }
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : 'Unable to load feedback data.'
  }

  const total = feedback.length
  const privateCount = feedback.filter((f) => f.kind === 'private').length
  const googleCount = feedback.filter((f) => f.kind === 'google').length
  const tripAdvisorCount = feedback.filter((f) => f.kind === 'tripadvisor').length
  const bookingCount = feedback.filter((f) => f.kind === 'booking').length
  const expediaCount = feedback.filter((f) => f.kind === 'expedia').length
  const avgRating =
    total > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
      : '—'

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 px-4 py-10">
      {loadError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <strong className="font-semibold">Unable to load feedback.</strong>
          <p className="mt-1">{loadError}</p>
        </div>
      ) : null}
      {sentMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-foreground">
          <strong className="font-semibold">Reminder sent.</strong>
          <p className="mt-1">{sentMessage}</p>
        </div>
      ) : null}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Feedback Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            {hotel.name} · {hotel.location}
          </p>
          <p className="text-xs text-muted-foreground/80">Signed in as admin</p>
        </div>
        <SignOutButton />
      </header>

      <form method="get" action={`/admin/${slug}`} className="grid gap-4 rounded-xl border border-muted/40 bg-muted/50 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Filter by provider</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  'private',
                  'google',
                  'tripadvisor',
                  'booking',
                  'expedia',
                ] as FeedbackProvider[]
              ).map((provider) => (
                <label
                  key={provider}
                  className="inline-flex items-center gap-2 rounded-md border border-muted/50 bg-background px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="providers"
                    value={provider}
                    defaultChecked={selectedProviders.includes(provider)}
                    className="h-4 w-4 rounded border-muted/50 text-primary"
                  />
                  {provider === 'private'
                    ? 'Private'
                    : REVIEW_PROVIDER_LABELS[
                        provider as PublicReviewProvider
                      ]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Filter by date</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span>Start date</span>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={resolvedSearchParams.startDate ?? ''}
                  className="rounded-md border border-muted/50 bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>End date</span>
                <input
                  name="endDate"
                  type="date"
                  defaultValue={resolvedSearchParams.endDate ?? ''}
                  className="rounded-md border border-muted/50 bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="period"
                value="today"
                defaultChecked={resolvedSearchParams.period === 'today'}
                className="h-4 w-4 rounded border-muted/50 text-primary"
              />
              Show only today
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Apply filters
          </button>
          <a
            href={`/admin/${slug}`}
            className="rounded-md border border-muted/50 px-4 py-2 text-sm text-foreground"
          >
            Clear filters
          </a>
        </div>
      </form>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total entries"
          value={String(total)}
          icon={<MessageSquare className="size-5" />}
        />
        <StatCard
          label="Avg. rating"
          value={String(avgRating)}
          icon={<Star className="size-5" />}
        />
        <StatCard
          label="Private feedback"
          value={String(privateCount)}
          icon={<MessageSquare className="size-5" />}
        />
        <StatCard
          label="Sent to public review"
          value={String(
            googleCount + tripAdvisorCount + bookingCount + expediaCount,
          )}
          icon={<ExternalLink className="size-5" />}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              All feedback
            </h2>
            <p className="text-xs text-muted-foreground">
              Showing {feedback.length} entries for {selectedProviders.length ? selectedProviders.join(', ') : 'all providers'}{' '}
              {resolvedSearchParams.period === 'today' ? 'today' : resolvedSearchParams.startDate || resolvedSearchParams.endDate ? 'in date range' : ''}.
            </p>
          </div>
          <form action={sendLowRatingReminder}>
            <input type="hidden" name="hotelSlug" value={slug} />
            <button
              type="submit"
              className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-white"
            >
              Send low-rating reminder
            </button>
          </form>
        </div>
        <FeedbackList initial={feedback} hotelSlug={slug} />
      </section>

      <footer className="mt-auto pt-4">
        <a
          href={`/hotel/${hotel.slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to guest experience
        </a>
      </footer>
    </main>
  )
}
