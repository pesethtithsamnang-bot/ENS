import type { ReactNode } from 'react'

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export function renderLegalMarkdown(raw: string) {
  const lines = raw.split('\n')
  const elements: ReactNode[] = []
  let listBuffer: string[] = []

  function flushList() {
    if (listBuffer.length === 0) return
    elements.push(
      <ul key={`list-${elements.length}`} className="my-3 list-disc space-y-1.5 pl-5">
        {listBuffer.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
      </ul>
    )
    listBuffer = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={elements.length} className="mb-3 mt-8 text-xl font-semibold text-ink first:mt-0">
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('# ')) {
      flushList()
      elements.push(
        <h1 key={elements.length} className="mb-4 text-2xl font-semibold text-ink">
          {trimmed.slice(2)}
        </h1>
      )
    } else if (trimmed.startsWith('- ')) {
      listBuffer.push(trimmed.slice(2))
    } else if (trimmed === '') {
      flushList()
    } else {
      flushList()
      elements.push(
        <p key={elements.length} className="mb-3 text-[15px] leading-relaxed text-[#3c3c40]">
          {renderInline(trimmed)}
        </p>
      )
    }
  }
  flushList()
  return elements
}
