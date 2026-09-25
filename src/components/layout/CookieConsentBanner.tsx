import { Link } from 'react-router-dom'
import { useCookieConsent } from '../../hooks/useCookieConsent'

export function CookieConsentBanner() {
  const { consent, loaded, setConsent } = useCookieConsent()

  if (!loaded || consent !== null) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-bold text-ink">We use cookies</h2>
        <p className="mb-5 text-sm text-grey">
          We use cookies to keep you signed in and to understand how the site is used. See our{' '}
          <Link to="/cookie-policy" className="font-semibold text-red-dark hover:text-red">
            Cookie Policy
          </Link>{' '}
          for details.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConsent('rejected')}
            className="flex-1 rounded-full border border-[#d8dbe2] bg-white px-4 py-2.5 text-sm font-bold text-ink hover:bg-[#f2f2f2]"
          >
            Reject
          </button>
          <button
            onClick={() => setConsent('accepted')}
            className="flex-1 rounded-full bg-red px-4 py-2.5 text-sm font-bold text-white hover:bg-red-dark"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
