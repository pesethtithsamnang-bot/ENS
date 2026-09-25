import { X } from 'lucide-react'
import { useReaderAuth } from '../../../context/ReaderAuthContext'
import { supabase } from '../../../lib/supabase/client'

export function WarningBanner() {
  const { session, warningMessage } = useReaderAuth()
  if (!warningMessage || !session) return null

  async function dismiss() {
    await supabase
      .from('reader_profiles')
      .update({ warning_message: null, warning_created_at: null })
      .eq('id', session!.user.id)
    // The auth context only re-fetches on auth state changes, not on this
    // update, so just reload to pick up the cleared state - simplest way
    // to avoid a second source of truth for one-time banners like this.
    window.location.reload()
  }

  return (
    <div className="border-b-2 border-amber bg-[#FBF1DD] px-6 py-3">
      <div className="mx-auto flex max-w-[1600px] items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink">
          <strong className="font-bold">A note from ENS staff:</strong> {warningMessage}
        </p>
        <button onClick={dismiss} className="flex-shrink-0 rounded-full p-1 hover:bg-black/5" aria-label="Dismiss">
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
