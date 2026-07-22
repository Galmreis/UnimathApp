// Turns whatever the user typed into a yes/no verdict, and formats the correct
// answer for the feedback line. A question object looks like:
//   { prompt, answer, kind }
// where `kind` is 'number' (answer is a Number) or 'fraction' (answer is {n,d}).

import { reduceFraction, formatNumber } from './math.js'

const TOLERANCE = 1e-3 // decimals within this distance count as correct

// Parse a typed number, accepting the Brazilian comma ("6,25") as the decimal
// separator. Returns a Number, or null if the text isn't a valid number.
function parseNumber(text) {
  const cleaned = String(text).trim().replace(',', '.')
  if (cleaned === '') return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

// Parse a typed fraction like "3/4" or "-6/8". Returns it reduced, or null.
function parseFraction(text) {
  const match = String(text).replace(/\s+/g, '').match(/^(-?\d+)\/(-?\d+)$/)
  if (!match) return null
  const n = Number(match[1])
  const d = Number(match[2])
  if (d === 0) return null
  return reduceFraction(n, d)
}

// Is the user's text a correct answer to this question?
export function checkAnswer(userText, question) {
  if (question.kind === 'fraction') {
    const want = reduceFraction(question.answer.n, question.answer.d)
    const asFraction = parseFraction(userText)
    if (asFraction) {
      return asFraction.n === want.n && asFraction.d === want.d
    }
    // Be friendly: also accept the equivalent decimal (e.g. "0,75" for 3/4).
    const asNumber = parseNumber(userText)
    if (asNumber === null) return false
    return Math.abs(asNumber - want.n / want.d) < TOLERANCE
  }

  // kind === 'number'
  const asNumber = parseNumber(userText)
  if (asNumber === null) return false
  return Math.abs(asNumber - question.answer) < TOLERANCE
}

// The correct answer as a readable string, for the "certo/errado" feedback.
export function formatAnswer(question) {
  if (question.kind === 'fraction') {
    const { n, d } = reduceFraction(question.answer.n, question.answer.d)
    return d === 1 ? String(n) : `${n}/${d}` // show "2" instead of "2/1"
  }
  return formatNumber(question.answer)
}
