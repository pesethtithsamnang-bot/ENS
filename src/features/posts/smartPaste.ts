/**
 * When pasting into a plain textarea, the browser normally strips all
 * formatting - bold from Word or Google Docs just becomes plain text.
 * This reads the HTML the clipboard actually carries (when there is any)
 * and converts bold and italic tags into the markdown-style syntax the
 * site's RichText renderer already understands.
 *
 * Ctrl+Shift+V needs no special handling here - browsers already strip
 * formatting for that shortcut before this ever runs, so it naturally
 * falls through to plain text.
 */
import type { ClipboardEvent } from 'react'

export function handleSmartPaste(e: ClipboardEvent<HTMLTextAreaElement>, insertText: (text: string) => void) {
  const html = e.clipboardData.getData('text/html')
  if (!html) return // no rich data (or Ctrl+Shift+V already stripped it) - let the browser paste plain text as usual

  e.preventDefault()
  const container = document.createElement('div')
  container.innerHTML = html

  function walk(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    const el = node as HTMLElement
    const inner = Array.from(el.childNodes).map(walk).join('')
    const tag = el.tagName.toLowerCase()
    if (tag === 'b' || tag === 'strong') return `**${inner}**`
    if (tag === 'i' || tag === 'em') return `*${inner}*`
    if (tag === 'br') return '\n'
    if (tag === 'p' || tag === 'div') return `${inner}\n`
    return inner
  }

  const converted = Array.from(container.childNodes).map(walk).join('').trim()
  insertText(converted || e.clipboardData.getData('text/plain'))
}
