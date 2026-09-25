import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '../features/auth/api'
import { useSiteSettings } from '../features/settings/hooks'

export function SignUpPage() {
  const { data: settings } = useSiteSettings()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!username.trim()) return setError('Choose a username.')
    if (!email.trim()) return setError('Enter your email.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (!agreed) return setError('You need to agree to the Terms & Conditions to continue.')

    setLoading(true)
    try {
      await signUp(email, password, username.trim(), {})
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── LEFT: form panel ── */}
      <div className="flex w-full flex-col px-8 py-10 sm:px-16 md:max-w-[520px]">
        {/* Logo — top left, one instance only */}
        <div className="mb-10">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings?.site_name ?? 'ENS'} className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-red font-serif text-2xl font-bold text-white">
              {settings?.logo_letter ?? 'E'}
            </span>
          )}
        </div>

        {/* Title + subtitle */}
        <h1 className="text-3xl font-bold text-ink">Create account</h1>
        <p className="mt-1.5 text-sm text-grey">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-red underline hover:text-red-dark">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* Username */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Username <span className="text-red">*</span>
            </label>
            <input
              required
              autoComplete="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-[#d8dbe2] px-4 py-3 text-sm text-ink placeholder:text-grey focus:border-ink focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Email Address <span className="text-red">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#d8dbe2] px-4 py-3 text-sm text-ink placeholder:text-grey focus:border-ink focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Password <span className="text-red">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#d8dbe2] px-4 py-3 pr-11 text-sm text-ink placeholder:text-grey focus:border-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 text-sm text-grey">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-red"
            />
            I agree to the{' '}
            <Link to="/terms" className="font-semibold text-red underline hover:text-red-dark">
              Terms &amp; Conditions
            </Link>
          </label>

          {error && (
            <p className="rounded-lg bg-red/5 px-3 py-2 text-sm font-medium text-red-dark">{error}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-red py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      {/* ── RIGHT: cover image ── */}
      <div className="hidden flex-1 md:block">
        <img
          src="/auth-cover.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
