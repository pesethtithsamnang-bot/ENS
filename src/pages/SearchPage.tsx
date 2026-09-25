import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSearchPosts } from '../features/posts/hooks'
import { searchBooks } from '../features/books/api'
import { PostCard } from '../features/posts/components/PostCard'
import { PostCardSkeleton } from '../components/ui'
import { StateIllustration } from '../components/ui/StateIllustration'
import { useLogVisit } from '../hooks/useLogVisit'

type BookResult = { id: string; title: string; author_name: string; cover_image_url: string | null }

export function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  useLogVisit('/search')
  const { data: results, isLoading } = useSearchPosts(query)
  const [books, setBooks] = useState<BookResult[]>([])

  useEffect(() => {
    if (query.trim().length < 2) {
      setBooks([])
      return
    }
    searchBooks(query.trim()).then(setBooks).catch(() => setBooks([]))
  }, [query])

  const nothingFound = !isLoading && query && results?.length === 0 && books.length === 0

  return (
    <div className="page-transition mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-1 font-serif text-2xl font-bold">Search results</h1>
      <p className="mb-7 text-sm text-grey">
        {query ? `Results for "${query}"` : 'Type something in the search bar above'}
      </p>

      {isLoading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
          {[0, 1, 2, 3, 4].map((i) => <PostCardSkeleton key={i} />)}
        </div>
      )}

      {nothingFound && (
        <StateIllustration kind="empty" title="No matches found" message={`Try a different word than "${query}".`} compact />
      )}

      {books.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 font-serif text-lg font-bold">Books</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
            {books.map((b, i) => (
              <Link key={b.id} to={`/library/${b.id}`} className="stagger-item group" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="aspect-[2/3] overflow-hidden rounded-lg border-2 border-ink bg-surface shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1">
                  {b.cover_image_url && <img src={b.cover_image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <h3 className="mt-1.5 text-xs font-bold leading-snug">{b.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results && results.length > 0 && (
        <div>
          <h2 className="mb-4 font-serif text-lg font-bold">Articles</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
            {results.map((post, i) => (
              <div key={post.id} className="stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
