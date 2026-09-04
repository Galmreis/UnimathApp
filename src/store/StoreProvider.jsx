import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { TOPICS, getTopic } from '../data/topics.js'
import { makeT, localizeTopic } from '../lib/i18n.js'
import {
  emptyProgress, recordAnswer, advanceIfReady, applyExamResult, topicStatus,
} from '../lib/mastery.js'
import { applyMatchResult, matchOutcome, clampStep } from '../lib/ranks.js'

// This file is the app's single source of truth. It holds every piece of state
// that must persist and exposes a small set of actions to change it. Screens
// read it with the useStore() hook below, so we never have to pass this data
// down through many layers of props.
//
// The slices, each under its own localStorage key:
//   settings   preferences (language, session size, theme, tour seen)
//   progress   per-topic level + rolling window (the learning track)
//   sessions   practice history        exams    "prova da sexta" history
//   papers     ENEM/UFRGS round history (deliberately outside the track)
//   rank       the rank ladder step + match history (lib/ranks.js)
//   pending    the one paused practice session, or null

const StoreContext = createContext(null)

const DEFAULT_SETTINGS = {
  lang: 'pt',             // 'pt' | 'en' — language of the whole UI and questions
  sessionMode: 'count', // 'count' = fixed number of questions, 'time' = minutes
  sessionCount: 20,
  sessionMinutes: 30,
  theme: 'midnight',      // colour palette — see index.css [data-theme]
  animations: true,       // page transitions/motion — off sets data-motion='off'
  highContrast: false,
  showExplanations: true, // show the step-by-step solution in the feedback
  showTips: true,         // show the strategy / mental-math "Dica" in the feedback
  onboarded: false,       // has the first-run tour been seen? (see screens/Onboarding)
}

// The rank slice starts everyone at step 0 — "Iniciante I" (see lib/ranks.js).
const DEFAULT_RANK = { step: 0, matches: [] }

// Today's date as "YYYY-MM-DD" (local time), our key for "days studied".
function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function StoreProvider({ children }) {
  // Each slice is its own persisted value under its own localStorage key.
  const [storedSettings, setSettings] = useLocalStorage('unimath.settings', DEFAULT_SETTINGS)
  const [progress, setProgress] = useLocalStorage('unimath.progress', {}) // { [topicId]: progressObj }
  const [sessions, setSessions] = useLocalStorage('unimath.sessions', []) // newest first
  const [exams, setExams] = useLocalStorage('unimath.exams', [])          // newest first
  const [papers, setPapers] = useLocalStorage('unimath.papers', [])       // ENEM/UFRGS rounds
  const [storedRank, setRank] = useLocalStorage('unimath.rank', DEFAULT_RANK)
  // Normalised field by field rather than spread over the defaults: this comes
  // from localStorage, which anyone can edit, and a null `matches` or a step off
  // the end of the ladder would otherwise reach the screens as-is.
  const rank = {
    step: clampStep(storedRank?.step),
    matches: Array.isArray(storedRank?.matches) ? storedRank.matches : [],
  }
  // The one paused practice session, or null. Written on every answer so closing
  // the tab mid-session doesn't lose it (see screens/Session.jsx).
  const [pending, setPending] = useLocalStorage('unimath.pending', null)

  // Merge over the defaults so any setting added in a later version still has a
  // value for users who already have an older settings object saved.
  //
  // `onboarded` is the one that can't just default: the tour is meant for a
  // first entry, but it shipped after people were already using the app, and
  // their saved settings say nothing about it. So when the flag is absent we
  // read it off the data — anyone with progress, sessions or exams behind them
  // is a returning user and gets the app, not a "Bem-vindo". They can still
  // replay the tour from Mais or Ajustes.
  const hasHistory = Object.keys(progress).length > 0 || sessions.length > 0 || exams.length > 0
  const settings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    onboarded: storedSettings?.onboarded ?? hasHistory,
  }

  // Apply the theme and high-contrast preference to the root element so CSS can react.
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])
  useEffect(() => {
    document.documentElement.dataset.motion = settings.animations ? 'on' : 'off'
  }, [settings.animations])
  useEffect(() => {
    document.documentElement.dataset.contrast = settings.highContrast ? 'high' : 'normal'
  }, [settings.highContrast])

  // Keep <html lang> in sync so screen readers and the browser know the language.
  useEffect(() => {
    document.documentElement.lang = settings.lang === 'en' ? 'en' : 'pt-BR'
  }, [settings.lang])

  // The active language, a translator bound to it, and the topic list with its
  // display strings already localized — everything the screens read for text.
  const lang = settings.lang
  const t = useMemo(() => makeT(lang), [lang])
  const topics = useMemo(() => TOPICS.map((topic) => localizeTopic(topic, lang)), [lang])
  const getLocalTopic = (id) => localizeTopic(getTopic(id), lang)

  // --- actions (the only ways state changes) ---

  function updateSettings(patch) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  // Commit a finished practice session: fold each answer into the topic's
  // progress, auto-advance the level if it was "fixed", and log the summary.
  function commitSession({ topicId, results, durationMs, level }) {
    setProgress((prev) => {
      let prog = prev[topicId] ?? emptyProgress()
      // Reviewing a level below the one you've reached: log the answers but don't
      // let them move the level up (or down).
      const reviewing = level != null && level < prog.levelIndex
      for (const isCorrect of results) prog = recordAnswer(prog, isCorrect, reviewing)
      if (!reviewing) prog = advanceIfReady(prog, getTopic(topicId))
      return { ...prev, [topicId]: prog }
    })
    const correct = results.filter(Boolean).length
    setSessions((prev) => [
      { date: todayISO(), topicId, total: results.length, correct, durationMs },
      ...prev,
    ].slice(0, 100)) // keep history bounded
    setPending(null) // a finished session is no longer a paused one
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

  // --- paused session ("estudo espaçado") ---
  // Session.jsx calls this after every answer, so the paused state survives even
  // a closed tab. There is only ever one: a new pause replaces the old one.
  function savePending(snapshot) {
    setPending(snapshot ? { ...snapshot, savedAt: Date.now() } : null)
  }
  function clearPending() {
    setPending(null)
  }

  // Commit a round of the ENEM/UFRGS mode. On purpose this touches NEITHER
  // progress nor levels — the papers mode is exam practice beside the track,
  // not part of it (see help_papers_p2 in i18n).
  function commitPaperRound({ source, topicId, correct, total, durationMs }) {
    setPapers((prev) => [
      { date: todayISO(), source: source ?? 'all', topicId: topicId ?? 'all', correct, total, durationMs },
      ...prev,
    ].slice(0, 100))
  }

  // Commit a rank match: move the step by the up/stay/down rule and log it.
  // Screens that need to *show* the outcome compute it with the same pure
  // functions (matchOutcome/applyMatchResult), so display and state agree.
  function commitMatch({ correct, total }) {
    setRank((prev) => {
      const step = clampStep(prev?.step)
      const nextStep = applyMatchResult(step, correct, total)
      const entry = {
        date: todayISO(),
        from: step,
        to: nextStep,
        correct,
        total,
        outcome: matchOutcome(step, correct, total),
      }
      return {
        step: nextStep,
        matches: [entry, ...(prev?.matches ?? [])].slice(0, 50),
      }
    })
  }

  // Wipe all progress but keep the user's settings (see 4.7). "All progress"
  // means the track, both histories, the papers log, the rank and any paused
  // session — everything the Progresso screens can show.
  function resetProgress() {
    setProgress({})
    setSessions([])
    setExams([])
    setPapers([])
    setRank(DEFAULT_RANK)
    setPending(null)
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
    lang, t, topics, getTopic: getLocalTopic,
    progress, sessions, exams, papers, rank, pending,
    commitSession, commitExam, commitPaperRound, commitMatch,
    savePending, clearPending, resetProgress,
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
