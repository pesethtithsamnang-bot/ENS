import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addComment,
  getBookmarkState,
  getComments,
  getFollowState,
  getLikeState,
  getMyBookmarkedPosts,
  toggleBookmark,
  toggleFollow,
  toggleLike,
} from './api'

export function useLikeState(postId: string, readerId: string | null) {
  return useQuery({ queryKey: ['like-state', postId, readerId], queryFn: () => getLikeState(postId, readerId) })
}

export function useToggleLike(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ readerId, currentlyLiked }: { readerId: string; currentlyLiked: boolean }) => toggleLike(postId, readerId, currentlyLiked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['like-state', postId] }),
  })
}

export function useBookmarkState(postId: string, readerId: string | null) {
  return useQuery({ queryKey: ['bookmark-state', postId, readerId], queryFn: () => getBookmarkState(postId, readerId) })
}

export function useToggleBookmark(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ readerId, currentlyBookmarked }: { readerId: string; currentlyBookmarked: boolean }) => toggleBookmark(postId, readerId, currentlyBookmarked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookmark-state', postId] }),
  })
}

export function useMyBookmarks(readerId: string | null) {
  return useQuery({
    queryKey: ['my-bookmarks', readerId],
    queryFn: () => getMyBookmarkedPosts(readerId as string),
    enabled: !!readerId,
  })
}

export function useComments(postId: string) {
  return useQuery({ queryKey: ['comments', postId], queryFn: () => getComments(postId) })
}

export function useAddComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ readerId, body, parentId }: { readerId: string; body: string; parentId?: string }) => addComment(postId, readerId, body, parentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  })
}

export function useFollowState(categoryId: string, readerId: string | null) {
  return useQuery({ queryKey: ['follow-state', categoryId, readerId], queryFn: () => getFollowState(categoryId, readerId) })
}

export function useToggleFollow(categoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ readerId, currentlyFollowing }: { readerId: string; currentlyFollowing: boolean }) => toggleFollow(categoryId, readerId, currentlyFollowing),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['follow-state', categoryId] }),
  })
}
