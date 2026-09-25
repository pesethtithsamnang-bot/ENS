import { useState, type FormEvent } from 'react'
import { Button } from '../components/ui'
import { useReaderAuth } from '../context/ReaderAuthContext'
import { useSubmitFeedback } from '../features/feedback/hooks'
import { useLogVisit } from '../hooks/useLogVisit'

export function FeedbackPage() {
  useLogVisit('/feedback')
  const { session } = useReaderAuth()
  const submitFeedback = useSubmitFeedback()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    submitFeedback.mutate(
      { name, email, message, readerId: session?.user.id ?? null },
      { onSuccess: () => setDone(true) }
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-14">
      <h1 className="mb-2 font-serif text-3xl font-bold">Feedback</h1>
      <p className="mb-6 text-sm text-grey">Something broken, confusing, or missing? Tell us.</p>

      {done ? (
        <p className="rounded-lg border-2 border-ink bg-surface p-4 text-sm font-semibold">Thanks, we read every message.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className="rounded-md border-2 border-ink px-3 py-2.5 text-sm outline-none" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="rounded-md border-2 border-ink px-3 py-2.5 text-sm outline-none" />
          <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your feedback" className="min-h-32 rounded-md border-2 border-ink p-3 text-sm outline-none" />
          <Button type="submit" disabled={submitFeedback.isPending} className="justify-center">
            {submitFeedback.isPending ? 'Sending...' : 'Send feedback'}
          </Button>
        </form>
      )}
    </div>
  )
}
