import { supabase } from '../../lib/supabase/client'

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  extra?: { firstName?: string; lastName?: string; birthday?: string; gender?: string; mobileNumber?: string }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })
  if (error) throw error
  // reader_profiles and reader_emails are created automatically by a
  // database trigger the moment the auth account is created - no
  // client-side write needed here, which is what caused the 401 (the
  // browser tried to insert before its session was fully ready).
  if (data.user && extra) {
    await supabase
      .from('reader_profiles')
      .update({
        first_name: extra.firstName || null,
        last_name: extra.lastName || null,
        birthday: extra.birthday || null,
        gender: extra.gender || null,
        mobile_number: extra.mobileNumber || null,
      })
      .eq('id', data.user.id)
  }
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}
