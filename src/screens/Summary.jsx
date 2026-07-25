import styles from './Summary.module.css'
import { Button } from '../components/Button.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { TOPICS } from '../data/topics.js'
import { round } from '../lib/math.js'

// Shown after a session or exam. `result` is what Session handed us:
//   { mode, topicId, results: boolean[], durationMs, levelIndex? }
export function Summary({ result, navigate }) {
  const { t, getTopic } = useStore()
  const topic = getTopic(result.topicId)
  const total = result.results.length
  const correct = result.results.filter(Boolean).length
  const pct = total > 0 ? round((correct / total) * 100, 0) : 0
  const isExam = result.mode === 'exam'

  return (
    <div className={styles.summary}>
      <div className={styles.hero}>
        <div className={styles.pct}>{pct}%</div>
        <div className={styles.score}>{t('ofCorrect', { correct, total })}</div>
        <div className={styles.sub}>
          {topic.name} · {formatDuration(result.durationMs)}
        </div>
      </div>

      <p className={styles.message}>
        {isExam ? examMessage(t, correct, total, result.levelIndex, topic) : practiceMessage(t, pct)}
      </p>

      <div className={styles.actions}>
        <Button size="big" full onClick={() => navigate(isExam ? 'exam' : 'session', { topicId: result.topicId })}>
          {isExam ? t('retakeExam') : t('trainAgain')}
        </Button>
        <Button variant="ghost" full onClick={() => navigate('home')}>{t('backHome')}</Button>
      </div>
    </div>
  )
}

// Short, guilt-free encouragement based on how the practice went.
function practiceMessage(t, pct) {
  if (pct >= 90) return t('practice90')
  if (pct >= 70) return t('practice70')
  if (pct >= 50) return t('practice50')
  return t('practice0')
}

// Explains what the exam did to your level (mirrors applyExamResult's rule).
function examMessage(t, correct, total, levelIndex, topic) {
  const ratio = correct / total
  const atLastLevel = levelIndex >= topic.levels.length - 1
  const isLastTopic = TOPICS[TOPICS.length - 1].id === topic.id
  if (ratio >= 0.8) {
    if (!atLastLevel) return t('examUp')
    return isLastTopic ? t('examMasteredAll', { topic: topic.name }) : t('examMastered', { topic: topic.name })
  }
  if (ratio < 0.5 && levelIndex > 0) {
    return t('examDown')
  }
  return t('examStay')
}

// Milliseconds -> "3 min" or "45 s".
function formatDuration(ms) {
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds} s`
  return `${Math.round(seconds / 60)} min`
}
