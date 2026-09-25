import owlError from '../../assets/mascot/owl-error.png'
import owlOffline from '../../assets/mascot/owl-offline.png'
import owlEmpty from '../../assets/mascot/owl-empty.png'

type StateKind = 'error' | 'offline' | 'empty'

const IMAGES: Record<StateKind, string> = {
  error: owlError,
  offline: owlOffline,
  empty: owlEmpty,
}

const DEFAULTS: Record<StateKind, { title: string; message: string }> = {
  error: { title: 'Something went wrong', message: 'That page hit a snag. Try again in a moment.' },
  offline: { title: "You're offline", message: 'Check your internet connection and try again.' },
  empty: { title: 'Nothing here yet', message: "We couldn't find anything for that." },
}

export function StateIllustration({
  kind,
  title,
  message,
  action,
  compact = false,
}: {
  kind: StateKind
  title?: string
  message?: string
  action?: React.ReactNode
  compact?: boolean
}) {
  const d = DEFAULTS[kind]
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10' : 'py-20'}`}>
      <img src={IMAGES[kind]} alt="" className={compact ? 'h-32 w-32 object-contain' : 'h-56 w-56 object-contain'} />
      <h2 className="mt-2 font-serif text-lg font-bold text-ink">{title ?? d.title}</h2>
      <p className="mt-1 max-w-[40ch] text-sm text-grey">{message ?? d.message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
