import { newReference, type ArticleReference } from '../../posts/blocks'

export function ReferencesEditor({
  references,
  onChange,
}: {
  references: ArticleReference[]
  onChange: (refs: ArticleReference[]) => void
}) {
  function update(id: string, changes: Partial<ArticleReference>) {
    onChange(references.map((r) => (r.id === id ? { ...r, ...changes } : r)))
  }
  function remove(id: string) {
    onChange(references.filter((r) => r.id !== id))
  }

  return (
    <div className="flex flex-col gap-3">
      {references.map((ref, i) => (
        <div key={ref.id} className="rounded-lg border border-[#e5e5e5] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-grey">Reference {i + 1}</span>
            <button type="button" onClick={() => remove(ref.id)} className="text-xs text-red-dark">Remove</button>
          </div>
          <div className="flex flex-col gap-2">
            <input
              value={ref.title}
              onChange={(e) => update(ref.id, { title: e.target.value })}
              placeholder="Source title"
              className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
            />
            <input
              value={ref.url}
              onChange={(e) => update(ref.id, { url: e.target.value })}
              placeholder="URL"
              className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={ref.author}
                onChange={(e) => update(ref.id, { author: e.target.value })}
                placeholder="Author / organization"
                className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
              />
              <input
                type="date"
                value={ref.date}
                onChange={(e) => update(ref.id, { date: e.target.value })}
                className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <textarea
              value={ref.notes}
              onChange={(e) => update(ref.id, { notes: e.target.value })}
              placeholder="Notes (optional)"
              className="min-h-14 rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...references, newReference()])}
        className="w-fit text-xs font-semibold text-red-dark"
      >
        + Add reference
      </button>
    </div>
  )
}
