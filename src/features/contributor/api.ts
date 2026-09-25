import { supabase } from '../../lib/supabase/client'

export async function uploadArticleCover(file: File) {
  const path = `cover-${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('reader-uploads').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('reader-uploads').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadArticleImage(file: File) {
  return uploadArticleCover(file)
}

function slugify(title: string) {
  return `${title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`
}

export type ArticleInput = {
  title: string
  excerpt: string
  categoryId: string
  coverImageUrl: string
  contentBlocks: unknown
  tags: string[]
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  references: unknown
  scheduledAt: string | null
}

export async function submitArticle(
  input: ArticleInput & { authorReaderId: string; autoApprove: boolean }
) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title_en: input.title,
      excerpt: input.excerpt,
      slug: slugify(input.title),
      category_id: input.categoryId,
      author_reader_id: input.authorReaderId,
      cover_image_url: input.coverImageUrl,
      content_blocks: input.contentBlocks,
      tags: input.tags,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      canonical_url: input.canonicalUrl || null,
      references: input.references,
      scheduled_at: input.scheduledAt,
      status: input.scheduledAt ? 'scheduled' : input.autoApprove ? 'published' : 'pending_review',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMyArticle(id: string, input: ArticleInput, status?: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({
      title_en: input.title,
      excerpt: input.excerpt,
      category_id: input.categoryId,
      cover_image_url: input.coverImageUrl,
      content_blocks: input.contentBlocks,
      tags: input.tags,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      canonical_url: input.canonicalUrl || null,
      references: input.references,
      scheduled_at: input.scheduledAt,
      ...(status ? { status, ...(status === 'published' ? { published_at: new Date().toISOString() } : {}) } : {}),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMyPosts(readerId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name)')
    .eq('author_reader_id', readerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getMyArticleById(id: string) {
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function deleteMyPost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}
