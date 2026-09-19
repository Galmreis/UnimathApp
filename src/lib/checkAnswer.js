// kind 'number' -> answer é Number; kind 'fraction' -> answer é {n,d}.

import { reduceFraction, formatNumber } from './math.js'

const TOLERANCE = 1e-3 // decimals within this distance count as correct

// Aceita vírgula decimal. Digitar "6,25" é o caso normal aqui, não exceção.
function parseNumber(text) {
  const cleaned = String(text).trim().replace(',', '.')
  if (cleaned === '') return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

function parseFraction(text) {
  const match = String(text).replace(/\s+/g, '').match(/^(-?\d+)\/(-?\d+)$/)
  if (!match) return null
  const n = Number(match[1])
  const d = Number(match[2])
  if (d === 0) return null
  return reduceFraction(n, d)
}

export function checkAnswer(userText, question) {
  if (question.kind === 'fraction') {
    const want = reduceFraction(question.answer.n, question.answer.d)
    const asFraction = parseFraction(userText)
    if (asFraction) {
      return asFraction.n === want.n && asFraction.d === want.d
    }
    // Aceita o decimal equivalente também: 0,75 vale por 3/4.
    const asNumber = parseNumber(userText)
    if (asNumber === null) return false
    return Math.abs(asNumber - want.n / want.d) < TOLERANCE
  }

  // kind === 'number'
  const asNumber = parseNumber(userText)
  if (asNumber === null) return false
  return Math.abs(asNumber - question.answer) < TOLERANCE
}

export function formatAnswer(question, lang = 'pt') {
  if (question.kind === 'fraction') {
    const { n, d } = reduceFraction(question.answer.n, question.answer.d)
    return d === 1 ? String(n) : `${n}/${d}` // show "2" instead of "2/1"
  }
  return formatNumber(question.answer, lang)
}
