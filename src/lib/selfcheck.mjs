// npm run check
// Não é suíte de teste, é a rede mínima em cima do que pode quebrar calado.

import { gcd, reduceFraction, round } from './math.js'
import { checkAnswer, formatAnswer } from './checkAnswer.js'
import { generateQuestion } from './generators.js'
import {
  emptyProgress, recordAnswer, isLevelReady, advanceIfReady,
  applyExamResult, topicStatus, recentAccuracy,
} from './mastery.js'
import { fracaoSomaTips } from './strategies.js'
import { translationKeys, LANGS } from './i18n.js'
import {
  RANK_TIERS, RANK_STEPS, MATCH_QUESTIONS, MATCH_SPREAD, roman, clampStep, rankAt,
  tierStartStep, matchOutcome, applyMatchResult, trainingLadder, ladderTarget, matchPool,
} from './ranks.js'
import {
  availableSources, availableTopicIds, filterPapers, countPapers, drawPaperSet,
  localizePaper, letterFor, isPaperCorrect,
} from './papers.js'
import { TOPICS, getTopic } from '../data/topics.js'
import { EXAM_QUESTIONS, EXAM_SOURCES } from '../data/exams.js'

let checks = 0
function assert(cond, msg) {
  checks++
  if (!cond) {
    console.error('❌ FALHOU:', msg)
    process.exit(1)
  }
}

function canonicalText(q) {
  if (q.kind === 'fraction') {
    const { n, d } = reduceFraction(q.answer.n, q.answer.d)
    return d === 1 ? String(n) : `${n}/${d}`
  }
  return String(q.answer).replace('.', ',') // exercise comma parsing too
}

// ---- helpers de matemática ----
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

// ---- generators ----
for (const lang of ['pt', 'en']) {
  for (const topic of TOPICS) {
  for (let level = 0; level < topic.levels.length; level++) {
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion(topic.id, level, lang)
      assert(typeof q.prompt === 'string' && q.prompt.length > 0, `${topic.id} L${level} has prompt`)
      assert(q.kind === 'number' || q.kind === 'fraction', `${topic.id} L${level} valid kind`)
      // toda questão precisa vir com steps e tips não vazios
      assert(
        Array.isArray(q.steps) && q.steps.length > 0 && q.steps.every((s) => typeof s === 'string' && s.length > 0),
        `${topic.id} L${level} has steps: "${q.prompt}"`,
      )
      assert(
        Array.isArray(q.tips) && q.tips.length > 0 && q.tips.every((t) => typeof t === 'string' && t.length > 0),
        `${topic.id} L${level} has tips: "${q.prompt}"`,
      )
      // prompt/step/tip nunca pode vazar NaN/undefined no texto
      for (const text of [q.prompt, ...q.steps, ...q.tips]) {
        assert(!/\b(NaN|undefined|Infinity)\b/.test(text), `${topic.id} L${level} leaked value in: "${text}"`)
      }
      // a resposta do próprio gerador tem que passar no próprio checker
      assert(checkAnswer(canonicalText(q), q), `${topic.id} L${level} answer checks out: "${q.prompt}"`)
      // verificação independente da conta, quando o prompt dá pra parsear
      let m
      if ((m = q.prompt.match(/^(\d+) ÷ (\d+) = \?$/))) {
        assert(Number(m[1]) / Number(m[2]) === q.answer, `divisão exata: ${q.prompt}`)
      } else if ((m = q.prompt.match(/^(\d+) ÷ (\d+) = \? \(decimal\)$/))) {
        assert(round(Number(m[1]) / Number(m[2]), 2) === q.answer, `divisão decimal: ${q.prompt}`)
      } else if ((m = q.prompt.match(/^Quanto é (\d+)% de (\d+)\?$/))) {
        assert(round((Number(m[2]) * Number(m[1])) / 100, 2) === q.answer, `porcentagem: ${q.prompt}`)
      } else if ((m = q.prompt.match(/^(\d+) \+ (\d+) = \?$/))) {
        assert(Number(m[1]) + Number(m[2]) === q.answer, `adição: ${q.prompt}`)
      } else if ((m = q.prompt.match(/^(\d+) − (\d+) = \?$/))) {
        assert(Number(m[1]) - Number(m[2]) === q.answer, `subtração: ${q.prompt}`)
      } else if ((m = q.prompt.match(/^(\d+) × (\d+) = \?$/))) {
        assert(Number(m[1]) * Number(m[2]) === q.answer, `multiplicação: ${q.prompt}`)
      } else if ((m = q.prompt.match(/^(\d+)\^(\d+) = \?$/))) {
        assert(Number(m[1]) ** Number(m[2]) === q.answer, `potência: ${q.prompt}`)
      } else if ((m = q.prompt.match(/^√(\d+) = \?$/))) {
        assert(q.answer * q.answer === Number(m[1]), `raiz: ${q.prompt}`)
      }
    }
  }
  }
}

// ---- mastery / progressão ----
let p = emptyProgress()
for (let i = 0; i < 12; i++) p = recordAnswer(p, true)
assert(p.recent.length === 10, 'rolling window caps at 10')
assert(p.answered === 12 && p.correct === 12, 'lifetime totals accumulate')
assert(recentAccuracy(p) === 1, 'recent accuracy 100%')
assert(isLevelReady(p), '10/10 recent -> level ready')

const firstTopic = TOPICS[0]
let p2 = advanceIfReady(p, firstTopic)
assert(p2.levelIndex === 1 && p2.recent.length === 0, 'advance moves up a level and resets window')

// revisão de nível passado conta no total mas não na janela, não avança tópico
let pr = { ...emptyProgress(), levelIndex: 2 }
for (let i = 0; i < 12; i++) pr = recordAnswer(pr, true, true)
assert(pr.answered === 12 && pr.correct === 12, 'review answers still count in totals')
assert(pr.recent.length === 0 && !isLevelReady(pr), 'review answers do not fill the mastery window')

// não fixado -> nada muda
let p3 = emptyProgress()
p3 = recordAnswer(p3, true)
assert(!isLevelReady(p3) && advanceIfReady(p3, firstTopic).levelIndex === 0, 'not enough answers -> no advance')

// regra da prova: 8/10 sobe, 6/10 fica, 3/10 desce
assert(applyExamResult({ ...emptyProgress(), levelIndex: 0 }, firstTopic, 8, 10).levelIndex === 1, 'exam 8/10 advances')
assert(applyExamResult({ ...emptyProgress(), levelIndex: 1 }, firstTopic, 6, 10).levelIndex === 1, 'exam 6/10 repeats')
assert(applyExamResult({ ...emptyProgress(), levelIndex: 1 }, firstTopic, 3, 10).levelIndex === 0, 'exam 3/10 drops')
const lastLevel = firstTopic.levels.length - 1
assert(applyExamResult({ ...emptyProgress(), levelIndex: lastLevel }, firstTopic, 10, 10).mastered, 'acing the last level masters the topic')

// tópico dominado não muda mais, nem refazendo a prova
const masteredProg = { ...emptyProgress(), levelIndex: lastLevel, mastered: true }
assert(applyExamResult(masteredProg, firstTopic, 3, 10) === masteredProg, 'exam does not demote a fixed topic')
assert(applyExamResult(masteredProg, firstTopic, 10, 10) === masteredProg, 'exam leaves a fixed topic unchanged')

// regra de bloqueio
assert(topicStatus(TOPICS[0], {}) === 'available', 'first topic available')
assert(topicStatus(TOPICS[1], {}) === 'locked', 'second topic locked until first mastered')
assert(topicStatus(TOPICS[1], { [TOPICS[0].id]: { mastered: true } }) === 'available', 'mastering prereq unlocks next')

// dica de soma de fração não pode dizer "sem fator comum" quando tem
assert(!fracaoSomaTips(4, 6)[0].includes('não têm fator comum'), 'somar tip: 4 & 6 share the factor 2')
assert(fracaoSomaTips(4, 6)[0].includes('12'), 'somar tip: 4 & 6 → common denominator 12')
assert(fracaoSomaTips(3, 5)[0].includes('não têm fator comum'), 'somar tip: 3 & 5 are truly coprime')
assert(fracaoSomaTips(2, 6)[0].includes('múltiplo'), 'somar tip: 2 divides 6')

// ---- i18n: os dois dicionários precisam ter as mesmas chaves ----
// (chave que falta em `en` cai pro português, só isso aqui pega)
const ptKeys = new Set(translationKeys('pt'))
const enKeys = new Set(translationKeys('en'))
assert(LANGS.length === 2, 'two languages')
assert(ptKeys.size > 0 && enKeys.size > 0, 'both dictionaries have keys')
for (const key of ptKeys) assert(enKeys.has(key), `en is missing the key "${key}"`)
for (const key of enKeys) assert(ptKeys.has(key), `pt is missing the key "${key}"`)

// ---- a escada de rank ----
assert(RANK_STEPS === RANK_TIERS.reduce((sum, tier) => sum + tier.divisions, 0), 'RANK_STEPS matches the tiers')
assert(RANK_STEPS === 20, 'the ladder is 20 steps (Iniciante I .. Sábio VI)')
assert(roman(1) === 'I' && roman(4) === 'IV' && roman(6) === 'VI', 'roman numerals')

// clamp mantém tudo dentro da escada
assert(clampStep(-5) === 0, 'clampStep floors at 0')
assert(clampStep(999) === RANK_STEPS - 1, 'clampStep caps at the top step')
assert(clampStep(undefined) === 0, 'clampStep survives a missing value')
assert(clampStep(3.4) === 3, 'clampStep rounds')

// todo step cai num tier/divisão real, e as duas pontas são o que prometemos
const seenLabels = new Set()
for (let step = 0; step < RANK_STEPS; step++) {
  const rank = rankAt(step)
  const tier = RANK_TIERS[rank.tierIndex]
  assert(tier && tier.key === rank.tierKey, `rankAt(${step}) lands on a real tier`)
  assert(rank.division >= 1 && rank.division <= tier.divisions, `rankAt(${step}) division in range`)
  assert(rank.step === step, `rankAt(${step}) keeps its step`)
  assert(typeof rank.color === 'string' && rank.color.startsWith('#'), `rankAt(${step}) carries a colour`)
  const label = `${rank.tierKey} ${rank.roman}`
  assert(!seenLabels.has(label), `no two steps share the label "${label}"`)
  seenLabels.add(label)
}
assert(seenLabels.size === RANK_STEPS, 'every step has its own label')
const bottom = rankAt(0)
const top = rankAt(RANK_STEPS - 1)
assert(bottom.tierKey === 'iniciante' && bottom.roman === 'I', 'step 0 is Iniciante I')
assert(top.tierKey === 'sabio' && top.roman === 'VI' && top.isTop, 'the last step is Sábio VI')
assert(rankAt(RANK_STEPS + 10).step === RANK_STEPS - 1, 'rankAt clamps out-of-range steps')
// tierStartStep tem que bater com rankAt
for (let i = 0; i < RANK_TIERS.length; i++) {
  const start = tierStartStep(i)
  assert(rankAt(start).tierIndex === i && rankAt(start).division === 1, `tierStartStep(${i}) is that tier's division I`)
}

// regra do match: 8+/10 sobe, 5-7 fica, <5 desce — nunca sai da escada
for (let step = 0; step < RANK_STEPS; step++) {
  for (let correct = 0; correct <= MATCH_QUESTIONS; correct++) {
    const outcome = matchOutcome(step, correct, MATCH_QUESTIONS)
    const next = applyMatchResult(step, correct, MATCH_QUESTIONS)
    assert(next >= 0 && next <= RANK_STEPS - 1, `match ${correct}/10 at ${step} stays on the ladder`)
    assert(Math.abs(next - step) <= 1, `match ${correct}/10 at ${step} moves at most one step`)
    if (correct >= 8) {
      assert(outcome === (step < RANK_STEPS - 1 ? 'up' : 'stay'), `${correct}/10 promotes (unless at the top)`)
      assert(next === Math.min(step + 1, RANK_STEPS - 1), `${correct}/10 climbs one step`)
    } else if (correct < 5) {
      assert(outcome === (step > 0 ? 'down' : 'stay'), `${correct}/10 demotes (unless at the bottom)`)
      assert(next === Math.max(step - 1, 0), `${correct}/10 drops one step`)
    } else {
      assert(outcome === 'stay' && next === step, `${correct}/10 holds the step`)
    }
  }
}
// a regra é uma razão, então um match de 20 questões funciona igual
assert(applyMatchResult(5, 16, 20) === 6, 'a 20-question match at 80% still promotes')
assert(applyMatchResult(5, 9, 20) === 4, 'a 20-question match under 50% still demotes')
assert(matchOutcome(3, 0, 0) === 'down', 'a match with no questions cannot count as a win')

// a escada de dificuldade de onde o match sorteia
const ladder = trainingLadder(TOPICS)
assert(ladder.length === TOPICS.reduce((sum, topic) => sum + topic.levels.length, 0), 'the ladder has one rung per topic level')
assert(ladder[0].topicId === TOPICS[0].id && ladder[0].level === 0, 'the ladder starts at the first level of the first topic')
assert(ladderTarget(0, ladder.length) === 0, 'rank 0 targets the easiest rung')
assert(ladderTarget(RANK_STEPS - 1, ladder.length) === ladder.length - 1, 'the top rank targets the hardest rung')
let previousTarget = -1
for (let step = 0; step < RANK_STEPS; step++) {
  const target = ladderTarget(step, ladder.length)
  assert(target >= previousTarget, `ladderTarget never goes backwards (step ${step})`)
  assert(target >= 0 && target < ladder.length, `ladderTarget(${step}) is a real rung`)
  previousTarget = target

  const poolForStep = matchPool(step, TOPICS)
  assert(poolForStep.length === Math.min(MATCH_SPREAD, ladder.length), `matchPool(${step}) always offers the same spread`)
  for (const rung of poolForStep) {
    const topic = getTopic(rung.topicId)
    assert(topic, `matchPool(${step}) only names real topics`)
    assert(rung.level >= 0 && rung.level < topic.levels.length, `matchPool(${step}) only names real levels`)
    // toda rung do pool tem que gerar questão de verdade
    for (const lang of LANGS) {
      const q = generateQuestion(rung.topicId, rung.level, lang)
      assert(typeof q.prompt === 'string' && q.prompt.length > 0, `match question has a prompt (${rung.topicId} ${rung.level} ${lang})`)
      assert(checkAnswer(canonicalText(q), q), `match question grades its own answer (${rung.topicId} ${rung.level} ${lang})`)
    }
  }
}
assert(matchPool(0, TOPICS)[0].level === 0, 'the easiest match starts at the first rung')
assert(matchPool(RANK_STEPS - 1, TOPICS).at(-1).topicId === TOPICS[TOPICS.length - 1].id, 'the hardest match reaches the last topic')

// ---- o banco de provas (data/exams.js) ----
// Dado catalogado na mão, os testes abaixo são as regras do exams.js.
const seenExamIds = new Set()
for (const q of EXAM_QUESTIONS) {
  assert(typeof q.id === 'string' && q.id.length > 0, 'every exam question has an id')
  assert(!seenExamIds.has(q.id), `exam id "${q.id}" is used twice`)
  seenExamIds.add(q.id)
  assert(EXAM_SOURCES.includes(q.source), `${q.id}: source must be one of EXAM_SOURCES`)
  assert(['official', 'adapted', 'authored'].includes(q.origin), `${q.id}: origin must be official/adapted/authored`)
  assert(q.year === null || (Number.isInteger(q.year) && q.year > 1990), `${q.id}: year is null or a real year`)
  assert(q.number === null || Number.isInteger(q.number), `${q.id}: number is null or an integer`)
  const topic = getTopic(q.topicId)
  assert(topic, `${q.id}: topicId "${q.topicId}" must exist in data/topics.js`)
  assert(Number.isInteger(q.level) && q.level >= 0 && q.level < topic.levels.length, `${q.id}: level must be one of the topic's levels`)
  assert(typeof q.statement === 'string' && q.statement.length > 10, `${q.id}: statement`)
  assert(Array.isArray(q.alternatives) && q.alternatives.length === 5, `${q.id}: exactly 5 alternatives`)
  assert(new Set(q.alternatives).size === 5, `${q.id}: the 5 alternatives must all differ`)
  assert(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 5, `${q.id}: correct must index an alternative`)
  assert(Array.isArray(q.solution) && q.solution.length > 0, `${q.id}: a worked solution`)
  // nos dois idiomas, e a versão localizada não pode mudar a resposta
  assert(q.en && typeof q.en.statement === 'string' && q.en.statement.length > 10, `${q.id}: English statement`)
  assert(Array.isArray(q.en.alternatives) && q.en.alternatives.length === 5, `${q.id}: 5 English alternatives`)
  assert(Array.isArray(q.en.solution) && q.en.solution.length > 0, `${q.id}: English solution`)
  for (const lang of LANGS) {
    const localized = localizePaper(q, lang)
    assert(localized.correct === q.correct, `${q.id}: localizing (${lang}) must not move the answer`)
    assert(localized.id === q.id && localized.topicId === q.topicId, `${q.id}: localizing (${lang}) keeps the structure`)
    assert(localized.alternatives.length === 5, `${q.id}: localized (${lang}) alternatives`)
    assert(isPaperCorrect(localized, q.correct), `${q.id}: localized (${lang}) grades the right answer`)
    assert(!isPaperCorrect(localized, (q.correct + 1) % 5), `${q.id}: localized (${lang}) rejects a wrong answer`)
  }
}
assert(letterFor(0) === 'a' && letterFor(4) === 'e', 'alternatives are labelled a..e')

// filtro e sorteio
assert(availableSources().every((source) => EXAM_SOURCES.includes(source)), 'availableSources stays inside EXAM_SOURCES')
assert(availableTopicIds().every((id) => getTopic(id)), 'availableTopicIds are real topics')
assert(countPapers({}) === EXAM_QUESTIONS.length, 'no filter counts the whole bank')
assert(countPapers({ source: 'all', topicId: 'all' }) === EXAM_QUESTIONS.length, '"all" means no filter')
for (const source of availableSources()) {
  const filtered = filterPapers(EXAM_QUESTIONS, { source })
  assert(filtered.length > 0 && filtered.every((q) => q.source === source), `filtering by ${source}`)
}
for (const topicId of availableTopicIds()) {
  const filtered = filterPapers(EXAM_QUESTIONS, { topicId })
  assert(filtered.length > 0 && filtered.every((q) => q.topicId === topicId), `filtering by topic ${topicId}`)
}
assert(filterPapers(EXAM_QUESTIONS, { source: 'ENEM', topicId: 'porcentagem' }).every((q) => q.source === 'ENEM' && q.topicId === 'porcentagem'), 'both filters apply together')
for (let run = 0; run < 200; run++) {
  const set = drawPaperSet({ count: 10 })
  assert(set.length === 10, 'a draw returns the asked-for count while the bank allows it')
  assert(new Set(set.map((q) => q.id)).size === set.length, 'a draw never repeats a question')
  assert(set.every((q) => EXAM_QUESTIONS.includes(q)), 'a draw only returns bank questions')
}
assert(drawPaperSet({ count: 999 }).length === EXAM_QUESTIONS.length, 'asking for more than the bank has returns the whole bank')
assert(drawPaperSet({ source: 'UFRGS', count: 5 }).every((q) => q.source === 'UFRGS'), 'a filtered draw respects its filter')
assert(drawPaperSet({ topicId: 'nao-existe', count: 5 }).length === 0, 'a filter matching nothing draws nothing')

console.log(`✅ todos os ${checks} testes passaram`)
