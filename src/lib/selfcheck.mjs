// Runnable self-check for the pure logic (no React, no browser needed).
//   npm run check      (or: node src/lib/selfcheck.mjs)
// If the math or the progression rules break, this fails loudly. It is NOT a
// full test suite — just the smallest safety net over the risky parts.

import { gcd, reduceFraction, round } from './math.js'
import { checkAnswer, formatAnswer } from './checkAnswer.js'
import { generateQuestion } from './generators.js'
import {
  emptyProgress, recordAnswer, isLevelReady, advanceIfReady,
  applyExamResult, topicStatus, recentAccuracy,
} from './mastery.js'
import { fracaoSomaTips } from './strategies.js'
import { TOPICS } from '../data/topics.js'

let checks = 0
function assert(cond, msg) {
  checks++
  if (!cond) {
    console.error('❌ FALHOU:', msg)
    process.exit(1)
  }
}

// The correct answer as text the user could have typed.
function canonicalText(q) {
  if (q.kind === 'fraction') {
    const { n, d } = reduceFraction(q.answer.n, q.answer.d)
    return d === 1 ? String(n) : `${n}/${d}`
  }
  return String(q.answer).replace('.', ',') // exercise comma parsing too
}

// ---- math helpers ----
assert(gcd(12, 8) === 4, 'gcd(12,8)')
assert(gcd(0, 5) === 5, 'gcd(0,5)')
const r = reduceFraction(6, 8)
assert(r.n === 3 && r.d === 4, 'reduceFraction 6/8')
const rn = reduceFraction(3, -4)
assert(rn.n === -3 && rn.d === 4, 'reduceFraction moves sign to numerator')
assert(round(1 / 3, 2) === 0.33, 'round 1/3')

// ---- checkAnswer ----
const numQ = { kind: 'number', answer: 6.25 }
assert(checkAnswer('6,25', numQ), 'accepts comma decimal')
assert(checkAnswer('6.25', numQ), 'accepts dot decimal')
assert(!checkAnswer('6', numQ), 'rejects wrong number')
assert(!checkAnswer('abc', numQ) && !checkAnswer('', numQ), 'rejects junk / empty')
const fracQ = { kind: 'fraction', answer: { n: 3, d: 4 } }
assert(checkAnswer('3/4', fracQ), 'accepts exact fraction')
assert(checkAnswer('6/8', fracQ), 'accepts unreduced equivalent fraction')
assert(checkAnswer('0,75', fracQ), 'accepts equivalent decimal for a fraction')
assert(!checkAnswer('2/4', fracQ), 'rejects wrong fraction')
assert(formatAnswer(fracQ) === '3/4', 'formats fraction')
assert(formatAnswer({ kind: 'fraction', answer: { n: 4, d: 2 } }) === '2', 'formats whole-number fraction as int')

// ---- generators: every topic × level must produce a valid, self-consistent question ----
for (const topic of TOPICS) {
  for (let level = 0; level < topic.levels.length; level++) {
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion(topic.id, level)
      assert(typeof q.prompt === 'string' && q.prompt.length > 0, `${topic.id} L${level} has prompt`)
      assert(q.kind === 'number' || q.kind === 'fraction', `${topic.id} L${level} valid kind`)
      // every question must carry non-empty steps AND non-empty strategy tips
      assert(
        Array.isArray(q.steps) && q.steps.length > 0 && q.steps.every((s) => typeof s === 'string' && s.length > 0),
        `${topic.id} L${level} has steps: "${q.prompt}"`,
      )
      assert(
        Array.isArray(q.tips) && q.tips.length > 0 && q.tips.every((t) => typeof t === 'string' && t.length > 0),
        `${topic.id} L${level} has tips: "${q.prompt}"`,
      )
      // no prompt/step/tip should ever leak a broken value into its text
      for (const text of [q.prompt, ...q.steps, ...q.tips]) {
        assert(!/\b(NaN|undefined|Infinity)\b/.test(text), `${topic.id} L${level} leaked value in: "${text}"`)
      }
      // the generator's own answer must pass its own checker
      assert(checkAnswer(canonicalText(q), q), `${topic.id} L${level} answer checks out: "${q.prompt}"`)
      // independent arithmetic verification where the prompt is machine-readable
      let m
      if ((m = q.prompt.match(/^(\d+) ÷ (\d+) = \?$/))) {
        assert(Number(m[1]) / Number(m[2]) === q.answer, `divisão exata: ${q.prompt}`)
      } else if ((m = q.prompt.match(/^(\d+) ÷ (\d+) = \? \(decimal\)$/))) {
        assert(round(Number(m[1]) / Number(m[2]), 2) === q.answer, `divisão decimal: ${q.prompt}`)
      } else if ((m = q.prompt.match(/^Quanto é (\d+)% de (\d+)\?$/))) {
        assert(round((Number(m[2]) * Number(m[1])) / 100, 2) === q.answer, `porcentagem: ${q.prompt}`)
      }
    }
  }
}

// ---- mastery / progression ----
let p = emptyProgress()
for (let i = 0; i < 12; i++) p = recordAnswer(p, true)
assert(p.recent.length === 10, 'rolling window caps at 10')
assert(p.answered === 12 && p.correct === 12, 'lifetime totals accumulate')
assert(recentAccuracy(p) === 1, 'recent accuracy 100%')
assert(isLevelReady(p), '10/10 recent -> level ready')

const divisao = TOPICS[0]
let p2 = advanceIfReady(p, divisao)
assert(p2.levelIndex === 1 && p2.recent.length === 0, 'advance moves up a level and resets window')

// reviewing a past level (statsOnly) counts toward totals but not the window,
// so it can never advance the topic
let pr = { ...emptyProgress(), levelIndex: 2 }
for (let i = 0; i < 12; i++) pr = recordAnswer(pr, true, true)
assert(pr.answered === 12 && pr.correct === 12, 'review answers still count in totals')
assert(pr.recent.length === 0 && !isLevelReady(pr), 'review answers do not fill the mastery window')

// not ready -> no change
let p3 = emptyProgress()
p3 = recordAnswer(p3, true)
assert(!isLevelReady(p3) && advanceIfReady(p3, divisao).levelIndex === 0, 'not enough answers -> no advance')

// exam rule: 8/10 up, 6/10 stay, 3/10 down
assert(applyExamResult({ ...emptyProgress(), levelIndex: 0 }, divisao, 8, 10).levelIndex === 1, 'exam 8/10 advances')
assert(applyExamResult({ ...emptyProgress(), levelIndex: 1 }, divisao, 6, 10).levelIndex === 1, 'exam 6/10 repeats')
assert(applyExamResult({ ...emptyProgress(), levelIndex: 1 }, divisao, 3, 10).levelIndex === 0, 'exam 3/10 drops')
const lastLevel = divisao.levels.length - 1
assert(applyExamResult({ ...emptyProgress(), levelIndex: lastLevel }, divisao, 10, 10).mastered, 'acing the last level masters the topic')

// a fixed topic is never changed by re-taking the exam (no demotion, no contradictory state)
const masteredProg = { ...emptyProgress(), levelIndex: lastLevel, mastered: true }
assert(applyExamResult(masteredProg, divisao, 3, 10) === masteredProg, 'exam does not demote a fixed topic')
assert(applyExamResult(masteredProg, divisao, 10, 10) === masteredProg, 'exam leaves a fixed topic unchanged')

// lock rule
assert(topicStatus(TOPICS[0], {}) === 'available', 'first topic available')
assert(topicStatus(TOPICS[1], {}) === 'locked', 'second topic locked until first mastered')
assert(topicStatus(TOPICS[1], { divisao: { mastered: true } }) === 'available', 'mastering prereq unlocks next')

// fraction-sum tip must not claim "no common factor" when there IS one
assert(!fracaoSomaTips(4, 6)[0].includes('não têm fator comum'), 'somar tip: 4 & 6 share the factor 2')
assert(fracaoSomaTips(4, 6)[0].includes('12'), 'somar tip: 4 & 6 → common denominator 12')
assert(fracaoSomaTips(3, 5)[0].includes('não têm fator comum'), 'somar tip: 3 & 5 are truly coprime')
assert(fracaoSomaTips(2, 6)[0].includes('múltiplo'), 'somar tip: 2 divides 6')

console.log(`✅ todos os ${checks} testes passaram`)
