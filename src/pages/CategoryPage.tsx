import { Link, useParams } from 'react-router-dom'
import { usePostsByCategory } from '../features/posts/hooks'
import { useCategories, useCategoryBySlug } from '../features/categories/hooks'
import { PostCard } from '../features/posts/components/PostCard'
import { PostCardSkeleton } from '../components/ui'
import { FollowButton } from '../features/engagement/components/FollowButton'
import { useLogVisit } from '../hooks/useLogVisit'

function getErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  if (typeof err === 'object') {
    const e = err as Record<string, unknown>
    return (e.message as string) || (e.error_description as string) || (e.hint as string) || JSON.stringify(err)
  }
  return String(err)
}

export function CategoryPage() {
  const { slug } = useParams()
  useLogVisit(`/category/${slug}`)
  const { data: category } = useCategoryBySlug(slug)
  const { data: categories } = useCategories()
  const { data: posts, isLoading, error } = usePostsByCategory(slug)

  return (
    <div className="page-transition">
      <div className="bg-red">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-8">
          <h1 className="text-3xl font-bold capitalize text-white">{category?.name ?? slug}</h1>
          {category && <FollowButton categoryId={category.id} />}
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="mx-auto max-w-[1600px] px-6 pt-4">
          <div className="scrollbar-none flex items-center gap-3 overflow-x-auto pb-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                  c.slug === slug ? 'bg-ink text-white' : 'bg-surface text-ink hover:bg-[#e5e5e5]'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {isLoading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-8">
            {[0, 1, 2, 3, 4].map((i) => <PostCardSkeleton key={i} />)}
          </div>
        )}
        {error && (
          <p className="rounded-md bg-surface p-4 text-base text-red-dark">
            Could not load posts for this category: {getErrorMessage(error)}
          </p>
        )}
        {!isLoading && !error && posts && posts.length === 0 && <p className="text-base text-grey">No posts in this category yet.</p>}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-8">
          {posts?.map((post, i) => (
            <div key={post.id} className="stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
