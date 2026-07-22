import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { TOPICS, getTopic } from '../data/topics.js'
import {
  emptyProgress, recordAnswer, advanceIfReady, applyExamResult, topicStatus,
} from '../lib/mastery.js'

// This file is the app's single source of truth. It holds every piece of state
// that must persist (settings, progress, session/exam history) and exposes a
// small set of actions to change it. Screens read it with the useStore() hook
// below, so we never have to pass this data down through many layers of props.

const StoreContext = createContext(null)

const DEFAULT_SETTINGS = {
  sessionMode: 'count', // 'count' = fixed number of questions, 'time' = minutes
  sessionCount: 20,
  sessionMinutes: 30,
  highContrast: false,
  showExplanations: true, // show the step-by-step solution in the feedback
  showTips: true,         // show the strategy / mental-math "Dica" in the feedback
}

// Today's date as "YYYY-MM-DD" (local time), our key for "days studied".
function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function StoreProvider({ children }) {
  // Each slice is its own persisted value under its own localStorage key.
  const [storedSettings, setSettings] = useLocalStorage('unimath.settings', DEFAULT_SETTINGS)
  // Merge over the defaults so any setting added in a later version still has a
  // value for users who already have an older settings object saved.
  const settings = { ...DEFAULT_SETTINGS, ...storedSettings }
  const [progress, setProgress] = useLocalStorage('unimath.progress', {}) // { [topicId]: progressObj }
  const [sessions, setSessions] = useLocalStorage('unimath.sessions', []) // newest first
  const [exams, setExams] = useLocalStorage('unimath.exams', [])          // newest first

  // Apply the high-contrast preference to the root element so CSS can react to it.
  useEffect(() => {
    document.documentElement.dataset.contrast = settings.highContrast ? 'high' : 'normal'
  }, [settings.highContrast])

  // --- actions (the only ways state changes) ---

  function updateSettings(patch) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  // Commit a finished practice session: fold each answer into the topic's
  // progress, auto-advance the level if it was "fixed", and log the summary.
  function commitSession({ topicId, results, durationMs }) {
    setProgress((prev) => {
      let prog = prev[topicId] ?? emptyProgress()
      for (const isCorrect of results) prog = recordAnswer(prog, isCorrect)
      prog = advanceIfReady(prog, getTopic(topicId))
      return { ...prev, [topicId]: prog }
    })
    const correct = results.filter(Boolean).length
    setSessions((prev) => [
      { date: todayISO(), topicId, total: results.length, correct, durationMs },
      ...prev,
    ].slice(0, 100)) // keep history bounded
  }

  // Commit a "prova da sexta": apply the up/stay/down rule and log the result.
  function commitExam({ topicId, correct, total, levelIndex }) {
    setProgress((prev) => {
      const prog = prev[topicId] ?? emptyProgress()
      return { ...prev, [topicId]: applyExamResult(prog, getTopic(topicId), correct, total) }
    })
    setExams((prev) => [
      { date: todayISO(), topicId, correct, total, levelIndex },
      ...prev,
    ].slice(0, 100))
  }

  // Wipe all progress but keep the user's settings (see 4.7).
  function resetProgress() {
    setProgress({})
    setSessions([])
    setExams([])
  }

  // The topic the "Treinar agora" button should train: the first one that is
  // unlocked but not yet mastered. If everything is mastered, keep the last one.
  const currentTopicId = useMemo(() => {
    for (const topic of TOPICS) {
      const status = topicStatus(topic, progress)
      if (status === 'available' || status === 'in_progress') return topic.id
    }
    return TOPICS[TOPICS.length - 1].id
  }, [progress])

  const value = {
    settings, updateSettings,
    progress, sessions, exams,
    commitSession, commitExam, resetProgress,
    currentTopicId,
    todayISO,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// The hook screens use to read/act on the store.
export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore() precisa estar dentro de <StoreProvider>')
  return store
}
