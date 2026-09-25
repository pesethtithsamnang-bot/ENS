import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase/client'
import { useLogVisit } from '../hooks/useLogVisit'
import { renderLegalMarkdown } from '../features/legal/renderLegalMarkdown'

async function getCookiePolicy() {
  const { data, error } = await supabase.from('site_settings').select('cookie_policy').eq('id', 1).single()
  if (error) throw error
  return data.cookie_policy
}

export function CookiePolicyPage() {
  useLogVisit('/cookie-policy')
  const { data: policy, isLoading } = useQuery({ queryKey: ['cookie-policy'], queryFn: getCookiePolicy })

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      {isLoading && <p className="text-sm text-grey">Loading...</p>}
      {policy && <div className="legal-content">{renderLegalMarkdown(policy)}</div>}
    </div>
  )
}
