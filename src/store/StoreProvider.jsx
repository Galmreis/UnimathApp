import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { TOPICS, getTopic } from '../data/topics.js'
import { makeT, localizeTopic } from '../lib/i18n.js'
import {
  emptyProgress, recordAnswer, advanceIfReady, applyExamResult, topicStatus,
} from '../lib/mastery.js'
import { applyMatchResult, matchOutcome, clampStep } from '../lib/ranks.js'

const StoreContext = createContext(null)

const DEFAULT_SETTINGS = {
  lang: 'pt',
  sessionMode: 'count', // 'count' = nº de questões, 'time' = minutos
  sessionCount: 20,
  sessionMinutes: 30,
  theme: 'midnight',
  animations: true,
  highContrast: false,
  showExplanations: true,
  showTips: true,
  onboarded: false,
}

const DEFAULT_RANK = { step: 0, matches: [] }

function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function StoreProvider({ children }) {
  const [storedSettings, setSettings] = useLocalStorage('unimath.settings', DEFAULT_SETTINGS)
  const [progress, setProgress] = useLocalStorage('unimath.progress', {})
  const [sessions, setSessions] = useLocalStorage('unimath.sessions', [])
  const [exams, setExams] = useLocalStorage('unimath.exams', [])
  const [papers, setPapers] = useLocalStorage('unimath.papers', [])
  const [storedRank, setRank] = useLocalStorage('unimath.rank', DEFAULT_RANK)
  const [pending, setPending] = useLocalStorage('unimath.pending', null)

  // Campo a campo, não spread: isso vem do localStorage, que qualquer um edita.
  // matches null ou step fora da escada chegariam inteiros na tela.
  const rank = {
    step: clampStep(storedRank?.step),
    matches: Array.isArray(storedRank?.matches) ? storedRank.matches : [],
  }

  // onboarded não pode simplesmente cair no default: o tour entrou depois que já
  // tinha gente usando, e o settings salvo dessa gente não diz nada sobre ele.
  // Quem já tem histórico é usuário antigo e não leva "Bem-vindo" na cara.
  const hasHistory = Object.keys(progress).length > 0 || sessions.length > 0 || exams.length > 0
  const settings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    onboarded: storedSettings?.onboarded ?? hasHistory,
  }

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])
  useEffect(() => {
    document.documentElement.dataset.motion = settings.animations ? 'on' : 'off'
  }, [settings.animations])
  useEffect(() => {
    document.documentElement.dataset.contrast = settings.highContrast ? 'high' : 'normal'
  }, [settings.highContrast])
  useEffect(() => {
    document.documentElement.lang = settings.lang === 'en' ? 'en' : 'pt-BR'
  }, [settings.lang])

  const lang = settings.lang
  const t = useMemo(() => makeT(lang), [lang])
  const topics = useMemo(() => TOPICS.map((topic) => localizeTopic(topic, lang)), [lang])
  const getLocalTopic = (id) => localizeTopic(getTopic(id), lang)

  // --- ações: único jeito do estado mudar ---

  function updateSettings(patch) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  function commitSession({ topicId, results, durationMs, level }) {
    setProgress((prev) => {
      let prog = prev[topicId] ?? emptyProgress()
      // Revisando nível abaixo do atual: registra as respostas mas não deixa
      // mexer no nível, pra cima nem pra baixo.
      const reviewing = level != null && level < prog.levelIndex
      for (const isCorrect of results) prog = recordAnswer(prog, isCorrect, reviewing)
      if (!reviewing) prog = advanceIfReady(prog, getTopic(topicId))
      return { ...prev, [topicId]: prog }
    })
    const correct = results.filter(Boolean).length
    setSessions((prev) => [
      { date: todayISO(), topicId, total: results.length, correct, durationMs },
      ...prev,
    ].slice(0, 100))
    setPending(null)
  }

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

  // Session.jsx chama isso a cada resposta, então fechar a aba no meio não perde
  // a sessão. Só existe uma pausada por vez.
  function savePending(snapshot) {
    setPending(snapshot ? { ...snapshot, savedAt: Date.now() } : null)
  }
  function clearPending() {
    setPending(null)
  }

  // De propósito não encosta em progress nem em levels. O modo de provas é
  // treino de vestibular ao lado da trilha, não parte dela.
  function commitPaperRound({ source, topicId, correct, total, durationMs }) {
    setPapers((prev) => [
      { date: todayISO(), source: source ?? 'all', topicId: topicId ?? 'all', correct, total, durationMs },
      ...prev,
    ].slice(0, 100))
  }

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

  // Apaga progresso mas preserva settings. "Progresso" aqui é tudo que a tela de
  // Progresso mostra: trilha, os dois históricos, provas, rank e sessão pausada.
  function resetProgress() {
    setProgress({})
    setSessions([])
    setExams([])
    setPapers([])
    setRank(DEFAULT_RANK)
    setPending(null)
  }

  // O que o "Treinar agora" treina: primeiro tópico destravado e não dominado.
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

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore() precisa estar dentro de <StoreProvider>')
  return store
}
