import { supabase } from '../../lib/supabase/client'

export async function getPublishedBooks() {
  const { data, error } = await supabase.from('books').select('*').eq('status', 'published').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function searchBooks(query: string) {
  const { data, error } = await supabase
    .from('books')
    .select('id, title, author_name, cover_image_url')
    .eq('status', 'published')
    .ilike('title', `%${query}%`)
    .limit(5)
  if (error) throw error
  return data
}

export async function getBookById(id: string) {
  const { data, error } = await supabase.from('books').select('*').eq('id', id).eq('status', 'published').single()
  if (error) throw error
  return data
}

/**
 * The book-pdfs bucket is private - book.pdf_url actually stores the
 * storage path, not a usable link. This exchanges that path for a signed
 * URL that expires in an hour, so the file can't be bookmarked or shared
 * as a permanent direct link.
 */
export async function getSignedPdfUrl(path: string) {
  const { data, error } = await supabase.storage.from('book-pdfs').createSignedUrl(path, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

export async function getBookPages(bookId: string) {
  const { data, error } = await supabase.from('book_pages').select('*').eq('book_id', bookId).order('page_number')
  if (error) throw error
  return data
}

export async function getReadingProgress(bookId: string, readerId: string | null) {
  if (!readerId) return 1
  const { data } = await supabase.from('reading_progress').select('current_page').eq('book_id', bookId).eq('reader_id', readerId).maybeSingle()
  return data?.current_page ?? 1
}

// For the Library page's "Continue Reading" shelf - every book this
// reader has made progress in, most recently read first. Two queries
// rather than a joined/embedded select, since the generated types here
// don't model the reading_progress -> books relationship.
export async function getMyInProgressBooks(readerId: string) {
  const { data: progress, error } = await supabase
    .from('reading_progress')
    .select('book_id, updated_at')
    .eq('reader_id', readerId)
    .order('updated_at', { ascending: false })
    .limit(10)
  if (error) throw error
  if (progress.length === 0) return []

  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, author_name, cover_image_url')
    .in('id', progress.map((p) => p.book_id))
  if (booksError) throw booksError

  const byId = new Map(books.map((b) => [b.id, b]))
  return progress.map((p) => byId.get(p.book_id)).filter((b): b is NonNullable<typeof b> => !!b)
}

export async function saveReadingProgress(bookId: string, readerId: string, currentPage: number) {
  await supabase.from('reading_progress').upsert({ book_id: bookId, reader_id: readerId, current_page: currentPage })
}
