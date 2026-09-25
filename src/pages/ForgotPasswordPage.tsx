import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { sendPasswordReset } from '../features/auth/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-3 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink">Check your email</h1>
        <p className="text-sm text-grey">
          If an account exists for {email}, a password reset link is on its way.
        </p>
        <Link to="/signin" className="mt-2 text-sm font-semibold text-red-dark">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-grey">We'll email you a link to set a new one.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-grey">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#dadce0] px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        {error && <p className="text-sm font-medium text-red-dark">{error}</p>}
        <Button type="submit" disabled={loading} className="justify-center">
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
      <Link to="/signin" className="text-sm font-semibold text-red-dark">Back to sign in</Link>
    </div>
  )
}
