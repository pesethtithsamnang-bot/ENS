import { useMutation } from '@tanstack/react-query'
import { updateProfile, uploadAvatar } from './api'

export function useUploadAvatar() {
  return useMutation({ mutationFn: uploadAvatar })
}
export function useUpdateProfile() {
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: { display_name?: string; avatar_url?: string | null; public_contact?: string | null } }) =>
      updateProfile(id, changes),
  })
}
