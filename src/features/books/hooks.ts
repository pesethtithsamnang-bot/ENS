import { useMutation, useQuery } from '@tanstack/react-query'
import { getBookById, getBookPages, getPublishedBooks, getReadingProgress, getMyInProgressBooks, saveReadingProgress } from './api'

export function useBooks() {
  return useQuery({ queryKey: ['books'], queryFn: getPublishedBooks })
}
export function useBook(id: string | undefined) {
  return useQuery({ queryKey: ['book', id], queryFn: () => getBookById(id as string), enabled: !!id })
}
export function useBookPages(id: string | undefined) {
  return useQuery({ queryKey: ['book-pages', id], queryFn: () => getBookPages(id as string), enabled: !!id })
}
export function useReadingProgress(bookId: string | undefined, readerId: string | null) {
  return useQuery({
    queryKey: ['reading-progress', bookId, readerId],
    queryFn: () => getReadingProgress(bookId as string, readerId),
    enabled: !!bookId,
  })
}
export function useMyInProgressBooks(readerId: string | null) {
  return useQuery({
    queryKey: ['in-progress-books', readerId],
    queryFn: () => getMyInProgressBooks(readerId as string),
    enabled: !!readerId,
  })
}
export function useSaveReadingProgress() {
  return useMutation({
    mutationFn: ({ bookId, readerId, currentPage }: { bookId: string; readerId: string; currentPage: number }) =>
      saveReadingProgress(bookId, readerId, currentPage),
  })
}
