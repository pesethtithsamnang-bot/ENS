import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { TextLayer } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
import '../styles/pdf-text-layer.css'
import { useBook, useBookPages, useReadingProgress, useSaveReadingProgress } from '../features/books/hooks'
import { getSignedPdfUrl } from '../features/books/api'
import { useReaderAuth } from '../context/ReaderAuthContext'
import { RichText } from '../features/posts/components/RichText'
import type { PostBlock } from '../features/posts/blocks'
import { useLogVisit } from '../hooks/useLogVisit'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

function parseBlocks(raw: unknown): PostBlock[] {
  return Array.isArray(raw) ? (raw as PostBlock[]) : []
}

const SWIPE_THRESHOLD = 50

export function BookReaderPage() {
  const { id } = useParams()
  useLogVisit(`/library/${id}/read`)
  const { data: book } = useBook(id)
  const { data: pages } = useBookPages(id)
  const { session } = useReaderAuth()
  const readerId = session?.user.id ?? null
  const { data: savedPage } = useReadingProgress(id, readerId)
  const saveProgress = useSaveReadingProgress()

  const isPdf = !!book?.pdf_url
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [pdfPageCount, setPdfPageCount] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(true)
  const [pdfProgress, setPdfProgress] = useState(0)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)

  const [pageIndex, setPageIndex] = useState(0)
  const [pageInput, setPageInput] = useState('1')
  const [flipping, setFlipping] = useState<'next' | 'prev' | null>(null)
  const [mode, setMode] = useState<'light' | 'sepia' | 'dark'>('light')
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md')

  const touchStartX = useRef<number | null>(null)

  // ---------- get a short-lived signed URL, then load the PDF ----------
  useEffect(() => {
    if (!book?.pdf_url) return
    let cancelled = false
    setPdfLoading(true)
    setPdfError(null)
    setPdfProgress(0)

    getSignedPdfUrl(book.pdf_url)
      .then((signedUrl) => {
        if (cancelled) return
        const loadingTask = pdfjsLib.getDocument({ url: signedUrl })
        loadingTask.onProgress = (p: { loaded: number; total: number }) => {
          if (p.total) setPdfProgress(Math.round((p.loaded / p.total) * 100))
        }
        return loadingTask.promise.then((doc) => {
          if (cancelled) return
          setPdfDoc(doc)
          setPdfPageCount(doc.numPages)
          setPdfLoading(false)
        })
      })
      .catch((err) => {
        if (cancelled) return
        setPdfError(err instanceof Error ? err.message : 'Could not load this PDF.')
        setPdfLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [book?.pdf_url])

  // ---------- render the current PDF page, crisp on retina/mobile screens, plus a real selectable text layer ----------
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return
    let cancelled = false
    pdfDoc.getPage(pageIndex + 1).then(async (page) => {
      if (cancelled || !canvasRef.current) return
      const containerWidth = Math.min(window.innerWidth - 32, 700)
      const baseViewport = page.getViewport({ scale: 1 })
      const scale = containerWidth / baseViewport.width
      const viewport = page.getViewport({ scale })

      // Render at real device pixel density instead of 1 canvas px = 1 CSS
      // px - this is what was causing the blur, especially on phones.
      const outputScale = window.devicePixelRatio || 1
      const canvas = canvasRef.current
      canvas.width = Math.floor(viewport.width * outputScale)
      canvas.height = Math.floor(viewport.height * outputScale)
      canvas.style.width = `${Math.floor(viewport.width)}px`
      canvas.style.height = `${Math.floor(viewport.height)}px`
      const context = canvas.getContext('2d')
      if (!context) return
      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined
      await page.render({ canvasContext: context, viewport, transform, canvas }).promise

      // Real text on top, positioned exactly over the rendered page, so
      // it can be selected and copied like normal text.
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = ''
        textLayerRef.current.style.width = `${Math.floor(viewport.width)}px`
        textLayerRef.current.style.height = `${Math.floor(viewport.height)}px`
        const textContent = await page.getTextContent()
        const textLayer = new TextLayer({ textContentSource: textContent, container: textLayerRef.current, viewport })
        await textLayer.render()
      }
    })
    return () => {
      cancelled = true
    }
  }, [pdfDoc, pageIndex])

  const totalPages = isPdf ? pdfPageCount : pages?.length ?? 0

  useEffect(() => {
    if (savedPage && totalPages && savedPage <= totalPages) setPageIndex(savedPage - 1)
  }, [savedPage, totalPages])

  useEffect(() => {
    setPageInput(String(pageIndex + 1))
  }, [pageIndex])

  useEffect(() => {
    if (!readerId || !id || !totalPages) return
    saveProgress.mutate({ bookId: id, readerId, currentPage: pageIndex + 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex])

  if (!book) return <div className="p-16 text-center text-sm text-grey">Loading...</div>
  if (isPdf && pdfError) {
    return (
      <div className="flex h-screen-safe flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-semibold text-red-dark">Could not load this PDF.</p>
        <p className="max-w-sm text-xs text-grey">{pdfError}</p>
        <Link to={`/library/${id}`} className="text-sm font-bold text-red-dark">Back to book details</Link>
      </div>
    )
  }
  if (isPdf && pdfLoading) {
    return (
      <div className="flex h-screen-safe flex-col items-center justify-center gap-4 px-6">
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface">
          <div className="h-full bg-red transition-all duration-300" style={{ width: `${pdfProgress || 15}%` }} />
        </div>
        <span className="text-xs text-grey">
          {pdfProgress > 0 ? `Loading PDF... ${pdfProgress}%` : 'Loading PDF...'}
        </span>
      </div>
    )
  }
  if (!isPdf && !pages) return <div className="p-16 text-center text-sm text-grey">Loading...</div>
  if (totalPages === 0) return <div className="p-16 text-center text-sm text-grey">This book has no pages yet.</div>

  const isFirst = pageIndex === 0
  const isLast = pageIndex === totalPages - 1
  const blocks = !isPdf && pages ? parseBlocks(pages[pageIndex]?.content_blocks) : []

  function goNext() {
    if (pageIndex >= totalPages - 1) return
    setFlipping('next')
    setTimeout(() => {
      setPageIndex((i) => i + 1)
      setFlipping(null)
    }, 160)
  }
  function goPrev() {
    if (pageIndex <= 0) return
    setFlipping('prev')
    setTimeout(() => {
      setPageIndex((i) => i - 1)
      setFlipping(null)
    }, 160)
  }
  function jumpToPage(e: React.FormEvent) {
    e.preventDefault()
    const target = Math.min(Math.max(1, Number(pageInput) || 1), totalPages)
    setPageIndex(target - 1)
  }
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > SWIPE_THRESHOLD) goPrev()
    else if (delta < -SWIPE_THRESHOLD) goNext()
    touchStartX.current = null
  }

  const bgClass = mode === 'dark' ? 'bg-ink text-white' : mode === 'sepia' ? 'bg-[#F4ECD8] text-[#3B2F1E]' : 'bg-white text-ink'
  const textSizeClass = fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'

  return (
    <div className={`flex h-screen-safe flex-col ${bgClass}`} onContextMenu={(e) => e.preventDefault()}>
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-current/10 px-4 py-3">
        <Link
          to={`/library/${id}`}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-current/20 hover:bg-current/5"
          aria-label="Back to book details"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{book.title}</h1>
        {!isPdf && (
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-current/20 text-sm font-bold hover:bg-current/5"
            aria-label="Reading settings"
          >
            Aa
          </button>
        )}
      </div>

      {showSettings && !isPdf && (
        <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-4 border-b-2 border-ink/10 px-4 py-3">
          <div className="flex items-center gap-2">
            {(['light', 'sepia', 'dark'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`h-8 w-8 rounded-full border-2 border-ink ${mode === m ? 'ring-2 ring-red ring-offset-2' : ''}`}
                style={{ background: m === 'light' ? '#fff' : m === 'sepia' ? '#F4ECD8' : '#121214' }}
                aria-label={`${m} mode`}
              />
            ))}
          </div>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as typeof fontSize)}
            className="rounded-md border-2 border-current bg-transparent px-3 py-1.5 text-sm"
          >
            <option value="sm">Small text</option>
            <option value="md">Medium text</option>
            <option value="lg">Large text</option>
          </select>
        </div>
      )}

      <div
        className="flex flex-1 justify-center overflow-y-auto px-4 py-6 sm:px-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`mx-auto w-full max-w-2xl transition-all duration-150 ${
            flipping === 'next' ? '-translate-x-4 opacity-0' : flipping === 'prev' ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
          }`}
        >
          {isPdf ? (
            <div className="relative mx-auto w-fit select-text rounded-md border-2 border-ink/20 shadow-[3px_3px_0_rgba(0,0,0,0.1)]">
              <canvas ref={canvasRef} className="block" />
              <div ref={textLayerRef} className="textLayer absolute left-0 top-0" />
            </div>
          ) : (
            <div className={`flex flex-col gap-4 leading-relaxed ${textSizeClass}`}>
              {blocks.map((block) => {
                if (block.type === 'heading1' && block.text.trim())
                  return <h1 key={block.id} className="font-serif text-2xl font-bold"><RichText text={block.text} /></h1>
                if (block.type === 'heading2' && block.text.trim())
                  return <h2 key={block.id} className="font-serif text-xl font-bold"><RichText text={block.text} /></h2>
                if (block.type === 'quote' && block.text.trim())
                  return <blockquote key={block.id} className="whitespace-pre-line border-l-4 border-current pl-4 italic opacity-80"><RichText text={block.text} /></blockquote>
                if (block.type === 'text' && block.text.trim())
                  return <p key={block.id} className="whitespace-pre-line"><RichText text={block.text} /></p>
                if (block.type === 'image' && block.url)
                  return <img key={block.id} src={block.url} alt={block.caption} className="w-full rounded-md border-2 border-ink/20" />
                return null
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col gap-2 border-t-2 border-ink/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-current text-lg font-bold disabled:opacity-20"
            aria-label="Previous page"
          >
            &#8249;
          </button>

          <div className="flex-1">
            <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-current/10">
              <div className="h-full bg-red transition-all" style={{ width: `${((pageIndex + 1) / totalPages) * 100}%` }} />
            </div>
            <span className="block text-center font-mono text-xs opacity-70">
              Page {pageIndex + 1} of {totalPages}
            </span>
          </div>

          <button
            onClick={goNext}
            disabled={isLast}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-current text-lg font-bold disabled:opacity-20"
            aria-label="Next page"
          >
            &#8250;
          </button>
        </div>

        <form onSubmit={jumpToPage} className="flex items-center justify-center gap-2">
          <span className="font-mono text-xs opacity-70">Jump to page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            className="w-16 rounded-md border-2 border-current bg-transparent px-2 py-1 text-center text-sm outline-none"
          />
          <button type="submit" className="rounded-md border-2 border-current px-3 py-1 text-xs font-bold">
            Go
          </button>
        </form>
      </div>
    </div>
  )
}
