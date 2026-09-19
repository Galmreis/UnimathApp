import { useLayoutEffect, useRef } from 'react'

// Trocar de tela aqui é mudança de estado, não page load, então o browser não
// restaura scroll nenhum sozinho.
export function useScrollMemory(key) {
  const positions = useRef({})
  const shown = useRef(key)

  // Chamar no onClick, antes do estado mudar. Se ler window.scrollY depois que
  // o React trocou o DOM, o valor já veio clampado pra altura da tela nova.
  function remember(nextKey) {
    const current = shown.current
    positions.current[current] = window.scrollY
    if (nextKey === current) {
      positions.current[current] = 0
      window.scrollTo(0, 0)
    }
  }

  // useLayoutEffect e não useEffect: com useEffect dá pra ver a tela nova na
  // posição errada por um frame.
  useLayoutEffect(() => {
    if (shown.current === key) return
    shown.current = key
    window.scrollTo(0, positions.current[key] ?? 0)
  }, [key])

  return remember
}
