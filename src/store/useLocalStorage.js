import { useState, useEffect } from 'react'

// useState que também grava no localStorage. É o "banco de dados" inteiro do app.
export function useLocalStorage(key, initialValue) {
  // Initializer só roda no primeiro render, então o read fica aqui.
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue // storage disabled or corrupt JSON -> use the default
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Cheio ou bloqueado (aba anônima). Segue funcionando em memória.
    }
  }, [key, value])

  return [value, setValue]
}
