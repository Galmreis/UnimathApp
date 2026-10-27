import styles from './TopicCard.module.css'
import { ProgressBar } from './ProgressBar.jsx'
import { TopicGlyph } from './TopicGlyph.jsx'
import { useStore } from '../store/StoreProvider.jsx'

export function TopicCard({ index, topic, status, levelIndex, accuracy, onStart }) {
  const { t } = useStore()
  const locked = status === 'locked'
  const mastered = status === 'mastered'
  const totalLevels = topic.levels.length
  const safeLevel = Math.min(levelIndex, totalLevels - 1)
  // Dá pra treinar até o nível alcançado. Tópico dominado libera todos.
  const maxTrainable = mastered ? totalLevels - 1 : safeLevel

  const hasData = status === 'in_progress' || mastered

  return (
    <article className={styles.card} data-status={status}>
      <div className={styles.head}>
        <TopicGlyph topic={topic} />
        <div className={styles.titles}>
          <div className={styles.nameRow}>
            <h4 className={styles.name}>{topic.name}</h4>
            <span className={styles.statusText} data-status={status}>
              {mastered ? '★ ' : ''}{t(`status_${status}`)}
            </span>
          </div>
          <div className={styles.sub}>
            {!locked ? t('level_of', { n: safeLevel + 1, m: totalLevels }) : t('lockedHint')}
          </div>
        </div>
      </div>

      {!locked && (
        <div className={styles.details}>
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
                className={styles.levelStep}
                data-current={i === safeLevel && !mastered}
                disabled={i > maxTrainable}
                onClick={() => onStart(i)}
              >
                <span className={styles.stepNum}>{i + 1}</span>
                <span className={styles.stepLabel}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
