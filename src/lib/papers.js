// Pure helpers over the exam bank in data/exams.js — the "Provas" mode's logic.
//
// The training track generates its questions; this mode *selects* them from a
// fixed list, so everything here is filtering, shuffling and localizing. No
// React, no browser: `npm run check` can exercise it directly.

import { EXAM_QUESTIONS, EXAM_SOURCES } from '../data/exams.js'
import { randInt } from './math.js'

// How many questions a paper set has by default (the ENEM math block reads in
// chunks of about this size, and it keeps a session under ~15 minutes).
export const PAPER_SET_SIZE = 10
export const PAPER_SET_OPTIONS = [5, 10, 15, 20]

// a) b) c) d) e) — the label shown next to each alternative.
const LETTERS = ['a', 'b', 'c', 'd', 'e']
export function letterFor(index) {
  return LETTERS[index] ?? String(index + 1)
}

// A question with its text swapped to `lang`. Structural fields (id, source,
// topicId, level, correct) never move — only statement/alternatives/solution.
export function localizePaper(question, lang) {
  if (!question || lang !== 'en' || !question.en) return question
  return { ...question, ...question.en }
}

// Which exam boards actually have questions in the bank right now. Declared
// order (EXAM_SOURCES) wins, so the filter chips don't reshuffle themselves.
export function availableSources(questions = EXAM_QUESTIONS) {
  const present = new Set(questions.map((q) => q.source))
  return EXAM_SOURCES.filter((source) => present.has(source))
}

// Which of our track topics the bank can quiz you on, in the order given.
export function availableTopicIds(questions = EXAM_QUESTIONS) {
  const seen = []
  for (const q of questions) if (q.topicId && !seen.includes(q.topicId)) seen.push(q.topicId)
  return seen
}

// `source` / `topicId` of null (or 'all') mean "no filter on that field".
export function filterPapers(questions, { source = null, topicId = null } = {}) {
  const wantSource = source && source !== 'all' ? source : null
  const wantTopic = topicId && topicId !== 'all' ? topicId : null
  return questions.filter((q) => {
    if (wantSource && q.source !== wantSource) return false
    if (wantTopic && q.topicId !== wantTopic) return false
    return true
  })
}

// How many questions match a filter — the "N questões disponíveis" hint.
export function countPapers(filter, questions = EXAM_QUESTIONS) {
  return filterPapers(questions, filter).length
}

// A shuffled copy (Fisher–Yates). Never mutates the input.
export function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Build one run of the mode: up to `count` distinct questions matching the
// filter, in random order. Returns fewer if the bank doesn't have enough — the
// screen shows the real length, so a thin bank degrades gracefully.
export function drawPaperSet({ source = null, topicId = null, count = PAPER_SET_SIZE } = {}, questions = EXAM_QUESTIONS) {
  const pool = filterPapers(questions, { source, topicId })
  return shuffle(pool).slice(0, Math.max(1, count))
}

// Did the user pick the right alternative? (Kept as a function so the screens
// never poke at `correct` themselves.)
export function isPaperCorrect(question, chosenIndex) {
  return chosenIndex === question.correct
}
