// A trilha gera questão; aqui só seleciona do banco em data/exams.js. Tudo é
// filtro, embaralho e tradução.

import { EXAM_QUESTIONS, EXAM_SOURCES } from '../data/exams.js'
import { randInt } from './math.js'

// O bloco de matemática do ENEM vem mais ou menos nesse tamanho.
export const PAPER_SET_SIZE = 10
export const PAPER_SET_OPTIONS = [5, 10, 15, 20]

const LETTERS = ['a', 'b', 'c', 'd', 'e']
export function letterFor(index) {
  return LETTERS[index] ?? String(index + 1)
}

// Só statement/alternatives/solution mudam. id, correct e afins não se mexem.
export function localizePaper(question, lang) {
  if (!question || lang !== 'en' || !question.en) return question
  return { ...question, ...question.en }
}

// Ordem declarada em EXAM_SOURCES manda, senão os chips de filtro dançam.
export function availableSources(questions = EXAM_QUESTIONS) {
  const present = new Set(questions.map((q) => q.source))
  return EXAM_SOURCES.filter((source) => present.has(source))
}

export function availableTopicIds(questions = EXAM_QUESTIONS) {
  const seen = []
  for (const q of questions) if (q.topicId && !seen.includes(q.topicId)) seen.push(q.topicId)
  return seen
}

// source / topicId null ou 'all' = sem filtro naquele campo.
export function filterPapers(questions, { source = null, topicId = null } = {}) {
  const wantSource = source && source !== 'all' ? source : null
  const wantTopic = topicId && topicId !== 'all' ? topicId : null
  return questions.filter((q) => {
    if (wantSource && q.source !== wantSource) return false
    if (wantTopic && q.topicId !== wantTopic) return false
    return true
  })
}

export function countPapers(filter, questions = EXAM_QUESTIONS) {
  return filterPapers(questions, filter).length
}

// Fisher-Yates numa cópia.
export function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Devolve menos que `count` se o banco não tiver. A tela mostra o tamanho real.
export function drawPaperSet({ source = null, topicId = null, count = PAPER_SET_SIZE } = {}, questions = EXAM_QUESTIONS) {
  const pool = filterPapers(questions, { source, topicId })
  return shuffle(pool).slice(0, Math.max(1, count))
}

export function isPaperCorrect(question, chosenIndex) {
  return chosenIndex === question.correct
}
