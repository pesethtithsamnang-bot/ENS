import { useReaderAuth } from '../../../context/ReaderAuthContext'
import { useBookmarkState, useLikeState, useToggleBookmark, useToggleLike } from '../hooks'

export function EngagementBar({ postId }: { postId: string }) {
  const { session } = useReaderAuth()
  const readerId = session?.user.id ?? null

  const { data: likeState } = useLikeState(postId, readerId)
  const toggleLike = useToggleLike(postId)
  const { data: bookmarked } = useBookmarkState(postId, readerId)
  const toggleBookmark = useToggleBookmark(postId)

  function requireAuth(action: () => void) {
    if (!readerId) {
      window.location.href = '/signin'
      return
    }
    action()
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => requireAuth(() => toggleLike.mutate({ readerId: readerId as string, currentlyLiked: !!likeState?.likedByMe }))}
        className={`shadow-press flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-1.5 text-xs font-bold shadow-sm transition-transform active:scale-95 ${likeState?.likedByMe ? 'bg-red text-white' : 'bg-paper text-ink'}`}
      >
        <HeartIcon filled={!!likeState?.likedByMe} /> {likeState?.total ?? 0}
      </button>
      <button
        onClick={() => requireAuth(() => toggleBookmark.mutate({ readerId: readerId as string, currentlyBookmarked: !!bookmarked }))}
        className={`shadow-press flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-1.5 text-xs font-bold shadow-sm transition-transform active:scale-95 ${bookmarked ? 'bg-amber text-[#241a05]' : 'bg-paper text-ink'}`}
      >
        <BookmarkIcon filled={!!bookmarked} /> {bookmarked ? 'Saved' : 'Save'}
      </button>
    </div>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  )
}
