import { useQuery } from '@tanstack/react-query'
import { getAuthorPosts, getAuthorProfile, getAuthorStats } from './api'

export function useAuthorProfile(readerId: string | undefined) {
  return useQuery({ queryKey: ['author-profile', readerId], queryFn: () => getAuthorProfile(readerId as string), enabled: !!readerId })
}
export function useAuthorPosts(readerId: string | undefined) {
  return useQuery({ queryKey: ['author-posts', readerId], queryFn: () => getAuthorPosts(readerId as string), enabled: !!readerId })
}
export function useAuthorStats(readerId: string | undefined) {
  return useQuery({ queryKey: ['author-stats', readerId], queryFn: () => getAuthorStats(readerId as string), enabled: !!readerId })
}
