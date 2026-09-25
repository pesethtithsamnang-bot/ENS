import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getPostBySlug, getPostsByCategory, getPublishedPosts, getPublishedPostsPage, searchPosts } from './api'

export function usePosts(limit?: number) {
  return useQuery({ queryKey: ['posts', limit], queryFn: () => getPublishedPosts(limit) })
}

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ['posts-infinite'],
    queryFn: ({ pageParam }) => getPublishedPostsPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostBySlug(slug as string),
    enabled: !!slug,
  })
}

export function usePostsByCategory(categorySlug: string | undefined) {
  return useQuery({
    queryKey: ['posts-by-category', categorySlug],
    queryFn: () => getPostsByCategory(categorySlug as string),
    enabled: !!categorySlug,
  })
}

export function useSearchPosts(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchPosts(query),
    enabled: query.trim().length > 1,
  })
}
