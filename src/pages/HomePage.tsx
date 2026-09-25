import React from 'react'
import { Link } from 'react-router-dom'
import { useInfinitePosts } from '../features/posts/hooks'
import { PostCard } from '../features/posts/components/PostCard'
import { PostCardSkeleton } from '../components/ui'
import { StateIllustration } from '../components/ui/StateIllustration'
import { AdBanner } from '../features/ads/components/AdBanner'
import { useCategories } from '../features/categories/hooks'
import { useLogVisit } from '../hooks/useLogVisit'
import { useInfiniteScrollTrigger } from '../hooks/useInfiniteScrollTrigger'

export function HomePage() {
  useLogVisit('/')
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts()
  const { data: categories } = useCategories()
  const posts = data?.pages.flatMap((p) => p.posts) ?? []

  const loadMoreRef = useInfiniteScrollTrigger(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, !!hasNextPage)

  return (
    <div className="page-transition">
      {categories && categories.length > 0 && (
        <div className="sticky top-[76px] z-20 -mt-px bg-white">
          <div className="mx-auto max-w-[1600px] px-6 pt-4">
            <div className="scrollbar-none flex items-center gap-3 overflow-x-auto pb-3">
              <button className="flex-shrink-0 whitespace-nowrap rounded-lg bg-[#0f0f0f] px-3 py-1.5 text-sm font-medium text-white">
                All
              </button>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.slug}`}
                  className="flex-shrink-0 whitespace-nowrap rounded-lg bg-[#f2f2f2] px-3 py-1.5 text-sm font-medium text-[#0f0f0f] hover:bg-[#e5e5e5]"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-x-4 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        )}
        {!isLoading && posts.length === 0 && (
          <StateIllustration kind="empty" title="No posts yet" message="Check back soon for new articles." compact />
        )}

        <div className="grid grid-cols-1 gap-x-4 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {posts.map((post, i) => (
            <React.Fragment key={`post-${i}`}>
              <div className="stagger-item" style={{ animationDelay: `${(i % 20) * 60}ms` }}>
                <PostCard post={post} />
              </div>
              {/* One ad slot every 12 posts. It spans the full grid row
                  (col-span-full) so it always gets its own row - no real
                  post or second ad can ever land beside it, regardless of
                  how many columns the current screen width fits. */}
              {(i + 1) % 12 === 0 && (
                <div key={`ad-${i}`} className="col-span-full">
                  <AdBanner placement="homepage_grid" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Sentinel element - scrolling this into view loads the next page.
            rootMargin on the observer means it fires ~600px before you
            actually reach it, so more posts are already there by the time
            you scroll down, instead of a visible pause every 20 posts. */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="mt-8">
            {isFetchingNextPage && (
              <div className="grid grid-cols-1 gap-x-4 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <PostCardSkeleton key={`more-${i}`} />
                ))}
              </div>
            )}
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="mt-10 text-center text-sm text-grey">You've reached the end - that's every post.</p>
        )}
      </div>
    </div>
  )
}
