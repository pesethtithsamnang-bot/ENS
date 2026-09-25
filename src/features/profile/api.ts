import { supabase } from '../../lib/supabase/client'

export async function uploadAvatar(file: File) {
  const path = `avatar-${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('reader-uploads').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('reader-uploads').getPublicUrl(path)
  return data.publicUrl
}

export async function updateProfile(id: string, changes: { display_name?: string; avatar_url?: string | null; public_contact?: string | null }) {
  const { error } = await supabase.from('reader_profiles').update(changes).eq('id', id)
  if (error) throw error
}
