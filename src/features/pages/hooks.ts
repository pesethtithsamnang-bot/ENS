import { useQuery } from '@tanstack/react-query'
import { getFooterPages, getPageBySlug } from './api'

export function useFooterPages() {
  return useQuery({ queryKey: ['footer-pages'], queryFn: getFooterPages, staleTime: 5 * 60_000 })
}
export function usePageBySlug(slug: string | undefined) {
  return useQuery({ queryKey: ['page', slug], queryFn: () => getPageBySlug(slug as string), enabled: !!slug })
}
