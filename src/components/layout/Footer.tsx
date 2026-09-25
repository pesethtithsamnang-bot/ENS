import { Link } from 'react-router-dom'
import { useSiteSettings } from '../../features/settings/hooks'
import { useFooterPages } from '../../features/pages/hooks'

export function Footer() {
  const { data: settings } = useSiteSettings()
  const { data: pages } = useFooterPages()

  return (
    <footer className="mt-16 border-t border-[#e5e5e5] bg-white py-8 text-grey">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-4 px-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2 font-medium text-ink">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="" className="h-7 w-7 rounded-lg border border-[#e5e5e5] object-cover" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red font-serif text-white">
              {settings?.logo_letter ?? 'i'}
            </span>
          )}
          {settings?.site_name ?? 'ENS'}
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <Link to="/details" className="hover:text-ink">Details</Link>
          <Link to="/feedback" className="hover:text-ink">Feedback</Link>
          <Link to="/terms" className="hover:text-ink">Terms &amp; Conditions</Link>
          {settings?.donate_enabled && <Link to="/donate" className="hover:text-ink">Donate</Link>}
          {pages?.map((p) => (
            <Link key={p.id} to={`/page/${p.slug}`} className="hover:text-ink">{p.title}</Link>
          ))}
        </nav>

        <div className="text-xs text-grey">
          &copy; {new Date().getFullYear()} {settings?.site_name ?? 'ENS'}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
