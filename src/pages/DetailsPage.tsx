import { Link } from 'react-router-dom'
import { useSiteSettings } from '../features/settings/hooks'
import { useLogVisit } from '../hooks/useLogVisit'

export function DetailsPage() {
  useLogVisit('/details')
  const { data: settings } = useSiteSettings()
  const siteName = settings?.site_name ?? 'ENS'
  const contactEmail = settings?.contact_email
  const advertiseEmail = settings?.advertise_email ?? contactEmail
  const phone = settings?.phone

  return (
    <div className="page-transition">
      <div className="bg-red">
        <div className="mx-auto max-w-[1600px] px-6 py-12">
          <h1 className="text-4xl font-semibold text-white md:text-5xl">{siteName}</h1>
          <p className="mt-2 max-w-xl text-white/90">
            Everything about {siteName}, who we are, how to reach us, and how to work with us,
            all on one page.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold text-ink">Our mission</h2>
          <p className="mb-3 text-base text-grey">
            {siteName} (Education, News, and Science) exists to make quality information
            accessible to everyone. Understanding complex topics shouldn't require a specialized
            degree.
          </p>
          <p className="text-base text-grey">
            We cover education, news, and science in plain English and Khmer. Every article links
            back to where it came from.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-ink">What we cover</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { title: 'Education', text: 'Learning tips, study guides, and resources for students of all ages.' },
              { title: 'News', text: 'Current events explained clearly, with context and background.' },
              { title: 'Science', text: 'Discoveries and explanations made understandable for everyone.' },
            ].map((c) => (
              <div key={c.title} className="rounded-lg bg-surface p-5">
                <h3 className="mb-2 font-semibold text-ink">{c.title}</h3>
                <p className="text-sm text-grey">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {contactEmail && (
            <div className="rounded-lg bg-surface p-5">
              <h3 className="mb-1 text-sm font-medium text-grey">General contact</h3>
              <a href={`mailto:${contactEmail}`} className="font-semibold text-red-dark">{contactEmail}</a>
              {phone && <p className="mt-1 text-sm text-grey">{phone}</p>}
            </div>
          )}
          {advertiseEmail && (
            <div className="rounded-lg bg-surface p-5">
              <h3 className="mb-1 text-sm font-medium text-grey">Advertise with us</h3>
              <a href={`mailto:${advertiseEmail}?subject=Advertising Inquiry`} className="font-semibold text-red-dark">
                {advertiseEmail}
              </a>
            </div>
          )}
          <div className="rounded-lg bg-surface p-5">
            <h3 className="mb-1 text-sm font-medium text-grey">Feedback</h3>
            <p className="mb-2 text-sm text-grey">Something broken or confusing? Tell us directly.</p>
            <Link to="/feedback" className="font-semibold text-red-dark">Send feedback</Link>
          </div>
          {contactEmail && (
            <div className="rounded-lg bg-surface p-5">
              <h3 className="mb-1 text-sm font-medium text-grey">Partnerships</h3>
              <a href={`mailto:${contactEmail}?subject=Partnership Proposal`} className="font-semibold text-red-dark">
                Propose a partnership
              </a>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-ink">More</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/terms" className="rounded-lg bg-surface px-4 py-2 text-sm font-medium hover:bg-[#e5e5e5]">
              Terms &amp; Conditions
            </Link>
            <Link to="/donate" className="rounded-lg bg-surface px-4 py-2 text-sm font-medium hover:bg-[#e5e5e5]">
              Donate
            </Link>
            <Link to="/write" className="rounded-lg bg-surface px-4 py-2 text-sm font-medium hover:bg-[#e5e5e5]">
              Write for us
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
