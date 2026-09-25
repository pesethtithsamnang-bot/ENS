import { useReaderAuth } from '../../../context/ReaderAuthContext'
import { useFollowState, useToggleFollow } from '../hooks'

export function FollowButton({ categoryId }: { categoryId: string }) {
  const { session } = useReaderAuth()
  const readerId = session?.user.id ?? null
  const { data: following } = useFollowState(categoryId, readerId)
  const toggleFollow = useToggleFollow(categoryId)

  function handleClick() {
    if (!readerId) {
      window.location.href = '/signin'
      return
    }
    toggleFollow.mutate({ readerId, currentlyFollowing: !!following })
  }

  return (
    <button
      onClick={handleClick}
      className={`shadow-press rounded-md border-2 border-ink px-4 py-2 text-sm font-bold shadow-sm ${following ? 'bg-ink text-white' : 'bg-red text-white'}`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
