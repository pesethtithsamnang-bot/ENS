import { useMutation } from '@tanstack/react-query'
import { submitFeedback } from './api'

export function useSubmitFeedback() {
  return useMutation({ mutationFn: submitFeedback })
}
