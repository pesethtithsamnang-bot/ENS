import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { updatePassword } from '../features/auth/api'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    setLoading(true)
    try {
      await updatePassword(password)
      setDone(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-3 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink">Password updated</h1>
        <p className="text-sm text-grey">Taking you back to the homepage...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5 px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Set a new password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-grey">New password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#dadce0] px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-grey">Confirm new password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-[#dadce0] px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        {error && <p className="text-sm font-medium text-red-dark">{error}</p>}
        <Button type="submit" disabled={loading} className="justify-center">
          {loading ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
