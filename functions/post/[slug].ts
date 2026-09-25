// This file goes in i-information-web/functions/post/[slug].ts and is
// automatically picked up by Cloudflare Pages as a server-side function -
// no extra setup needed beyond deploying it in the "functions" folder.
//
// Why this exists: Facebook/Telegram/X's link-preview crawlers fetch a
// page's raw HTML and read its <meta> tags - they do not run JavaScript.
// Since this site is a client-rendered React app, the real title/image
// for a specific article only exists after JS runs, which crawlers never
// see. This function detects those crawlers by their User-Agent and
// serves a tiny, complete HTML page with the correct title/description
// /image for that exact post, fetched directly from Supabase. Regular
// human visitors are untouched and get the normal app.

interface Env {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
}

const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'TelegramBot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'Discordbot',
  'redditbot',
  'Pinterest',
  'vkShare',
]

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false
  return BOT_USER_AGENTS.some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()))
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const userAgent = context.request.headers.get('user-agent')

  // Not a crawler - let the normal static site load as usual.
  if (!isBot(userAgent)) {
    return context.next()
  }

  const slug = context.params.slug as string
  const supabaseUrl = context.env.VITE_SUPABASE_URL
  const anonKey = context.env.VITE_SUPABASE_ANON_KEY

  const query = `${supabaseUrl}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title_en,body_en,cover_image_url`
  const res = await fetch(query, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  })

  if (!res.ok) return context.next()
  const posts = (await res.json()) as { title_en: string; body_en: string; cover_image_url: string | null }[]
  const post = posts[0]
  if (!post) return context.next()

  const title = escapeHtml(post.title_en)
  const description = escapeHtml(post.body_en.slice(0, 160))
  const image = post.cover_image_url ?? ''
  const url = context.request.url

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : ''}
</head>
<body></body>
</html>`

  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}
