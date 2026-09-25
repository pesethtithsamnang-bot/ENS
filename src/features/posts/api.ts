import { supabase } from '../../lib/supabase/client'

export async function getPublishedPosts(limit = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, slug), reader_profiles!posts_author_reader_id_fkey(display_name, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

const PAGE_SIZE = 20

export async function getPublishedPostsPage(page: number) {
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, slug), reader_profiles!posts_author_reader_id_fkey(display_name, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to)
  if (error) throw error
  return { posts: data, nextPage: data.length === PAGE_SIZE ? page + 1 : undefined }
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, slug), reader_profiles!posts_author_reader_id_fkey(id, display_name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) throw error
  return data
}

export async function getPostsByCategory(categorySlug: string) {
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()
  if (catError) throw catError
  if (!category) return []

  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, slug), reader_profiles!posts_author_reader_id_fkey(display_name, avatar_url)')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

export async function searchPosts(query: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, slug), reader_profiles!posts_author_reader_id_fkey(display_name, avatar_url)')
    .eq('status', 'published')
    .or(`title_en.ilike.%${query}%,body_en.ilike.%${query}%`)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

// Used for live search suggestions: if the exact phrase has no matches,
// falls back to matching on its individual significant words, and if that
// still comes up empty, falls back further to the most recent published
// posts - so a search never dead-ends with nothing to show, it just gets
// progressively less exact about what "relevant" means.
export async function searchPostsWithFallback(query: string, limit = 5) {
  const exact = await searchPosts(query)
  if (exact.length > 0) return { results: exact.slice(0, limit), exact: true }

  const words = query.trim().split(/\s+/).filter((w) => w.length > 2)
  if (words.length > 0) {
    const orClause = words.map((w) => `title_en.ilike.%${w}%`).join(',')
    const { data } = await supabase
      .from('posts')
      .select('*, categories(name, slug), reader_profiles!posts_author_reader_id_fkey(display_name, avatar_url)')
      .eq('status', 'published')
      .or(orClause)
      .order('published_at', { ascending: false })
      .limit(limit)
    if (data && data.length > 0) return { results: data, exact: false }
  }

  const { data: recent } = await supabase
    .from('posts')
    .select('*, categories(name, slug), reader_profiles!posts_author_reader_id_fkey(display_name, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
  return { results: recent ?? [], exact: false }
}
