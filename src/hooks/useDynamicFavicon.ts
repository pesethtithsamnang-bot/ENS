import { useEffect } from 'react'
import { useSiteSettings } from '../features/settings/hooks'

export function useDynamicFavicon() {
  const { data: settings } = useSiteSettings()

  useEffect(() => {
    if (!settings?.logo_url) return
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = settings.logo_url
  }, [settings?.logo_url])
}
