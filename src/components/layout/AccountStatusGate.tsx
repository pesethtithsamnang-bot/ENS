import type { ReactNode } from 'react'
import { useReaderAuth } from '../../context/ReaderAuthContext'
import { signOut } from '../../features/auth/api'
import { StateIllustration } from '../ui/StateIllustration'

export function AccountStatusGate({ children }: { children: ReactNode }) {
  const { isBanned, suspendedUntil, banReason, suspendReason } = useReaderAuth()
  const suspended = suspendedUntil ? new Date(suspendedUntil) > new Date() : false

  if (isBanned) {
    return (
      <StateIllustration
        kind="error"
        title="This account has been banned"
        message={banReason || 'Contact support if you believe this is a mistake.'}
        action={
          <button
            onClick={() => signOut()}
            className="shadow-press rounded-full border-2 border-ink bg-red px-5 py-2 text-sm font-bold text-white shadow-sm"
          >
            Sign out
          </button>
        }
      />
    )
  }

  if (suspended) {
    return (
      <StateIllustration
        kind="error"
        title="This account is temporarily suspended"
        message={
          (suspendReason ? `${suspendReason} ` : '') +
          `Access returns automatically on ${new Date(suspendedUntil!).toLocaleString()}.`
        }
        action={
          <button
            onClick={() => signOut()}
            className="shadow-press rounded-full border-2 border-ink bg-red px-5 py-2 text-sm font-bold text-white shadow-sm"
          >
            Sign out
          </button>
        }
      />
    )
  }

  return <>{children}</>
}
