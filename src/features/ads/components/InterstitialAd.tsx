import { useEffect, useRef, useState } from 'react'
import { useAds } from '../hooks'
import { trackAdEvent } from '../api'
import { useSiteSettings } from '../../settings/hooks'
import { DefaultAdBanner } from './DefaultAdBanner'

const STORAGE_KEY = 'ii_next_interstitial_at'

export function InterstitialAd() {
  const { data: settings } = useSiteSettings()
  const { data: ads } = useAds('interstitial')
  const [visible, setVisible] = useState(false)
  const [adIndex, setAdIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const codeRef = useRef<HTMLDivElement>(null)

  const ad = ads && ads.length > 0 ? ads[adIndex % ads.length] : null
  const intervalMinutes = settings?.ad_interval_minutes ?? 5

  useEffect(() => {
    const nextAt = Number(localStorage.getItem(STORAGE_KEY) ?? 0)
    const now = Date.now()

    function schedule(delayMs: number) {
      return setTimeout(() => {
        setAdIndex((i) => (ads && ads.length > 0 ? (i + 1) % ads.length : 0))
        setVisible(true)
        localStorage.setItem(STORAGE_KEY, String(Date.now() + intervalMinutes * 60_000))
      }, delayMs)
    }

    const delay = nextAt > now ? nextAt - now : intervalMinutes * 60_000
    const timer = schedule(delay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads, intervalMinutes])

  useEffect(() => {
    if (!visible || !ad) return
    if (!ad.is_mandatory) {
      setCountdown(0)
      return
    }
    setCountdown(ad.duration_seconds || 5)
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [visible, ad])

  useEffect(() => {
    if (!visible || !ad?.ad_code || !codeRef.current) return
    const container = codeRef.current
    container.innerHTML = ad.ad_code
    const scripts = Array.from(container.querySelectorAll('script'))
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value))
      newScript.textContent = oldScript.textContent
      oldScript.replaceWith(newScript)
    })
  }, [visible, ad])

  useEffect(() => {
    if (visible && ad) trackAdEvent(ad.id, 'impression')
  }, [visible, ad?.id])

  if (!visible) return null
  if (!ad) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={() => setVisible(false)}>
        <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setVisible(false)}
            className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold shadow-md"
          >
            &times;
          </button>
          <DefaultAdBanner />
        </div>
      </div>
    )
  }

  const canClose = !ad.is_mandatory || countdown <= 0

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={() => canClose && setVisible(false)}
    >
      <div className="relative w-full max-w-md rounded-lg border-2 border-ink bg-white shadow-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b-2 border-ink px-4 py-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-grey">Sponsored</span>
          {canClose ? (
            <button onClick={() => setVisible(false)} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink text-sm font-bold">
              &times;
            </button>
          ) : (
            <span className="rounded-full border-2 border-ink bg-surface px-2.5 py-0.5 font-mono text-xs font-bold">{countdown}s</span>
          )}
        </div>

        <div className="p-5 text-center">
          {ad.ad_code ? (
            <div ref={codeRef} />
          ) : (
            <a href={ad.link_url ?? '#'} target="_blank" rel="noopener noreferrer nofollow sponsored" onClick={() => trackAdEvent(ad.id, 'click')}>
              {ad.media_url && <img src={ad.media_url} alt={ad.campaign_name} className="mx-auto mb-3 max-h-64 w-full rounded-md border-2 border-ink object-cover" />}
              <span className="text-sm font-extrabold text-red-dark">{ad.campaign_name}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
