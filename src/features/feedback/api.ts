import { supabase } from '../../lib/supabase/client'

export async function submitFeedback(input: { name?: string; email?: string; message: string; readerId?: string | null }) {
  const { error } = await supabase.from('feedback').insert({
    name: input.name || null,
    email: input.email || null,
    message: input.message,
    reader_id: input.readerId ?? null,
  })
  if (error) throw error
}
