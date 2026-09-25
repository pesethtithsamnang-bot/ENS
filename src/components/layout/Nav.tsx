import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSiteSettings } from '../../features/settings/hooks'
import { useReaderAuth } from '../../context/ReaderAuthContext'
import { searchPosts } from '../../features/posts/api'
import { searchBooks } from '../../features/books/api'
import { SearchIcon, MenuIcon } from '../ui/icons'
import { StateIllustration } from '../ui/StateIllustration'
import { useSidebar } from './SidebarContext'
import { MobileSearchOverlay } from './MobileSearchOverlay'

type ArticleResult = { slug: string; title_en: string; cover_image_url: string | null }
type BookResult = { id: string; title: string; author_name: string; cover_image_url: string | null }

export function Nav() {
  const { data: settings } = useSiteSettings()
  const { session } = useReaderAuth()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<ArticleResult[]>([])
  const [books, setBooks] = useState<BookResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showSuggest, setShowSuggest] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (query.trim().length < 2) {
      setArticles([])
      setBooks([])
      setSearching(false)
      return
    }
    clearTimeout(debounceRef.current)
    setSearching(true)
    const thisRequest = ++requestIdRef.current
    debounceRef.current = setTimeout(async () => {
      try {
        const [articleResults, bookResults] = await Promise.all([searchPosts(query.trim()), searchBooks(query.trim())])
        if (requestIdRef.current !== thisRequest) return
        setArticles(articleResults.slice(0, 4))
        setBooks(bookResults)
      } catch {
        setArticles([])
        setBooks([])
      } finally {
        if (requestIdRef.current === thisRequest) setSearching(false)
      }
    }, 320)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setShowSuggest(false)
  }

  const hasResults = articles.length > 0 || books.length > 0
  const showDropdown = showSuggest && (searching || hasResults || query.trim().length >= 2)
  const { toggle: toggleSidebar } = useSidebar()
  const { pathname } = useLocation()
  const chromeless = pathname === '/signin' || pathname === '/signup'

  if (chromeless) return null

  return (
    <>
    <nav className="fixed-shell fixed inset-x-0 top-0 z-40 h-[76px] bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-6 py-3.5">
        {!chromeless && (
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="hidden flex-shrink-0 items-center justify-center rounded-full p-2 hover:bg-surface md:flex"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        )}

        <Link to="/" className="group flex flex-shrink-0 items-center gap-3 whitespace-nowrap font-serif font-bold">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings?.site_name ?? 'ENS'} className="h-12 w-12 rounded-lg object-cover transition-transform duration-150 group-hover:-translate-y-0.5" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-red font-serif text-2xl font-bold text-white shadow-sm transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-md">
              {settings?.logo_letter ?? 'i'}
            </span>
          )}
          <span className="hidden text-xl sm:inline">{settings?.site_name ?? 'ENS'}</span>
        </Link>

        {!chromeless && (
        <div className="order-3 flex flex-1 justify-center md:order-none">
        {/* Mobile: a plain button that opens the full-screen search overlay,
            rather than typing inline in the nav bar - matches how most
            mobile apps handle search (a dedicated screen, not a cramped
            dropdown under a small bar). */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="flex w-full items-center gap-2 rounded-full border border-[#ccc] px-4 py-2.5 text-left text-[15px] text-grey md:hidden"
        >
          <SearchIcon className="h-4 w-4 flex-shrink-0" />
          Search articles, books, topics...
        </button>

        <form onSubmit={handleSearch} className="relative hidden w-full md:flex md:max-w-2xl">
          <div
            className={`flex flex-1 items-center rounded-l-full border py-2 pl-4 ${
              searchFocused ? 'border-blue-500' : 'border-[#ccc]'
            }`}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setShowSuggest(true)
                setSearchFocused(true)
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggest(false), 150)
                setSearchFocused(false)
              }}
              placeholder="Search articles, books, topics..."
              className="w-full bg-transparent text-base outline-none placeholder:text-grey"
            />
          </div>
          <button
            type="submit"
            className="flex w-16 flex-shrink-0 items-center justify-center rounded-r-full border border-l-0 border-[#ccc] bg-surface hover:bg-[#e9e9e9]"
            aria-label="Search"
          >
            {searching ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-grey border-t-ink" />
            ) : (
              <SearchIcon className="h-5 w-5 text-ink" />
            )}
          </button>

          {showDropdown && (
            <div className="absolute left-0 right-16 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-[#ccc] bg-white shadow-lg">
              {searching ? (
                <div className="flex flex-col gap-3 p-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeleton h-11 w-11 flex-shrink-0 rounded-lg" />
                      <div className="skeleton h-4 flex-1 rounded" />
                    </div>
                  ))}
                </div>
              ) : hasResults ? (
                <div className="max-h-[70vh] overflow-y-auto">
                  {articles.length > 0 && (
                    <div>
                      <div className="bg-surface px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-grey">Articles</div>
                      {articles.map((a) => (
                        <button
                          key={a.slug}
                          type="button"
                          onMouseDown={() => navigate(`/post/${a.slug}`)}
                          className="flex w-full items-center gap-3 border-b border-surface p-3 text-left transition-colors last:border-none hover:bg-surface"
                        >
                          <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-surface">
                            {a.cover_image_url && <img src={a.cover_image_url} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <span className="text-sm font-bold leading-snug">{a.title_en}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {books.length > 0 && (
                    <div>
                      <div className="bg-surface px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-grey">Library</div>
                      {books.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onMouseDown={() => navigate(`/library/${b.id}`)}
                          className="flex w-full items-center gap-3 border-b border-surface p-3 text-left transition-colors last:border-none hover:bg-surface"
                        >
                          <div className="h-11 w-8 flex-shrink-0 overflow-hidden rounded-md border-2 border-ink bg-surface">
                            {b.cover_image_url && <img src={b.cover_image_url} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold leading-snug">{b.title}</div>
                            <div className="text-xs text-grey">{b.author_name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <StateIllustration kind="empty" title="No matches" message={`Nothing found for "${query}".`} compact />
              )}
            </div>
          )}
        </form>
        </div>
        )}

        <div className="hidden flex-shrink-0 items-center gap-3 text-sm font-bold md:flex">
          {!session && (
            <>
              <NavFrameLink to="/signin">Sign in</NavFrameLink>
              <Link
                to="/signup"
                className="rounded-full bg-red px-4 py-2 text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
    <MobileSearchOverlay open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
    </>
  )
}

function NavFrameLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors hover:bg-[#f2f2f2]"
    >
      {children}
    </Link>
  )
}
