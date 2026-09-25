import { Link, useLocation } from 'react-router-dom'
import { Home, NotebookPen, Bookmark, User, BookText } from 'lucide-react'
import { useReaderAuth } from '../../context/ReaderAuthContext'

export function MobileBottomNav() {
  const { pathname } = useLocation()
  const { session, avatarUrl, displayName } = useReaderAuth()

  const items = [
    { to: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
    { to: '/library', label: 'Library', icon: BookText, match: (p: string) => p.startsWith('/library') },
    { to: session ? '/write' : '/signin', label: 'Write', icon: NotebookPen, match: (p: string) => p === '/write', center: true },
    { to: session ? '/saved' : '/signin', label: 'Saved', icon: Bookmark, match: (p: string) => p === '/saved' },
    {
      to: session ? '/profile' : '/signin',
      label: session ? 'You' : 'Sign in',
      icon: User,
      match: (p: string) => p === '/profile',
      avatar: true,
    },
  ]

  return (
    <nav className="fixed-shell fixed inset-x-0 bottom-0 z-40 flex h-[calc(70px+env(safe-area-inset-bottom))] flex-shrink-0 items-stretch border-t border-[#e5e5e5] bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ to, label, icon: Icon, match, center, avatar }) => {
        const active = match(pathname)
        return (
          <Link
            key={label}
            to={to}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors duration-150 ${
              active ? 'text-ink' : 'text-grey'
            }`}
          >
            {center ? (
              <span
                className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-red text-white transition-transform duration-200 ${
                  active ? 'scale-105 ring-4 ring-red/20' : 'scale-100'
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={2} />
              </span>
            ) : avatar && session && avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className={`h-7 w-7 rounded-full object-cover transition-all duration-150 ${active ? 'ring-2 ring-ink ring-offset-1' : ''}`}
              />
            ) : avatar && session ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red text-xs font-bold text-white">
                {displayName?.[0]?.toUpperCase() ?? '?'}
              </span>
            ) : (
              <Icon className={`h-6 w-6 transition-transform duration-150 ${active ? 'scale-110' : 'scale-100'}`} strokeWidth={active ? 2.25 : 1.75} />
            )}
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
