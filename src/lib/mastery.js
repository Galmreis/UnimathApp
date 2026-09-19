// Progressão: só avança quando fixou. Tudo puro, entra valor e sai valor novo.
// Progresso de um tópico: { answered, correct, levelIndex, recent, mastered }

export const MASTERY_WINDOW = 10
export const MASTERY_ACCURACY = 0.8

export function emptyProgress() {
  return { answered: 0, correct: 0, levelIndex: 0, recent: [], mastered: false }
}

// statsOnly conta a resposta no total mas não mexe na janela. É o caso da
// revisão: gabaritar nível velho e fácil não pode destravar nada.
export function recordAnswer(prog, isCorrect, statsOnly = false) {
  return {
    ...prog,
    answered: prog.answered + 1,
    correct: prog.correct + (isCorrect ? 1 : 0),
    recent: statsOnly ? prog.recent : [...prog.recent, isCorrect].slice(-MASTERY_WINDOW),
  }
}

export function recentAccuracy(prog) {
  if (prog.recent.length === 0) return 0
  return prog.recent.filter(Boolean).length / prog.recent.length
}

export function lifetimeAccuracy(prog) {
  if (!prog || prog.answered === 0) return 0
  return prog.correct / prog.answered
}

// Janela cheia E acerto suficiente. Só a porcentagem não basta: 2 de 2 não fixa.
export function isLevelReady(prog) {
  return prog.recent.length >= MASTERY_WINDOW && recentAccuracy(prog) >= MASTERY_ACCURACY
}

export function advanceIfReady(prog, topic) {
  if (!isLevelReady(prog)) return prog
  const lastLevel = topic.levels.length - 1
  if (prog.levelIndex < lastLevel) {
    return { ...prog, levelIndex: prog.levelIndex + 1, recent: [] }
  }
  return { ...prog, mastered: true }
}

// Prova da sexta: 8+/10 sobe, 5 a 7 repete, menos de 5 desce. Escrito em razão
// pra prova de 20 questões funcionar igual.
export function applyExamResult(prog, topic, correct, total) {
  // Tópico já dominado não volta atrás. Refazer a prova é revisão, e não pode
  // deixar o tópico "dominado mas abaixo do último nível".
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
  return prog
}

// 'locked' | 'available' | 'in_progress' | 'mastered'
export function topicStatus(topic, progressMap) {
  const prog = progressMap[topic.id]
  if (prog?.mastered) return 'mastered'
  if (topic.prerequisite && !progressMap[topic.prerequisite]?.mastered) return 'locked'
  if (prog && prog.answered > 0) return 'in_progress'
  return 'available'
}
