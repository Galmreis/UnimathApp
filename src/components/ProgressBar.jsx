import styles from './ProgressBar.module.css'

// A thin horizontal bar. `value` is a fraction from 0 to 1. `tone` chooses the
// fill colour ('accent' or 'success'). It's also a real ARIA progressbar so
// screen readers announce the percentage.
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
