export function LoadingBot({ label = 'Loading...' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-current/20 border-t-current" />
      <span>{label}</span>
    </span>
  )
}

export function LoadingBotBlock({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-surface border-t-red" />
      <span className="text-sm text-grey">{label}</span>
    </div>
  )
}
