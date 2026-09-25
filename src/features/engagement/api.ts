import { supabase } from '../../lib/supabase/client'

export async function getLikeState(postId: string, readerId: string | null) {
  const [{ count }, mine] = await Promise.all([
    supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId),
    readerId
      ? supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId).eq('reader_id', readerId)
      : Promise.resolve({ count: 0 }),
  ])
  return { total: count ?? 0, likedByMe: (mine.count ?? 0) > 0 }
}

export async function toggleLike(postId: string, readerId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('reader_id', readerId)
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, reader_id: readerId })
  }
}

export async function getBookmarkState(postId: string, readerId: string | null) {
  if (!readerId) return false
  const { count } = await supabase.from('post_bookmarks').select('*', { count: 'exact', head: true }).eq('post_id', postId).eq('reader_id', readerId)
  return (count ?? 0) > 0
}

export async function toggleBookmark(postId: string, readerId: string, currentlyBookmarked: boolean) {
  if (currentlyBookmarked) {
    await supabase.from('post_bookmarks').delete().eq('post_id', postId).eq('reader_id', readerId)
  } else {
    await supabase.from('post_bookmarks').insert({ post_id: postId, reader_id: readerId })
  }
}

export async function getMyBookmarkedPosts(readerId: string) {
  const { data, error } = await supabase
    .from('post_bookmarks')
    .select('post_id, posts(id, title_en, slug, cover_image_url, published_at, categories(name, slug))')
    .eq('reader_id', readerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map((row) => row.posts).filter(Boolean)
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, reader_profiles(display_name, avatar_url)')
    .eq('post_id', postId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addComment(postId: string, readerId: string, body: string, parentId?: string) {
  const { error } = await supabase.from('comments').insert({ post_id: postId, reader_id: readerId, body, parent_id: parentId ?? null })
  if (error) throw error
}

export async function getFollowState(categoryId: string, readerId: string | null) {
  if (!readerId) return false
  const { count } = await supabase.from('category_follows').select('*', { count: 'exact', head: true }).eq('category_id', categoryId).eq('reader_id', readerId)
  return (count ?? 0) > 0
}

export async function toggleFollow(categoryId: string, readerId: string, currentlyFollowing: boolean) {
  if (currentlyFollowing) {
    await supabase.from('category_follows').delete().eq('category_id', categoryId).eq('reader_id', readerId)
  } else {
    await supabase.from('category_follows').insert({ category_id: categoryId, reader_id: readerId })
  }
}
