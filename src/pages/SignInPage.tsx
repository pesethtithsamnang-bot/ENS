import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '../features/auth/api'
import { supabase } from '../lib/supabase/client'
import { useSiteSettings } from '../features/settings/hooks'

/** Resolve username → email via reader_profiles.display_name lookup */
async function resolveEmail(input: string): Promise<string> {
  if (input.includes('@')) return input.trim()

  const { data, error } = await supabase
    .from('reader_profiles')
    .select('id')
    .eq('display_name', input.trim())
    .limit(1)
    .single()

  if (error || !data) {
    throw new Error('No account found with that username.')
  }

  const { data: emailRow, error: emailErr } = await supabase
    .from('reader_emails')
    .select('email')
    .eq('reader_id', data.id)
    .limit(1)
    .single()

  if (emailErr || !emailRow?.email) {
    throw new Error('Could not resolve email for that username. Try logging in with your email address.')
  }

  return emailRow.email as string
}

export function SignInPage() {
  const { data: settings } = useSiteSettings()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!identifier.trim()) return setError('Enter your email or username.')
    if (!password) return setError('Enter your password.')
    setLoading(true)
    try {
      const email = await resolveEmail(identifier)
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
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
        <h1 className="text-3xl font-bold text-ink">Log in</h1>
        <p className="mt-1.5 text-sm text-grey">
          New user?{' '}
          <Link to="/signup" className="font-semibold text-red underline hover:text-red-dark">
            Create account
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* Email / Username */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Email or Username
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="your@email.com or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-lg border border-[#d8dbe2] px-4 py-3 text-sm text-ink placeholder:text-grey focus:border-ink focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Password"
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

          {error && (
            <p className="rounded-lg bg-red/5 px-3 py-2 text-sm font-medium text-red-dark">{error}</p>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-red py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          {/* Forgot password — below button */}
          <Link
            to="/forgot-password"
            className="text-center text-sm font-semibold text-red underline hover:text-red-dark"
          >
            Forgot password?
          </Link>
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
