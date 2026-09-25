import { Link } from 'react-router-dom'

type PostSummary = {
  slug: string
  title_en: string
  cover_image_url: string | null
  published_at: string | null
  categories: { name: string; slug: string } | null
  reader_profiles?: { display_name: string; avatar_url: string | null } | { display_name: string; avatar_url: string | null }[] | null
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  const units: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]
  for (const [secs, label] of units) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export function PostCard({ post }: { post: PostSummary }) {
  const author = Array.isArray(post.reader_profiles) ? post.reader_profiles[0] : post.reader_profiles
  const authorName = author?.display_name ?? 'ENS Staff'

  return (
    <Link to={`/post/${post.slug}`} className="group block">
      <div className="aspect-video overflow-hidden rounded-xl bg-surface">
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="mt-3 flex gap-3">
        <div className="mt-0.5 h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-surface">
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-ink font-serif text-sm font-bold text-white">
              {authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="min-h-[2.6em] text-[15px] font-semibold leading-snug text-ink line-clamp-2 group-hover:text-red-dark">
            {post.title_en}
          </h3>
          <div className="mt-1 truncate text-[13px] text-grey">{authorName}</div>
          <div className="truncate text-[13px] text-grey">
            {post.categories?.name}
            {post.categories && post.published_at && ' \u00b7 '}
            {post.published_at && timeAgo(post.published_at)}
          </div>
        </div>
      </div>
    </Link>
  )
}
