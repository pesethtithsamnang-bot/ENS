import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function TopLoadingBar() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setVisible(true)
    setProgress(20)

    timers.current.push(setTimeout(() => setProgress(60), 100))
    timers.current.push(setTimeout(() => setProgress(85), 300))
    timers.current.push(
      setTimeout(() => {
        setProgress(100)
        timers.current.push(setTimeout(() => setVisible(false), 200))
      }, 500)
    )

    return () => timers.current.forEach(clearTimeout)
  }, [location.pathname])

  if (!visible) return null

  return (
    <div className="fixed left-0 top-0 z-[200] h-[3px] w-full bg-transparent">
      <div
        className="h-full bg-red transition-all duration-200 ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  )
}
