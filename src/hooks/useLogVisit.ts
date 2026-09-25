import { useEffect } from 'react'
import { logVisit } from '../features/analytics/api'

export function useLogVisit(path: string) {
  useEffect(() => {
    logVisit(path).catch(() => {
      // Analytics failing silently is fine - never disrupt the reader.
    })
  }, [path])
}
