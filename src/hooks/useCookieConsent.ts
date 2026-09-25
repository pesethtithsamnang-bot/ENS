import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ens_cookie_consent'

export type CookieConsent = 'accepted' | 'rejected' | null

export function useCookieConsent() {
  const [consent, setConsentState] = useState<CookieConsent>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setConsentState(stored === 'accepted' || stored === 'rejected' ? stored : null)
    setLoaded(true)
  }, [])

  function setConsent(value: 'accepted' | 'rejected') {
    localStorage.setItem(STORAGE_KEY, value)
    setConsentState(value)
  }

  return { consent, loaded, setConsent }
}
