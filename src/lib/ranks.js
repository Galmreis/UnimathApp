// The rank ladder — the app's single piece of "gamification".
//
// A rank is just an integer `step` from 0 to RANK_STEPS-1. The tiers below slice
// that line into named bands with roman-numeral divisions, so step 0 reads
// "Iniciante I" and the last one reads "Sábio VI". Divisions grow upward: within
// a tier, I is the entry and the highest roman is the top.
//
// You move along the line only through a "teste de pareamento" (a rank match):
// MATCH_QUESTIONS mixed questions, no feedback until the end, then the same
// up/stay/down shape as the prova da sexta — 8+/10 up, 5–7 stay, <5 down.
//
// Everything here is pure (numbers in, numbers out) so `npm run check` can
// hammer it without a browser.

// Tier names live in lib/i18n.js as `rank_<key>`; the shape and the badge colour
// are data here (same idea as `color` on a topic in data/topics.js — the UI
// follows the data, so retinting a tier is a one-line change).
export const RANK_TIERS = [
  { key: 'iniciante', divisions: 3, color: '#7dcfff' },
  { key: 'aprendiz', divisions: 3, color: '#73daca' },
  { key: 'calculista', divisions: 4, color: '#7ecb8f' },
  { key: 'mestre', divisions: 4, color: '#c99ae0' },
  { key: 'sabio', divisions: 6, color: '#e0b45b' },
]

// 3 + 3 + 4 + 4 + 6 = 20 steps from "Iniciante I" to "Sábio VI".
export const RANK_STEPS = RANK_TIERS.reduce((sum, tier) => sum + tier.divisions, 0)

export const MATCH_QUESTIONS = 10   // questions in one rank match
export const MATCH_UP = 0.8         // 8+/10 promotes
export const MATCH_DOWN = 0.5       // under 5/10 demotes
// How many rungs of the difficulty ladder a match draws from (see matchPool).
export const MATCH_SPREAD = 4

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

// Roman numeral for a 1-based division number.
export function roman(n) {
  return ROMAN[n - 1] ?? String(n)
}

// Clamp any number into a valid step.
export function clampStep(step) {
  const n = Number.isFinite(step) ? Math.round(step) : 0
  return Math.max(0, Math.min(n, RANK_STEPS - 1))
}

// Which tier/division a step lands on:
//   rankAt(0)  -> { step: 0,  tierKey: 'iniciante', tierIndex: 0, division: 1, roman: 'I' }
//   rankAt(19) -> { step: 19, tierKey: 'sabio',     tierIndex: 4, division: 6, roman: 'VI' }
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
  // Unreachable while clampStep keeps `s` inside the ladder, but staying total
  // beats throwing from a display helper.
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

// The first step of a tier — used to draw the ladder on the Rank screen.
export function tierStartStep(tierIndex) {
  let step = 0
  for (let i = 0; i < tierIndex && i < RANK_TIERS.length; i++) step += RANK_TIERS[i].divisions
  return step
}

// "Iniciante I" / "Sábio VI". `t` is the translator from lib/i18n.js.
export function rankLabel(step, t) {
  const rank = rankAt(step)
  return `${t(`rank_${rank.tierKey}`)} ${rank.roman}`
}

// What a match score does to the rank: 'up' | 'stay' | 'down'. A win at the top
// step (or a loss at the bottom) has nowhere to go, so it reads as 'stay'.
export function matchOutcome(step, correct, total) {
  const ratio = total > 0 ? correct / total : 0
  const s = clampStep(step)
  if (ratio >= MATCH_UP) return s < RANK_STEPS - 1 ? 'up' : 'stay'
  if (ratio < MATCH_DOWN) return s > 0 ? 'down' : 'stay'
  return 'stay'
}

// The new step after a match. Never leaves the ladder.
export function applyMatchResult(step, correct, total) {
  const s = clampStep(step)
  const outcome = matchOutcome(s, correct, total)
  if (outcome === 'up') return s + 1
  if (outcome === 'down') return s - 1
  return s
}

// --- what a match asks you ---

// Every (topic, level) pair in track order — the app's full difficulty ladder.
// Adição 1 is rung 0; the last level of the last topic is the final rung.
export function trainingLadder(topics) {
  const rungs = []
  for (const topic of topics) {
    for (let level = 0; level < topic.levels.length; level++) {
      rungs.push({ topicId: topic.id, level })
    }
  }
  return rungs
}

// Where on that ladder a given rank should be tested. Rank 0 maps to the first
// rung, the top rank to the last one, linearly in between.
export function ladderTarget(step, ladderLength) {
  if (ladderLength <= 1) return 0
  const s = clampStep(step)
  return Math.round((s * (ladderLength - 1)) / (RANK_STEPS - 1))
}

// The rungs a match at `step` draws from: the target rung plus the ones just
// below it, so a match mixes "your level" with a little review. The window is
// slid (not clipped) at the ends so every rank sees MATCH_SPREAD rungs.
//
// Note this ladder is absolute, not "what you've unlocked": the rank measures
// skill across the whole track, so you can't climb to Sábio on easy questions.
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
