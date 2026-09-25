import { useQuery } from '@tanstack/react-query'
import { getAdsByPlacement } from './api'

export function useAds(placement: string) {
  return useQuery({ queryKey: ['ads', placement], queryFn: () => getAdsByPlacement(placement) })
}
