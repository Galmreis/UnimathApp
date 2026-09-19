import styles from './RankBadge.module.css'
import { rankAt } from '../lib/ranks.js'
import { useStore } from '../store/StoreProvider.jsx'

// Mesma ideia de cor do TopicGlyph. `bare` tira o label e deixa só a placa.
export function RankBadge({ step, size, bare = false }) {
  const { t } = useStore()
  const rank = rankAt(step)

  return (
    <span className={`${styles.badge} ${size === 'sm' ? styles.sm : ''} ${size === 'lg' ? styles.lg : ''}`}>
      <span
        className={styles.plate}
        style={{
          color: rank.color,
          backgroundColor: `${rank.color}22`,
          borderColor: `${rank.color}55`,
        }}
      >
        {rank.roman}
      </span>
      {!bare && <span className={styles.label}>{t(`rank_${rank.tierKey}`)}</span>}
    </span>
  )
}
