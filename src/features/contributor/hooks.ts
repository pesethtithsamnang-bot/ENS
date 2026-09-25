import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteMyPost,
  getMyArticleById,
  getMyPosts,
  submitArticle,
  updateMyArticle,
  uploadArticleCover,
  uploadArticleImage,
} from './api'

export function useUploadArticleCover() {
  return useMutation({ mutationFn: uploadArticleCover })
}
export function useUploadArticleImage() {
  return useMutation({ mutationFn: uploadArticleImage })
}
export function useSubmitArticle() {
  return useMutation({ mutationFn: submitArticle })
}
export function useUpdateMyArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input, status }: { id: string; input: Parameters<typeof updateMyArticle>[1]; status?: string }) =>
      updateMyArticle(id, input, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-submitted-posts'] }),
  })
}
export function useMyArticleById(id: string | undefined) {
  return useQuery({ queryKey: ['my-article', id], queryFn: () => getMyArticleById(id as string), enabled: !!id })
}
export function useMyPosts(readerId: string | null) {
  return useQuery({
    queryKey: ['my-submitted-posts', readerId],
    queryFn: () => getMyPosts(readerId as string),
    enabled: !!readerId,
  })
}
export function useDeleteMyPost() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: deleteMyPost, onSuccess: () => qc.invalidateQueries({ queryKey: ['my-submitted-posts'] }) })
}
