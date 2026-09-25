import { renderInlineFormatting } from '../blocks'

export function RichText({ text }: { text: string }) {
  return (
    <>
      {renderInlineFormatting(text).map((part, i) => {
        if (typeof part === 'string') return <span key={i}>{part}</span>
        if (part.bold !== undefined) return <strong key={i}>{part.bold}</strong>
        if (part.italic !== undefined) return <em key={i}>{part.italic}</em>
        return null
      })}
    </>
  )
}
