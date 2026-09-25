// This file goes in i-information-web/functions/whoami.ts and is picked up
// automatically by Cloudflare Pages, same as functions/post/[slug].ts.
//
// Why this exists: a browser cannot read its own public IP address - it
// genuinely doesn't know it. But every request that reaches this site
// already passes through Cloudflare's network, and Cloudflare stamps two
// things onto every request before it even reaches our code: the real
// client IP (cf-connecting-ip header) and a two-letter country code
// (request.cf.country). This function just reads those two values back
// out and returns them as JSON - no third-party IP-lookup service, no
// extra cost, and it can't be spoofed by the client since these are set
// by Cloudflare's edge, not sent by the browser.
//
// The client calls this once on sign-in/sign-up (see
// src/hooks/useTrackSession.ts) and saves the result onto the reader's
// profile.

interface CfRequest extends Request {
  cf?: { country?: string }
}

export const onRequestGet: PagesFunction = async (context) => {
  const request = context.request as CfRequest
  const ip = request.headers.get('cf-connecting-ip') ?? null
  const country = request.cf?.country ?? null

  return new Response(JSON.stringify({ ip, country }), {
    headers: {
      'content-type': 'application/json',
      // This is per-visitor data, never cache it at any layer.
      'cache-control': 'no-store',
    },
  })
}
