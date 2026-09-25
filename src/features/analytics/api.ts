import { supabase } from '../../lib/supabase/client'

export async function logVisit(path: string) {
  // Fire and forget - a failed visit log should never block the page.
  await supabase.from('page_visits').insert({ path })
}
