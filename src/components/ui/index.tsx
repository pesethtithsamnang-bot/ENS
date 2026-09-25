import type { ButtonHTMLAttributes } from 'react'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'white' | 'black' }) {
  const base =
    'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-5 text-[15px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-[filter,transform] duration-150 hover:brightness-105 active:translate-y-px'
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-b from-red to-red-dark text-white'
      : variant === 'black'
        ? 'bg-gradient-to-b from-[#2b2b2f] to-[#171719] text-white'
        : variant === 'white'
          ? 'border border-[#d8dbe2] bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
          : 'border border-[#d8dbe2] bg-paper text-ink'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function PostCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-1.5 h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}
export function Tag({ children, color = 'ink' }: { children: React.ReactNode; color?: 'ink' | 'amber' }) {
  const styles = color === 'amber' ? 'bg-amber text-[#241a05]' : 'bg-ink text-white'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${styles}`}>
      {children}
    </span>
  )
}
