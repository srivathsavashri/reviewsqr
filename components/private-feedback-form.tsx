'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitPrivateFeedback } from '@/app/actions/feedback'
import { toast } from 'sonner'

type Props = {
  hotelSlug: string
  rating: number
  onSubmitted: () => void
}

export function PrivateFeedbackForm({ hotelSlug, rating, onSubmitted }: Props) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await submitPrivateFeedback({ hotelSlug, rating, name, message })
      onSubmitted()
    } catch (err) {
      console.log('[v0] submitPrivateFeedback error:', err)
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground text-balance">
          We&apos;re sorry we missed the mark
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Your feedback goes straight to our management team so we can make it
          right. Please tell us what happened.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">What could we have done better?</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your experience..."
          rows={4}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <Button type="submit" disabled={loading} className="mt-2 w-full" size="lg">
        {loading ? 'Sending...' : 'Submit Feedback'}
      </Button>
    </form>
  )
}
