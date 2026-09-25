// This file goes in i-information-web/functions/sitemap.xml.ts - a
// Cloudflare Pages Function, same pattern as functions/post/[slug].ts and
// functions/whoami.ts.
//
// Why this exists: Google can only rank pages it knows exist. Without a
// sitemap, Google has to discover every article purely by following links
// from page to page (slow, and it can miss pages entirely). A sitemap
// hands Google the full, current list directly. This is generated live
// from Supabase on every request rather than baked in at build time, so a
// brand-new article shows up here immediately without waiting for a
// redeploy.

interface Env {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
}

const SITE_URL = 'https://www.ensnew.org'

const STATIC_PAGES = ['/', '/library', '/details', '/terms', '/cookie-policy']

function escapeXml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const supabaseUrl = context.env.VITE_SUPABASE_URL
  const anonKey = context.env.VITE_SUPABASE_ANON_KEY

  let postUrls: { loc: string; lastmod: string | null }[] = []

  if (supabaseUrl && anonKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/posts?status=eq.published&select=slug,published_at&order=published_at.desc`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } },
      )
      if (res.ok) {
        const posts: { slug: string; published_at: string | null }[] = await res.json()
        postUrls = posts.map((p) => ({
          loc: `${SITE_URL}/post/${p.slug}/`,
          // Some posts may not have a published_at set - skip the lastmod
          // tag for those instead of crashing on a null value.
          lastmod: p.published_at ? p.published_at.slice(0, 10) : null,
        }))
      }
    } catch {
      // If Supabase is unreachable, still serve the static pages below
      // rather than failing the whole sitemap.
    }
  }

  const staticEntries = STATIC_PAGES.map(
    (path) => `  <url>\n    <loc>${escapeXml(SITE_URL + path)}</loc>\n  </url>`,
  ).join('\n')

  const postEntries = postUrls
    .map(
      (p) =>
        `  <url>\n    <loc>${escapeXml(p.loc)}</loc>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ''}\n  </url>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries}\n${postEntries}\n</urlset>`

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  })
}
