import { useEffect, useRef, useState } from 'react'
import { useAds } from '../hooks'
import { trackAdEvent } from '../api'
import { DefaultAdBanner, DefaultPostAd, DefaultGridAd } from './DefaultAdBanner'

export function AdBanner({ placement }: { placement: string }) {
  const { data: ads } = useAds(placement)
  const [index, setIndex] = useState(0)
  const codeRef = useRef<HTMLDivElement>(null)
  const isBannerShape = placement === 'homepage_banner'

  const ad = ads && ads.length > 0 ? ads[index % ads.length] : null

  // ---------- log one impression each time a real ad becomes visible ----------
  useEffect(() => {
    if (ad) trackAdEvent(ad.id, 'impression')
  }, [ad?.id])

  // ---------- rotate to the next ad after this one's duration ----------
  useEffect(() => {
    if (!ads || ads.length < 2 || !ad) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % ads.length), (ad.duration_seconds || 8) * 1000)
    return () => clearTimeout(timer)
  }, [ad, ads])

  useEffect(() => {
    if (!ad?.ad_code || !codeRef.current) return
    const container = codeRef.current
    container.innerHTML = ad.ad_code
    const scripts = Array.from(container.querySelectorAll('script'))
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value))
      newScript.textContent = oldScript.textContent
      oldScript.replaceWith(newScript)
    })
  }, [ad])

  const isGridShape = placement === 'homepage_grid'

  // ---------- no real ad configured - fall back to the ENS house ad, in the right shape for where it sits ----------
  if (!ad) return isBannerShape ? <DefaultAdBanner /> : isGridShape ? <DefaultGridAd /> : <DefaultPostAd />

  // ---------- raw embed code (e.g. AdSense) always renders as-is, shape doesn't apply ----------
  if (ad.ad_code) {
    return (
      <div className="relative rounded-lg border border-dashed border-[#d8dbe2] bg-surface p-3">
        <span className="absolute -top-2.5 left-3 rounded bg-amber px-2 py-0.5 text-[10px] font-bold text-[#241a05] shadow-sm">
          Sponsored
        </span>
        <div ref={codeRef} />
      </div>
    )
  }

  // ---------- wide banner shape ----------
  if (isBannerShape) {
    return (
      <a
        key={ad.id}
        href={ad.link_url ?? '#'}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        onClick={() => trackAdEvent(ad.id, 'click')}
        className="relative block aspect-[4/1] w-full overflow-hidden rounded-[4px] shadow-md"
      >
        {ad.media_url && <img src={ad.media_url} alt={ad.campaign_name} className="h-full w-full object-cover" />}
        <span className="absolute left-3 top-3 rounded bg-amber px-2 py-0.5 text-[10px] font-bold text-[#241a05] shadow-sm">
          Sponsored
        </span>
      </a>
    )
  }

  // ---------- grid row card shape - horizontal strip that spans the full row ----------
  if (isGridShape) {
    return (
      <a
        key={ad.id}
        href={ad.link_url ?? '#'}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        onClick={() => trackAdEvent(ad.id, 'click')}
        className="col-span-full flex h-[90px] w-full items-center gap-4 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white px-4 shadow-sm transition-shadow hover:shadow-md"
      >
        {ad.media_url && (
          <div className="h-[66px] w-[66px] flex-shrink-0 overflow-hidden rounded-lg bg-surface">
            <img src={ad.media_url} alt={ad.campaign_name} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-amber">Sponsored</div>
          <h3 className="truncate text-[15px] font-semibold text-ink">{ad.campaign_name}</h3>
        </div>
      </a>
    )
  }

  // ---------- post-card shape - matches a real PostCard so it blends into the grid ----------
  return (
    <a
      key={ad.id}
      href={ad.link_url ?? '#'}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      onClick={() => trackAdEvent(ad.id, 'click')}
      className="group block"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface">
        {ad.media_url && <img src={ad.media_url} alt={ad.campaign_name} className="h-full w-full object-cover" />}
        <span className="absolute left-2 bottom-2 rounded bg-amber px-2 py-0.5 text-[10px] font-bold text-[#241a05] shadow-sm">
          Sponsored
        </span>
      </div>
      <div className="mt-3">
        <h3 className="text-[15px] font-semibold leading-snug text-ink">{ad.campaign_name}</h3>
        <div className="mt-1 text-[13px] text-grey">Sponsored</div>
      </div>
    </a>
  )
}
