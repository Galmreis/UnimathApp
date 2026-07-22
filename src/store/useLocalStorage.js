import { useState, useEffect } from 'react'

// A drop-in replacement for useState that also saves the value to the browser's
// localStorage, so it survives reloads. In the MVP this is our entire "database"
// — no server needed, and the app works offline once loaded.
//
// Usage:  const [count, setCount] = useLocalStorage('count', 0)
export function useLocalStorage(key, initialValue) {
  // The initialiser runs only on the first render. We read from storage there so
  // we start with whatever was saved last time (or the default if nothing was).
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue // storage disabled or corrupt JSON -> use the default
    }
  })

  // Whenever the value (or key) changes, write it back to storage.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or blocked (e.g. private mode). The app keeps working from
      // memory for this session; we just can't persist. Nothing to do.
    }
  }, [key, value])

  return [value, setValue]
}
