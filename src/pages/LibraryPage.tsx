import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useBooks, useMyInProgressBooks } from '../features/books/hooks'
import { useReaderAuth } from '../context/ReaderAuthContext'
import { Skeleton } from '../components/ui'
import { StateIllustration } from '../components/ui/StateIllustration'
import { useLogVisit } from '../hooks/useLogVisit'

export function LibraryPage() {
  useLogVisit('/library')
  const { session } = useReaderAuth()
  const { data: books, isLoading } = useBooks()
  const { data: inProgress } = useMyInProgressBooks(session?.user.id ?? null)
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState<string | null>(null)

  const genres = useMemo(() => {
    const set = new Set((books ?? []).map((b) => b.genre).filter(Boolean))
    return Array.from(set)
  }, [books])

  const filtered = (books ?? []).filter((b) => {
    const matchesQuery =
      query.trim().length === 0 ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author_name.toLowerCase().includes(query.toLowerCase())
    const matchesGenre = !genre || b.genre === genre
    return matchesQuery && matchesGenre
  })

  return (
    <div className="mx-auto max-w-[1600px] bg-white px-6 py-10">
      <h1 className="mb-1 text-3xl font-semibold text-ink">Library</h1>
      <p className="mb-6 text-sm text-grey">Books to read right here, page by page.</p>

      <div className="mb-8 flex items-center gap-2 rounded-full border border-[#d8dbe2] px-4 py-2.5">
        <Search className="h-4 w-4 flex-shrink-0 text-grey" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books, authors..."
          className="w-full text-[15px] outline-none placeholder:text-grey"
        />
      </div>

      {session && inProgress && inProgress.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-ink">Continue reading</h2>
          <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">
            {inProgress.map((book) => (
              <Link key={book.id} to={`/library/${book.id}`} className="group w-32 flex-shrink-0">
                <div className="aspect-[2/3] w-full overflow-hidden rounded-lg border border-[#e5e5e5] transition-transform duration-200 group-hover:-translate-y-1">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white text-xs text-grey">No cover</div>
                  )}
                </div>
                <h3 className="mt-2 text-xs font-semibold leading-snug text-ink line-clamp-2">{book.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {genres.length > 0 && (
        <div className="scrollbar-none mb-8 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setGenre(null)}
            className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              !genre ? 'border-ink bg-ink text-white' : 'border-[#e5e5e5] text-ink hover:bg-surface'
            }`}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                genre === g ? 'border-ink bg-ink text-white' : 'border-[#e5e5e5] text-ink hover:bg-surface'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1.5 h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}
      {!isLoading && filtered.length === 0 && (
        <StateIllustration
          kind="empty"
          title={query || genre ? 'No matching books' : 'No books yet'}
          message={query || genre ? 'Try a different search or category.' : 'Check back soon for new titles.'}
          compact
        />
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((book) => (
          <Link key={book.id} to={`/library/${book.id}`} className="group">
            <div className="aspect-[2/3] overflow-hidden rounded-lg border border-[#e5e5e5] transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-grey">No cover</div>
              )}
            </div>
            <h3 className="mt-2.5 text-sm font-semibold leading-snug text-ink line-clamp-2">{book.title}</h3>
            <p className="mt-0.5 text-xs text-grey">{book.author_name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
