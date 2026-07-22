import styles from './StatTile.module.css'

// A small "number + label" card used in the stats rows. `hint` is optional
// secondary text under the label.
export function StatTile({ value, label, hint }) {
  return (
    <div className={styles.tile}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  )
}
