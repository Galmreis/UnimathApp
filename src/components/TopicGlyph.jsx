import styles from './TopicGlyph.module.css'

// A coloured rounded badge showing a topic's math symbol — the replacement for
// emoji icons. Both the symbol and the colour come from the topic object
// (data/topics.js), so the styling is driven by data. `size="sm"` is the
// compact version used in list rows.
//
// Note the inline `style`: we build the tinted background/border by appending
// an alpha value to the topic's hex colour ("#7aa2f7" + "22" = ~13% opacity).
export function TopicGlyph({ topic, size }) {
  return (
    <span
      className={`${styles.glyph} ${size === 'sm' ? styles.sm : ''}`}
      style={{
        color: topic.color,
        backgroundColor: `${topic.color}22`,
        borderColor: `${topic.color}55`,
      }}
      aria-hidden
    >
      {topic.glyph}
    </span>
  )
}
