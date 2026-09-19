import styles from './TopicCard.module.css'
import { ProgressBar } from './ProgressBar.jsx'
import { TopicGlyph } from './TopicGlyph.jsx'
import { useStore } from '../store/StoreProvider.jsx'

export function TopicCard({ topic, status, levelIndex, accuracy, onStart }) {
  const { t } = useStore()
  const locked = status === 'locked'
  const mastered = status === 'mastered'
  const totalLevels = topic.levels.length
  const safeLevel = Math.min(levelIndex, totalLevels - 1)
  // Dá pra treinar até o nível alcançado. Tópico dominado libera todos.
  const maxTrainable = mastered ? totalLevels - 1 : safeLevel

  const hasData = status === 'in_progress' || mastered

  return (
    <div className={styles.card} data-status={status}>
      <div className={styles.head}>
        <TopicGlyph topic={topic} />
        <div className={styles.titles}>
          <div className={styles.name}>{topic.name}</div>
          <div className={styles.sub}>
            <span className={styles.statusText} data-status={status}>{t(`status_${status}`)}</span>
            {!locked && <>{' · '}{t('level_of', { n: safeLevel + 1, m: totalLevels })}</>}
          </div>
        </div>
      </div>

      {!locked && (
        <>
          <div className={styles.accRow}>
            <div className={styles.accBar}>
              <ProgressBar value={accuracy} tone={mastered ? 'success' : 'accent'} />
            </div>
            <span className={styles.accPct} data-status={status}>
              {hasData ? `${Math.round(accuracy * 100)}%` : '—'}
            </span>
          </div>
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
