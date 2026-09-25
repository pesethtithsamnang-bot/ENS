import { supabase } from '../../lib/supabase/client'

export async function getSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
  if (error) throw error
  return data
}
