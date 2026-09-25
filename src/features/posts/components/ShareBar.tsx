import { useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import { postUrl } from '../../../config/site'

export function ShareBar({ postId, slug }: { postId: string; slug: string }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(postUrl(slug))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    // Fire and forget - a real share happened, count it for the author's stats.
    supabase.from('post_shares').insert({ post_id: postId }).then(() => {})
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-y-2 border-ink py-3">
      <span className="mr-1 font-mono text-[11px] text-grey">SHARE</span>
      <button
        onClick={copyLink}
        className="shadow-press rounded-md border-2 border-ink bg-paper px-3 py-1.5 text-xs font-bold shadow-sm"
      >
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  )
}
