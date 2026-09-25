import { useQuery } from '@tanstack/react-query'
import { getSiteSettings } from './api'

const CACHE_KEY = 'ens_site_settings_cache'

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function writeCache(data: unknown) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // ignore - private browsing or storage disabled, just skip caching
  }
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const data = await getSiteSettings()
      writeCache(data)
      return data
    },
    staleTime: 5 * 60_000,
    initialData: readCache,
  })
}
