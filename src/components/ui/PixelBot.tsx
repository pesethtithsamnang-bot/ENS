import { useEffect, useState } from 'react'

// 9x9 pixel grid. 0=empty 1=ink(outline) 2=red(body) 3=white(eye) 4=ink(pupil) 5=amber(antenna glow)
const FRAME_OPEN = [
  [0, 0, 0, 0, 5, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 2, 2, 2, 2, 2, 1, 0],
  [1, 2, 3, 4, 2, 3, 4, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 1],
  [0, 1, 2, 2, 2, 2, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
]

const FRAME_BLINK = FRAME_OPEN.map((row, y) => (y === 4 ? row.map((cell) => (cell === 3 || cell === 4 ? 2 : cell)) : row))

const COLORS: Record<number, string> = {
  1: '#121214',
  2: '#E1152B',
  3: '#FFFFFF',
  4: '#121214',
  5: '#E8A63A',
}

export function PixelBot({ thinking = false, size = 6 }: { thinking?: boolean; size?: number }) {
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 140)
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  const frame = blinking ? FRAME_BLINK : FRAME_OPEN

  return (
    <div
      className={thinking ? 'pixelbot-bob-fast' : 'pixelbot-bob'}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(9, ${size}px)`,
        gridTemplateRows: `repeat(9, ${size}px)`,
        width: size * 9,
        height: size * 9,
      }}
    >
      {frame.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={cell === 5 && thinking ? 'pixelbot-glow' : undefined}
            style={{ background: cell === 0 ? 'transparent' : COLORS[cell] }}
          />
        ))
      )}
      <style>{`
        @keyframes pixelbot-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes pixelbot-bob-fast { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes pixelbot-glow { 0%,100% { background: #E8A63A; } 50% { background: #E1152B; } }
        .pixelbot-bob { animation: pixelbot-bob 1.4s ease-in-out infinite; }
        .pixelbot-bob-fast { animation: pixelbot-bob-fast 0.7s ease-in-out infinite; }
        .pixelbot-glow { animation: pixelbot-glow 0.6s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
