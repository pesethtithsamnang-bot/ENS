import { RichText } from './RichText'
import { toEmbedUrl } from '../embedUrl'
import type { PostBlock, BlockColor } from '../blocks'

const CALLOUT_STYLES: Record<BlockColor, string> = {
  default: 'bg-white border-ink',
  amber: 'bg-[#FBF1DD] border-amber',
  red: 'bg-[#FBEAEC] border-red',
  plum: 'bg-[#F3E7ED] border-plum',
  surface: 'bg-surface border-ink',
}

/**
 * Renders article content blocks exactly one way - used by the real
 * published article page AND the editor's Preview mode, so "preview"
 * can never drift from what actually gets published.
 */
export function ArticleBody({ blocks }: { blocks: PostBlock[] }) {
  if (blocks.length === 0) return null

  return (
    <div className="flex flex-col gap-4 text-[16.5px] leading-relaxed text-[#232327]">
      {blocks.map((block) => {
        const align = 'align' in block ? block.align : undefined
        const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'

        switch (block.type) {
          case 'heading1':
            return block.text.trim() ? (
              <h2 key={block.id} className={`mt-2 font-serif text-3xl font-bold text-ink ${alignClass}`}><RichText text={block.text} /></h2>
            ) : null
          case 'heading2':
            return block.text.trim() ? (
              <h3 key={block.id} className={`mt-1 font-serif text-2xl font-bold text-ink ${alignClass}`}><RichText text={block.text} /></h3>
            ) : null
          case 'heading3':
            return block.text.trim() ? (
              <h4 key={block.id} className={`font-serif text-xl font-bold text-ink ${alignClass}`}><RichText text={block.text} /></h4>
            ) : null
          case 'text':
            return block.text.trim() ? <p key={block.id} className={`whitespace-pre-line ${alignClass}`}><RichText text={block.text} /></p> : null
          case 'quote':
            return block.text.trim() ? (
              <blockquote key={block.id} className="whitespace-pre-line border-l-4 border-ink bg-surface py-3 pl-5 italic text-grey">
                <RichText text={block.text} />
              </blockquote>
            ) : null
          case 'code':
            return block.text.trim() ? (
              <pre key={block.id} className="overflow-x-auto rounded-lg border-2 border-ink bg-ink p-4 font-mono text-sm text-[#DCEBFF]">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-[#8C8A85]">{block.language}</div>
                <code>{block.text}</code>
              </pre>
            ) : null
          case 'callout':
            return block.text.trim() ? (
              <div key={block.id} className={`rounded-lg border-2 p-4 font-medium ${CALLOUT_STYLES[block.color]}`}>
                <RichText text={block.text} />
              </div>
            ) : null
          case 'divider':
            return <hr key={block.id} className="border-t-2 border-surface" />
          case 'image':
            return block.url ? (
              <figure key={block.id}>
                <img src={block.url} alt={block.alt || block.caption} className="w-full rounded-lg border-2 border-ink object-cover" />
                {(block.caption || block.credit) && (
                  <figcaption className="mt-1.5 text-xs font-medium text-grey">
                    {block.caption}
                    {block.caption && block.credit ? ' - ' : ''}
                    {block.credit && <span>Credit: {block.credit}</span>}
                  </figcaption>
                )}
              </figure>
            ) : null
          case 'list':
            return block.items.some((i) => i.trim()) ? (
              block.ordered ? (
                <ol key={block.id} className="list-decimal space-y-1.5 pl-5">
                  {block.items.filter((i) => i.trim()).map((item, i) => <li key={i}><RichText text={item} /></li>)}
                </ol>
              ) : (
                <ul key={block.id} className="list-disc space-y-1.5 pl-5">
                  {block.items.filter((i) => i.trim()).map((item, i) => <li key={i}><RichText text={item} /></li>)}
                </ul>
              )
            ) : null
          case 'table':
            return block.rows.length > 0 ? (
              <div key={block.id} className="overflow-x-auto">
                <table className="w-full border-collapse overflow-hidden rounded-lg border-2 border-ink text-sm">
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri} className={ri === 0 ? 'bg-surface font-semibold' : ''}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border border-ink/15 px-3 py-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null
          case 'video':
            return block.url ? (
              <figure key={block.id}>
                <div className="aspect-video w-full overflow-hidden rounded-lg border-2 border-ink bg-ink">
                  <iframe src={toEmbedUrl(block.url)} className="h-full w-full" allowFullScreen title="Embedded video" />
                </div>
                {block.caption && <figcaption className="mt-1.5 text-xs font-medium text-grey">{block.caption}</figcaption>}
              </figure>
            ) : null
        }
      })}
    </div>
  )
}
