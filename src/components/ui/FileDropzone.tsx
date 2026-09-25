import { useState } from 'react'

export function FileDropzone({
  onFile,
  accept,
  label,
  compact = false,
}: {
  onFile: (file: File) => void
  accept: string
  label: string
  compact?: boolean
}) {
  const [dragOver, setDragOver] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-center transition-colors ${
        compact ? 'px-4 py-4' : 'px-6 py-8'
      } ${dragOver ? 'border-red bg-surface' : 'border-ink/30 bg-white hover:border-ink hover:bg-surface'}`}
    >
      <span className="text-sm font-bold">{label}</span>
      <span className="text-xs text-grey">Click to browse or drag a file here</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
    </label>
  )
}
