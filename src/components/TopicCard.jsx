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

// `onStart(levelIndex)` starts a practice session at the chosen level.
export function TopicCard({ topic, status, levelIndex, accuracy, onStart }) {
  const locked = status === 'locked'
  const mastered = status === 'mastered'
  const totalLevels = topic.levels.length
  const safeLevel = Math.min(levelIndex, totalLevels - 1)
  // Highest level you're allowed to train: everything up to (and including) the
  // one you've reached — or every level once the topic is fixed.
  const maxTrainable = mastered ? totalLevels - 1 : safeLevel

  return (
    <div className={styles.card} data-status={status}>
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
          <ProgressBar value={accuracy} tone={mastered ? 'success' : 'accent'} />
          <div className={styles.levels}>
            {topic.levels.map((label, i) => (
              <button
                key={i}
                className={styles.levelPill}
                data-current={i === safeLevel && !mastered}
                disabled={i > maxTrainable}
                onClick={() => onStart(i)}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
