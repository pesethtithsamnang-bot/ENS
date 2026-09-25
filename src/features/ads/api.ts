import { supabase } from '../../lib/supabase/client'

export async function getAdsByPlacement(placement: string) {
  const { data, error } = await supabase.from('ads').select('*').eq('status', 'live').eq('placement', placement)
  if (error) throw error
  return data
}

export async function trackAdEvent(adId: string, eventType: 'impression' | 'click') {
  // Fire-and-forget - a failed tracking write should never affect the
  // reader's experience, so this deliberately swallows its own errors.
  try {
    await supabase.from('ad_events').insert({ ad_id: adId, event_type: eventType })
  } catch {
    // ignore
  }
}
