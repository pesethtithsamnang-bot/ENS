import { useMutation, useQuery } from '@tanstack/react-query'
import { getActivePlanWithBenefits, subscribe } from './api'

export function useActivePlan() {
  return useQuery({ queryKey: ['active-plan'], queryFn: getActivePlanWithBenefits })
}

export function useSubscribe() {
  return useMutation({
    mutationFn: ({ email, planId }: { email: string; planId?: string }) => subscribe(email, planId),
  })
}
