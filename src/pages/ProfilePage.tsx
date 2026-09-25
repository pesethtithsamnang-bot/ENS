import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReaderAuth } from '../context/ReaderAuthContext'
import { useUpdateProfile, useUploadAvatar } from '../features/profile/hooks'
import { useDeleteMyPost, useMyPosts } from '../features/contributor/hooks'
import { signOut } from '../features/auth/api'
import { Button } from '../components/ui'
import { LoadingBot } from '../components/ui/LoadingBot'
import { FileDropzone } from '../components/ui/FileDropzone'
import { supabase } from '../lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

async function getMyProfile(id: string) {
  const { data, error } = await supabase.from('reader_profiles').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  pending_review: 'Pending review',
  draft: 'Draft',
  scheduled: 'Scheduled',
}

export function ProfilePage() {
  const { session } = useReaderAuth()
  const { data: profile } = useQuery({
    queryKey: ['my-profile', session?.user.id],
    queryFn: () => getMyProfile(session!.user.id),
    enabled: !!session,
  })
  const uploadAvatar = useUploadAvatar()
  const updateProfile = useUpdateProfile()
  const { data: myPosts } = useMyPosts(session?.user.id ?? null)
  const deleteMyPost = useDeleteMyPost()

  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [publicContact, setPublicContact] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.display_name)
      setAvatarUrl(profile.avatar_url)
      setPublicContact(profile.public_contact ?? '')
    }
  }, [profile])

  async function handleAvatarFile(file: File) {
    if (!session) return
    const url = await uploadAvatar.mutateAsync(file)
    setAvatarUrl(url)
    updateProfile.mutate(
      { id: session.user.id, changes: { avatar_url: url } },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) } }
    )
  }

  function handleSave() {
    if (!session) return
    updateProfile.mutate(
      { id: session.user.id, changes: { display_name: name, avatar_url: avatarUrl, public_contact: publicContact || null } },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) } }
    )
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-sm text-grey">
        <a href="/signin" className="font-bold text-red-dark">Sign in</a> to manage your profile.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Your profile</h1>
        <button onClick={() => signOut()} className="text-sm font-semibold text-red-dark hover:text-red">
          Sign out
        </button>
      </div>

      <div className="mb-5 flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-ink bg-surface">
          {avatarUrl && <img src={avatarUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-grey">Profile photo</label>
          <FileDropzone accept="image/*" label="Upload photo" compact onFile={handleAvatarFile} />
        </div>
      </div>

      <label className="mb-1 block text-xs font-semibold text-grey">Display name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-5 w-full rounded-md border-2 border-ink px-3 py-2.5 text-sm outline-none"
      />

      <label className="mb-1 block text-xs font-semibold text-grey">Email</label>
      <p className="mb-5 rounded-md border-2 border-ink bg-surface px-3 py-2.5 text-sm text-grey">{session.user.email}</p>

      <label className="mb-1 block text-xs font-semibold text-grey">Public contact (optional, shown on your author page)</label>
      <input
        value={publicContact}
        onChange={(e) => setPublicContact(e.target.value)}
        placeholder="e.g. a contact email or Telegram, only if you write articles"
        className="mb-5 w-full rounded-md border-2 border-ink px-3 py-2.5 text-sm outline-none"
      />

      <div className="mb-10 flex items-center gap-3">
        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? <LoadingBot label="Saving..." /> : 'Save changes'}
        </Button>
        {saved && <span className="text-sm font-semibold text-green">Saved</span>}
      </div>

      <div className="flex items-center justify-between border-t-2 border-surface pt-6">
        <h2 className="font-serif text-xl font-bold">Your articles</h2>
        <Link to="/write" className="text-sm font-bold text-red-dark">Write a new one</Link>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {myPosts?.map((post) => (
          <div key={post.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-ink">{post.title_en}</div>
              <div className="text-xs text-grey">{STATUS_LABEL[post.status] ?? post.status}</div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/write/${post.id}`} className="text-xs font-semibold text-red-dark">Edit</Link>
              <button
                onClick={() => {
                  if (confirm('Delete this article? This cannot be undone.')) deleteMyPost.mutate(post.id)
                }}
                className="text-xs font-semibold text-red-dark"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {myPosts?.length === 0 && <p className="text-sm text-grey">You haven't written anything yet.</p>}
      </div>
    </div>
  )
}
