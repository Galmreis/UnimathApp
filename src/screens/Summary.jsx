import styles from './Summary.module.css'
import { Button } from '../components/Button.jsx'
import { getTopic, TOPICS } from '../data/topics.js'
import { round } from '../lib/math.js'

// Shown after a session or exam. `result` is what Session handed us:
//   { mode, topicId, results: boolean[], durationMs, levelIndex? }
export function Summary({ result, navigate }) {
  const topic = getTopic(result.topicId)
  const total = result.results.length
  const correct = result.results.filter(Boolean).length
  const pct = total > 0 ? round((correct / total) * 100, 0) : 0
  const isExam = result.mode === 'exam'

  return (
    <div className={styles.summary}>
      <div className={styles.hero}>
        <div className={styles.pct}>{pct}%</div>
        <div className={styles.score}>{correct} de {total} certas</div>
        <div className={styles.sub}>
          {topic.name} · {formatDuration(result.durationMs)}
        </div>
      </div>

      <p className={styles.message}>
        {isExam ? examMessage(correct, total, result.levelIndex, topic) : practiceMessage(pct)}
      </p>

      <div className={styles.actions}>
        <Button size="big" full onClick={() => navigate(isExam ? 'exam' : 'session', { topicId: result.topicId })}>
          {isExam ? 'Refazer prova' : 'Treinar de novo'}
        </Button>
        <Button variant="ghost" full onClick={() => navigate('home')}>Voltar ao início</Button>
      </div>
    </div>
  )
}

// Short, guilt-free encouragement based on how the practice went.
function practiceMessage(pct) {
  if (pct >= 90) return 'Mandou muito bem! Consistência assim fixa rápido.'
  if (pct >= 70) return 'Bom ritmo. Seguindo assim, o nível fixa logo.'
  if (pct >= 50) return 'Tá evoluindo. Cada erro corrigido é aprendizado.'
  return 'Sem pressa — repetir é o que fixa. Bora de novo.'
}

// Explains what the exam did to your level (mirrors applyExamResult's rule).
function examMessage(correct, total, levelIndex, topic) {
  const ratio = correct / total
  const atLastLevel = levelIndex >= topic.levels.length - 1
  const isLastTopic = TOPICS[TOPICS.length - 1].id === topic.id
  if (ratio >= 0.8) {
    if (!atLastLevel) return 'Passou! Você avançou de nível.'
    return isLastTopic
      ? `Você fixou "${topic.name}" e completou toda a trilha! Mandou muito bem.`
      : `Você fixou "${topic.name}"! O próximo tópico foi liberado.`
  }
  if (ratio < 0.5 && levelIndex > 0) {
    return 'Você voltou um nível para reforçar a base — sem crise, faz parte.'
  }
  return 'Quase lá. Repita o nível mais um pouco para fixar.'
}

// Milliseconds -> "3 min" or "45 s".
function formatDuration(ms) {
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds} s`
  return `${Math.round(seconds / 60)} min`
}
