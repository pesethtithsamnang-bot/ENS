import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase/client'
import { useLogVisit } from '../hooks/useLogVisit'
import { renderLegalMarkdown } from '../features/legal/renderLegalMarkdown'

async function getTerms() {
  const { data, error } = await supabase.from('site_settings').select('terms_and_conditions').eq('id', 1).single()
  if (error) throw error
  return data.terms_and_conditions
}

export function TermsPage() {
  useLogVisit('/terms')
  const { data: terms, isLoading } = useQuery({ queryKey: ['terms'], queryFn: getTerms })

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      {isLoading && <p className="text-sm text-grey">Loading...</p>}
      {terms && <div className="legal-content">{renderLegalMarkdown(terms)}</div>}
    </div>
  )
}
