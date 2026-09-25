import { supabase } from '../../lib/supabase/client'

export async function getVisibleCategories() {
  const { data, error } = await supabase.from('categories').select('*').eq('is_visible', true).order('name')
  if (error) throw error
  return data
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}
