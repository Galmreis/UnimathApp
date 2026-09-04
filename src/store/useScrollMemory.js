import { useLayoutEffect, useRef } from 'react'

// Keeps each screen's scroll position and puts you back where you were.
//
// The bug this fixes (found in the field test, on mobile): "routing" here is a
// piece of state, not a real page load, so the browser has no history entry to
// restore. Going Início → sessão → Início re-rendered a brand new Home while the
// window stayed at whatever offset the last screen happened to leave behind —
// you either lost your place in the track or landed mid-page on a new screen.
//
// How it works. Two halves, and the order matters:
//
//   remember(nextKey)  called from the click handler, BEFORE the state changes.
//                      That's the only moment the outgoing screen is still on
//                      screen, so window.scrollY is still its real position.
//                      Reading it after React swapped the DOM would give us a
//                      value the browser had already clamped to the new, often
//                      shorter, content.
//   the layout effect  runs after React commits the new screen but before the
//                      browser paints, so we scroll to the remembered offset
//                      (or to the top for a screen we've never seen) without
//                      the user ever seeing the wrong position.
//
// Positions live in a ref, so they survive re-renders but not a reload — which
// is what you want: a fresh load should start at the top.
export function useScrollMemory(key) {
  const positions = useRef({}) // { [screen key]: scroll offset }
  const shown = useRef(key)    // the screen currently on screen

  function remember(nextKey) {
    const current = shown.current
    positions.current[current] = window.scrollY
    // Tapping the tab you're already on is a "take me to the top" gesture, so
    // don't keep the old offset around for it.
    if (nextKey === current) {
      positions.current[current] = 0
      window.scrollTo(0, 0)
    }
  }

  useLayoutEffect(() => {
    if (shown.current === key) return // same screen (or the very first render)
    shown.current = key
    window.scrollTo(0, positions.current[key] ?? 0)
  }, [key])

  return remember
}
