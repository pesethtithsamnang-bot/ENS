import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBook, useBookPages, useReadingProgress } from '../features/books/hooks'
import { useReaderAuth } from '../context/ReaderAuthContext'
import { Button, Tag } from '../components/ui'
import { useLogVisit } from '../hooks/useLogVisit'

export function BookDetailPage() {
  const { id } = useParams()
  useLogVisit(`/library/${id}`)
  const navigate = useNavigate()
  const { data: book, isLoading } = useBook(id)
  const { data: pages } = useBookPages(id)
  const { session } = useReaderAuth()
  const { data: currentPage } = useReadingProgress(id, session?.user.id ?? null)

  if (isLoading) return <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-grey">Loading...</div>
  if (!book) return <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-grey">Book not found.</div>

  const hasStarted = currentPage && currentPage > 1

  function handleStartReading() {
    if (!session) {
      navigate('/signup')
      return
    }
    navigate(`/library/${book!.id}/read`)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[240px_1fr]">
        <div className="aspect-[2/3] overflow-hidden rounded-xl bg-surface shadow-sm">
          {book.cover_image_url && <img src={book.cover_image_url} alt="" className="h-full w-full object-cover" />}
        </div>
        <div>
          {book.genre && <Tag color="amber">{book.genre}</Tag>}
          <h1 className="mb-1 mt-2 font-serif text-3xl font-bold">{book.title}</h1>
          <p className="mb-4 text-sm text-grey">by {book.author_name}</p>
          <p className="mb-6 text-[15px] leading-relaxed text-[#232327]">{book.description}</p>
          <p className="mb-4 text-xs text-grey">{pages?.length ?? 0} pages</p>
          {!session && (
            <p className="mb-3 text-xs text-grey">
              Reading requires a free account. <Link to="/signup" className="font-bold text-red-dark">Sign up</Link> to start.
            </p>
          )}
          <Button onClick={handleStartReading}>{hasStarted ? `Continue from page ${currentPage}` : 'Start reading'}</Button>
        </div>
      </div>
    </div>
  )
}
