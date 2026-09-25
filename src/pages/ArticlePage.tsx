import { Link, useParams } from 'react-router-dom'
import { usePost, usePostsByCategory } from '../features/posts/hooks'
import { AdBanner } from '../features/ads/components/AdBanner'
import { ArticleBody } from '../features/posts/components/ArticleBody'
import { toEmbedUrl } from '../features/posts/embedUrl'
import { ShareBar } from '../features/posts/components/ShareBar'
import { EngagementBar } from '../features/engagement/components/EngagementBar'
import { CommentSection } from '../features/engagement/components/CommentSection'
import { useReaderAuth } from '../context/ReaderAuthContext'
import { useLogVisit } from '../hooks/useLogVisit'
import { Tag } from '../components/ui'
import { ChevronRightIcon, FileIcon, GlobeIcon } from '../components/ui/icons'
import type { PostBlock } from '../features/posts/blocks'

function parseBlocks(raw: unknown): PostBlock[] {
  return Array.isArray(raw) ? (raw as PostBlock[]) : []
}

export function ArticlePage() {
  const { slug } = useParams()
  useLogVisit(`/post/${slug}`)
  const { session } = useReaderAuth()
  const { data: post, isLoading, error } = usePost(slug)
  const categorySlug = post?.categories?.slug
  const { data: related } = usePostsByCategory(categorySlug)

  if (isLoading) return <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-grey">Loading...</div>
  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm text-grey">This post could not be found, or isn't published.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-bold text-red-dark">Back to home</Link>
      </div>
    )
  }

  const blocks = parseBlocks(post.content_blocks)
  const relatedPosts = related?.filter((p) => p.id !== post.id).slice(0, 3)

  return (
    <div className="page-transition mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-5 flex items-center gap-1.5 text-xs text-grey">
        <Link to="/">Home</Link>
        <ChevronRightIcon />
        {post.categories && <Link to={`/category/${post.categories.slug}`}>{post.categories.name}</Link>}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,760px)_1fr]">
        <div className="mx-auto w-full max-w-[760px]">
          {post.categories && <Tag>{post.categories.name}</Tag>}
          <h1 className="mb-4 mt-3 font-serif text-3xl font-bold leading-tight md:text-4xl">{post.title_en}</h1>

          {post.title_kh && (
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-surface px-3.5 py-1.5 text-xs font-semibold">
              <GlobeIcon className="h-3.5 w-3.5" /> Also available in Khmer
            </div>
          )}

          {post.published_at && (
            <div className="mb-4 font-mono text-xs text-grey">
              Published {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              {(post.reader_profiles as { id: string; display_name: string } | null) && (
                <>
                  {' '}by{' '}
                  <Link to={`/author/${(post.reader_profiles as { id: string; display_name: string }).id}`} className="font-bold text-red-dark">
                    {(post.reader_profiles as { id: string; display_name: string }).display_name}
                  </Link>
                </>
              )}
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <EngagementBar postId={post.id} />
          </div>

          <div className="mb-6">
            <ShareBar postId={post.id} slug={post.slug} />
          </div>

          {post.video_url ? (
            <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg border-2 border-ink bg-ink">
              <iframe src={toEmbedUrl(post.video_url)} className="h-full w-full" allowFullScreen title={post.title_en} />
            </div>
          ) : (
            post.cover_image_url && (
              <img src={post.cover_image_url} alt="" className="mb-6 aspect-video w-full rounded-lg border-2 border-ink object-cover" />
            )
          )}

          {blocks.length > 0 ? (
            <ArticleBody blocks={blocks} />
          ) : (
            <div className="flex flex-col gap-4 text-[16.5px] leading-relaxed text-[#232327]">
              {post.body_en.split('\n\n').map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
            </div>
          )}

          {(post.source_url || post.source_label) && (
            <div className="mt-7 rounded-lg border-2 border-ink bg-surface p-4">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded bg-ink px-2.5 py-1 text-[10px] font-bold text-white">
                <FileIcon className="h-3 w-3" /> SOURCE
              </div>
              <p className="text-sm">
                {post.source_label}
                {post.source_url && (
                  <>
                    {post.source_label ? ' ' : ''}
                    <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-amber decoration-2">
                      {post.source_url}
                    </a>
                  </>
                )}
              </p>
            </div>
          )}

          <CommentSection postId={post.id} />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-fit">
          <AdBanner placement="homepage_sidebar" />
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h4 className="mb-4 font-semibold text-ink">Related posts</h4>
              <div className="flex flex-col gap-4">
                {relatedPosts.map((p) => (
                  <Link key={p.id} to={`/post/${p.slug}`} className="flex gap-3">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
                      {p.cover_image_url && <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <span className="text-sm font-semibold leading-snug text-ink">{p.title_en}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <AdBanner placement="article_video" />
          {!session && <AdBanner placement="sitewide_popup" />}
        </div>
      </div>
    </div>
  )
}
