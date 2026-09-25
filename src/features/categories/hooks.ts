import { useQuery } from '@tanstack/react-query'
import { getCategoryBySlug, getVisibleCategories } from './api'

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: getVisibleCategories })
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategoryBySlug(slug as string),
    enabled: !!slug,
  })
}
