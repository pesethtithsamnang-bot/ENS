import { useParams } from 'react-router-dom'
import { useAuthorPosts, useAuthorProfile, useAuthorStats } from '../features/authors/hooks'
import { PostCard } from '../features/posts/components/PostCard'
import { LoadingBotBlock } from '../components/ui/LoadingBot'
import { useLogVisit } from '../hooks/useLogVisit'

export function AuthorProfilePage() {
  const { id } = useParams()
  useLogVisit(`/author/${id}`)
  const { data: author, isLoading } = useAuthorProfile(id)
  const { data: posts } = useAuthorPosts(id)
  const { data: stats } = useAuthorStats(id)

  if (isLoading) return <LoadingBotBlock label="Loading profile..." />
  if (!author) return <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-grey">Author not found.</div>

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-ink bg-surface">
          {author.avatar_url && <img src={author.avatar_url} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="font-serif text-2xl font-bold">{author.display_name}</h1>
          {author.public_contact && <p className="text-sm text-grey">{author.public_contact}</p>}
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Articles" value={stats?.totalPosts} />
        <Stat label="Likes" value={stats?.totalLikes} />
        <Stat label="Comments" value={stats?.totalComments} />
        <Stat label="Shares" value={stats?.totalShares} />
      </div>

      <h2 className="mb-4 font-serif text-lg font-bold">Articles</h2>
      {posts && posts.length === 0 && <p className="text-sm text-grey">No published articles yet.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-lg border-2 border-ink bg-white p-4 text-center shadow-sm">
      <div className="font-serif text-2xl font-bold">{value ?? '-'}</div>
      <div className="text-xs font-semibold text-grey">{label}</div>
    </div>
  )
}
