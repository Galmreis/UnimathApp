// The progression rules — "só avança quando fixou". All functions here are pure
// (input in, new value out, no side effects), which keeps them easy to reason
// about and to check with `npm run check`.
//
// A topic's progress is stored as:
//   { answered, correct, levelIndex, recent: boolean[], mastered }
// `recent` is a rolling window of the last few answers, used to decide mastery.

export const MASTERY_WINDOW = 10   // look at the last N answers of a topic
export const MASTERY_ACCURACY = 0.8 // need 80% of them right to "fixar"

// A fresh topic starts here.
export function emptyProgress() {
  return { answered: 0, correct: 0, levelIndex: 0, recent: [], mastered: false }
}

// Fold one answer into a topic's progress (returns a new object — never mutates).
// `statsOnly` records the answer in the lifetime totals but leaves the rolling
// window untouched — used when reviewing an already-passed level, so acing easy
// old questions can't advance or master the topic.
export function recordAnswer(prog, isCorrect, statsOnly = false) {
  return {
    ...prog,
    answered: prog.answered + 1,
    correct: prog.correct + (isCorrect ? 1 : 0),
    // keep only the last MASTERY_WINDOW results
    recent: statsOnly ? prog.recent : [...prog.recent, isCorrect].slice(-MASTERY_WINDOW),
  }
}

// Accuracy over the rolling window (0..1). Zero when there are no answers yet.
export function recentAccuracy(prog) {
  if (prog.recent.length === 0) return 0
  return prog.recent.filter(Boolean).length / prog.recent.length
}

// Lifetime accuracy (0..1), used for the stats screens.
export function lifetimeAccuracy(prog) {
  if (!prog || prog.answered === 0) return 0
  return prog.correct / prog.answered
}

// Has the current level been "fixed"? Needs a full window AND enough accuracy.
export function isLevelReady(prog) {
  return prog.recent.length >= MASTERY_WINDOW && recentAccuracy(prog) >= MASTERY_ACCURACY
}

// After practice: if the current level is fixed, move up a level (fresh window),
// or mark the whole topic mastered once the last level is fixed.
export function advanceIfReady(prog, topic) {
  if (!isLevelReady(prog)) return prog
  const lastLevel = topic.levels.length - 1
  if (prog.levelIndex < lastLevel) {
    return { ...prog, levelIndex: prog.levelIndex + 1, recent: [] }
  }
  return { ...prog, mastered: true }
}

// The "prova da sexta" rule: 8+/10 moves up a step, 5–7 repeats, <5 drops a step.
// Generalised to any total so a 20-question exam works the same way.
export function applyExamResult(prog, topic, correct, total) {
  // A topic that's already fixed stays fixed — re-taking the exam is just
  // review and must never leave it in a "mastered but below the top level" state.
  if (prog.mastered) return prog
  const ratio = correct / total
  const lastLevel = topic.levels.length - 1
  if (ratio >= 0.8) {
    if (prog.levelIndex < lastLevel) return { ...prog, levelIndex: prog.levelIndex + 1, recent: [] }
    return { ...prog, mastered: true }
  }
  if (ratio < 0.5 && prog.levelIndex > 0) {
    return { ...prog, levelIndex: prog.levelIndex - 1, recent: [] }
  }
  return prog // 5–7 out of 10: repeat the step, nothing changes
}

// Display status of a topic, combining the lock rule with its progress.
// Returns 'locked' | 'available' | 'in_progress' | 'mastered'.
export function topicStatus(topic, progressMap) {
  const prog = progressMap[topic.id]
  if (prog?.mastered) return 'mastered'
  // Locked until the prerequisite topic is mastered.
  if (topic.prerequisite && !progressMap[topic.prerequisite]?.mastered) return 'locked'
  if (prog && prog.answered > 0) return 'in_progress'
  return 'available'
}
