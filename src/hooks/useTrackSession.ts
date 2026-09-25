import { useEffect } from 'react'
import { supabase } from '../lib/supabase/client'
import { useReaderAuth } from '../context/ReaderAuthContext'

// Runs once per signed-in session (not on every page view - there's no
// need, and it'd be wasteful). Fetches this visitor's real IP/country from
// our own whoami Pages Function and saves it onto their profile, so staff
// can see roughly where sign-ins are coming from. Only ever reflects the
// most recent sign-in, not a full history.
export function useTrackSession() {
  const { session } = useReaderAuth()

  useEffect(() => {
    if (!session) return
    const userId = session.user.id
    let cancelled = false

    async function track() {
      // Respect cookie consent: if the visitor rejected cookies, or hasn't
      // decided yet, don't capture their IP/location. Only run this once
      // they've explicitly accepted.
      if (localStorage.getItem('ens_cookie_consent') !== 'accepted') return
      try {
        const res = await fetch('/whoami')
        if (!res.ok) return
        const { ip, country } = await res.json()
        if (cancelled || (!ip && !country)) return
        await supabase
          .from('reader_profiles')
          .update({ last_ip: ip, last_country: country, last_seen_at: new Date().toISOString() })
          .eq('id', userId)
      } catch {
        // Best-effort only - never block sign-in or show an error over this.
      }
    }

    track()
    return () => {
      cancelled = true
    }
  }, [session?.user.id])
}
