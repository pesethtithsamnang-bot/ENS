import { Link } from 'react-router-dom'

/**
 * Wide banner shape (4:1) - only used for the "homepage_banner" placement,
 * a full-width strip on its own, never mixed into a grid of cards.
 */
export function DefaultAdBanner() {
  return (
    <div className="relative flex aspect-[4/1] w-full items-center justify-between overflow-hidden rounded-[4px] bg-red px-[4.5%] shadow-md">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(circle at 88% -20%, rgba(255,255,255,0.14), transparent 55%)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 shine"
        style={{
          left: '-30%',
          width: '18%',
          background:
            'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.58) 50%, rgba(255,255,255,0.3) 55%, transparent 100%)',
          transform: 'skewX(-18deg)',
        }}
      />
      <div className="relative z-10 flex flex-col justify-center">
        <div className="font-black leading-[0.85] tracking-tight text-white" style={{ fontSize: 'clamp(1.4rem, 6.5vw, 3.2rem)' }}>
          ENS
        </div>
        <div className="mt-1 font-semibold text-white/90" style={{ fontSize: 'clamp(0.6rem, 1.6vw, 0.85rem)' }}>
          Education&nbsp;&middot;&nbsp;News&nbsp;&middot;&nbsp;Science
        </div>
      </div>
      <Link
        to="/write"
        className="relative z-10 flex-shrink-0 whitespace-nowrap rounded-full bg-white font-extrabold text-red-dark"
        style={{ fontSize: 'clamp(0.6rem, 1.4vw, 0.85rem)', padding: '0.7em 1.6em' }}
      >
        Explore ENS
      </Link>
      <style>{`
        @keyframes shine-sweep { 0% { left: -30%; } 22% { left: 120%; } 100% { left: 120%; } }
        .shine { animation: shine-sweep 4.5s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

/**
 * Horizontal row card — spans the full grid row, h-[90px], slim strip.
 * Used as fallback for homepage_grid placement when no real ad is configured.
 */
export function DefaultGridAd() {
  return (
    <Link
      to="/write"
      className="col-span-full flex h-[88px] w-full items-center gap-4 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white px-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Red square logo */}
      <div className="flex h-[62px] w-[62px] flex-shrink-0 items-center justify-center rounded-xl bg-red">
        <span className="font-black text-xl text-white">ENS</span>
      </div>
      {/* Text block */}
      <div className="flex-1 overflow-hidden">
        <div className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-grey">Sponsored</div>
        <h3 className="truncate text-[15px] font-semibold text-ink">Write your own article on ENS</h3>
        <p className="text-[12px] text-grey">Education · News · Science</p>
      </div>
      {/* CTA button */}
      <span className="flex-shrink-0 rounded-full bg-red px-5 py-2 text-sm font-bold text-white">
        Start writing
      </span>
    </Link>
  )
}

/**
 * Post-card shape - matches the real PostCard exactly (thumbnail + avatar
 * row + title), so a sponsored slot sitting inside a grid of articles
 * blends into that grid instead of looking like a squeezed banner.
 */
export function DefaultPostAd() {
  return (
    <Link to="/write" className="group block">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-red">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle at 88% -20%, rgba(255,255,255,0.14), transparent 55%)' }}
        />
        <div className="relative z-10 text-center">
          <div className="font-black leading-none tracking-tight text-white" style={{ fontSize: 'clamp(1.5rem, 8vw, 2.5rem)' }}>ENS</div>
          <div className="mt-1 text-[11px] font-semibold text-white/85">Education &middot; News &middot; Science</div>
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red font-serif text-sm font-bold text-white">E</div>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug text-ink">Write your own article on ENS</h3>
          <div className="mt-1 text-[13px] text-grey">Sponsored</div>
        </div>
      </div>
    </Link>
  )
}
