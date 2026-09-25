import { Outlet, useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { Sidebar } from './Sidebar'
import { SidebarProvider, useSidebar } from './SidebarContext'
import { useDynamicFavicon } from '../../hooks/useDynamicFavicon'
import { useContentProtection } from '../../hooks/useContentProtection'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useTrackSession } from '../../hooks/useTrackSession'
import { WarningBanner } from '../../features/engagement/components/WarningBanner'
import { TopLoadingBar } from '../ui/TopLoadingBar'
import { StateIllustration } from '../ui/StateIllustration'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { AccountStatusGate } from './AccountStatusGate'
import { CookieConsentBanner } from './CookieConsentBanner'
import { MobileBottomNav } from './MobileBottomNav'

const CHROMELESS_ROUTES = ['/signin', '/signup']

export function PublicLayout() {
  useDynamicFavicon()
  useContentProtection()
  useTrackSession()
  const online = useOnlineStatus()
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <TopLoadingBar />
        <Nav />
        <ShellBody online={online} />
        <CookieConsentBanner />
      </div>
    </SidebarProvider>
  )
}

// Split out so it can read the collapsed state to size main's left offset -
// PublicLayout itself stays outside SidebarProvider's consumer tree otherwise.
function ShellBody({ online }: { online: boolean }) {
  const { collapsed } = useSidebar()
  const { pathname } = useLocation()
  const chromeless = CHROMELESS_ROUTES.includes(pathname)
  // Reading an article should feel calm and uninterrupted - the bottom
  // tab bar (with its prominent red Write button) sits right where a
  // thumb rests while reading, so it's hidden on article pages only. The
  // top nav (back/search) stays, since leaving an article is still useful.
  const isReading = pathname.startsWith('/post/')
  const showBottomNav = !chromeless && !isReading

  return (
    <>
      {/* Fixed nav is 76px tall and out of normal flow - this reserves that space. */}
      {!chromeless && <div className="h-[76px]" />}
      <WarningBanner />
      {!chromeless && <Sidebar />}
      <main
        className={
          chromeless
            ? 'min-w-0'
            : `min-w-0 ${showBottomNav ? 'pb-[calc(70px+env(safe-area-inset-bottom))] md:pb-0' : ''} ${collapsed ? 'md:ml-[72px]' : 'md:ml-[72px] lg:ml-[240px]'}`
        }
      >
        {online ? (
          <ErrorBoundary>
            <AccountStatusGate>
              <Outlet />
            </AccountStatusGate>
          </ErrorBoundary>
        ) : (
          <StateIllustration kind="offline" />
        )}
      </main>
      {showBottomNav && <MobileBottomNav />}
    </>
  )
}
