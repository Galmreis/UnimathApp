import styles from './ProgressBar.module.css'

// value vai de 0 a 1.
export function ProgressBar({ value, tone = 'accent' }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.fill} data-tone={tone} style={{ width: `${pct}%` }} />
    </div>
  )
}
