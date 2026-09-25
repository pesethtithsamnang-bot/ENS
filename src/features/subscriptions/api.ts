import { supabase } from '../../lib/supabase/client'

export async function getActivePlanWithBenefits() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*, plan_benefits(*)')
    .eq('is_active', true)
    .order('price_cents')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function subscribe(email: string, planId?: string) {
  const { error } = await supabase.from('subscribers').insert({ email, plan_id: planId ?? null })
  if (error) throw error
}
