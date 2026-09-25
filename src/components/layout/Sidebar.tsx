import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Bookmark, NotebookPen, Info, LogOut, MessageCircleQuestion, FileText, Cookie, BookText, HeartHandshake, type LucideIcon } from 'lucide-react'
import { useReaderAuth } from '../../context/ReaderAuthContext'
import { signOut } from '../../features/auth/api'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useSidebar } from './SidebarContext'
import { useSiteSettings } from '../../features/settings/hooks'
import { useFooterPages } from '../../features/pages/hooks'

type SidebarLink = { to: string; label: string; icon: LucideIcon }

export function Sidebar() {
  const { pathname } = useLocation()
  const { session } = useReaderAuth()
  const { collapsed } = useSidebar()
  const { data: settings } = useSiteSettings()
  const { data: pages } = useFooterPages()

  const mainLinks: SidebarLink[] = [{ to: '/', label: 'Home', icon: Home }]

  const youLinks: SidebarLink[] = [
    { to: '/library', label: 'Library', icon: BookText },
    ...(session ? [{ to: '/saved', label: 'Saved', icon: Bookmark }] : []),
    ...(session ? [{ to: '/write', label: 'Write', icon: NotebookPen }] : []),
  ]

  const aboutLinks: SidebarLink[] = [
    { to: '/details', label: 'Details', icon: Info },
    { to: '/feedback', label: 'Feedback', icon: MessageCircleQuestion },
    { to: '/terms', label: 'Terms & Conditions', icon: FileText },
    { to: '/cookie-policy', label: 'Cookie Policy', icon: Cookie },
    ...(settings?.donate_enabled ? [{ to: '/donate', label: 'Donate', icon: HeartHandshake }] : []),
    ...(pages ?? []).map((p) => ({ to: `/page/${p.slug}`, label: p.title, icon: Info as LucideIcon })),
  ]

  return (
    <aside
      className={`fixed-shell fixed left-0 top-[76px] z-30 hidden h-[calc(100vh-76px)] flex-shrink-0 flex-col bg-white py-3 md:flex overflow-hidden
        transition-[width] duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[72px] lg:w-[240px]'}`}
    >
      <div className="flex flex-1 flex-col overflow-y-auto">
        <SidebarSection links={mainLinks} pathname={pathname} expanded={!collapsed} />

        <div className="mx-3 my-3 h-px bg-[#e5e5e5]" />

        <div className={`px-4 pb-1 text-base font-medium text-ink ${collapsed ? 'hidden' : 'hidden lg:block'}`}>You</div>
        <SidebarSection links={youLinks} pathname={pathname} expanded={!collapsed} />

        <div className="mx-3 my-3 h-px bg-[#e5e5e5]" />

        <SidebarSection links={aboutLinks} pathname={pathname} expanded={!collapsed} small />

        <div className={`mt-3 px-4 text-[11px] text-grey ${collapsed ? 'hidden' : 'hidden lg:block'}`}>
          &copy; {new Date().getFullYear()} {settings?.site_name ?? 'ENS'}. All rights reserved.
        </div>
      </div>

      {session && <ProfileMenu collapsed={collapsed} />}
    </aside>
  )
}

function ProfileMenu({ collapsed }: { collapsed: boolean }) {
  const { displayName, avatarUrl } = useReaderAuth()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  useClickOutside(wrapRef, () => {
    setOpen(false)
    setConfirming(false)
  })

  const expanded = !collapsed

  return (
    <div ref={wrapRef} className="relative border-t border-[#e5e5e5] px-1.5 pt-2 lg:px-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-1 rounded-lg px-2 py-3 text-center text-[10px] text-ink hover:bg-[#f2f2f2] transition-all duration-300 ease-in-out lg:rounded-xl lg:px-3 lg:py-2.5 ${
          expanded ? 'flex-col lg:flex-row lg:gap-3 lg:text-left lg:text-sm' : 'flex-col'
        }`}
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-red text-[11px] font-bold text-white lg:h-8 lg:w-8">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            displayName?.[0]?.toUpperCase() ?? '?'
          )}
        </span>
        <span className={`truncate ${expanded ? 'hidden lg:inline' : 'hidden'}`}>{displayName ?? 'Profile'}</span>
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+4px)] left-1.5 w-56 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg lg:left-2">
          {!confirming ? (
            <>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-ink hover:bg-[#f2f2f2]"
              >
                View profile
              </Link>
              <button
                onClick={() => setConfirming(true)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-dark hover:bg-[#f2f2f2]"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Sign out
              </button>
            </>
          ) : (
            <div className="p-3">
              <p className="mb-3 px-1 text-xs font-medium text-ink">Sign out of ENS?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-lg bg-[#f2f2f2] px-3 py-2 text-xs font-bold text-ink hover:bg-[#e5e5e5]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex-1 rounded-lg bg-red px-3 py-2 text-xs font-bold text-white hover:bg-red-dark"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SidebarSection({
  links,
  pathname,
  expanded,
  small,
}: {
  links: SidebarLink[]
  pathname: string
  expanded: boolean
  small?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 px-1.5 lg:px-2">
      {links.map(({ to, label, icon: Icon }) => {
        const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1 rounded-lg px-2 py-4 text-center transition-all duration-300 ease-in-out lg:rounded-xl lg:px-3 lg:py-2.5 ${
              small ? 'text-[9px] lg:text-xs' : 'text-[10px] lg:text-sm'
            } ${expanded ? 'flex-col lg:flex-row lg:gap-6 lg:text-left' : 'flex-col'} ${
              active ? 'bg-[#f2f2f2] font-medium text-ink' : 'font-normal text-ink hover:bg-[#f2f2f2]'
            }`}
          >
            <Icon className="h-6 w-6 flex-shrink-0 transition-transform duration-300" strokeWidth={active ? 2 : 1.75} />
            <span className={`truncate transition-all duration-300 ease-in-out ${expanded ? 'hidden lg:inline lg:opacity-100 lg:max-w-full' : 'hidden opacity-0 max-w-0'}`}>{label}</span>
          </Link>
        )
      })}
    </div>
  )
}
