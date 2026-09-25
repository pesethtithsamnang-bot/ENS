// Authors paste whatever link they copied from the site itself (a normal
// "watch" or "share" URL) - not the special embeddable URL each platform
// actually needs inside an <iframe>. This converts the common ones
// automatically so pasting just works. Anything unrecognized is returned
// as-is, so a URL that's already embed-ready (or a provider not listed
// here) still works, it just isn't auto-fixed.
export function toEmbedUrl(rawUrl: string): string {
  const url = rawUrl.trim()
  if (!url) return url

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }
  const host = parsed.hostname.replace(/^www\./, '')

  // YouTube: watch?v=, youtu.be/<id>, shorts/<id>, live/<id>
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = parsed.searchParams.get('v') ?? parsed.pathname.match(/\/(?:shorts|live)\/([^/?]+)/)?.[1]
    if (id) return `https://www.youtube.com/embed/${id}`
  }
  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1)
    if (id) return `https://www.youtube.com/embed/${id}`
  }

  // Vimeo: vimeo.com/<id>
  if (host === 'vimeo.com') {
    const id = parsed.pathname.match(/\/(\d+)/)?.[1]
    if (id) return `https://player.vimeo.com/video/${id}`
  }

  // Loom: loom.com/share/<id>
  if (host === 'loom.com') {
    const id = parsed.pathname.match(/\/share\/([a-zA-Z0-9]+)/)?.[1]
    if (id) return `https://www.loom.com/embed/${id}`
  }

  // CodePen: codepen.io/<user>/pen/<id>
  if (host === 'codepen.io') {
    return url.replace('/pen/', '/embed/')
  }

  // Google Slides: docs.google.com/presentation/d/<id>/...
  if (host === 'docs.google.com' && parsed.pathname.includes('/presentation/')) {
    return url.replace(/\/(edit|view).*$/, '/embed')
  }

  // Spotify: open.spotify.com/<type>/<id>
  if (host === 'open.spotify.com') {
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
  }

  // Twitch clips: clips.twitch.tv/<slug>
  if (host === 'clips.twitch.tv') {
    const slug = parsed.pathname.slice(1)
    if (slug && typeof window !== 'undefined') {
      return `https://clips.twitch.tv/embed?clip=${slug}&parent=${window.location.hostname}`
    }
  }

  // itch.io games already embed directly - no change needed.
  return url
}
