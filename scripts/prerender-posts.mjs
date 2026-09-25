// Runs after `vite build`. Fetches every published post directly from
// Supabase's REST API and writes dist/post/<slug>/index.html for each one -
// a copy of the real app shell, but with that specific post's title,
// description, and cover image baked into the <head> as real HTML.
//
// Why this exists: Cloudflare's plain drag-and-drop "Upload assets" deploy
// method doesn't support Pages Functions, so a runtime bot-detection
// approach isn't usable here. A real static file per post works with any
// static host, no server code needed at all. Real visitors get the normal
// app (the same JS bundle boots and React Router takes over); Facebook,
// Telegram, etc. just read the correct tags straight from the file, since
// they never run JavaScript in the first place.
//
// Trade-off worth knowing: this only covers posts that existed at the time
// you built this file. A post published after this build won't have a
// preview file until you rebuild and redeploy again.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return {}
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  const vars = {}
  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match) vars[match[1]] = match[2].trim()
  }
  return vars
}

const env = { ...loadEnvFile(), ...process.env }
const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[prerender-posts] Missing Supabase env vars - skipping social-preview generation.')
    return
  }

  const baseHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')

  const query = `${SUPABASE_URL}/rest/v1/posts?status=eq.published&select=slug,title_en,body_en,cover_image_url`
  const res = await fetch(query, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  })

  if (!res.ok) {
    console.warn('[prerender-posts] Could not fetch posts - skipping. Status:', res.status)
    return
  }

  const posts = await res.json()
  console.log(`[prerender-posts] Generating social-preview pages for ${posts.length} post(s)...`)

  for (const post of posts) {
    const title = escapeHtml(post.title_en)
    const description = escapeHtml((post.body_en || '').slice(0, 160))
    const image = post.cover_image_url

    let html = baseHtml
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}">`)
    html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${description}">`)
    html = html.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${description}">`)

    if (image) {
      if (html.includes('property="og:image"')) {
        html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${escapeHtml(image)}">`)
      } else {
        html = html.replace('</head>', `  <meta property="og:image" content="${escapeHtml(image)}">\n    <meta name="twitter:image" content="${escapeHtml(image)}">\n  </head>`)
      }
      html = html.replace(/<meta name="twitter:card" content=".*?"\s*\/?>/, `<meta name="twitter:card" content="summary_large_image">`)
    }

    const outDir = path.join(distDir, 'post', post.slug)
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'index.html'), html)
  }

  console.log('[prerender-posts] Done.')
}

main().catch((err) => {
  console.warn('[prerender-posts] Failed, continuing without social previews:', err.message)
})
