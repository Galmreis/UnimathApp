// Rank é só um inteiro `step`. Os tiers abaixo fatiam essa reta em faixas com
// divisão em romano: step 0 é "Iniciante I", o último é "Sábio VI".

// Nome de cada tier fica no i18n como `rank_<key>`.
export const RANK_TIERS = [
  { key: 'iniciante', divisions: 3, color: '#7dcfff' },
  { key: 'aprendiz', divisions: 3, color: '#73daca' },
  { key: 'calculista', divisions: 4, color: '#7ecb8f' },
  { key: 'mestre', divisions: 4, color: '#c99ae0' },
  { key: 'sabio', divisions: 6, color: '#e0b45b' },
]

// 3 + 3 + 4 + 4 + 6 = 20 steps.
export const RANK_STEPS = RANK_TIERS.reduce((sum, tier) => sum + tier.divisions, 0)

export const MATCH_QUESTIONS = 10   // questions in one rank match
export const MATCH_UP = 0.8         // 8+/10 promotes
export const MATCH_DOWN = 0.5       // under 5/10 demotes
// Quantos degraus da escada de dificuldade um teste sorteia.
export const MATCH_SPREAD = 4

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export function roman(n) {
  return ROMAN[n - 1] ?? String(n)
}

export function clampStep(step) {
  const n = Number.isFinite(step) ? Math.round(step) : 0
  return Math.max(0, Math.min(n, RANK_STEPS - 1))
}

// rankAt(0)  -> { tierKey: 'iniciante', division: 1, roman: 'I' }
// rankAt(19) -> { tierKey: 'sabio', division: 6, roman: 'VI' }
export function rankAt(step) {
  const s = clampStep(step)
  let left = s
  for (let i = 0; i < RANK_TIERS.length; i++) {
    const tier = RANK_TIERS[i]
    if (left < tier.divisions) {
      return {
        step: s,
        tierKey: tier.key,
        tierIndex: i,
        color: tier.color,
        division: left + 1,
        divisions: tier.divisions,
        roman: roman(left + 1),
        isTop: s === RANK_STEPS - 1,
      }
    }
    left -= tier.divisions
  }
  // Inalcançável com o clampStep na frente, mas não quero helper de display
  // que joga exceção.
  const last = RANK_TIERS[RANK_TIERS.length - 1]
  return {
    step: RANK_STEPS - 1,
    tierKey: last.key,
    tierIndex: RANK_TIERS.length - 1,
    color: last.color,
    division: last.divisions,
    divisions: last.divisions,
    roman: roman(last.divisions),
    isTop: true,
  }
}

export function tierStartStep(tierIndex) {
  let step = 0
  for (let i = 0; i < tierIndex && i < RANK_TIERS.length; i++) step += RANK_TIERS[i].divisions
  return step
}

export function rankLabel(step, t) {
  const rank = rankAt(step)
  return `${t(`rank_${rank.tierKey}`)} ${rank.roman}`
}

// 'up' | 'stay' | 'down'. Vitória no topo (ou derrota no fundo) não tem pra onde
// ir e sai como 'stay'.
export function matchOutcome(step, correct, total) {
  const ratio = total > 0 ? correct / total : 0
  const s = clampStep(step)
  if (ratio >= MATCH_UP) return s < RANK_STEPS - 1 ? 'up' : 'stay'
  if (ratio < MATCH_DOWN) return s > 0 ? 'down' : 'stay'
  return 'stay'
}

export function applyMatchResult(step, correct, total) {
  const s = clampStep(step)
  const outcome = matchOutcome(s, correct, total)
  if (outcome === 'up') return s + 1
  if (outcome === 'down') return s - 1
  return s
}

// --- o que o teste pergunta ---

// Todo par (tópico, nível) na ordem da trilha. Adição 1 é o degrau 0.
export function trainingLadder(topics) {
  const rungs = []
  for (const topic of topics) {
    for (let level = 0; level < topic.levels.length; level++) {
      rungs.push({ topicId: topic.id, level })
    }
  }
  return rungs
}

// Onde na escada testar cada rank. Linear entre o primeiro e o último degrau.
export function ladderTarget(step, ladderLength) {
  if (ladderLength <= 1) return 0
  const s = clampStep(step)
  return Math.round((s * (ladderLength - 1)) / (RANK_STEPS - 1))
}

// Degrau alvo mais os de baixo, pra misturar nível atual com revisão. Nas pontas
// a janela desliza em vez de cortar, senão rank baixo veria menos questão.
//
// A escada é absoluta, não "o que você destravou": senão dava pra chegar em
// Sábio só de adição.
export function matchPool(step, topics) {
  const ladder = trainingLadder(topics)
  if (ladder.length === 0) return []
  const width = Math.min(MATCH_SPREAD, ladder.length)
  const target = ladderTarget(step, ladder.length)
  let start = target - (width - 1)
  if (start < 0) start = 0
  if (start + width > ladder.length) start = ladder.length - width
  return ladder.slice(start, start + width)
}
