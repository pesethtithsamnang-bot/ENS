import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Clock, X } from 'lucide-react'
import { searchPostsWithFallback } from '../../features/posts/api'
import { useSearchHistory } from '../../hooks/useSearchHistory'

type Result = { slug: string; title_en: string; cover_image_url: string | null }

export function MobileSearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [isFallback, setIsFallback] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const navigate = useNavigate()
  const { history, addSearch, removeSearch } = useSearchHistory()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    clearTimeout(debounceRef.current)
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { results: r, exact } = await searchPostsWithFallback(query.trim())
        setResults(r)
        setIsFallback(!exact)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  function runSearch(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return
    addSearch(trimmed)
    onClose()
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  function goToResult(slug: string) {
    addSearch(query)
    onClose()
    navigate(`/post/${slug}`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-white md:hidden">
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#e5e5e5] px-3 py-2.5">
        <button onClick={onClose} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full hover:bg-surface" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            runSearch(query)
          }}
          className="flex flex-1 items-center gap-2 rounded-full border border-[#ccc] px-3.5 py-2"
        >
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, books, topics..."
            className="search-input flex-1 text-[15px] outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear">
              <X className="h-4 w-4 text-grey" />
            </button>
          )}
          <button type="submit" aria-label="Search">
            <Search className="h-4 w-4 text-grey" />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        {query.trim().length < 2 ? (
          <div className="py-2">
            {history.length === 0 && <p className="px-4 py-6 text-sm text-grey">Your recent searches will show up here.</p>}
            {history.map((q) => (
              <div key={q} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                <Clock className="h-4 w-4 flex-shrink-0 text-grey" strokeWidth={1.75} />
                <button onClick={() => runSearch(q)} className="flex-1 text-left text-[15px] text-ink">
                  {q}
                </button>
                <button onClick={() => removeSearch(q)} aria-label="Remove" className="text-grey">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2">
            {loading && <p className="px-4 py-6 text-sm text-grey">Searching...</p>}
            {!loading && results.length === 0 && <p className="px-4 py-6 text-sm text-grey">Nothing found for "{query}".</p>}
            {!loading && results.length > 0 && isFallback && (
              <p className="px-4 pb-2 pt-3 text-xs font-medium text-grey">
                No exact match for "{query}" - here's what's closest:
              </p>
            )}
            {results.map((r) => (
              <button key={r.slug} onClick={() => goToResult(r.slug)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface">
                {r.cover_image_url ? (
                  <img src={r.cover_image_url} alt="" className="h-10 w-10 flex-shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-surface">
                    <Search className="h-4 w-4 text-grey" />
                  </span>
                )}
                <span className="line-clamp-2 text-[14px] text-ink">{r.title_en}</span>
              </button>
            ))}
            {!loading && results.length > 0 && (
              <button
                onClick={() => runSearch(query)}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-red-dark hover:bg-surface"
              >
                See all results for "{query}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
