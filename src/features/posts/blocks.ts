export type BlockColor = 'default' | 'amber' | 'red' | 'plum' | 'surface'
export type TextAlign = 'left' | 'center' | 'right'

export type PostBlock =
  | { id: string; type: 'heading1'; text: string; align?: TextAlign }
  | { id: string; type: 'heading2'; text: string; align?: TextAlign }
  | { id: string; type: 'heading3'; text: string; align?: TextAlign }
  | { id: string; type: 'text'; text: string; align?: TextAlign }
  | { id: string; type: 'quote'; text: string }
  | { id: string; type: 'code'; text: string; language: string }
  | { id: string; type: 'callout'; text: string; color: BlockColor }
  | { id: string; type: 'divider' }
  | { id: string; type: 'image'; url: string; caption: string; alt: string; credit: string }
  | { id: string; type: 'list'; ordered: boolean; items: string[] }
  | { id: string; type: 'table'; rows: string[][] }
  | { id: string; type: 'video'; url: string; caption: string }

export type ArticleReference = {
  id: string
  title: string
  url: string
  author: string
  date: string
  notes: string
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // Fallback for older browsers (iOS Safari before 15.4) that lack crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function newBlock(type: PostBlock['type']): PostBlock {
  const id = generateId()
  switch (type) {
    case 'heading1':
    case 'heading2':
    case 'heading3':
    case 'text':
      return { id, type, text: '', align: 'left' }
    case 'quote':
      return { id, type: 'quote', text: '' }
    case 'code':
      return { id, type: 'code', text: '', language: 'javascript' }
    case 'callout':
      return { id, type: 'callout', text: '', color: 'amber' }
    case 'divider':
      return { id, type: 'divider' }
    case 'image':
      return { id, type: 'image', url: '', caption: '', alt: '', credit: '' }
    case 'list':
      return { id, type: 'list', ordered: false, items: [''] }
    case 'table':
      return { id, type: 'table', rows: [['', ''], ['', '']] }
    case 'video':
      return { id, type: 'video', url: '', caption: '' }
  }
}

export function newImageBlock(url: string): PostBlock {
  return { id: generateId(), type: 'image', url, caption: '', alt: '', credit: '' }
}

export function newReference(): ArticleReference {
  return { id: generateId(), title: '', url: '', author: '', date: '', notes: '' }
}

export function renderInlineFormatting(text: string): (string | { bold?: string; italic?: string })[] {
  const parts: (string | { bold?: string; italic?: string })[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    if (match[2] !== undefined) parts.push({ bold: match[2] })
    else if (match[3] !== undefined) parts.push({ italic: match[3] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}
