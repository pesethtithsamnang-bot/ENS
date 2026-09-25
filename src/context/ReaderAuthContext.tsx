import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase/client'

type ReaderState = {
  session: Session | null
  displayName: string | null
  avatarUrl: string | null
  isBanned: boolean
  suspendedUntil: string | null
  banReason: string | null
  suspendReason: string | null
  warningMessage: string | null
  loading: boolean
}

const EMPTY: ReaderState = {
  session: null,
  displayName: null,
  avatarUrl: null,
  isBanned: false,
  suspendedUntil: null,
  banReason: null,
  suspendReason: null,
  warningMessage: null,
  loading: true,
}

const ReaderAuthContext = createContext<ReaderState>(EMPTY)

const PROFILE_FIELDS = 'display_name, avatar_url, is_banned, suspended_until, ban_reason, suspend_reason, warning_message'

export function ReaderAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReaderState>(EMPTY)

  useEffect(() => {
    async function load(session: Session | null) {
      if (!session) {
        setState({ ...EMPTY, loading: false })
        return
      }
      const { data } = await supabase.from('reader_profiles').select(PROFILE_FIELDS).eq('id', session.user.id).maybeSingle()

      if (data) {
        setState({
          session,
          displayName: data.display_name,
          avatarUrl: data.avatar_url,
          isBanned: !!data.is_banned,
          suspendedUntil: data.suspended_until,
          banReason: data.ban_reason,
          suspendReason: data.suspend_reason,
          warningMessage: data.warning_message,
          loading: false,
        })
        return
      }

      // Signed in but no profile row exists yet (e.g. an interrupted signup) -
      // create one now so comments/likes/follows aren't silently blocked.
      const fallbackName = session.user.email?.split('@')[0] ?? 'Reader'
      await supabase.from('reader_profiles').insert({ id: session.user.id, display_name: fallbackName })
      if (session.user.email) {
        await supabase.from('reader_emails').upsert({ reader_id: session.user.id, email: session.user.email })
      }
      setState({ ...EMPTY, session, displayName: fallbackName, loading: false })
    }

    supabase.auth.getSession().then(({ data }) => load(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => load(session))
    return () => listener.subscription.unsubscribe()
  }, [])

  return <ReaderAuthContext.Provider value={state}>{children}</ReaderAuthContext.Provider>
}

export function useReaderAuth() {
  return useContext(ReaderAuthContext)
}
