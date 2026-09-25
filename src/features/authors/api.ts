import { supabase } from '../../lib/supabase/client'

export async function getAuthorProfile(readerId: string) {
  const { data, error } = await supabase.from('reader_profiles').select('*').eq('id', readerId).single()
  if (error) throw error
  return data
}

export async function getAuthorPosts(readerId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, slug)')
    .eq('author_reader_id', readerId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAuthorStats(readerId: string) {
  const posts = await getAuthorPosts(readerId)
  const postIds = posts.map((p) => p.id)
  if (postIds.length === 0) {
    return { totalPosts: 0, totalLikes: 0, totalComments: 0, totalShares: 0 }
  }
  const [{ count: totalLikes }, { count: totalComments }, { count: totalShares }] = await Promise.all([
    supabase.from('post_likes').select('*', { count: 'exact', head: true }).in('post_id', postIds),
    supabase.from('comments').select('*', { count: 'exact', head: true }).in('post_id', postIds).eq('is_hidden', false),
    supabase.from('post_shares').select('*', { count: 'exact', head: true }).in('post_id', postIds),
  ])
  return {
    totalPosts: posts.length,
    totalLikes: totalLikes ?? 0,
    totalComments: totalComments ?? 0,
    totalShares: totalShares ?? 0,
  }
}
