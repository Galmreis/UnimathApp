import styles from './TopicGlyph.module.css'

export function TopicGlyph({ topic, size }) {
  return (
    <span
      className={`${styles.glyph} ${size === 'sm' ? styles.sm : ''}`}
      style={{
        color: topic.color,
        borderColor: `color-mix(in srgb, ${topic.color} 35%, var(--border))`,
      }}
      aria-hidden
    >
      {topic.glyph}
    </span>
  )
}
