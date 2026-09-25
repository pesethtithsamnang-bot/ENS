import { Link } from 'react-router-dom'
import { StateIllustration } from '../components/ui/StateIllustration'

export function NotFoundPage() {
  return (
    <StateIllustration
      kind="empty"
      title="Page not found"
      message="That page doesn't exist, or may have been moved."
      action={
        <Link
          to="/"
          className="shadow-press inline-flex items-center gap-2 rounded-full border-2 border-ink bg-red px-5 py-2 text-sm font-bold text-white shadow-sm"
        >
          Back to home
        </Link>
      }
    />
  )
}
