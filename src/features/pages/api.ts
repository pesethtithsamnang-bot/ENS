import { supabase } from '../../lib/supabase/client'

export async function getFooterPages() {
  const { data, error } = await supabase.from('pages').select('*').eq('show_in_footer', true).order('created_at')
  if (error) throw error
  return data
}

export async function getPageBySlug(slug: string) {
  const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).single()
  if (error) throw error
  return data
}
