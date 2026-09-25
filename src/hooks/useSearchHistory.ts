import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ens_recent_searches'
const MAX_ITEMS = 8

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      if (Array.isArray(stored)) setHistory(stored)
    } catch {
      // ignore malformed storage
    }
  }, [])

  function addSearch(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function removeSearch(query: string) {
    setHistory((prev) => {
      const next = prev.filter((q) => q !== query)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return { history, addSearch, removeSearch }
}
