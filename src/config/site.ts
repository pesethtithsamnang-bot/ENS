// The canonical public domain. Copy-link, share buttons, and any other
// place that needs a shareable/canonical URL should build it from this -
// never from window.location, since a visitor could be on a staging
// domain, the old pre-rebrand domain, or a preview deploy URL, and links
// built from that would break the moment the visitor isn't on the real
// site.
export const SITE_URL = 'https://www.ensnew.org'

export function postUrl(slug: string) {
  return `${SITE_URL}/post/${slug}/`
}
