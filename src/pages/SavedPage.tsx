import { useReaderAuth } from '../context/ReaderAuthContext'
import { useMyBookmarks } from '../features/engagement/hooks'
import { PostCard } from '../features/posts/components/PostCard'
import { useLogVisit } from '../hooks/useLogVisit'

export function SavedPage() {
  useLogVisit('/saved')
  const { session, loading } = useReaderAuth()
  const { data: posts, isLoading } = useMyBookmarks(session?.user.id ?? null)

  if (loading) return null
  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-grey">
        <a href="/signin" className="font-bold text-red-dark">Sign in</a> to see what you've saved.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-7 font-serif text-3xl font-bold">Saved</h1>
      {isLoading && <p className="text-sm text-grey">Loading...</p>}
      {!isLoading && posts && posts.length === 0 && <p className="text-sm text-grey">Nothing saved yet.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {posts?.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
