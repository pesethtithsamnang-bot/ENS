import { useParams } from 'react-router-dom'
import { usePageBySlug } from '../features/pages/hooks'
import { RichText } from '../features/posts/components/RichText'
import type { PostBlock } from '../features/posts/blocks'
import { useLogVisit } from '../hooks/useLogVisit'

function parseBlocks(raw: unknown): PostBlock[] {
  return Array.isArray(raw) ? (raw as PostBlock[]) : []
}

export function CustomPage() {
  const { slug } = useParams()
  useLogVisit(`/page/${slug}`)
  const { data: page, isLoading, error } = usePageBySlug(slug)

  if (isLoading) return <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-grey">Loading...</div>
  if (error || !page) return <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-grey">Page not found.</div>

  const blocks = parseBlocks(page.content_blocks)

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="mb-6 font-serif text-3xl font-bold">{page.title}</h1>
      <div className="legal-content flex flex-col gap-4 text-[15px] leading-relaxed text-[#232327]">
        {blocks.map((block) => {
          if (block.type === 'heading1' && block.text.trim())
            return <h2 key={block.id} className="font-serif text-2xl font-bold text-ink"><RichText text={block.text} /></h2>
          if (block.type === 'heading2' && block.text.trim())
            return <h3 key={block.id} className="font-serif text-xl font-bold text-ink"><RichText text={block.text} /></h3>
          if (block.type === 'quote' && block.text.trim())
            return <blockquote key={block.id} className="whitespace-pre-line border-l-4 border-ink bg-surface py-2 pl-4 italic"><RichText text={block.text} /></blockquote>
          if (block.type === 'text' && block.text.trim())
            return <p key={block.id} className="whitespace-pre-line"><RichText text={block.text} /></p>
          return null
        })}
      </div>
    </div>
  )
}
