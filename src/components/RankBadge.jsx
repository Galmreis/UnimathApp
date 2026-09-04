import styles from './RankBadge.module.css'
import { rankAt } from '../lib/ranks.js'
import { useStore } from '../store/StoreProvider.jsx'

// The rank shield: the roman numeral of the division on a tinted plate, with the
// tier's name beside it. The colour comes from RANK_TIERS in lib/ranks.js, so a
// tier is retinted by editing data — the same trick as TopicGlyph.
//
// `size="sm"` is the compact chip used in Home's header; `size="lg"` is the hero
// version on the Ranking screen. `bare` drops the label and keeps only the plate.
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
