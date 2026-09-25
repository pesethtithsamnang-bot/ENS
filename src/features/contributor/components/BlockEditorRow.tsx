import type { PostBlock, BlockColor, TextAlign } from '../../posts/blocks'
import { FileDropzone } from '../../../components/ui/FileDropzone'
import { handleSmartPaste } from '../../posts/smartPaste'

const ALIGN_OPTIONS: { value: TextAlign; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]

export function BlockEditorRow({
  block,
  isFirst,
  isLast,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  uploadImage,
}: {
  block: PostBlock
  isFirst: boolean
  isLast: boolean
  onChange: (changes: Partial<PostBlock>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onRemove: () => void
  uploadImage: (file: File) => Promise<string>
}) {
  return (
    <div className="group relative rounded-lg border border-[#e5e5e5] bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-grey">{block.type}</span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" onClick={onMoveUp} disabled={isFirst} className="rounded px-1.5 py-0.5 text-xs text-grey hover:bg-surface disabled:opacity-30">Up</button>
          <button type="button" onClick={onMoveDown} disabled={isLast} className="rounded px-1.5 py-0.5 text-xs text-grey hover:bg-surface disabled:opacity-30">Down</button>
          <button type="button" onClick={onDuplicate} className="rounded px-1.5 py-0.5 text-xs text-grey hover:bg-surface">Duplicate</button>
          <button type="button" onClick={onRemove} className="rounded px-1.5 py-0.5 text-xs text-red-dark hover:bg-surface">Remove</button>
        </div>
      </div>

      {'align' in block && (
        <div className="mb-2 flex gap-1">
          {ALIGN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ align: opt.value } as Partial<PostBlock>)}
              className={`rounded px-2 py-1 text-xs font-medium ${block.align === opt.value ? 'bg-ink text-white' : 'bg-surface text-ink hover:bg-[#e5e5e5]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {'text' in block && block.type !== 'code' && (
        <textarea
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value } as Partial<PostBlock>)}
          onPaste={(e) => {
            const target = e.currentTarget
            handleSmartPaste(e, (text) => {
              const start = target.selectionStart
              const end = target.selectionEnd
              const newValue = block.text.slice(0, start) + text + block.text.slice(end)
              onChange({ text: newValue } as Partial<PostBlock>)
            })
          }}
          placeholder={
            block.type === 'heading1' ? 'Big heading...' : block.type === 'heading2' ? 'Subheading...' : block.type === 'heading3' ? 'Smaller heading...' : 'Write here...'
          }
          className={`min-h-20 w-full resize-y rounded-lg border border-[#e5e5e5] p-2.5 text-sm outline-none focus:border-blue-500 ${
            block.type === 'heading1' ? 'font-serif text-lg font-bold' : block.type === 'heading2' ? 'font-serif font-bold' : block.type === 'heading3' ? 'font-semibold' : ''
          }`}
        />
      )}

      {block.type === 'callout' && (
        <div className="mt-2 flex gap-2">
          {(['default', 'amber', 'red', 'plum', 'surface'] as BlockColor[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ color: c } as Partial<PostBlock>)}
              className={`h-6 w-6 rounded-full border-2 ${block.color === c ? 'border-ink' : 'border-transparent'}`}
              style={{ background: { default: '#fff', amber: '#E8A63A', red: '#E1152B', plum: '#7A1030', surface: '#F3F4EE' }[c] }}
            />
          ))}
        </div>
      )}

      {block.type === 'code' && (
        <div>
          <input
            value={block.language}
            onChange={(e) => onChange({ language: e.target.value } as Partial<PostBlock>)}
            placeholder="Language"
            className="mb-1.5 w-full rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 font-mono text-xs outline-none focus:border-blue-500"
          />
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<PostBlock>)}
            className="min-h-28 w-full rounded-lg border border-[#e5e5e5] bg-ink p-2.5 font-mono text-xs text-[#DCEBFF] outline-none"
          />
        </div>
      )}

      {block.type === 'image' && (
        <div className="flex flex-col gap-2">
          {block.url ? (
            <img src={block.url} alt="" className="max-h-56 w-full rounded-lg object-cover" />
          ) : (
            <FileDropzone accept="image/*" label="Upload image" compact onFile={async (file) => onChange({ url: await uploadImage(file) } as Partial<PostBlock>)} />
          )}
          {block.url && (
            <>
              <input
                value={block.caption}
                onChange={(e) => onChange({ caption: e.target.value } as Partial<PostBlock>)}
                placeholder="Caption (optional)"
                className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={block.alt}
                  onChange={(e) => onChange({ alt: e.target.value } as Partial<PostBlock>)}
                  placeholder="Alt text (accessibility)"
                  className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                />
                <input
                  value={block.credit}
                  onChange={(e) => onChange({ credit: e.target.value } as Partial<PostBlock>)}
                  placeholder="Credit (optional)"
                  className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      )}

      {block.type === 'video' && (
        <div className="flex flex-col gap-2">
          <input
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value } as Partial<PostBlock>)}
            placeholder="Paste any video or game link (YouTube, Vimeo, CodePen, Loom, Spotify, itch.io...)"
            className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
          />
          <input
            value={block.caption}
            onChange={(e) => onChange({ caption: e.target.value } as Partial<PostBlock>)}
            placeholder="Caption (optional)"
            className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
          />
        </div>
      )}

      {block.type === 'list' && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ ordered: false } as Partial<PostBlock>)}
              className={`rounded px-2 py-1 text-xs font-medium ${!block.ordered ? 'bg-ink text-white' : 'bg-surface text-ink'}`}
            >
              Bulleted
            </button>
            <button
              type="button"
              onClick={() => onChange({ ordered: true } as Partial<PostBlock>)}
              className={`rounded px-2 py-1 text-xs font-medium ${block.ordered ? 'bg-ink text-white' : 'bg-surface text-ink'}`}
            >
              Numbered
            </button>
          </div>
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-4 flex-shrink-0 text-xs text-grey">{block.ordered ? `${i + 1}.` : '\u2022'}</span>
              <input
                value={item}
                onChange={(e) => {
                  const items = [...block.items]
                  items[i] = e.target.value
                  onChange({ items } as Partial<PostBlock>)
                }}
                className="flex-1 rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => onChange({ items: block.items.filter((_, j) => j !== i) } as Partial<PostBlock>)}
                className="text-xs text-red-dark"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ items: [...block.items, ''] } as Partial<PostBlock>)}
            className="w-fit text-xs font-semibold text-red-dark"
          >
            + Add item
          </button>
        </div>
      )}

      {block.type === 'table' && (
        <div className="flex flex-col gap-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border border-[#e5e5e5] p-0.5">
                        <input
                          value={cell}
                          onChange={(e) => {
                            const rows = block.rows.map((r) => [...r])
                            rows[ri][ci] = e.target.value
                            onChange({ rows } as Partial<PostBlock>)
                          }}
                          className="w-full min-w-[80px] px-1.5 py-1 text-xs outline-none"
                        />
                      </td>
                    ))}
                    <button
                      type="button"
                      onClick={() => onChange({ rows: block.rows.filter((_, j) => j !== ri) } as Partial<PostBlock>)}
                      className="ml-1 text-xs text-red-dark"
                    >
                      &times;
                    </button>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ rows: [...block.rows, block.rows[0].map(() => '')] } as Partial<PostBlock>)}
              className="text-xs font-semibold text-red-dark"
            >
              + Add row
            </button>
            <button
              type="button"
              onClick={() => onChange({ rows: block.rows.map((r) => [...r, '']) } as Partial<PostBlock>)}
              className="text-xs font-semibold text-red-dark"
            >
              + Add column
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
