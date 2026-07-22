import styles from './TopicCard.module.css'
import { ProgressBar } from './ProgressBar.jsx'
import { TopicGlyph } from './TopicGlyph.jsx'

// One row in the learning track. Shows the topic, its status, the current
// difficulty level and an accuracy bar. Locked topics are disabled.
const STATUS_LABEL = {
  locked: 'Bloqueado',
  available: 'Disponível',
  in_progress: 'Em andamento',
  mastered: 'Fixado',
}

export function TopicCard({ topic, status, levelIndex, accuracy, onStart }) {
  const locked = status === 'locked'
  const totalLevels = topic.levels.length
  const safeLevel = Math.min(levelIndex, totalLevels - 1)

  return (
    <button
      className={styles.card}
      data-status={status}
      disabled={locked}
      onClick={locked ? undefined : onStart}
    >
      <div className={styles.head}>
        <TopicGlyph topic={topic} />
        <div className={styles.titles}>
          <div className={styles.name}>{topic.name}</div>
          <div className={styles.status} data-status={status}>{STATUS_LABEL[status]}</div>
        </div>
      </div>

      {locked ? (
        <div className={styles.hint}>Fixe o tópico anterior para liberar.</div>
      ) : (
        <>
          <div className={styles.level}>
            Nível {safeLevel + 1}/{totalLevels} · {topic.levels[safeLevel]}
          </div>
          <ProgressBar value={accuracy} tone={status === 'mastered' ? 'success' : 'accent'} />
        </>
      )}
    </button>
  )
}
